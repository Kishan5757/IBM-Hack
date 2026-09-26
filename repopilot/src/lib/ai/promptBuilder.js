/**
 * promptBuilder.js — SERVER-SIDE ONLY
 *
 * Builds the shared analysis prompt used by BOTH GeminiProvider and
 * LocalAIProvider.  Both providers receive the exact same prompt text
 * so the output schema is consistent regardless of which model answers.
 */

// ─── JSON schema literal (embedded directly in the prompt) ───────────────────

const SCHEMA_LITERAL = `{
  "repository": {
    "name": "string",
    "stack": ["string"],
    "framework": "string",
    "language": "string"
  },
  "overview": {
    "summary": "string",
    "healthScore": 0,
    "criticalIssues": 0,
    "warnings": 0
  },
  "readme": {
    "qualityScore": 0,
    "missingSections": ["string"],
    "issues": ["string"],
    "generatedMarkdown": "string"
  },
  "setup": {
    "status": "healthy",
    "issues": ["string"],
    "requiredSteps": [
      { "id": 1, "title": "string", "command": "string", "description": "string" }
    ],
    "environmentVariables": [
      { "key": "string", "example": "string", "required": true }
    ],
    "runtimeRequirements": ["string"],
    "dockerCommand": "string",
    "dockerCompose": "string"
  },
  "testing": {
    "framework": "string",
    "testFilesFound": ["string"],
    "missingTests": ["string"],
    "recommendations": ["string"],
    "sourceCode": "string",
    "generatedTests": "string",
    "stats": [
      { "label": "string", "value": "string", "color": "string" }
    ]
  },
  "deadCode": [
    {
      "id": "string",
      "name": "string",
      "type": "Unused Variable|Unreachable Function|Orphan File|Unused Import|Dead Branch|Unused Component|Unused Route|Unused Function",
      "file": "string",
      "line": 0,
      "severity": "high|medium|low",
      "confidence": 0,
      "reason": "string",
      "evidence": ["string"]
    }
  ],
  "dependencies": {
    "nodes": [
      { "id": "string", "label": "string", "type": "root|dep|devDep", "health": "ok|warning|critical" }
    ],
    "alerts": [
      { "pkg": "string", "severity": "CRITICAL|MEDIUM|LOW", "cve": "string", "desc": "string" }
    ],
    "outdated": [
      { "pkg": "string", "current": "string", "latest": "string", "status": "outdated|minor|patch" }
    ]
  },
  "actionPlan": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "reason": "string",
      "recommendation": "string"
    }
  ]
}`;

// ─── Public builder ───────────────────────────────────────────────────────────

/**
 * buildAnalysisPrompt
 *
 * @param {import('./schemas.js').RepositoryContext} repoData
 * @returns {string} prompt text
 */
