# Optimize the product when it uses local or gemini , the output we get after analysis seems to be basic output , and in test cases it shows zero test cases why is it.

---

**Status:** active  **Date:** 2026-09-27

---

### 👤 User

Optimize the product when it uses local or gemini , the output we get after analysis seems to be basic output , and in test cases it shows zero test cases why is it.

---

### 🤖 Assistant

> 🔧 called: list_files

Let me explore the codebase first to understand the project structure.

> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — repopilot

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — repopilot/src

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/app/api/analyze-repository/route.js

> 🔧 **read_file** — repopilot/src/lib/ai/AIService.js

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/lib/ai/GeminiProvider.js

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me read the core files — the prompt builder, response normalizer, and the RuleBasedProvider's key methods:

> 🔧 **read_file** — repopilot/src/lib/ai/responseNormalizer.js

> 🔧 **read_file** — repopilot/src/lib/ai/promptBuilder.js

### 🤖 Assistant

> 🔧 called: read_file

Now let me read the RuleBasedProvider's key analysis methods:

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me look at the repoExtractor to understand what data is actually being passed to the API:

> 🔧 **read_file** — repopilot/src/lib/ai/schemas.js

> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: read_file

Now let me read the repoExtractor's full content to understand how test files and source files are collected:

> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I have a thorough understanding of the codebase. Let me look at how the Dashboard component uses the analysis data to understand the test count display:

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

> 🔧 **read_file** — repopilot/src/components/FeatureTabs/TestGenerator.jsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a complete picture of all the issues. Let me analyze the root causes:

**Root Cause 1: Zero test cases shown** — In `_analyzeTests`, `testFilesFound` is set to `Object.keys(testFiles)` where `testFiles` is the map fetched from the repo. But the **"Test Files" stat shows `0`** because:
- `testCount = Object.keys(testFiles).length` only counts `testFiles` passed in — but many repos have test files that aren't correctly classified (the `isTestFile` function in `repoExtractor.js` doesn't match `*.test.js` that are inside a `src/` directory as a path with no `/tests/` directory). More importantly, the **test file count from the `fileTree`** is never used in stats, only the fetched `testFiles` object.
- The `fileTree` has test files (matching `.test.` / `.spec.`) but those may NOT be fetched (limited to `MAX_TEST_FILES = 10`) or the patterns are too strict.

**Root Cause 2: Basic/weak analysis output** — When Gemini isn't available (local mode), the `RuleBasedProvider`:
- Uses very simple text patterns in `_generateTestScaffold` — just stub TODOs with no real logic
- The `_buildSummary` produces a 1–2 sentence generic summary
- The generated README is template-like
- The prompt to Gemini is good but the **response temperature is `0.3`** which is conservative

**Root Cause 3: Test file stats from `fileTree` ignored** — The stats only count `testFiles` (fetched content), but the `fileTree` often contains many more test file paths that weren't fetched due to `MAX_TEST_FILES = 10`.

Let me now make targeted fixes:

> 🔧 **update_todo_list** — 
[-] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[ ] Improve RuleBasedProvider _analyzeTests — richer stats, real coverage inference from fileTree
[ ] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[ ] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[ ] Improve Gemini prompt — request more depth, raise temperature slightly, fix stats instruction
[ ] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff

Now I have full context. Let me implement all fixes:

> 🔧 **apply_diff** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[-] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[ ] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[ ] Improve Gemini prompt — request more depth, better stats instruction
[ ] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

> 🔧 called: apply_diff

Now let's improve the `_generateTestScaffold` to produce real, meaningful test bodies:

> 🔧 **apply_diff** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: update_todo_list

Now let's improve the `_buildSummary` to be richer and more informative:

> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[-] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[ ] Improve Gemini prompt — request more depth, better stats instruction
[ ] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:1439
-------
  _buildSummary(name, metadata, language, framework, pkg, fileTree, readme, stack) {
    // Primary: use GitHub description
    const ghDesc = metadata?.description;

    // Secondary: extract first meaningful paragraph from readme
    const readmeDesc = readme ? this._extractDescription(readme) : null;

    // Count meaningful signals
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const testCount = fileTree.filter(
      (f) => f.includes(".test.") || f.includes(".spec.") || /_test\.(py|go|rs|java)$/.test(f)
    ).length;
    const hasCI = fileTree.some((f) => f.includes(".github/workflows"));
    const stars = metadata?.stars;

    // Build language/framework phrase — avoid "Unknown" leaking into user-visible text
    const knownLang = language && language !== "Unknown" ? language : null;
    const knownFw = framework && framework !== "Unknown" && framework !== language ? framework : null;
    const techPhrase = knownLang && knownFw
      ? `${knownLang} project built with ${knownFw}`
      : knownLang
      ? `${knownLang} project`
      : knownFw
      ? `project built with ${knownFw}`
      : "software project";

    let summary = "";

    if (ghDesc && ghDesc.length > 20) {
      summary = `${name} is a ${techPhrase}. ${ghDesc}`;
    } else if (readmeDesc && readmeDesc.length > 30) {
      summary = `${name} is a ${techPhrase}. ${readmeDesc}`;
    } else {
      summary = `${name} is a ${techPhrase}.`;
    }

    // Add notable stack highlights (skip language, framework, and generic TypeScript/JavaScript)
    const notableStack = stack.filter(
      (s) => s && s !== "Unknown" && s !== language && s !== framework &&
             s !== "TypeScript" && s !== "JavaScript"
    ).slice(0, 3);
    if (notableStack.length > 0) {
      summary += ` It uses ${notableStack.join(", ")}.`;
    }

    // Add health signals
    const signals = [];
    if (depsCount > 0) signals.push(`${depsCount} production dependencies`);
    if (testCount > 0) signals.push(`${testCount} test file(s)`);
    else signals.push("no automated tests");
    if (hasCI) signals.push("CI/CD configured");
    if (stars != null && stars > 0) signals.push(`${stars} GitHub stars`);

    if (signals.length > 0) {
      summary += ` The repository has ${signals.join(", ")}.`;
    }

    return summary;
  }
=======
  _buildSummary(name, metadata, language, framework, pkg, fileTree, readme, stack) {
    // Primary: use GitHub description
    const ghDesc = metadata?.description;

    // Secondary: extract first meaningful paragraph from readme
    const readmeDesc = readme ? this._extractDescription(readme) : null;

    // Count meaningful signals from the file tree
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const devDepsCount = Object.keys(pkg?.devDependencies || {}).length;
    const testCount = fileTree.filter(
      (f) => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f) || /__tests__\//.test(f) ||
              /\/tests?\//.test(f) || /_test\.(py|go|rs|java)$/.test(f)
    ).length;
    const hasCI = fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"));
    const hasDocker = fileTree.some((f) => f === "Dockerfile" || f.endsWith("/Dockerfile") || f.includes("docker-compose"));
    const hasLicense = fileTree.some((f) => /^license/i.test(f.split("/").pop()));
    const hasContributing = fileTree.some((f) => /^contributing/i.test(f.split("/").pop()));
    const stars = metadata?.stars;
    const githubSlug = metadata?.githubSlug;

    // Infer project purpose from scripts
    const scripts = pkg?.scripts || {};
    const hasDevServer = !!(scripts.dev || scripts.start || scripts.serve);
    const hasBuild = !!(scripts.build || scripts.compile);
    const hasLint = !!(scripts.lint || scripts["lint:fix"]);
    const hasTestScript = !!(scripts.test || scripts["test:unit"] || scripts["test:e2e"]);

    // Build language/framework phrase — avoid "Unknown" leaking into user-visible text
    const knownLang = language && language !== "Unknown" ? language : null;
    const knownFw = framework && framework !== "Unknown" && framework !== language ? framework : null;
    const techPhrase = knownLang && knownFw
      ? `${knownLang} project built with ${knownFw}`
      : knownLang
      ? `${knownLang} project`
      : knownFw
      ? `project built with ${knownFw}`
      : "software project";

    // ── Sentence 1: identity ────────────────────────────────────────────────
    let identity = "";
    if (ghDesc && ghDesc.length > 20) {
      identity = `${name} is a ${techPhrase}. ${ghDesc}`;
    } else if (readmeDesc && readmeDesc.length > 30) {
      identity = `${name} is a ${techPhrase}. ${readmeDesc}`;
    } else {
      identity = `${name} is a ${techPhrase}.`;
    }

    // ── Sentence 2: tech stack highlights ──────────────────────────────────
    const notableStack = stack.filter(
      (s) => s && s !== "Unknown" && s !== language && s !== framework &&
             s !== "TypeScript" && s !== "JavaScript"
    ).slice(0, 4);

    // Also surface notable tooling from devDeps
    const all = { ...pkg?.dependencies, ...pkg?.devDependencies };
    const toolingHighlights = [];
    if (all["tailwindcss"] || all["@tailwindcss/vite"]) toolingHighlights.push("Tailwind CSS");
    if (all["prisma"] || all["@prisma/client"]) toolingHighlights.push("Prisma ORM");
    if (all["drizzle-orm"]) toolingHighlights.push("Drizzle ORM");
    if (all["trpc"] || all["@trpc/server"]) toolingHighlights.push("tRPC");
    if (all["zod"]) toolingHighlights.push("Zod");
    if (all["zustand"]) toolingHighlights.push("Zustand");
    if (all["@tanstack/react-query"] || all["react-query"]) toolingHighlights.push("React Query");
    if (all["socket.io"] || all["ws"]) toolingHighlights.push("WebSockets");
    if (all["stripe"]) toolingHighlights.push("Stripe");
    if (all["openai"]) toolingHighlights.push("OpenAI");
    if (all["@google/genai"] || all["@google/generative-ai"]) toolingHighlights.push("Google Gemini");
    if (all["redis"] || all["ioredis"]) toolingHighlights.push("Redis");
    if (all["mongodb"] || all["mongoose"]) toolingHighlights.push("MongoDB");
    if (all["pg"] || all["postgres"]) toolingHighlights.push("PostgreSQL");

    const combinedStack = [...new Set([...notableStack, ...toolingHighlights])].slice(0, 4);
    const stackSentence = combinedStack.length > 0
      ? ` It uses ${combinedStack.join(", ")}.`
      : "";

    // ── Sentence 3: health & maturity signals ───────────────────────────────
    const healthSignals = [];
    if (depsCount > 0) healthSignals.push(`${depsCount} production ${depsCount === 1 ? "dependency" : "dependencies"}`);
    if (devDepsCount > 0) healthSignals.push(`${devDepsCount} dev ${devDepsCount === 1 ? "dependency" : "dependencies"}`);
    if (testCount > 0) healthSignals.push(`${testCount} test file${testCount === 1 ? "" : "s"}`);
    if (hasCI) healthSignals.push("CI/CD configured");
    if (hasDocker) healthSignals.push("Docker support");
    if (stars != null && stars > 100) healthSignals.push(`${stars.toLocaleString()} GitHub stars`);
    else if (stars != null && stars > 0) healthSignals.push(`${stars} GitHub stars`);

    const healthSentence = healthSignals.length > 0
      ? ` The repository has ${healthSignals.join(", ")}.`
      : "";

    // ── Sentence 4: quality gaps (only if notable) ──────────────────────────
    const gaps = [];
    if (testCount === 0) gaps.push("no automated tests");
    if (!hasCI) gaps.push("no CI configuration");
    if (!readme || readme.length < 200) gaps.push("minimal documentation");

    const qualitySentence = gaps.length >= 2
      ? ` Key gaps: ${gaps.join(" and ")}.`
      : "";

    return `${identity}${stackSentence}${healthSentence}${qualitySentence}`.trim();
  }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: grep

The file structure shifted after the previous large edit. Let me find the correct line for `_buildSummary`:

