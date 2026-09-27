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

  return `You are a senior software engineer performing a deep, thorough repository analysis for the RepoPilot dashboard.

CRITICAL RULES — violating any of these will break the UI:
1. Return ONLY valid JSON. No markdown fences, no explanations, no prose outside JSON.
2. NEVER leave stats, setup steps, or actionPlan as empty arrays — always populate with real values.
3. Every string field must contain meaningful, repo-specific content. Generic filler like "This is a project" is NOT acceptable.
4. testing.stats MUST have EXACTLY these 4 entries (in order): "Test Files", "Coverage Estimate", "Framework", "Source Files".
5. testing.generatedTests MUST contain runnable test code, not placeholder comments.
6. overview.summary MUST be 3-4 sentences that describe what this specific repo actually does.

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

=== DEEP ANALYSIS INSTRUCTIONS ===

**repository**:
- Detect language from file extensions + package.json + GitHub metadata
- Detect framework from package.json dependencies (next → Next.js, react → React, express → Express, etc.)
- stack: list the full technology stack including language, framework, UI libraries, ORMs, test frameworks, and build tools

**overview.summary**:
Write 3-4 specific sentences describing what this project does. Cover:
1. What the project is and who it's for (based on name, description, code)
2. What technology stack it uses
3. Notable features or architectural patterns visible in the code
4. Repository health (test coverage, CI, documentation quality)
Do NOT write generic filler. Every sentence must be grounded in the actual evidence.

**readme.generatedMarkdown**:
Write a COMPLETE professional README.md (minimum 400 words) using all available evidence:
- Title: actual repo name with a badge row (build status, license, npm version if applicable)
- Description: derived from metadata.description and source code analysis — be specific
- Features: list 4-6 actual features inferred from the source code and file structure
- Prerequisites: Node.js version from engines field, Python version, etc.
- Installation: use actual package manager (detect from lockfile: yarn.lock→yarn, pnpm-lock.yaml→pnpm, else npm)
- Configuration: list every .env variable found in source/config files with descriptions
- Usage: real examples from actual scripts in package.json or inferred from source files
- API reference (if applicable): key endpoints or exported functions visible in source
- Contributing: standard fork→branch→PR flow
- License: detected from package.json.license or LICENSE file in tree

**setup.requiredSteps**: MINIMUM 4 steps using real commands from package.json.scripts. Always include: clone, install, configure env (if env vars found), start/dev command.

**setup.environmentVariables**: Scan EVERY source and config file for process.env.VAR_NAME, os.environ['VAR'], dotenv patterns. List them all with realistic example values.

**testing.framework**: Detect from devDependencies (jest, vitest, mocha, pytest, go test, etc.) or test file naming patterns.

**testing.sourceCode**: Copy the COMPLETE content of the most complex/interesting source file verbatim. Prefer files with exported functions/classes over config files.

**testing.generatedTests**: Write REAL, RUNNABLE test code for the source file shown:
- Use the EXACT function/class names from the source code
- Use the EXACT import paths
- Write meaningful assertions (not just toBeDefined())
- Cover: happy path, edge cases (null/empty/boundary), error conditions
- Minimum 3 test cases per exported function

**testing.stats**: EXACTLY 4 items:
1. {"label":"Test Files","value":"<count from file tree>","color":"emerald|rose"}
2. {"label":"Coverage Estimate","value":"<percent>","color":"emerald|amber|rose"}
3. {"label":"Framework","value":"<framework name>","color":"indigo"}
4. {"label":"Source Files","value":"<count from file tree>","color":"indigo"}
For "Test Files" count: count all files matching *.test.*, *.spec.*, __tests__/, /tests/, /test/ in the file tree.
For "Source Files" count: count all .js/.ts/.jsx/.tsx/.py/.go/.rs/.java files (excluding test files) in the file tree.

**deadCode**: Scan imports vs exports across all source files. Flag:
- Imported symbols never used in the file
- Exported functions/classes with no imports elsewhere in the fetched files
- Variables declared but never read
- Commented-out code blocks over 10 lines
Include exact file path and line number. Use confidence 70-90 for clear cases, 40-60 for inferred cases.

**dependencies.nodes**:
- Root node first: {"id":"root","label":"${repositoryName}","type":"root","health":"ok"}
- Add EVERY package from both dependencies AND devDependencies
- health: "critical" for known CVEs, "warning" for outdated major versions, "ok" otherwise

**dependencies.alerts**: Real CVEs only. Check: lodash<4.17.21 (prototype pollution), minimist<1.2.6, axios<0.21.2, serialize-javascript<4.0, json5<2.2.2, semver<7.5.2.

**dependencies.outdated**: Flag packages where installed major version is behind current (react<19, next<15, typescript<5, tailwindcss<4, eslint<9, vite<6, webpack<5).

**actionPlan**: 4-5 specific, prioritised recommendations. Each must reference an actual finding from this repo. High priority: security issues, missing tests. Medium: outdated deps, README gaps. Low: CI, code quality, env.example.

=== JSON SCHEMA ===
Return ONLY valid JSON matching this schema exactly:

${SCHEMA_LITERAL}

SCORING RULES:
- healthScore: Start at 100. Subtract 15 per CRITICAL security issue, 8 per missing test suite, 5 per outdated major dependency, 5 per missing README section. Floor: 10.
- readme.qualityScore: title(15) + description(15) + installation(20) + usage(20) + contributing(15) + license(15) = max 100. Score what actually exists.
- testing.stats colors: "emerald" = good (tests exist, coverage >50%), "amber" = warning (low coverage), "rose" = bad (0 tests, 0%), "indigo" = neutral info.`;
}