export function buildAnalysisPrompt(repoData) {
  const {
    repositoryName,
    fileTree = [],
    packageManifest,
    lockFileSummary,
    readme,
    sourceFiles = {},
    configurationFiles = {},
    testFiles = {},
    metadata = {},
  } = repoData;

  const hasSourceFiles = Object.keys(sourceFiles).length > 0;
  const hasConfigFiles = Object.keys(configurationFiles).length > 0;
  const hasTestFiles = Object.keys(testFiles).length > 0;
  const hasFileTree = fileTree.length > 0;
  const hasPackage = !!packageManifest;
  const hasReadme = !!readme;

  const fileTreeStr = hasFileTree
    ? fileTree.slice(0, 600).join("\n")
    : "(no file tree available)";

  const sourceFilesStr = hasSourceFiles
    ? Object.entries(sourceFiles)
        .map(([path, content]) => `### FILE: ${path}\n\`\`\`\n${content}\n\`\`\``)
        .join("\n\n")
    : "(no source files were fetched — use the file tree to infer structure)";

  const configFilesStr = hasConfigFiles
    ? Object.entries(configurationFiles)
        .map(([path, content]) => `### CONFIG: ${path}\n\`\`\`\n${content}\n\`\`\``)
        .join("\n\n")
    : "(no configuration files fetched)";

  const testFilesStr = hasTestFiles
    ? Object.entries(testFiles)
        .map(([path, content]) => `### TEST: ${path}\n\`\`\`\n${content}\n\`\`\``)
        .join("\n\n")
    : "(no test files found)";

  const pkgStr = hasPackage
    ? `\`\`\`json\n${JSON.stringify(packageManifest, null, 2)}\n\`\`\``
    : "(package.json not found — infer from file tree and config files)";

  const readmeStr = hasReadme
    ? `\`\`\`markdown\n${readme}\n\`\`\``
    : "(README.md not found — generate one from available evidence)";

  const metaStr =
    [
      metadata.githubSlug
        ? `GitHub: https://github.com/${metadata.githubSlug}`
        : null,
      metadata.language
        ? `Primary Language (GitHub-detected): ${metadata.language}`
        : null,
      metadata.description
        ? `Repository Description: ${metadata.description}`
        : null,
      metadata.defaultBranch
        ? `Default Branch: ${metadata.defaultBranch}`
        : null,
      metadata.stars != null ? `Stars: ${metadata.stars}` : null,
    ]
      .filter(Boolean)
      .join("\n") ||
    "(no GitHub metadata — use file tree and source files to infer)";

  const evidenceSummary = [
    `- File tree: ${hasFileTree ? `${fileTree.length} files listed` : "NOT available"}`,
    `- package.json: ${hasPackage ? "YES — full content provided" : "NOT found"}`,
    `- README.md: ${hasReadme ? "YES — full content provided" : "NOT found"}`,
    `- Source files: ${hasSourceFiles ? `${Object.keys(sourceFiles).length} files with content` : "NOT fetched (use file tree only)"}`,
    `- Config files: ${hasConfigFiles ? `${Object.keys(configurationFiles).length} files` : "none"}`,
    `- Test files: ${hasTestFiles ? `${Object.keys(testFiles).length} files` : "none"}`,
    `- GitHub metadata: ${metadata.language ? `language=${metadata.language}` : "none"}`,
  ].join("\n");

  return `You are an expert software engineer performing a thorough repository analysis for the RepoPilot dashboard.

You MUST populate EVERY field in the JSON schema with real, useful content.
NEVER return empty arrays for setup steps, environment variables, or test stats — always provide reasonable values based on available evidence.
When source files are not available, use the file tree + metadata + package.json to make well-reasoned inferences.
When package.json IS available, list ALL dependencies in the nodes array — not just a few.

EVIDENCE AVAILABLE FOR THIS ANALYSIS:
${evidenceSummary}

=== REPOSITORY METADATA ===
Repository Name: ${repositoryName}
${metaStr}
${lockFileSummary ? `Dependency Summary: ${lockFileSummary}` : ""}

=== FILE TREE ===
${fileTreeStr}

=== package.json ===
${pkgStr}

=== README ===
${readmeStr}

=== SOURCE FILES ===
${sourceFilesStr}

=== CONFIGURATION FILES ===
${configFilesStr}

=== TEST FILES ===
${testFilesStr}

=== INSTRUCTIONS PER SECTION ===

**repository**: Detect language and framework from package.json, file extensions in the tree, and imports in source files.

**overview.summary**: Write 2-3 real sentences describing what this project appears to do based on its name, description, file structure, and source code. Do NOT write generic filler.

**readme.generatedMarkdown**: Write a COMPLETE, professional README.md using ALL available evidence:
- Use the actual repo name as the title
- Base the description on metadata.description and source code analysis
- List real installation steps (detect package manager from package.json/yarn.lock/pnpm-lock.yaml)
- Show real usage examples derived from source files or scripts
- List real dependencies from package.json
- Add real configuration notes if .env files or config files are present
- Include a proper license section if detectable

**setup.requiredSteps**: Always provide AT LEAST 3-4 steps. Use actual commands from package.json scripts. If no package.json, infer from file extensions (Python→pip install, etc).
Example minimum for a Node.js project: clone, npm install, configure env, npm run dev.

**setup.environmentVariables**: Search source files and config files for process.env.*, os.environ, dotenv references. If .env.example exists in config files, list every variable in it. If nothing found, return [].

**setup.dockerCommand / dockerCompose**: If Dockerfile or docker-compose.yml exists, provide real commands. Otherwise return empty strings.

**testing.framework**: Detect from package.json devDependencies (jest, vitest, mocha, pytest, etc.) or test file patterns.
**testing.sourceCode**: Copy the FULL content of the most interesting/complex source file into this field for display.
**testing.generatedTests**: Generate REAL test code for the source file shown. Use the detected framework. Include actual function names and import paths from the real code. Do NOT write placeholder comments.
**testing.stats**: ALWAYS include at least 3 stats: "Test Files" (count), "Coverage Estimate" (%), "Framework" label.

**deadCode**: Examine imports and exports in source files. Flag symbols that are imported/defined but appear unused within the fetched files. Always include the actual file path and line number if visible. If you cannot see enough code to be certain, use confidence 40-60 and mark as "potentially unused". Return [] only if truly no evidence.

**dependencies.nodes**:
- ALWAYS include a root node: {"id":"root","label":"${repositoryName}","type":"root","health":"ok"}
- Then list EVERY dependency from package.json (both dependencies and devDependencies)
- Mark health: "ok" for most packages, "warning" for known old major versions, "critical" for known CVEs
- If no package.json, return just the root node

**dependencies.alerts**: Only include if you have real evidence of vulnerabilities. Do not invent CVE numbers.

**dependencies.outdated**: Compare the versions in package.json against your knowledge of current releases. Only list packages where you are confident the version is outdated.

**actionPlan**: Always provide 3-5 concrete, prioritised recommendations based on what you found.

=== JSON SCHEMA ===
Return ONLY valid JSON (no markdown fences, no explanation) matching this schema exactly:

${SCHEMA_LITERAL}

SCORING:
- healthScore: Start at 100. -15 per critical issue, -5 per warning. Range 0-100.
- readme.qualityScore: title(15) + description(15) + installation(20) + usage(20) + contributing(15) + license(15) = max 100.
- testing.stats colors: use "emerald" for good values, "amber" for warnings, "rose" for bad, "indigo" for neutral info.`;
}