> 🔧 **grep** — _buildSummary

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:1571
-------
  _buildSummary(name, metadata, language, framework, pkg, fileTree, readme, stack) {
    // Primary: use GitHub description
    const ghDesc = metadata?.description;

    // Secondary: extract first meaningful paragraph from readme
    const readmeDesc = readme ? this._extractDescription(readme) : null;

    // Count meaningful signals
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const testCount = fileTree.filter(
      (f) => f.includes(".test.") || f.includes(".spec.") || /_test\.(py|go|rs|java)$/.test(f)
    ).length;
    const hasCI = fileTree.some((f) => f.includes(".github/workflows"));
    const stars = metadata?.stars;

    // Build language/framework phrase — avoid "Unknown" leaking into user-visible text
    const knownLang = language && language !== "Unknown" ? language : null;
    const knownFw = framework && framework !== "Unknown" && framework !== language ? framework : null;
    const techPhrase = knownLang && knownFw
      ? `${knownLang} project built with ${knownFw}`
      : knownLang
      ? `${knownLang} project`
      : knownFw
      ? `project built with ${knownFw}`
      : "software project";

    let summary = "";

    if (ghDesc && ghDesc.length > 20) {
      summary = `${name} is a ${techPhrase}. ${ghDesc}`;
    } else if (readmeDesc && readmeDesc.length > 30) {
      summary = `${name} is a ${techPhrase}. ${readmeDesc}`;
    } else {
      summary = `${name} is a ${techPhrase}.`;
    }

    // Add notable stack highlights (skip language, framework, and generic TypeScript/JavaScript)
    const notableStack = stack.filter(
      (s) => s && s !== "Unknown" && s !== language && s !== framework &&
             s !== "TypeScript" && s !== "JavaScript"
    ).slice(0, 3);
    if (notableStack.length > 0) {
      summary += ` It uses ${notableStack.join(", ")}.`;
    }

    // Add health signals
    const signals = [];
    if (depsCount > 0) signals.push(`${depsCount} production dependencies`);
    if (testCount > 0) signals.push(`${testCount} test file(s)`);
    else signals.push("no automated tests");
    if (hasCI) signals.push("CI/CD configured");
    if (stars != null && stars > 0) signals.push(`${stars} GitHub stars`);

    if (signals.length > 0) {
      summary += ` The repository has ${signals.join(", ")}.`;
    }

    return summary;
  }
}
=======
  _buildSummary(name, metadata, language, framework, pkg, fileTree, readme, stack) {
    // Primary: use GitHub description
    const ghDesc = metadata?.description;

    // Secondary: extract first meaningful paragraph from readme
    const readmeDesc = readme ? this._extractDescription(readme) : null;

    // Count meaningful signals from the file tree
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const devDepsCount = Object.keys(pkg?.devDependencies || {}).length;
    const testCount = fileTree.filter(
      (f) => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f) || /__tests__\//.test(f) ||
              /\/tests?\//.test(f) || /_test\.(py|go|rs|java)$/.test(f)
    ).length;
    const hasCI = fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"));
    const hasDocker = fileTree.some((f) => f === "Dockerfile" || f.endsWith("/Dockerfile") || f.includes("docker-compose"));
    const stars = metadata?.stars;

    // Build language/framework phrase — avoid "Unknown" leaking into user-visible text
    const knownLang = language && language !== "Unknown" ? language : null;
    const knownFw = framework && framework !== "Unknown" && framework !== language ? framework : null;
    const techPhrase = knownLang && knownFw
      ? `${knownLang} project built with ${knownFw}`
      : knownLang
      ? `${knownLang} project`
      : knownFw
      ? `project built with ${knownFw}`
      : "software project";

    // ── Sentence 1: identity ────────────────────────────────────────────────
    let identity = "";
    if (ghDesc && ghDesc.length > 20) {
      identity = `${name} is a ${techPhrase}. ${ghDesc}`;
    } else if (readmeDesc && readmeDesc.length > 30) {
      identity = `${name} is a ${techPhrase}. ${readmeDesc}`;
    } else {
      identity = `${name} is a ${techPhrase}.`;
    }

    // ── Sentence 2: tech stack highlights ──────────────────────────────────
    const notableStack = stack.filter(
      (s) => s && s !== "Unknown" && s !== language && s !== framework &&
             s !== "TypeScript" && s !== "JavaScript"
    ).slice(0, 4);

    // Surface notable tooling from deps
    const all = { ...pkg?.dependencies, ...pkg?.devDependencies };
    const toolingHighlights = [];
    if (all["tailwindcss"] || all["@tailwindcss/vite"]) toolingHighlights.push("Tailwind CSS");
    if (all["prisma"] || all["@prisma/client"]) toolingHighlights.push("Prisma ORM");
    if (all["drizzle-orm"]) toolingHighlights.push("Drizzle ORM");
    if (all["@trpc/server"] || all["trpc"]) toolingHighlights.push("tRPC");
    if (all["zod"]) toolingHighlights.push("Zod");
    if (all["zustand"]) toolingHighlights.push("Zustand");
    if (all["@tanstack/react-query"] || all["react-query"]) toolingHighlights.push("React Query");
    if (all["socket.io"] || all["ws"]) toolingHighlights.push("WebSockets");
    if (all["stripe"]) toolingHighlights.push("Stripe");
    if (all["openai"]) toolingHighlights.push("OpenAI");
    if (all["@google/genai"] || all["@google/generative-ai"]) toolingHighlights.push("Google Gemini");
    if (all["redis"] || all["ioredis"]) toolingHighlights.push("Redis");
    if (all["mongodb"] || all["mongoose"]) toolingHighlights.push("MongoDB");
    if (all["pg"] || all["postgres"]) toolingHighlights.push("PostgreSQL");

    const combinedStack = [...new Set([...notableStack, ...toolingHighlights])].slice(0, 4);
    const stackSentence = combinedStack.length > 0
      ? ` It uses ${combinedStack.join(", ")}.`
      : "";

    // ── Sentence 3: health & maturity signals ───────────────────────────────
    const healthSignals = [];
    if (depsCount > 0) healthSignals.push(`${depsCount} production ${depsCount === 1 ? "dependency" : "dependencies"}`);
    if (devDepsCount > 0) healthSignals.push(`${devDepsCount} dev ${devDepsCount === 1 ? "dependency" : "dependencies"}`);
    if (testCount > 0) healthSignals.push(`${testCount} test file${testCount === 1 ? "" : "s"}`);
    if (hasCI) healthSignals.push("CI/CD configured");
    if (hasDocker) healthSignals.push("Docker support");
    if (stars != null && stars > 100) healthSignals.push(`${stars.toLocaleString()} GitHub stars`);
    else if (stars != null && stars > 0) healthSignals.push(`${stars} GitHub stars`);

    const healthSentence = healthSignals.length > 0
      ? ` The repository has ${healthSignals.join(", ")}.`
      : "";

    // ── Sentence 4: quality gaps (only if notable) ──────────────────────────
    const gaps = [];
    if (testCount === 0) gaps.push("no automated tests");
    if (!hasCI) gaps.push("no CI configuration");
    if (!readme || readme.length < 200) gaps.push("minimal documentation");

    const qualitySentence = gaps.length >= 2
      ? ` Key gaps: ${gaps.join(" and ")}.`
      : "";

    return `${identity}${stackSentence}${healthSentence}${qualitySentence}`.trim();
  }
}
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: update_todo_list

Now improve the Gemini prompt to produce richer output:

> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[-] Improve Gemini prompt — request more depth, better stats instruction
[ ] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:176
-------
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
=======
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
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: update_todo_list

Now also improve the `responseNormalizer.js` to enforce exactly 4 testing stats including the "Source Files" stat from the file tree, since Gemini may return incomplete stats:

> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[x] Improve Gemini prompt — request more depth, better stats instruction
[-] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

> 🔧 called: apply_diff

Now fix the `responseNormalizer.js` to also compute real test/source counts from the file tree when normalizing Gemini output (so both providers have accurate stats):

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:131
-------
  // ── 6. Testing-stats fallback ──────────────────────────────────────────────
  if (!parsed.testing.stats || parsed.testing.stats.length === 0) {
    const testCount = (parsed.testing.testFilesFound || []).length;
    parsed.testing.stats = [
      { label: "Test Files", value: String(testCount), color: testCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: testCount > 0 ? "~20%" : "0%", color: testCount > 0 ? "amber" : "rose" },
      { label: "Framework", value: parsed.testing.framework || "None detected", color: "indigo" },
    ];
  }
=======
  // ── 6. Testing-stats fallback / enrichment ────────────────────────────────
  // Compute accurate counts from the file tree whenever available
  const fileTree = repoData.fileTree || [];
  const TEST_FILE_RE = /\.(test|spec)\.(js|jsx|ts|tsx)$|__tests__\/|\/tests?\/|\/specs?\//i;
  const PY_TEST_RE = /(?:^|\/)test_[^/]+\.py$|(?:^|\/)[^/]+_test\.py$/;
  const GO_TEST_RE = /_test\.go$/;
  const JAVA_TEST_RE = /Test\.java$|Tests\.java$/;
  const SOURCE_EXT_RE = /\.(js|jsx|ts|tsx|py|rb|go|rs|java|kt|cs|cpp|c|php|swift|scala)$/i;

  const treeTestCount = fileTree.filter(
    (f) => TEST_FILE_RE.test(f) || PY_TEST_RE.test(f) || GO_TEST_RE.test(f) || JAVA_TEST_RE.test(f)
  ).length;
  const treeSourceCount = fileTree.filter(
    (f) => SOURCE_EXT_RE.test(f) && !TEST_FILE_RE.test(f) && !PY_TEST_RE.test(f) && !GO_TEST_RE.test(f) && !JAVA_TEST_RE.test(f)
  ).length;

  // Use tree counts when they are larger than what the AI reported
  const reportedTestCount = (parsed.testing.testFilesFound || []).length;
  const trueTestCount = Math.max(reportedTestCount, treeTestCount);
  const fetchedSourceCount = Object.keys(repoData.sourceFiles || {}).length;
  const trueSourceCount = Math.max(fetchedSourceCount, treeSourceCount);

  const coverageRatio = trueSourceCount > 0 ? trueTestCount / trueSourceCount : 0;

  if (!parsed.testing.stats || parsed.testing.stats.length === 0) {
    parsed.testing.stats = [
      { label: "Test Files", value: String(trueTestCount), color: trueTestCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: trueTestCount === 0 ? "0%" : coverageRatio >= 0.5 ? "~65%" : coverageRatio >= 0.2 ? "~30%" : "~15%", color: trueTestCount === 0 ? "rose" : coverageRatio >= 0.5 ? "emerald" : "amber" },
      { label: "Framework", value: parsed.testing.framework || "None detected", color: "indigo" },
      { label: "Source Files", value: String(trueSourceCount), color: "indigo" },
    ];
  } else {
    // Patch existing stats: if the AI returned test count 0 but the tree has tests, fix it
    parsed.testing.stats = parsed.testing.stats.map((s) => {
      if (s.label === "Test Files" && trueTestCount > Number(s.value || 0)) {
        return { ...s, value: String(trueTestCount), color: "emerald" };
      }
      if (s.label === "Source Files" && trueSourceCount > Number(s.value || 0)) {
        return { ...s, value: String(trueSourceCount) };
      }
      return s;
    });
    // Ensure "Source Files" stat always exists
    if (!parsed.testing.stats.find((s) => s.label === "Source Files")) {
      parsed.testing.stats.push({ label: "Source Files", value: String(trueSourceCount), color: "indigo" });
    }
  }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: read_file

Now fix the repoExtractor to ensure test files are discovered separately and not blocked by the source file limit:

> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: apply_diff

The core issue in `repoExtractor.js`: `isSourceFile` matches ALL `.js/.ts` files including test files. So test files are being grabbed by `sourceFilePaths` and then also by `testFilePaths`, causing source slots to be wasted. Fix this by excluding test files from the source file filter:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:148
-------
  // Categorize files
  const sourceFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isSourceFile(p))
    .slice(0, MAX_SOURCE_FILES);

  const configFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isConfigFile(p))
    .slice(0, MAX_CONFIG_FILES);

  const testFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isTestFile(p))
    .slice(0, MAX_TEST_FILES);
=======
  // Categorize files — test files are separated first so they don't consume source file slots
  const testFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isTestFile(p))
    .slice(0, MAX_TEST_FILES);

  const sourceFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isSourceFile(p) && !isTestFile(p))
    .slice(0, MAX_SOURCE_FILES);

  const configFilePaths = allFiles
    .filter((p) => !isExcludedPath(p) && isConfigFile(p))
    .slice(0, MAX_CONFIG_FILES);
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff

Now apply the same fix to the ZIP extraction path:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:261
-------
  const sourceFilePaths = allPaths.filter(isSourceFile).slice(0, MAX_SOURCE_FILES);
  const configFilePaths = allPaths.filter(isConfigFile).slice(0, MAX_CONFIG_FILES);
  const testFilePaths = allPaths.filter(isTestFile).slice(0, MAX_TEST_FILES);
=======
  // Separate test files first so they don't consume source file slots
  const testFilePaths = allPaths.filter(isTestFile).slice(0, MAX_TEST_FILES);
  const sourceFilePaths = allPaths.filter((p) => isSourceFile(p) && !isTestFile(p)).slice(0, MAX_SOURCE_FILES);
  const configFilePaths = allPaths.filter(isConfigFile).slice(0, MAX_CONFIG_FILES);
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: execute_command

Now let's run a quick validation to make sure there are no syntax errors:

> 🔧 **execute_command** — cd repopilot && node --input-type=module --eval "import './src/lib/ai/RuleBasedProvider.js'; console.log('RuleBasedProvider OK')" 2>&1

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — node --input-type=module --eval "import './src/lib/ai/RuleBasedProvider.js'; console.log('OK')"

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — node --input-type=module --eval "import './src/lib/ai/promptBuilder.js'; console.log('OK')"

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — node --input-type=module --eval "import './src/lib/ai/responseNormalizer.js'; console.log('OK')"

### 🤖 Assistant

> 🔧 called: execute_command

All three files parse cleanly. Let's do a quick smoke test of the RuleBasedProvider's analysis logic end-to-end with a mock payload:

> 🔧 **execute_command** — node --input-type=module --eval "
import { RuleBasedProvider } from './src/lib/ai/RuleBasedProvider.js';
const p = new RuleBasedProvider();
const result = await p.analyzeRepository({
  repositoryName: 'my-app',
  fileTree: [
    'src/index.ts', 'src/utils/helpers.ts', 'src/api/route.ts',
    'src/utils/helpers.test.ts', 'src/api/route.spec.ts',
    'src/components/Button.tsx', 'src/components/Modal.tsx',
    '.github/workflows/ci.yml',
    'package.json'
  ],
  packageManifest: {
    name: 'my-app',
    dependencies: { react: '^18.0.0', next: '^14.0.0' },
    devDependencies: { jest: '^29.0.0', typescript: '^5.0.0' },
    scripts: { dev: 'next dev', build: 'next build', test: 'jest' }
  },
  sourceFiles: {
    'src/utils/helpers.ts': 'export function formatDate(date: Date): string { return date.toISOString(); } export function slugify(s: string) { return s.toLowerCase().replace(/ /g, \"-\"); }'
  },
  testFiles: {
    'src/utils/helpers.test.ts': 'import { formatDate } from \"./helpers\"; test(\"works\", () => expect(formatDate(new Date())).toBeDefined());'
  },
  configurationFiles: {},
  readme: null,
  metadata: { language: 'TypeScript', description: 'A Next.js app', stars: 42 }
});
console.log('Framework:', result.repository.framework);
console.log('Language:', result.repository.language);
console.log('Test stats:', JSON.stringify(result.testing.stats));
console.log('Test count (fetched 1 + tree 2):', result.testing.stats[0].value);
console.log('Summary:', result.overview.summary);
console.log('Generated tests (first 200 chars):', result.testing.generatedTests.slice(0, 200));
"


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — repopilot/_test_smoke.mjs

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — node _test_smoke.mjs

### 🤖 Assistant

> 🔧 called: execute_command

Everything works correctly. The smoke test confirms:

- **Test Files: `2`** — correctly reads from the file tree (2 test files in the tree, even though only 1 was in `testFiles`). Previously this would have shown `1`.
- **Source Files: `5`** — correctly counts from file tree (5 non-test source files), not just the 1 fetched file.
- **Coverage Estimate: `~30%`** — accurate ratio-based estimate.
- **Summary** — now 2 sentences with real data: language, framework, dep counts, test files, CI, stars.
- **Generated tests** — real `import` statement with actual function names (`formatDate`, `slugify`), real assertions.

Clean up the smoke test file:

> 🔧 **execute_command** — Remove-Item repopilot/_test_smoke.mjs

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[x] Improve Gemini prompt — request more depth, better stats instruction
[x] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision


### 🤖 Assistant

Here's a summary of every change made and why it fixes the problems:

---

## What was fixed and why

### 1. Zero test cases in stats — root cause + fix

**Root cause:** `testCount` in [`_analyzeTests()`](repopilot/src/lib/ai/RuleBasedProvider.js:1109) was computed as `Object.keys(testFiles).length` — only counting test files whose *content* was actually fetched (capped at `MAX_TEST_FILES = 10`). Many repos have test files in the tree that weren't fetched, and they were never counted.

**Fix:** Now scans the full `fileTree` with proper regexes for `.test.ts`, `.spec.js`, `__tests__/`, `/tests/`, `_test.py`, `_test.go`, `Test.java` etc., and uses `Math.max(fetchedCount, treeCount)`. A repo with 47 test files in the tree now shows `47`, not `0`.

### 2. Test files consuming source file slots — root cause + fix

**Root cause:** In [`repoExtractor.js`](repopilot/src/utils/repoExtractor.js), `sourceFilePaths` was filtered with `isSourceFile(p)` which matched `.ts`/`.js` files *including* test files. So test files were eating into the `MAX_SOURCE_FILES = 30` quota, leaving fewer real source files fetched.

**Fix:** `sourceFilePaths` now filters `isSourceFile(p) && !isTestFile(p)`. Test files are always collected in their own separate pass first. Applied to both the GitHub API path and the ZIP extraction path.

### 3. Basic / shallow analysis output — root causes + fixes

**`_generateTestScaffold`** ([RuleBasedProvider.js:1215](repopilot/src/lib/ai/RuleBasedProvider.js:1215)):
- Old: Generic stubs with `// TODO` comments everywhere, no real imports, no real assertions
- New: Extracts function *parameters* and generates smart placeholder values (e.g., `'test-id'` for `id`, `5` for `count`). Writes 3–4 real assertion cases per function. Also adds Python (`pytest`) and Go (`testing`) scaffolds for non-JS repos.

**`_buildSummary`** ([RuleBasedProvider.js:1571](repopilot/src/lib/ai/RuleBasedProvider.js:1571)):
- Old: 1–2 generic sentences, only listed "production dependencies" and "no automated tests" as one blob
- New: 4 structured sentences: identity → notable stack (Tailwind, Prisma, tRPC, Redis etc. detected from deps) → specific health signals (test count, CI, Docker, stars) → quality gaps sentence (only shown when 2+ gaps exist)

**`promptBuilder.js`** ([promptBuilder.js:176](repopilot/src/lib/ai/promptBuilder.js:176)):
- Added `CRITICAL RULES` header with numbered enforcement rules Gemini must follow
- Expanded `overview.summary` instruction from "2-3 sentences" to 4 structured sentence types
- Expanded `readme.generatedMarkdown` to minimum 400 words with badges, features list, API reference
- `testing.stats` now explicitly mandates exactly 4 items with count instructions: "count all files matching *.test.* in the **file tree**"
- `testing.generatedTests` now says "minimum 3 test cases per exported function, meaningful assertions"
- Added specific known CVE list and known outdated version list for `dependencies` sections

**`responseNormalizer.js`** ([responseNormalizer.js:131](repopilot/src/lib/ai/responseNormalizer.js:131)):
- Now recomputes true test/source counts from the file tree for *both* Gemini and local results
- Patches any AI-returned stats where the count is lower than what the tree shows (fixes Gemini returning `0` test files when the tree has them)
- Always ensures the `"Source Files"` stat exists

---

### 👤 User

https://github.com/Kishan5757/SIH i uploaded this project for setup it gaveSetup Steps

Env Variables

Docker
1
Clone the repository

Clone the project to your local machine.

git clone https://github.com/Kishan5757/SIH.git && cd sih

2
Create virtual environment

Isolate project dependencies.

python -m venv venv && source venv/bin/activate

3
Install dependencies

Install required Python packages.

pip install -r requirements.txt

4
Run the application

Start the application.

python main.pythis is correct but only for backend setup it didn't show front end setuplike npm run devin dependency it showsDependency Analyzer
Offline engine · Repo: SIH

Dependency Health
0 critical
map
alerts
outdated
SIH
root
Healthy
Warning
Critical
no dependency why ,optimize the project.

---

### 🤖 Assistant

> 🔧 called: execute_command

Let me investigate the repository to understand its actual structure first.

> 🔧 **execute_command** — Invoke-WebRequest -Uri "https://api.github.com/repos/Kishan5757/SIH/git/trees/HEAD?recursive=1" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty tree | Where-Object { $_.type -eq "blob" } | Select-Object -ExpandProperty path | Select-Object -First 100

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Kishan5757/SIH/main/package.json" -UseBasicParsing | Select-Object -ExpandProperty Content

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — $branches = @("master","main","develop"); foreach($b in $branches) { $r = try { Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Kishan5757/SIH/$b/package.json" -UseBasicParsing -EA Stop; "FOUND:$b" } catch { "NOT:$b" }; Write-Host $r }

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — $branches = @("master","main","develop"); foreach($b in $branches) { $r = try { $resp = Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Kishan5757/SIH/$b/README.md" -UseBasicParsing -EA Stop; "FOUND:$b - $($resp.Content.Length) chars" } catch { "NOT:$b" }; Write-Host $r }

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Kishan5757/SIH/main/README.md" -UseBasicParsing | Select-Object -ExpandProperty Content

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I understand the full picture. This is a **full-stack project** with a Python/FastAPI **backend** and a **Vite/React frontend**. The problem is that the rule engine and the extractor only look for a single `package.json` at the repo root — but this project has `frontend/package.json`. Let me read all the relevant code paths:

> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have the full picture. There are **three root causes** for this specific repo:

1. **`_buildSetupSteps`** only builds setup for either Python OR Node.js — never both. For a monorepo with `backend/` (Python/FastAPI) and `frontend/` (Vite/React), it picks Python (because there's no root `package.json`) and generates only backend steps.

2. **`_analyzeDependencies`** only reads `requirements.txt` at the root or `requirements/base.txt` — not `backend/requirements.txt`. And the frontend `frontend/package.json` is never read at all.

3. **`_detectFramework`** picks the first manifest it finds — not the nested ones — so the frontend's Vite/React stack is invisible.

4. **The extractor** (`fetchGitHubPayload` and `fetchRawFallbackPayload`) only fetches `package.json` at the repo root, never `frontend/package.json` or `backend/requirements.txt`.

Let me fix all of these:

> 🔧 **update_todo_list** — 
[-] Fix repoExtractor — detect monorepo structure, fetch nested package.json and requirements.txt
[ ] Fix RuleBasedProvider _buildSetupSteps — generate multi-service steps for monorepos (backend + frontend)
[ ] Fix RuleBasedProvider _analyzeDependencies — parse both frontend/package.json and backend/requirements.txt in monorepos
[ ] Fix RuleBasedProvider _detectFramework — recognise monorepo and surface full stack
[ ] Fix raw fallback extractor — also probe monorepo manifest paths


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[x] Improve Gemini prompt — request more depth, better stats instruction
[x] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision
[-] Fix repoExtractor — detect monorepo structure, fetch nested package.json and requirements.txt
[ ] Fix RuleBasedProvider _buildSetupSteps — generate multi-service steps for monorepos (backend + frontend)
[ ] Fix RuleBasedProvider _analyzeDependencies — parse both frontend/package.json and backend/requirements.txt in monorepos
[ ] Fix RuleBasedProvider _detectFramework — recognise monorepo + surface full stack
[ ] Fix raw fallback extractor — also probe common monorepo manifest paths


### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: apply_diff

Now I'll make all fixes in one large coordinated edit. Starting with the extractor:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:163
-------
  // Fetch key file contents
  const packageManifest = await fetchGitHubFile(slug, "package.json", headers, true);
  // Also try requirements.txt, pyproject.toml, go.mod, Cargo.toml, pom.xml
  const altManifestPaths = ["requirements.txt", "pyproject.toml", "go.mod", "Cargo.toml", "pom.xml", "build.gradle"];

  const readmeContent = await fetchGitHubFile(slug, "README.md", headers) ||
                        await fetchGitHubFile(slug, "readme.md", headers) ||
                        await fetchGitHubFile(slug, "Readme.md", headers);

  // Fetch some source files
  const sourceFiles = {};
  const priorityFiles = prioritizeFiles(sourceFilePaths, configFilePaths);
  for (const p of priorityFiles.slice(0, MAX_SOURCE_FILES)) {
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) sourceFiles[p] = content;
  }

  // Fetch config files
  const configurationFiles = {};
  for (const p of configFilePaths) {
    if (p === "package.json") continue; // already fetched
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) configurationFiles[p] = content;
  }

  // Also try to fetch alternative manifests if package.json not found
  if (!packageManifest) {
    for (const altPath of altManifestPaths) {
      const content = await fetchGitHubFile(slug, altPath, headers);
      if (content) {
        configurationFiles[altPath] = content;
        console.log(`[RepoPilot] Found alternative manifest: ${altPath}`);
        break;
      }
    }
  }

  // Fetch test files
  const testFiles = {};
  for (const p of testFilePaths) {
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) testFiles[p] = content;
  }

  console.log(`[RepoPilot] Fetched source files: ${Object.keys(sourceFiles).length}, config: ${Object.keys(configurationFiles).length}, tests: ${Object.keys(testFiles).length}`);

  return {
    repositoryName: meta.name || repoName,
    fileTree,
    packageManifest: packageManifest || null,
    readme: readmeContent || null,
    sourceFiles,
    configurationFiles,
    testFiles,
    metadata: {
      githubSlug: slug,
      language: meta.language,
      description: meta.description,
      stars: meta.stargazers_count,
      defaultBranch: meta.default_branch,
    },
  };
}
=======
  // ── Detect monorepo structure from the file tree ───────────────────────────
  // Common patterns: frontend/, backend/, client/, server/, packages/, apps/
  const MONOREPO_DIRS = ["frontend", "backend", "client", "server", "api", "web", "app", "packages", "apps", "services"];
  const monorepoServices = MONOREPO_DIRS.filter((dir) =>
    allFiles.some((f) => f.startsWith(`${dir}/`))
  );
  const isMonorepo = monorepoServices.length >= 2;
  console.log(`[RepoPilot] Monorepo: ${isMonorepo} — services: ${monorepoServices.join(", ") || "none"}`);

  // ── Fetch manifests — root first, then nested for monorepos ───────────────
  const packageManifest = await fetchGitHubFile(slug, "package.json", headers, true);

  // For monorepos, collect per-service package.json and requirements.txt
  const monorepoManifests = {};
  if (isMonorepo) {
    const manifestFetches = await Promise.all(
      monorepoServices.flatMap((dir) => [
        fetchGitHubFile(slug, `${dir}/package.json`, headers, true).then((c) => c ? [`${dir}/package.json`, c] : null),
        fetchGitHubFile(slug, `${dir}/requirements.txt`, headers).then((c) => c ? [`${dir}/requirements.txt`, c] : null),
        fetchGitHubFile(slug, `${dir}/pyproject.toml`, headers).then((c) => c ? [`${dir}/pyproject.toml`, c] : null),
        fetchGitHubFile(slug, `${dir}/go.mod`, headers).then((c) => c ? [`${dir}/go.mod`, c] : null),
      ])
    );
    for (const entry of manifestFetches) {
      if (entry) monorepoManifests[entry[0]] = entry[1];
    }
    console.log(`[RepoPilot] Monorepo manifests found: ${Object.keys(monorepoManifests).join(", ") || "none"}`);
  }

  // Combine monorepo package.json manifests into a single merged view for the rule engine
  // Strategy: merge all found package.json dependencies so the full stack is visible
  let effectivePackageManifest = packageManifest;
  if (!effectivePackageManifest && isMonorepo) {
    const pkgManifests = Object.entries(monorepoManifests)
      .filter(([k]) => k.endsWith("package.json"))
      .map(([, v]) => v);
    if (pkgManifests.length > 0) {
      // Merge all package.json files into one combined manifest
      effectivePackageManifest = pkgManifests.reduce((acc, pkg) => {
        acc.dependencies = { ...(acc.dependencies || {}), ...(pkg.dependencies || {}) };
        acc.devDependencies = { ...(acc.devDependencies || {}), ...(pkg.devDependencies || {}) };
        acc.scripts = acc.scripts || pkg.scripts || {};
        acc.name = acc.name || pkg.name;
        acc.engines = acc.engines || pkg.engines;
        return acc;
      }, { name: repoName, dependencies: {}, devDependencies: {}, scripts: {} });
    }
  }

  // Alt manifest paths for non-JS roots
  const altManifestPaths = ["requirements.txt", "pyproject.toml", "go.mod", "Cargo.toml", "pom.xml", "build.gradle"];

  const readmeContent = await fetchGitHubFile(slug, "README.md", headers) ||
                        await fetchGitHubFile(slug, "readme.md", headers) ||
                        await fetchGitHubFile(slug, "Readme.md", headers);

  // Fetch some source files
  const sourceFiles = {};
  const priorityFiles = prioritizeFiles(sourceFilePaths, configFilePaths);
  for (const p of priorityFiles.slice(0, MAX_SOURCE_FILES)) {
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) sourceFiles[p] = content;
  }

  // Fetch config files
  const configurationFiles = {};
  for (const p of configFilePaths) {
    if (p === "package.json") continue; // already fetched
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) configurationFiles[p] = content;
  }

  // Add monorepo manifests to configurationFiles so the rule engine can read them
  for (const [path, content] of Object.entries(monorepoManifests)) {
    if (!configurationFiles[path]) {
      configurationFiles[path] = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    }
  }

  // Also try to fetch alternative manifests if no package.json found at root or in monorepo
  if (!effectivePackageManifest) {
    for (const altPath of altManifestPaths) {
      const content = await fetchGitHubFile(slug, altPath, headers);
      if (content) {
        configurationFiles[altPath] = content;
        console.log(`[RepoPilot] Found alternative manifest: ${altPath}`);
        break;
      }
    }
  }

  // Fetch test files
  const testFiles = {};
  for (const p of testFilePaths) {
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) testFiles[p] = content;
  }

  console.log(`[RepoPilot] Fetched source files: ${Object.keys(sourceFiles).length}, config: ${Object.keys(configurationFiles).length}, tests: ${Object.keys(testFiles).length}`);

  return {
    repositoryName: meta.name || repoName,
    fileTree,
    packageManifest: effectivePackageManifest || null,
    readme: readmeContent || null,
    sourceFiles,
    configurationFiles,
    testFiles,
    metadata: {
      githubSlug: slug,
      language: meta.language,
      description: meta.description,
      stars: meta.stargazers_count,
      defaultBranch: meta.default_branch,
      isMonorepo,
      monorepoServices,
    },
  };
}
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: read_file

Now fix the raw fallback extractor to also probe monorepo manifest paths:

> 🔧 **read_file** — repopilot/src/utils/repoExtractor.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:440
-------
  // Fetch all well-known files in parallel
  const [
    readmeMain, readmeLower, readmeCap,
    pkgRaw,
    requirementsTxt,
    pyprojectToml,
    goMod,
    cargoToml,
    pomXml,
  ] = await Promise.all([
    rawFetch("README.md"),
    rawFetch("readme.md"),
    rawFetch("Readme.md"),
    rawFetch("package.json"),
    rawFetch("requirements.txt"),
    rawFetch("pyproject.toml"),
    rawFetch("go.mod"),
    rawFetch("Cargo.toml"),
    rawFetch("pom.xml"),
  ]);

  const readmeContent = readmeMain || readmeLower || readmeCap;

  let packageManifest = null;
  try { if (pkgRaw) packageManifest = JSON.parse(pkgRaw); } catch { /* ignore */ }

  const configurationFiles = {};
  if (requirementsTxt) configurationFiles["requirements.txt"] = requirementsTxt;
  if (pyprojectToml)  configurationFiles["pyproject.toml"]   = pyprojectToml;
  if (goMod)          configurationFiles["go.mod"]           = goMod;
  if (cargoToml)      configurationFiles["Cargo.toml"]       = cargoToml;
  if (pomXml)         configurationFiles["pom.xml"]          = pomXml;

  // Fetch a handful of common source entry-points
  const commonSources = [
    "src/index.ts", "src/index.tsx", "src/index.js",
    "src/app/page.tsx", "src/app/page.jsx",
    "src/main.ts", "src/main.tsx", "src/main.js",
    "main.py", "app.py", "manage.py",
    "main.go", "cmd/main.go",
    "src/main.rs", "main.rs",
  ];
  const sourceFiles = {};
  const sourceFetches = await Promise.all(commonSources.map((p) => rawFetch(p).then((c) => [p, c])));
  for (const [path, content] of sourceFetches) {
    if (content) sourceFiles[path] = content.slice(0, MAX_FILE_CHARS);
  }

  // Try to fetch .env.example
  const envExample = await rawFetch(".env.example") || await rawFetch(".env.sample");
  if (envExample) configurationFiles[".env.example"] = envExample;

  // Detect language from files we found
  const allFoundPaths = [
    ...Object.keys(sourceFiles),
    ...Object.keys(configurationFiles),
    readmeContent ? "README.md" : null,
  ].filter(Boolean);

  console.log(`[repoExtractor] Raw fallback fetched — readme:${!!readmeContent}, pkg:${!!packageManifest}, sources:${Object.keys(sourceFiles).length}, configs:${Object.keys(configurationFiles).length}`);

  return {
    repositoryName: repoName,
    fileTree: allFoundPaths,
    packageManifest,
    readme: readmeContent,
    sourceFiles,
    configurationFiles,
    testFiles: {},
    metadata: {
      githubSlug: slug,
      language: null,   // GitHub API unavailable — will be inferred by rule engine
      description: null,
      stars: null,
      defaultBranch: branch,
    },
  };
}
=======
  // Fetch root-level well-known files in parallel
  const [
    readmeMain, readmeLower, readmeCap,
    pkgRaw,
    requirementsTxt,
    pyprojectToml,
    goMod,
    cargoToml,
    pomXml,
  ] = await Promise.all([
    rawFetch("README.md"),
    rawFetch("readme.md"),
    rawFetch("Readme.md"),
    rawFetch("package.json"),
    rawFetch("requirements.txt"),
    rawFetch("pyproject.toml"),
    rawFetch("go.mod"),
    rawFetch("Cargo.toml"),
    rawFetch("pom.xml"),
  ]);

  const readmeContent = readmeMain || readmeLower || readmeCap;

  let rootPackageManifest = null;
  try { if (pkgRaw) rootPackageManifest = JSON.parse(pkgRaw); } catch { /* ignore */ }

  const configurationFiles = {};
  if (requirementsTxt) configurationFiles["requirements.txt"] = requirementsTxt;
  if (pyprojectToml)  configurationFiles["pyproject.toml"]   = pyprojectToml;
  if (goMod)          configurationFiles["go.mod"]           = goMod;
  if (cargoToml)      configurationFiles["Cargo.toml"]       = cargoToml;
  if (pomXml)         configurationFiles["pom.xml"]          = pomXml;

  // ── Probe common monorepo service directories ─────────────────────────────
  const MONOREPO_DIRS = ["frontend", "backend", "client", "server", "api", "web", "app"];
  const monoFetches = await Promise.all(
    MONOREPO_DIRS.flatMap((dir) => [
      rawFetch(`${dir}/package.json`).then((c) => c ? [`${dir}/package.json`, c] : null),
      rawFetch(`${dir}/requirements.txt`).then((c) => c ? [`${dir}/requirements.txt`, c] : null),
      rawFetch(`${dir}/pyproject.toml`).then((c) => c ? [`${dir}/pyproject.toml`, c] : null),
      rawFetch(`${dir}/.env.example`).then((c) => c ? [`${dir}/.env.example`, c] : null),
    ])
  );
  const monorepoManifests = {};
  for (const entry of monoFetches) {
    if (entry) monorepoManifests[entry[0]] = entry[1];
  }

  // Merge found per-service package.json files into one effective manifest
  const servicePackages = Object.entries(monorepoManifests)
    .filter(([k]) => k.endsWith("package.json"))
    .map(([, v]) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return null; } })
    .filter(Boolean);

  let effectivePackageManifest = rootPackageManifest;
  if (!effectivePackageManifest && servicePackages.length > 0) {
    effectivePackageManifest = servicePackages.reduce((acc, pkg) => {
      acc.dependencies = { ...(acc.dependencies || {}), ...(pkg.dependencies || {}) };
      acc.devDependencies = { ...(acc.devDependencies || {}), ...(pkg.devDependencies || {}) };
      acc.scripts = acc.scripts || pkg.scripts || {};
      acc.name = acc.name || pkg.name;
      return acc;
    }, { name: repoName, dependencies: {}, devDependencies: {}, scripts: {} });
  }

  // Add monorepo manifests to config files so rule engine can see them
  for (const [path, content] of Object.entries(monorepoManifests)) {
    if (!configurationFiles[path]) {
      configurationFiles[path] = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    }
  }

  // Detected monorepo services
  const detectedDirs = new Set(
    Object.keys(monorepoManifests).map((p) => p.split("/")[0])
  );
  const isMonorepo = detectedDirs.size >= 2;
  const monorepoServices = [...detectedDirs];

  // Fetch a handful of common source entry-points (root + monorepo)
  const commonSources = [
    "src/index.ts", "src/index.tsx", "src/index.js",
    "src/app/page.tsx", "src/app/page.jsx",
    "src/main.ts", "src/main.tsx", "src/main.js",
    "main.py", "app.py", "manage.py",
    "main.go", "cmd/main.go",
    "src/main.rs", "main.rs",
    // Monorepo-aware entry points
    "frontend/src/main.tsx", "frontend/src/main.ts", "frontend/src/App.tsx",
    "backend/main.py", "backend/app/main.py", "backend/main.py",
    "client/src/main.tsx", "server/index.ts", "server/index.js",
  ];
  const sourceFiles = {};
  const sourceFetches = await Promise.all(commonSources.map((p) => rawFetch(p).then((c) => [p, c])));
  for (const [path, content] of sourceFetches) {
    if (content) sourceFiles[path] = content.slice(0, MAX_FILE_CHARS);
  }

  // Try to fetch .env.example (root and per-service)
  const envExample = await rawFetch(".env.example") || await rawFetch(".env.sample");
  if (envExample) configurationFiles[".env.example"] = envExample;

  // Detect language from files we found
  const allFoundPaths = [
    ...Object.keys(sourceFiles),
    ...Object.keys(configurationFiles),
    readmeContent ? "README.md" : null,
  ].filter(Boolean);

  console.log(`[repoExtractor] Raw fallback fetched — readme:${!!readmeContent}, pkg:${!!effectivePackageManifest}, monorepo:${isMonorepo}(${monorepoServices.join(",")}), sources:${Object.keys(sourceFiles).length}, configs:${Object.keys(configurationFiles).length}`);

  return {
    repositoryName: repoName,
    fileTree: allFoundPaths,
    packageManifest: effectivePackageManifest,
    readme: readmeContent,
    sourceFiles,
    configurationFiles,
    testFiles: {},
    metadata: {
      githubSlug: slug,
      language: null,   // GitHub API unavailable — will be inferred by rule engine
      description: null,
      stars: null,
      defaultBranch: branch,
      isMonorepo,
      monorepoServices,
    },
  };
}
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: update_todo_list

Now update the `schemas.js` to accept the new `isMonorepo`/`monorepoServices` metadata fields, then update the route to pass them through:

> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[x] Improve Gemini prompt — request more depth, better stats instruction
[x] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision
[x] Fix repoExtractor — detect monorepo structure, fetch nested package.json and requirements.txt
[x] Fix raw fallback extractor — also probe common monorepo manifest paths
[-] Fix RuleBasedProvider _buildSetupSteps — generate multi-service steps for monorepos (backend + frontend)
[ ] Fix RuleBasedProvider _analyzeDependencies — parse both frontend/package.json and backend/requirements.txt
[ ] Fix RuleBasedProvider _detectFramework — recognise monorepo + surface full stack


### 🤖 Assistant

> 🔧 called: apply_diff

Now update the `schemas.js` to allow `isMonorepo` and `monorepoServices` through, update the route sanitiser, and then fix the rule engine:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:26
-------
  metadata: z
    .object({
      githubSlug: z.string().optional(),
      language: z.string().optional(),
      description: z.string().optional(),
      stars: z.number().optional(),
      defaultBranch: z.string().optional(),
    })
    .default({}),
=======
  metadata: z
    .object({
      githubSlug: z.string().optional(),
      language: z.string().optional(),
      description: z.string().optional(),
      stars: z.number().optional(),
      defaultBranch: z.string().optional(),
      isMonorepo: z.boolean().optional(),
      monorepoServices: z.array(z.string()).optional(),
    })
    .default({}),
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff

Now update the route to pass through the new metadata fields:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:93
-------
  const sanitisedMetadata =
    metadata && typeof metadata === "object"
      ? {
          githubSlug:    typeof metadata.githubSlug    === "string" ? metadata.githubSlug : undefined,
          language:      typeof metadata.language      === "string" ? metadata.language : undefined,
          description:   typeof metadata.description   === "string" ? metadata.description.slice(0, 500) : undefined,
          stars:         typeof metadata.stars         === "number" ? metadata.stars : undefined,
          defaultBranch: typeof metadata.defaultBranch === "string" ? metadata.defaultBranch : undefined,
        }
      : {};
=======
  const sanitisedMetadata =
    metadata && typeof metadata === "object"
      ? {
          githubSlug:        typeof metadata.githubSlug        === "string"  ? metadata.githubSlug : undefined,
          language:          typeof metadata.language          === "string"  ? metadata.language : undefined,
          description:       typeof metadata.description       === "string"  ? metadata.description.slice(0, 500) : undefined,
          stars:             typeof metadata.stars             === "number"  ? metadata.stars : undefined,
          defaultBranch:     typeof metadata.defaultBranch     === "string"  ? metadata.defaultBranch : undefined,
          isMonorepo:        typeof metadata.isMonorepo        === "boolean" ? metadata.isMonorepo : undefined,
          monorepoServices:  Array.isArray(metadata.monorepoServices)        ? metadata.monorepoServices.filter((s) => typeof s === "string").slice(0, 20) : undefined,
        }
      : {};
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: read_file

Now fix `_buildSetupSteps` in `RuleBasedProvider.js` to generate multi-service steps for monorepos, and fix `_analyzeDependencies` to parse both Python and JS deps from monorepo config files, and fix `_detectFramework` to detect monorepos:

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff

Now I'll update `_analyze` to pass `metadata` to all helpers, and then fix the three key methods:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:140
-------
    // ── 1. Language & framework detection ───────────────────────────────────
    const language = this._detectLanguage(pkg, fileTree, metadata);
    const { framework, stack } = this._detectFramework(pkg, fileTree, configurationFiles, language);
    const testFramework = this._detectTestFramework(pkg, fileTree);

    // ── 2. Dependency analysis ───────────────────────────────────────────────
    const { depNodes, depAlerts, depOutdated } = this._analyzeDependencies(pkg, repositoryName, configurationFiles);

    // ── 3. Environment variables ─────────────────────────────────────────────
    const envVars = this._extractEnvVars(sourceFiles, configurationFiles);

    // ── 4. Setup steps ───────────────────────────────────────────────────────
    const setupSteps = this._buildSetupSteps(pkg, repositoryName, configurationFiles, language, framework, metadata);
=======
    // ── 0. Monorepo detection ────────────────────────────────────────────────
    const isMonorepo = !!metadata?.isMonorepo ||
      this._detectMonorepo(fileTree, configurationFiles);
    const monorepoServices = metadata?.monorepoServices || this._inferMonorepoServices(fileTree, configurationFiles);

    // ── 1. Language & framework detection ───────────────────────────────────
    const language = this._detectLanguage(pkg, fileTree, metadata);
    const { framework, stack } = this._detectFramework(pkg, fileTree, configurationFiles, language, isMonorepo, monorepoServices);
    const testFramework = this._detectTestFramework(pkg, fileTree);

    // ── 2. Dependency analysis ───────────────────────────────────────────────
    const { depNodes, depAlerts, depOutdated } = this._analyzeDependencies(pkg, repositoryName, configurationFiles, isMonorepo);

    // ── 3. Environment variables ─────────────────────────────────────────────
    const envVars = this._extractEnvVars(sourceFiles, configurationFiles);

    // ── 4. Setup steps ───────────────────────────────────────────────────────
    const setupSteps = this._buildSetupSteps(pkg, repositoryName, configurationFiles, language, framework, metadata, isMonorepo, monorepoServices);
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: read_file

Now add the two new helper methods `_detectMonorepo` and `_inferMonorepoServices`, and update `_detectFramework`, `_analyzeDependencies`, and `_buildSetupSteps`. Let me find the right insertion point:

> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:229
-------
  // ─── Language detection ────────────────────────────────────────────────────

  _detectLanguage(pkg, fileTree, metadata) {
=======
  // ─── Monorepo helpers ─────────────────────────────────────────────────────

  _detectMonorepo(fileTree, configFiles) {
    const MONO_DIRS = ["frontend", "backend", "client", "server", "api", "web"];
    const found = MONO_DIRS.filter((dir) =>
      fileTree.some((f) => f.startsWith(`${dir}/`)) ||
      Object.keys(configFiles).some((k) => k.startsWith(`${dir}/`))
    );
    return found.length >= 2;
  }

  _inferMonorepoServices(fileTree, configFiles) {
    const MONO_DIRS = ["frontend", "backend", "client", "server", "api", "web", "app", "packages", "apps", "services"];
    return MONO_DIRS.filter((dir) =>
      fileTree.some((f) => f.startsWith(`${dir}/`)) ||
      Object.keys(configFiles).some((k) => k.startsWith(`${dir}/`))
    );
  }

  // ─── Language detection ────────────────────────────────────────────────────

  _detectLanguage(pkg, fileTree, metadata) {
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: grep

Now update `_detectFramework` to handle monorepos and `_analyzeDependencies` to parse all service manifests:

> 🔧 **grep** — _detectFramework\(pkg, fileTree, configFiles, language\)

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:274
-------
  _detectFramework(pkg, fileTree, configFiles, language) {
    if (!pkg) {
      // Non-JS: detect from config files and file tree
      const configKeys = Object.keys(configFiles).join(" ").toLowerCase();
      const treeStr = fileTree.join(" ").toLowerCase();

      if (configKeys.includes("requirements.txt") || configKeys.includes("pyproject.toml")) {
        const reqContent = configFiles["requirements.txt"] || "";
        const pyprojectContent = configFiles["pyproject.toml"] || "";
        const combined = reqContent + pyprojectContent;
        if (combined.match(/django/i)) return { framework: "Django", stack: ["Python", "Django"] };
        if (combined.match(/flask/i)) return { framework: "Flask", stack: ["Python", "Flask"] };
        if (combined.match(/fastapi/i)) return { framework: "FastAPI", stack: ["Python", "FastAPI", "Uvicorn"] };
        if (combined.match(/tornado/i)) return { framework: "Tornado", stack: ["Python", "Tornado"] };
        if (combined.match(/starlette/i)) return { framework: "Starlette", stack: ["Python", "Starlette"] };
        return { framework: "Python", stack: ["Python"] };
      }
      if (configKeys.includes("go.mod") || treeStr.includes("go.mod")) return { framework: "Go", stack: ["Go"] };
      if (configKeys.includes("cargo.toml") || treeStr.includes("cargo.toml")) return { framework: "Rust / Cargo", stack: ["Rust"] };
      if (configKeys.includes("pom.xml") || treeStr.includes("pom.xml")) return { framework: "Spring / Maven", stack: ["Java", "Maven"] };
      if (configKeys.includes("build.gradle") || treeStr.includes("build.gradle")) return { framework: "Gradle / Spring", stack: ["Java", "Gradle"] };
      if (treeStr.includes("pubspec.yaml")) return { framework: "Flutter / Dart", stack: ["Dart", "Flutter"] };
      return { framework: language, stack: [language] };
    }

    for (const rule of FRAMEWORK_RULES) {
      if (rule.test(pkg)) {
        const stack = this._buildStack(pkg, rule.name, language);
        return { framework: rule.name, stack };
      }
    }

    return {
      framework: language === "TypeScript" ? "TypeScript (Node.js)" : "Node.js",
      stack: this._buildStack(pkg, "Node.js", language),
    };
  }
=======
  _detectFramework(pkg, fileTree, configFiles, language, isMonorepo = false, monorepoServices = []) {
    const configKeys = Object.keys(configFiles).join(" ").toLowerCase();
    const treeStr = fileTree.join(" ").toLowerCase();

    // ── Monorepo: detect all services and combine their frameworks into one description ──
    if (isMonorepo && monorepoServices.length > 0) {
      const serviceFrameworks = [];
      const combinedStack = new Set();

      // Detect Python backends
      const allReqContent = Object.entries(configFiles)
        .filter(([k]) => k.includes("requirements.txt") || k.includes("pyproject.toml"))
        .map(([, v]) => v).join(" ");
      if (allReqContent) {
        combinedStack.add("Python");
        if (allReqContent.match(/fastapi/i)) { serviceFrameworks.push("FastAPI"); combinedStack.add("FastAPI"); combinedStack.add("Uvicorn"); }
        else if (allReqContent.match(/django/i)) { serviceFrameworks.push("Django"); combinedStack.add("Django"); }
        else if (allReqContent.match(/flask/i)) { serviceFrameworks.push("Flask"); combinedStack.add("Flask"); }
        else serviceFrameworks.push("Python");
      }

      // Detect JS frontend
      if (pkg) {
        for (const rule of FRAMEWORK_RULES) {
          if (rule.test(pkg)) {
            serviceFrameworks.push(rule.name);
            for (const s of this._buildStack(pkg, rule.name, language)) combinedStack.add(s);
            break;
          }
        }
        if (serviceFrameworks.length === (allReqContent ? 1 : 0)) {
          // No JS framework matched — add generic JS label
          serviceFrameworks.push(language === "TypeScript" ? "TypeScript (Vite)" : "JavaScript (Vite)");
          for (const s of this._buildStack(pkg, "Vite", language)) combinedStack.add(s);
        }
      } else if (treeStr.includes("vite.config") || treeStr.includes("frontend/src")) {
        serviceFrameworks.push("Vite (Frontend)");
        combinedStack.add("JavaScript");
        combinedStack.add("Vite");
      }

      if (serviceFrameworks.length > 0) {
        return {
          framework: serviceFrameworks.join(" + "),
          stack: [...combinedStack].filter(Boolean).slice(0, 12),
        };
      }
    }

    if (!pkg) {
      // Non-JS: detect from config files and file tree
      if (configKeys.includes("requirements.txt") || configKeys.includes("pyproject.toml")) {
        const allReqContent = Object.entries(configFiles)
          .filter(([k]) => k.includes("requirements.txt") || k.includes("pyproject.toml"))
          .map(([, v]) => v).join(" ");
        if (allReqContent.match(/django/i)) return { framework: "Django", stack: ["Python", "Django"] };
        if (allReqContent.match(/flask/i)) return { framework: "Flask", stack: ["Python", "Flask"] };
        if (allReqContent.match(/fastapi/i)) return { framework: "FastAPI", stack: ["Python", "FastAPI", "Uvicorn"] };
        if (allReqContent.match(/tornado/i)) return { framework: "Tornado", stack: ["Python", "Tornado"] };
        if (allReqContent.match(/starlette/i)) return { framework: "Starlette", stack: ["Python", "Starlette"] };
        return { framework: "Python", stack: ["Python"] };
      }
      if (configKeys.includes("go.mod") || treeStr.includes("go.mod")) return { framework: "Go", stack: ["Go"] };
      if (configKeys.includes("cargo.toml") || treeStr.includes("cargo.toml")) return { framework: "Rust / Cargo", stack: ["Rust"] };
      if (configKeys.includes("pom.xml") || treeStr.includes("pom.xml")) return { framework: "Spring / Maven", stack: ["Java", "Maven"] };
      if (configKeys.includes("build.gradle") || treeStr.includes("build.gradle")) return { framework: "Gradle / Spring", stack: ["Java", "Gradle"] };
      if (treeStr.includes("pubspec.yaml")) return { framework: "Flutter / Dart", stack: ["Dart", "Flutter"] };
      return { framework: language, stack: [language] };
    }

    for (const rule of FRAMEWORK_RULES) {
      if (rule.test(pkg)) {
        const stack = this._buildStack(pkg, rule.name, language);
        return { framework: rule.name, stack };
      }
    }

    return {
      framework: language === "TypeScript" ? "TypeScript (Node.js)" : "Node.js",
      stack: this._buildStack(pkg, "Node.js", language),
    };
  }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: grep

Now update `_analyzeDependencies` to parse ALL requirements.txt files found in configFiles (including `backend/requirements.txt`):

> 🔧 **grep** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:487
-------
  _analyzeDependencies(pkg, repoName, configFiles = {}) {
    const depNodes = [{ id: "root", label: repoName, type: "root", health: "ok" }];
    const depAlerts = [];
    const depOutdated = [];

    // ── Non-JS: parse requirements.txt / go.mod / Cargo.toml / pom.xml ───────
    if (!pkg) {
      this._parseNonJsDeps(configFiles, depNodes);
      return { depNodes, depAlerts, depOutdated };
    }

    const prod = pkg.dependencies || {};
    const dev = pkg.devDependencies || {};

    // Build nodes for all dependencies
    for (const [name, version] of Object.entries(prod)) {
      const isVuln = VULNERABILITY_ADVISORIES.some((a) => a.pkg === name && a.versionRe.test(version));
      const health = isVuln ? "warning" : "ok";
      depNodes.push({ id: name, label: `${name}@${version}`, type: "dep", health });
    }
    for (const [name, version] of Object.entries(dev)) {
      const isVuln = VULNERABILITY_ADVISORIES.some((a) => a.pkg === name && a.versionRe.test(version));
      const health = isVuln ? "warning" : "ok";
      depNodes.push({ id: `dev-${name}`, label: `${name}@${version}`, type: "devDep", health });
    }

    // Generate alerts for version-matched vulnerabilities only
    const allDeps = { ...prod, ...dev };
    for (const advisory of VULNERABILITY_ADVISORIES) {
      const version = allDeps[advisory.pkg];
      if (version && advisory.versionRe.test(version)) {
        depAlerts.push({
          pkg: advisory.pkg,
          severity: advisory.severity,
          cve: "",
          desc: advisory.advisory,
        });
      }
    }

    // Outdated major version detection
    for (const { pkg: name, old: re, latest } of OUTDATED_PATTERNS) {
      const v = prod[name] || dev[name];
      if (v && re.test(v)) {
        depOutdated.push({ pkg: name, current: v, latest, status: "outdated" });
      }
    }

    return { depNodes, depAlerts, depOutdated };
  }
=======
  _analyzeDependencies(pkg, repoName, configFiles = {}, isMonorepo = false) {
    const depNodes = [{ id: "root", label: repoName, type: "root", health: "ok" }];
    const depAlerts = [];
    const depOutdated = [];

    // ── Always parse non-JS manifests from config files (handles monorepos) ──
    // This covers: root requirements.txt, backend/requirements.txt, go.mod, Cargo.toml etc.
    this._parseNonJsDeps(configFiles, depNodes);

    if (!pkg) {
      // Pure non-JS project — non-JS deps already added above
      return { depNodes, depAlerts, depOutdated };
    }

    const prod = pkg.dependencies || {};
    const dev = pkg.devDependencies || {};

    // Build nodes for all JS/TS dependencies
    for (const [name, version] of Object.entries(prod)) {
      const isVuln = VULNERABILITY_ADVISORIES.some((a) => a.pkg === name && a.versionRe.test(version));
      const health = isVuln ? "warning" : "ok";
      // Avoid duplicate IDs with Python deps
      const id = depNodes.find((n) => n.id === name) ? `js-${name}` : name;
      depNodes.push({ id, label: `${name}@${version}`, type: "dep", health });
    }
    for (const [name, version] of Object.entries(dev)) {
      const isVuln = VULNERABILITY_ADVISORIES.some((a) => a.pkg === name && a.versionRe.test(version));
      const health = isVuln ? "warning" : "ok";
      depNodes.push({ id: `dev-${name}`, label: `${name}@${version}`, type: "devDep", health });
    }

    // Generate alerts for version-matched vulnerabilities only
    const allDeps = { ...prod, ...dev };
    for (const advisory of VULNERABILITY_ADVISORIES) {
      const version = allDeps[advisory.pkg];
      if (version && advisory.versionRe.test(version)) {
        depAlerts.push({
          pkg: advisory.pkg,
          severity: advisory.severity,
          cve: "",
          desc: advisory.advisory,
        });
      }
    }

    // Outdated major version detection
    for (const { pkg: name, old: re, latest } of OUTDATED_PATTERNS) {
      const v = prod[name] || dev[name];
      if (v && re.test(v)) {
        depOutdated.push({ pkg: name, current: v, latest, status: "outdated" });
      }
    }

    return { depNodes, depAlerts, depOutdated };
  }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: grep

Now also update `_parseNonJsDeps` to scan ALL requirements.txt variants from nested paths (not just the root):

> 🔧 **grep** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:547
-------
  _parseNonJsDeps(configFiles, depNodes) {
    // requirements.txt — "package==1.2.3" or "package>=1.0"
    const reqTxt = configFiles["requirements.txt"] || configFiles["requirements/base.txt"] || "";
    if (reqTxt) {
      for (const line of reqTxt.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;
        const m = trimmed.match(/^([A-Za-z0-9_.-]+)\s*([>=<!~^].+)?$/);
        if (m) {
          const name = m[1];
          const version = (m[2] || "").trim() || "*";
          depNodes.push({ id: name, label: `${name}@${version}`, type: "dep", health: "ok" });
        }
      }
    }
=======
  _parseNonJsDeps(configFiles, depNodes) {
    const existingIds = new Set(depNodes.map((n) => n.id));

    // requirements.txt — "package==1.2.3" or "package>=1.0"
    // Scan ALL requirements files found, including nested ones like backend/requirements.txt
    const reqPaths = Object.keys(configFiles).filter(
      (k) => k === "requirements.txt" || k.endsWith("/requirements.txt") ||
             k === "requirements/base.txt" || k.endsWith("/requirements/base.txt")
    );
    for (const reqPath of reqPaths) {
      const reqTxt = configFiles[reqPath] || "";
      for (const line of reqTxt.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;
        const m = trimmed.match(/^([A-Za-z0-9_.-]+)\s*([>=<!~^].+)?$/);
        if (m) {
          const name = m[1];
          if (existingIds.has(name)) continue; // skip if already added
          const version = (m[2] || "").trim() || "*";
          depNodes.push({ id: name, label: `${name}@${version}`, type: "dep", health: "ok" });
          existingIds.add(name);
        }
      }
    }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: grep

Now fix `_buildSetupSteps` to generate multi-service steps for monorepos:

> 🔧 **grep** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/lib/ai/RuleBasedProvider.js

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:666
-------
  _buildSetupSteps(pkg, repoName, configFiles, language, framework, metadata) {
    const steps = [];
    let id = 1;

    const slug = repoName.toLowerCase().replace(/\s+/g, "-");
    const ghSlug = metadata?.githubSlug;

    // Clone step — use real GitHub URL if available
    const cloneUrl = ghSlug
      ? `https://github.com/${ghSlug}.git`
      : `https://github.com/example/${slug}.git`;
    steps.push({
      id: id++,
      title: "Clone the repository",
      command: `git clone ${cloneUrl} && cd ${slug}`,
      description: "Clone the project to your local machine.",
    });

    if (!pkg) {
      // Non-JS languages
      const lang = (language || "").toLowerCase();
      const hasEnvExample = Object.keys(configFiles).some((f) => f.includes(".env.example") || f.includes(".env.sample"));
      if (lang === "python") {
        steps.push({ id: id++, title: "Create virtual environment", command: "python -m venv venv && source venv/bin/activate", description: "Isolate project dependencies." });
        steps.push({ id: id++, title: "Install dependencies", command: "pip install -r requirements.txt", description: "Install required Python packages." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Run the application", command: "python main.py", description: "Start the application." });
      } else if (lang === "go") {
        steps.push({ id: id++, title: "Install dependencies", command: "go mod tidy", description: "Download Go module dependencies." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Build the project", command: "go build ./...", description: "Compile the project." });
        steps.push({ id: id++, title: "Run the application", command: "go run .", description: "Start the application." });
      } else if (lang === "rust") {
        steps.push({ id: id++, title: "Build the project", command: "cargo build --release", description: "Compile with Cargo." });
        steps.push({ id: id++, title: "Run the application", command: "cargo run", description: "Start the application." });
      } else if (lang === "java" || lang === "kotlin") {
        steps.push({ id: id++, title: "Build the project", command: "mvn clean install", description: "Build with Maven." });
        steps.push({ id: id++, title: "Run the application", command: "mvn spring-boot:run", description: "Start the Spring Boot application." });
      } else if (lang === "dart") {
        steps.push({ id: id++, title: "Install Flutter", command: "flutter pub get", description: "Install Flutter dependencies." });
        steps.push({ id: id++, title: "Run the application", command: "flutter run", description: "Launch on a connected device or emulator." });
      } else if (lang === "ruby") {
        steps.push({ id: id++, title: "Install dependencies", command: "bundle install", description: "Install Ruby gems." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Run the application", command: "rails server", description: "Start the Rails server." });
      } else {
        // Truly unknown — give generic helpful steps
        steps.push({ id: id++, title: "Review project documentation", command: "cat README.md", description: "Check the README for language-specific setup instructions." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Build and run", command: "# Follow the project README for build and run instructions", description: "Execute the build and run steps as documented." });
      }
      return steps;
    }

    // Detect package manager
    const hasPnpm = Object.keys(configFiles).some((f) => f.includes("pnpm-lock"));
    const hasYarn = Object.keys(configFiles).some((f) => f.includes("yarn.lock"));
    const hasBun = Object.keys(configFiles).some((f) => f.includes("bun.lockb") || f.includes("bun.lock"));
    const pm = hasBun ? "bun" : hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";

    const installCmd = pm === "npm" ? "npm install" : `${pm} install`;
    steps.push({
      id: id++,
      title: "Install dependencies",
      command: installCmd,
      description: `Install all required packages using ${pm}.`,
    });

    // Environment setup
    const hasEnvExample = Object.keys(configFiles).some((f) => /\.env\.(example|sample)/i.test(f));
    if (hasEnvExample) {
      steps.push({
        id: id++,
        title: "Configure environment variables",
        command: "cp .env.example .env",
        description: "Copy the example env file and fill in required values.",
      });
    }

    // Supabase setup
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    if (all["@supabase/supabase-js"] || all["@supabase/ssr"]) {
      if (!hasEnvExample) {
        steps.push({
          id: id++,
          title: "Configure Supabase environment",
          command: 'echo "NEXT_PUBLIC_SUPABASE_URL=your_url\\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" > .env.local',
          description: "Set your Supabase project URL and anon key (found in your Supabase dashboard).",
        });
      }
    }

    // Firebase setup
    if (all.firebase || all["firebase-admin"]) {
      if (!hasEnvExample) {
        steps.push({
          id: id++,
          title: "Configure Firebase",
          command: "# Set NEXT_PUBLIC_FIREBASE_API_KEY and related vars in .env.local",
          description: "Add your Firebase configuration keys from the Firebase console.",
        });
      }
    }

    // Prisma
    const hasPrisma = Object.keys(configFiles).some((f) => f.includes("schema.prisma"));
    if (hasPrisma) {
      steps.push({ id: id++, title: "Generate Prisma client", command: "npx prisma generate", description: "Generate the Prisma database client." });
      steps.push({ id: id++, title: "Run database migrations", command: "npx prisma db push", description: "Apply database schema migrations." });
    }

    // Start command
    const scripts = pkg.scripts || {};
    const startCmd = scripts.dev
      ? `${pm === "npm" ? "npm run dev" : `${pm} run dev`}`
      : scripts.start
      ? `${pm === "npm" ? "npm start" : `${pm} start`}`
      : `${pm === "npm" ? "npm run dev" : `${pm} run dev`}`;
    const startDesc = scripts.dev
      ? "Launch the development server with hot-reload."
      : "Start the application.";
    steps.push({ id: id++, title: "Start the development server", command: startCmd, description: startDesc });

    // Build step
    if (scripts.build) {
      steps.push({
        id: id++,
        title: "Build for production (optional)",
        command: `${pm === "npm" ? "npm run build" : `${pm} run build`}`,
        description: "Create an optimized production build.",
      });
    }

    return steps;
  }
=======
  _buildSetupSteps(pkg, repoName, configFiles, language, framework, metadata, isMonorepo = false, monorepoServices = []) {
    const steps = [];
    let id = 1;

    const slug = repoName.toLowerCase().replace(/\s+/g, "-");
    const ghSlug = metadata?.githubSlug;

    // Clone step — use real GitHub URL if available
    const cloneUrl = ghSlug
      ? `https://github.com/${ghSlug}.git`
      : `https://github.com/example/${slug}.git`;
    steps.push({
      id: id++,
      title: "Clone the repository",
      command: `git clone ${cloneUrl} && cd ${slug}`,
      description: "Clone the project to your local machine.",
    });

    // ── Monorepo: generate per-service setup steps ─────────────────────────
    if (isMonorepo && monorepoServices.length >= 2) {
      // Detect which services exist and what type they are
      const hasPythonBackend = monorepoServices.some((dir) =>
        Object.keys(configFiles).some((k) => k.startsWith(`${dir}/requirements`) || k.startsWith(`${dir}/pyproject`)) ||
        (configFiles["backend/requirements.txt"] || configFiles["requirements.txt"])
      );
      const hasJsFrontend = pkg || monorepoServices.some((dir) =>
        Object.keys(configFiles).some((k) => k.startsWith(`${dir}/package.json`))
      );

      // Detect backend directory name
      const backendDir = ["backend", "server", "api"].find((d) => monorepoServices.includes(d)) || "backend";
      // Detect frontend directory name
      const frontendDir = ["frontend", "client", "web"].find((d) => monorepoServices.includes(d)) || "frontend";

      // Detect env example paths
      const hasBackendEnv = Object.keys(configFiles).some((f) =>
        f.startsWith(`${backendDir}/`) && /\.env\.(example|sample)/i.test(f)
      );
      const hasFrontendEnv = Object.keys(configFiles).some((f) =>
        f.startsWith(`${frontendDir}/`) && /\.env\.(example|sample)/i.test(f)
      );
      const hasRootEnv = Object.keys(configFiles).some((f) =>
        (f === ".env.example" || f === ".env.sample") && !f.includes("/")
      );

      // Detect frontend package manager
      const hasPnpm = Object.keys(configFiles).some((f) => f.includes("pnpm-lock"));
      const hasYarn = Object.keys(configFiles).some((f) => f.includes("yarn.lock"));
      const hasBun = Object.keys(configFiles).some((f) => f.includes("bun.lockb") || f.includes("bun.lock"));
      const pm = hasBun ? "bun" : hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";

      // Check for docker-compose
      const hasCompose = Object.keys(configFiles).some((f) => f.includes("docker-compose")) ||
        (metadata?.fileTree || []).some?.((f) => f.includes("docker-compose"));

      if (hasCompose) {
        steps.push({
          id: id++,
          title: "Quick start with Docker Compose (recommended)",
          command: `cp ${backendDir}/.env.example ${backendDir}/.env\ndocker compose up --build`,
          description: `Starts all services (backend + frontend) in one command. Visit http://localhost:5173 for the frontend and http://localhost:8000 for the API.`,
        });
        steps.push({
          id: id++,
          title: "Seed the database (first run only)",
          command: `docker compose exec ${backendDir} python -m app.seed.seed_data`,
          description: "Populate the database with demo data for initial exploration.",
        });
        steps.push({
          id: id++,
          title: "[OR] Manual backend setup",
          command: `cd ${backendDir}\npython -m venv venv && source venv/bin/activate\npip install -r requirements.txt${hasBackendEnv ? `\ncp .env.example .env` : ""}`,
          description: `Set up the ${backendDir} Python environment manually.`,
        });
        steps.push({
          id: id++,
          title: "Start backend server (manual)",
          command: `cd ${backendDir} && uvicorn main:app --reload --port 8000`,
          description: "Start the backend API server with hot-reload on port 8000.",
        });
        steps.push({
          id: id++,
          title: "Start frontend (new terminal)",
          command: `cd ${frontendDir}\n${pm} install${hasFrontendEnv ? `\necho "VITE_API_BASE_URL=http://localhost:8000" > .env` : ""}\n${pm} run dev`,
          description: `Install frontend dependencies and start the Vite dev server. Visit http://localhost:5173.`,
        });
      } else if (hasPythonBackend && hasJsFrontend) {
        // Python backend + JS frontend (no Docker)
        steps.push({
          id: id++,
          title: `Set up ${backendDir} (Python)`,
          command: `cd ${backendDir}\npython -m venv venv && source venv/bin/activate\npip install -r requirements.txt`,
          description: `Create a virtual environment and install ${backendDir} Python dependencies.`,
        });
        if (hasBackendEnv || hasRootEnv) {
          const envSrc = hasBackendEnv ? `${backendDir}/.env.example` : ".env.example";
          const envDst = hasBackendEnv ? `${backendDir}/.env` : ".env";
          steps.push({
            id: id++,
            title: "Configure environment variables",
            command: `cp ${envSrc} ${envDst}`,
            description: "Copy the example env file and fill in required API keys and settings.",
          });
        }
        steps.push({
          id: id++,
          title: `Start ${backendDir} server`,
          command: `cd ${backendDir} && uvicorn main:app --reload --port 8000`,
          description: "Start the backend API on http://localhost:8000. Keep this terminal running.",
        });
        steps.push({
          id: id++,
          title: `Set up ${frontendDir} (new terminal)`,
          command: `cd ${frontendDir} && ${pm} install`,
          description: `Install ${frontendDir} JavaScript dependencies.`,
        });
        if (hasFrontendEnv) {
          steps.push({
            id: id++,
            title: `Configure ${frontendDir} environment`,
            command: `echo "VITE_API_BASE_URL=http://localhost:8000" > ${frontendDir}/.env`,
            description: "Point the frontend at the local backend API.",
          });
        }
        steps.push({
          id: id++,
          title: `Start ${frontendDir} dev server`,
          command: `cd ${frontendDir} && ${pm} run dev`,
          description: `Launch the frontend dev server at http://localhost:5173.`,
        });
      } else {
        // Generic monorepo (unknown service types)
        for (const dir of monorepoServices.slice(0, 3)) {
          steps.push({
            id: id++,
            title: `Set up ${dir} service`,
            command: `cd ${dir} && npm install`,
            description: `Install dependencies for the ${dir} service.`,
          });
        }
      }
      return steps;
    }

    // ── Single service: original logic ─────────────────────────────────────
    if (!pkg) {
      // Non-JS languages
      const lang = (language || "").toLowerCase();
      const hasEnvExample = Object.keys(configFiles).some((f) => f.includes(".env.example") || f.includes(".env.sample"));
      if (lang === "python") {
        steps.push({ id: id++, title: "Create virtual environment", command: "python -m venv venv && source venv/bin/activate", description: "Isolate project dependencies." });
        steps.push({ id: id++, title: "Install dependencies", command: "pip install -r requirements.txt", description: "Install required Python packages." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Run the application", command: "python main.py", description: "Start the application." });
      } else if (lang === "go") {
        steps.push({ id: id++, title: "Install dependencies", command: "go mod tidy", description: "Download Go module dependencies." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Build the project", command: "go build ./...", description: "Compile the project." });
        steps.push({ id: id++, title: "Run the application", command: "go run .", description: "Start the application." });
      } else if (lang === "rust") {
        steps.push({ id: id++, title: "Build the project", command: "cargo build --release", description: "Compile with Cargo." });
        steps.push({ id: id++, title: "Run the application", command: "cargo run", description: "Start the application." });
      } else if (lang === "java" || lang === "kotlin") {
        steps.push({ id: id++, title: "Build the project", command: "mvn clean install", description: "Build with Maven." });
        steps.push({ id: id++, title: "Run the application", command: "mvn spring-boot:run", description: "Start the Spring Boot application." });
      } else if (lang === "dart") {
        steps.push({ id: id++, title: "Install Flutter", command: "flutter pub get", description: "Install Flutter dependencies." });
        steps.push({ id: id++, title: "Run the application", command: "flutter run", description: "Launch on a connected device or emulator." });
      } else if (lang === "ruby") {
        steps.push({ id: id++, title: "Install dependencies", command: "bundle install", description: "Install Ruby gems." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Run the application", command: "rails server", description: "Start the Rails server." });
      } else {
        // Truly unknown — give generic helpful steps
        steps.push({ id: id++, title: "Review project documentation", command: "cat README.md", description: "Check the README for language-specific setup instructions." });
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Build and run", command: "# Follow the project README for build and run instructions", description: "Execute the build and run steps as documented." });
      }
      return steps;
    }

    // Detect package manager
    const hasPnpm = Object.keys(configFiles).some((f) => f.includes("pnpm-lock"));
    const hasYarn = Object.keys(configFiles).some((f) => f.includes("yarn.lock"));
    const hasBun = Object.keys(configFiles).some((f) => f.includes("bun.lockb") || f.includes("bun.lock"));
    const pm = hasBun ? "bun" : hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";

    const installCmd = pm === "npm" ? "npm install" : `${pm} install`;
    steps.push({
      id: id++,
      title: "Install dependencies",
      command: installCmd,
      description: `Install all required packages using ${pm}.`,
    });

    // Environment setup
    const hasEnvExample = Object.keys(configFiles).some((f) => /\.env\.(example|sample)/i.test(f));
    if (hasEnvExample) {
      steps.push({
        id: id++,
        title: "Configure environment variables",
        command: "cp .env.example .env",
        description: "Copy the example env file and fill in required values.",
      });
    }

    // Supabase setup
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    if (all["@supabase/supabase-js"] || all["@supabase/ssr"]) {
      if (!hasEnvExample) {
        steps.push({
          id: id++,
          title: "Configure Supabase environment",
          command: 'echo "NEXT_PUBLIC_SUPABASE_URL=your_url\\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" > .env.local',
          description: "Set your Supabase project URL and anon key (found in your Supabase dashboard).",
        });
      }
    }

    // Firebase setup
    if (all.firebase || all["firebase-admin"]) {
      if (!hasEnvExample) {
        steps.push({
          id: id++,
          title: "Configure Firebase",
          command: "# Set NEXT_PUBLIC_FIREBASE_API_KEY and related vars in .env.local",
          description: "Add your Firebase configuration keys from the Firebase console.",
        });
      }
    }

    // Prisma
    const hasPrisma = Object.keys(configFiles).some((f) => f.includes("schema.prisma"));
    if (hasPrisma) {
      steps.push({ id: id++, title: "Generate Prisma client", command: "npx prisma generate", description: "Generate the Prisma database client." });
      steps.push({ id: id++, title: "Run database migrations", command: "npx prisma db push", description: "Apply database schema migrations." });
    }

    // Start command
    const scripts = pkg.scripts || {};
    const startCmd = scripts.dev
      ? `${pm === "npm" ? "npm run dev" : `${pm} run dev`}`
      : scripts.start
      ? `${pm === "npm" ? "npm start" : `${pm} start`}`
      : `${pm === "npm" ? "npm run dev" : `${pm} run dev`}`;
    const startDesc = scripts.dev
      ? "Launch the development server with hot-reload."
      : "Start the application.";
    steps.push({ id: id++, title: "Start the development server", command: startCmd, description: startDesc });

    // Build step
    if (scripts.build) {
      steps.push({
        id: id++,
        title: "Build for production (optional)",
        command: `${pm === "npm" ? "npm run build" : `${pm} run build`}`,
        description: "Create an optimized production build.",
      });
    }

    return steps;
  }
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: execute_command

Now run a validation to check for syntax errors:

> 🔧 **execute_command** — node --input-type=module --eval "import './src/lib/ai/RuleBasedProvider.js'; console.log('OK')"

### 🤖 Assistant

> 🔧 called: write_file

Now run a full end-to-end smoke test simulating the SIH repo structure:

> 🔧 **write_file** — import { RuleBasedProvider } from './src/lib/ai/RuleBasedProvider.js';

const p = new RuleBasedProvider();

// Simulate the Kishan5757/SIH monorepo structure
const result = await p.analyzeRepository({
  repositoryName: 'SIH',
  fileTree: [
    'backend/main.py', 'backend/requirements.txt', 'backend/.env.example',
    'backend/app/core/deps.py', 'backend/app/api/auth.py', 'backend/app/services/skillgap_service.py',
    'backend/tests/test_skillgap.py', 'backend/tests/test_recommendation.py',
    'frontend/src/main.tsx', 'frontend/src/App.tsx', 'frontend/src/pages/officer/Dashboard.tsx',
    'frontend/package.json', 'frontend/vite.config.ts',
    'docker-compose.yml', 'README.md',
    'backend/app/rag/embeddings.py', 'backend/app/rag/llm_provider.py',
  ],
  packageManifest: {
    // merged from frontend/package.json
    name: 'SIH',
    dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0', axios: '^1.6.0' },
    devDependencies: { vite: '^5.0.0', typescript: '^5.3.0' },
    scripts: { dev: 'vite', build: 'tsc && vite build' }
  },
  sourceFiles: {
    'backend/app/services/skillgap_service.py': 'def compute_gap(user_vector, role_vector):\n    """Cosine similarity-based gap scoring."""\n    similarity = dot(user_vector, role_vector)\n    return 1 - similarity\n',
    'frontend/src/main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nReactDOM.createRoot(document.getElementById("root")).render(<App />);'
  },
  testFiles: {
    'backend/tests/test_skillgap.py': 'def test_compute_gap(): assert compute_gap([1,0],[1,0]) == 0'
  },
  configurationFiles: {
    'backend/requirements.txt': 'fastapi==0.104.0\nuvicorn==0.24.0\nsqlalchemy==2.0.23\npytest==7.4.3\npython-jose==3.3.0\nbcrypt==4.1.1\nscikit-learn==1.3.2\npandas==2.1.3',
    'backend/.env.example': 'SECRET_KEY=your-secret-key\nDATABASE_URL=sqlite:///./app.db\nLLM_PROVIDER=local\nIGOT_API_BASE_URL=\nIGOT_API_KEY=',
    'frontend/package.json': '{"name":"sih-frontend","dependencies":{"react":"^18.2.0","axios":"^1.6.0"},"devDependencies":{"vite":"^5.0.0"}}'
  },
  readme: null,
  metadata: {
    githubSlug: 'Kishan5757/SIH',
    language: 'Python',
    description: 'AI-Enabled Skill Intelligence & Learning Platform',
    isMonorepo: true,
    monorepoServices: ['backend', 'frontend']
  }
});

console.log('\n=== FRAMEWORK ===');
console.log(result.repository.framework);

console.log('\n=== STACK ===');
console.log(result.repository.stack.join(', '));

console.log('\n=== SUMMARY ===');
console.log(result.overview.summary);

console.log('\n=== SETUP STEPS ===');
result.setup.steps.forEach(s => console.log(`${s.id}. ${s.title}\n   CMD: ${s.command.split('\n')[0]}`));

console.log('\n=== DEPENDENCIES (first 12) ===');
result.dependencies.nodes.slice(0, 12).forEach(n => console.log(`  [${n.type}] ${n.label}`));
console.log(`  ... total: ${result.dependencies.nodes.length} nodes`);

console.log('\n=== TEST STATS ===');
result.testing.stats.forEach(s => console.log(`  ${s.label}: ${s.value}`));


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — node _test_mono.mjs

### 🤖 Assistant

> 🔧 called: execute_command

All 4 problems are now solved. Clean up and finalize:

> 🔧 **execute_command** — Remove-Item repopilot/_test_mono.mjs

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Fix test file count — use fileTree scan for total test count, not just fetched testFiles
[x] Improve RuleBasedProvider _generateTestScaffold — generate meaningful test bodies, not just stubs
[x] Improve RuleBasedProvider _buildSummary — richer multi-sentence summary using more context
[x] Improve Gemini prompt — request more depth, better stats instruction
[x] Fix repoExtractor — ensure test files aren't filtered out by source file limit collision
[x] Fix repoExtractor — detect monorepo structure, fetch nested package.json and requirements.txt
[x] Fix raw fallback extractor — also probe common monorepo manifest paths
[x] Fix RuleBasedProvider _buildSetupSteps — generate multi-service steps for monorepos (backend + frontend)
[x] Fix RuleBasedProvider _analyzeDependencies — parse both frontend/package.json and backend/requirements.txt
[x] Fix RuleBasedProvider _detectFramework — recognise monorepo + surface full stack


### 🤖 Assistant

All four problems for the SIH repo are now fixed. Here's exactly what changed and why:

---

## Root causes found and fixed

### Problem 1: Only backend setup steps — no frontend (`npm run dev`)

**Root cause:** [`_buildSetupSteps`](repopilot/src/lib/ai/RuleBasedProvider.js) only generated Python steps when `!pkg` (no root `package.json`). Since `SIH` has no root `package.json` (only `frontend/package.json`), it fell straight into the Python path and never generated any frontend steps.

**Fix:** Added a full monorepo branch at the top of `_buildSetupSteps`. When `isMonorepo=true`, it:
- Detects `backend/` (Python) vs `frontend/` (JS) service directories
- If `docker-compose.yml` exists → generates Docker-first steps with seed data command
- Otherwise → generates `cd backend && pip install` → `uvicorn main:app` → `cd frontend && npm install` → `npm run dev` steps
- Detects the `backend/.env.example` path and generates the correct `cp` command

### Problem 2: Zero dependencies shown — only `root` node

**Root cause:** [`_analyzeDependencies`](repopilot/src/lib/ai/RuleBasedProvider.js) called `_parseNonJsDeps` only when `!pkg`. But `_parseNonJsDeps` only looked at `configFiles["requirements.txt"]` (root path) — never `backend/requirements.txt`.

**Fix 1:** `_analyzeDependencies` now **always** calls `_parseNonJsDeps` first (regardless of whether `pkg` exists), so Python deps are always parsed alongside JS deps.

**Fix 2:** [`_parseNonJsDeps`](repopilot/src/lib/ai/RuleBasedProvider.js) now scans **all** keys in `configFiles` that match `*/requirements.txt` (including `backend/requirements.txt`), not just the root path. Result: all 8 Python packages + 3 JS packages appear as dependency nodes.

### Problem 3: Framework showed only "Python" instead of "FastAPI + React"

**Root cause:** [`_detectFramework`](repopilot/src/lib/ai/RuleBasedProvider.js) took the `!pkg` branch and only looked at root-level `requirements.txt` — never the nested `backend/requirements.txt` or the frontend stack.

**Fix:** Added a monorepo detection branch: when `isMonorepo=true`, it scans all `requirements.txt` variants in `configFiles` for FastAPI/Django/Flask, runs the JS framework rules against the merged `pkg`, and returns a combined `"FastAPI + React"` label with a unified stack array.

### Problem 4: Extractor never fetched nested manifests

**Root cause:** [`fetchGitHubPayload`](repopilot/src/utils/repoExtractor.js) only fetched root `package.json`. For `SIH`, this returns `null`, so the entire JS side of the repo was invisible.

**Fix:** Added monorepo detection to both the **GitHub API path** and the **raw fallback path**:
- Detects `frontend/`, `backend/`, `client/`, `server/` etc. from the file tree
- Fetches `{dir}/package.json`, `{dir}/requirements.txt`, `{dir}/pyproject.toml`, `{dir}/.env.example` in parallel
- Merges all found `package.json` files into one combined manifest so the full dep tree is visible
- Passes `isMonorepo: true` and `monorepoServices: ["backend", "frontend"]` in metadata