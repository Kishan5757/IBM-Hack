/**
 * RuleBasedProvider.js — SERVER-SIDE ONLY
 *
 * Zero-API fallback intelligence engine.
 * Runs entirely in Node.js — no network calls, no API keys, no installs.
 *
 * When Gemini is unavailable (quota, no key, timeout, any error), this
 * engine deterministically analyzes the actual repository context that was
 * already extracted from the user's repo and produces a complete, real
 * RepositoryAnalysis that drives all 5 dashboard features.
 *
 * What it actually analyzes:
 *   - package.json   → dependencies, scripts, framework, version health
 *   - file tree      → structure, entry points, test coverage, dead files
 *   - source files   → imports, exports, env vars, unused symbols
 *   - config files   → docker, CI, linting, env examples
 *   - test files     → framework detection, coverage estimation
 *   - README         → quality scoring, missing sections
 *   - metadata       → GitHub stars, description, language, slug
 */

// ─── Framework detection rules ────────────────────────────────────────────────

const FRAMEWORK_RULES = [
  { test: (p) => p.dependencies?.next || p.devDependencies?.next, name: "Next.js", type: "Full-Stack Framework" },
  { test: (p) => p.dependencies?.["@angular/core"], name: "Angular", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.vue || p.devDependencies?.vue, name: "Vue.js", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.["@nuxtjs/core"] || p.devDependencies?.nuxt, name: "Nuxt.js", type: "Full-Stack Framework" },
  { test: (p) => p.dependencies?.react || p.dependencies?.["react-dom"], name: "React", type: "Frontend Library" },
  { test: (p) => p.dependencies?.express, name: "Express.js", type: "Backend Framework" },
  { test: (p) => p.dependencies?.fastify, name: "Fastify", type: "Backend Framework" },
  { test: (p) => p.dependencies?.koa, name: "Koa", type: "Backend Framework" },
  { test: (p) => p.dependencies?.["@nestjs/core"], name: "NestJS", type: "Backend Framework" },
  { test: (p) => p.dependencies?.hono, name: "Hono", type: "Backend Framework" },
  { test: (p) => p.dependencies?.svelte || p.devDependencies?.svelte, name: "Svelte", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.["solid-js"], name: "SolidJS", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.remix || p.dependencies?.["@remix-run/node"], name: "Remix", type: "Full-Stack Framework" },
  { test: (p) => p.dependencies?.astro || p.devDependencies?.astro, name: "Astro", type: "Static Site Framework" },
  { test: (p) => p.dependencies?.["gatsby"], name: "Gatsby", type: "Static Site Framework" },
  { test: (p) => p.dependencies?.["electron"], name: "Electron", type: "Desktop App Framework" },
  { test: (p) => p.dependencies?.["react-native"] || p.dependencies?.["expo"], name: "React Native / Expo", type: "Mobile Framework" },
  { test: (p) => p.dependencies?.["@builder.io/qwik"] || p.devDependencies?.["@builder.io/qwik"], name: "Qwik", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.["@tanstack/start"] || p.dependencies?.["@tanstack/react-start"], name: "TanStack Start", type: "Full-Stack Framework" },
];

const TEST_FRAMEWORK_RULES = [
  { test: (p) => p.devDependencies?.jest || p.dependencies?.jest, name: "Jest" },
  { test: (p) => p.devDependencies?.vitest, name: "Vitest" },
  { test: (p) => p.devDependencies?.mocha, name: "Mocha" },
  { test: (p) => p.devDependencies?.jasmine, name: "Jasmine" },
  { test: (p) => p.devDependencies?.["@testing-library/react"], name: "Testing Library" },
  { test: (p) => p.devDependencies?.cypress, name: "Cypress" },
  { test: (p) => p.devDependencies?.playwright || p.devDependencies?.["@playwright/test"], name: "Playwright" },
  { test: (p) => p.devDependencies?.ava, name: "AVA" },
  { test: (p) => p.devDependencies?.bun, name: "Bun Test" },
];

const LANGUAGE_BY_EXT = {
  ts: "TypeScript", tsx: "TypeScript",
  js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", rb: "Ruby", go: "Go", rs: "Rust",
  java: "Java", kt: "Kotlin", cs: "C#",
  cpp: "C++", cc: "C++", cxx: "C++", c: "C", h: "C/C++", hpp: "C++",
  php: "PHP", swift: "Swift",
  scala: "Scala", clj: "Clojure",
  dart: "Dart", lua: "Lua", r: "R",
  html: "HTML", css: "CSS", scss: "CSS", sass: "CSS",
  sh: "Shell", bash: "Shell", ps1: "PowerShell",
  sql: "SQL",
};

// Known vulnerability patterns: { pkg, versionRe, severity, advisory }
// Only well-documented advisories — no invented CVEs.
const VULNERABILITY_ADVISORIES = [
  { pkg: "lodash", versionRe: /^\^?[0-3]\./, severity: "MEDIUM", advisory: "Prototype pollution vulnerabilities in lodash < 4.17.21. Upgrade to 4.17.21+." },
  { pkg: "minimist", versionRe: /^\^?0\.|^\^?1\.[01]\./, severity: "MEDIUM", advisory: "Prototype pollution in minimist < 1.2.6. Upgrade to latest." },
  { pkg: "node-fetch", versionRe: /^\^?[12]\./, severity: "LOW", advisory: "Older node-fetch v2 may lack SSRF protections present in v3+." },
  { pkg: "serialize-javascript", versionRe: /^\^?[0-3]\.|^\^?4\.[0-1]\./, severity: "MEDIUM", advisory: "XSS via unsafe serialization in serialize-javascript < 4.0.0." },
  { pkg: "semver", versionRe: /^\^?[0-6]\./, severity: "LOW", advisory: "ReDoS vulnerability in semver < 7.5.2. Upgrade to 7.5.4+." },
  { pkg: "tough-cookie", versionRe: /^\^?[0-3]\./, severity: "MEDIUM", advisory: "Prototype pollution in tough-cookie < 4.1.3." },
  { pkg: "ws", versionRe: /^\^?[0-6]\./, severity: "LOW", advisory: "DoS vulnerability in ws < 7.4.6. Upgrade to 8.x." },
  { pkg: "json5", versionRe: /^\^?[0-1]\./, severity: "MEDIUM", advisory: "Prototype pollution in json5 < 2.2.2." },
  { pkg: "word-wrap", versionRe: /^\^?[0]\./, severity: "LOW", advisory: "ReDoS in word-wrap < 1.2.4." },
  { pkg: "axios", versionRe: /^\^?0\.[0-9]\./, severity: "LOW", advisory: "SSRF and open redirect in axios < 0.21.2. Use axios 1.x." },
];

// Known outdated major versions — compared against installed version string
const OUTDATED_PATTERNS = [
  { pkg: "react", old: /^\^?[0-9]\.|^\^?1[0-7]\./, latest: "19.x" },
  { pkg: "react-dom", old: /^\^?[0-9]\.|^\^?1[0-7]\./, latest: "19.x" },
  { pkg: "next", old: /^\^?[0-9]\.|^\^?1[0-3]\./, latest: "15.x" },
  { pkg: "typescript", old: /^\^?[0-4]\./, latest: "5.x" },
  { pkg: "tailwindcss", old: /^\^?[0-2]\./, latest: "4.x" },
  { pkg: "eslint", old: /^\^?[0-7]\./, latest: "9.x" },
  { pkg: "vite", old: /^\^?[0-3]\./, latest: "6.x" },
  { pkg: "webpack", old: /^\^?[0-4]\./, latest: "5.x" },
  { pkg: "@angular/core", old: /^\^?1[0-5]\./, latest: "19.x" },
  { pkg: "vue", old: /^\^?[12]\./, latest: "3.x" },
  { pkg: "express", old: /^\^?[0-3]\./, latest: "5.x" },
  { pkg: "node-fetch", old: /^\^?[12]\./, latest: "3.x" },
  { pkg: "jest", old: /^\^?2[0-8]\./, latest: "29.x" },
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export class RuleBasedProvider {
  constructor() {
    this.model = "rule-engine-v2";
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<import('./schemas.js').RepositoryAnalysis>}  — always resolves, never rejects
   */
  async analyzeRepository(repositoryContext) {
    const name = repositoryContext.repositoryName || "unknown-repo";
    console.log(
      `[RuleBasedProvider] Analyzing ${name} with local rule engine v2`
    );
    try {
      const analysis = this._analyze(repositoryContext);
      console.log(
        `[RuleBasedProvider] Done — healthScore: ${analysis.overview.healthScore}, ` +
          `steps: ${analysis.setup.steps.length}, deps: ${analysis.dependencies.nodes.length}`
      );
      return analysis;
    } catch (err) {
      // Rule engine must NEVER propagate — return a safe minimal result
      console.error(`[RuleBasedProvider] Unexpected error for ${name}:`, err?.message || err);
      return this._minimalFallback(name, repositoryContext);
    }
  }

  /** Emergency fallback — returned when _analyze() itself throws. */
  _minimalFallback(name, ctx) {
    const language = ctx?.metadata?.language || "Unknown";
    const ghSlug = ctx?.metadata?.githubSlug;
    return {
      repository: { name, stack: [language].filter(s => s !== "Unknown"), framework: language, language },
      overview: {
        summary: `${name} is a ${language !== "Unknown" ? language : "software"} project. Automated analysis encountered an issue — please try again or check the repository manually.`,
        healthScore: 50,
        criticalIssues: 0,
        warnings: 1,
      },
      readme: {
        qualityScore: 0,
        missingSections: ["Installation", "Usage", "Contributing", "License"],
        issues: ["README could not be fully analyzed"],
        generatedMarkdown: `# ${name}\n\n> A ${language !== "Unknown" ? language : "software"} project.\n\n## Getting Started\n\n\`\`\`bash\ngit clone https://github.com/${ghSlug || `your-username/${name.toLowerCase()}`}.git\ncd ${name.toLowerCase()}\n\`\`\`\n\n## Contributing\n\nContributions welcome! Open a pull request.\n\n## License\n\nSee LICENSE file for details.`,
        markdown: `# ${name}\n\nSee above.`,
      },
      setup: {
        status: "warning",
        issues: [],
        requiredSteps: [
          { id: 1, title: "Clone the repository", command: `git clone https://github.com/${ghSlug || `your-username/${name.toLowerCase()}`}.git`, description: "Clone the project." },
        ],
        steps: [
          { id: 1, title: "Clone the repository", command: `git clone https://github.com/${ghSlug || `your-username/${name.toLowerCase()}`}.git`, description: "Clone the project." },
        ],
        environmentVariables: [],
        envVars: [],
        runtimeRequirements: [],
        dockerCommand: "",
        dockerCompose: "",
      },
      testing: {
        framework: "None detected",
        testFilesFound: [],
        missingTests: [],
        recommendations: ["Add tests to improve code quality and reliability."],
        sourceCode: "",
        generatedTests: `// No tests generated — analysis encountered an error.\n// Please re-run the analysis.`,
        stats: [
          { label: "Test Files",        value: "0",              color: "rose"   },
          { label: "Coverage Estimate", value: "0%",             color: "rose"   },
          { label: "Framework",         value: "None detected",  color: "indigo" },
          { label: "Source Files",      value: "0",              color: "indigo" },
        ],
      },
      deadCode: [],
      dependencies: {
        nodes: [{ id: "root", label: name, type: "root", health: "ok" }],
        alerts: [],
        outdated: [],
      },
      actionPlan: [
        { priority: "medium", title: "Re-run analysis", reason: "The analysis engine encountered an unexpected error.", recommendation: "Try analysing the repository again. If the issue persists, check the Vercel function logs." },
      ],
    };
  }

  // ─── Core analysis ──────────────────────────────────────────────────────────

  _analyze(ctx) {
    const {
      repositoryName,
      fileTree = [],
      packageManifest: pkg,
      readme,
      sourceFiles = {},
      configurationFiles = {},
      testFiles = {},
      metadata = {},
    } = ctx;

    // ── 0. Monorepo detection ────────────────────────────────────────────────
    const isMonorepo = !!metadata?.isMonorepo ||
      this._detectMonorepo(fileTree, configurationFiles);
    const monorepoServices = metadata?.monorepoServices || this._inferMonorepoServices(fileTree, configurationFiles);

    // ── 1. Language & framework detection ───────────────────────────────────
    let language = "Unknown", framework = "Unknown", stack = [];
    try {
      language = this._detectLanguage(pkg, fileTree, metadata);
      ({ framework, stack } = this._detectFramework(pkg, fileTree, configurationFiles, language, isMonorepo, monorepoServices));
    } catch (e) { console.error("[RuleBasedProvider] detect lang/fw:", e?.message); }

    let testFramework = "None detected";
    try { testFramework = this._detectTestFramework(pkg, fileTree); } catch (e) { console.error("[RuleBasedProvider] detectTestFw:", e?.message); }

    // ── 2. Dependency analysis ───────────────────────────────────────────────
    let depNodes = [{ id: "root", label: repositoryName, type: "root", health: "ok" }], depAlerts = [], depOutdated = [];
    try { ({ depNodes, depAlerts, depOutdated } = this._analyzeDependencies(pkg, repositoryName, configurationFiles, isMonorepo)); } catch (e) { console.error("[RuleBasedProvider] analyzeDeps:", e?.message); }

    // ── 3. Environment variables ─────────────────────────────────────────────
    let envVars = [];
    try { envVars = this._extractEnvVars(sourceFiles, configurationFiles); } catch (e) { console.error("[RuleBasedProvider] extractEnvVars:", e?.message); }

    // ── 4. Setup steps ───────────────────────────────────────────────────────
    let setupSteps = [];
    try { setupSteps = this._buildSetupSteps(pkg, repositoryName, configurationFiles, language, framework, metadata, isMonorepo, monorepoServices, fileTree); } catch (e) { console.error("[RuleBasedProvider] buildSetupSteps:", e?.message); }

    // ── 5. README quality ────────────────────────────────────────────────────
    let qualityScore = 0, missingSections = [], readmeIssues = [];
    try { ({ qualityScore, missingSections, readmeIssues } = this._scoreReadme(readme)); } catch (e) { console.error("[RuleBasedProvider] scoreReadme:", e?.message); }

    let generatedMarkdown = `# ${repositoryName}\n\nRepository analysis complete.`;
    try { generatedMarkdown = this._generateReadme(repositoryName, metadata, pkg, language, framework, stack, setupSteps, envVars, fileTree, readme); } catch (e) { console.error("[RuleBasedProvider] generateReadme:", e?.message); }

    // ── 6. Dead code detection ───────────────────────────────────────────────
    let deadCode = [];
    try { deadCode = this._detectDeadCode(sourceFiles, fileTree); } catch (e) { console.error("[RuleBasedProvider] detectDeadCode:", e?.message); }

    // ── 7. Test analysis ─────────────────────────────────────────────────────
    let testStats = [], missingTests = [], testRecommendations = [], sampleSourceCode = "", generatedTestCode = "";
    try {
      ({ testStats, missingTests, testRecommendations, sampleSourceCode, generatedTestCode } =
        this._analyzeTests(testFramework, testFiles, sourceFiles, fileTree, language));
    } catch (e) { console.error("[RuleBasedProvider] analyzeTests:", e?.message); }

    // ── 8. Health scoring ────────────────────────────────────────────────────
    const criticalIssues = depAlerts.filter((a) => a.severity === "CRITICAL").length;
    const warnings =
      missingSections.filter((s) => ["Installation", "Usage"].includes(s)).length +
      depOutdated.length +
      (Object.keys(testFiles).length === 0 ? 1 : 0) +
      (!readme ? 1 : 0);
    const healthScore = Math.max(10, Math.min(100, 100 - criticalIssues * 15 - warnings * 5));

    // ── 9. Action plan ───────────────────────────────────────────────────────
    let actionPlan = [];
    try { actionPlan = this._buildActionPlan(criticalIssues, warnings, depOutdated, testFiles, readme, envVars, pkg, fileTree, language); } catch (e) { console.error("[RuleBasedProvider] buildActionPlan:", e?.message); }

    // ── 10. Overview summary ─────────────────────────────────────────────────
    let summary = `${repositoryName} repository analysis.`;
    try { summary = this._buildSummary(repositoryName, metadata, language, framework, pkg, fileTree, readme, stack); } catch (e) { console.error("[RuleBasedProvider] buildSummary:", e?.message); }

    // ── 11. Setup status ─────────────────────────────────────────────────────
    const setupStatus = criticalIssues > 0 ? "critical" : warnings > 2 ? "warning" : "healthy";

    // ── 12. Docker detection ─────────────────────────────────────────────────
    const hasDockerfile = fileTree.some((f) => f === "Dockerfile" || f.endsWith("/Dockerfile"));
    const hasCompose = fileTree.some((f) => f.includes("docker-compose"));
    const dockerCommand = hasDockerfile ? `docker build -t ${repositoryName} . && docker run -p 3000:3000 ${repositoryName}` : "";
    const dockerCompose = hasCompose ? "docker compose up --build -d" : "";

    return {
      repository: { name: repositoryName, stack, framework, language },
      overview: { summary, healthScore, criticalIssues, warnings },
      readme: {
        qualityScore,
        missingSections,
        issues: readmeIssues,
        generatedMarkdown,
        markdown: generatedMarkdown,
      },
      setup: {
        status: setupStatus,
        issues: warnings > 0 ? [`${warnings} configuration item(s) need attention`] : [],
        requiredSteps: setupSteps,
        steps: setupSteps,
        environmentVariables: envVars,
        envVars,
        runtimeRequirements: this._runtimeRequirements(pkg, language),
        dockerCommand,
        dockerCompose,
      },
      testing: {
        framework: testFramework,
        testFilesFound: Object.keys(testFiles),
        missingTests,
        recommendations: testRecommendations,
        sourceCode: sampleSourceCode,
        generatedTests: generatedTestCode,
        stats: testStats,
      },
      deadCode,
      dependencies: { nodes: depNodes, alerts: depAlerts, outdated: depOutdated },
      actionPlan,
    };
  }

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
    // GitHub-detected language is the most reliable signal
    if (metadata?.language) return metadata.language;

    // Count file extensions (exclude test and config files from the count)
    const counts = {};
    for (const f of fileTree) {
      if (f.includes("node_modules/") || f.includes(".next/") || f.includes("dist/")) continue;
      const ext = f.split(".").pop()?.toLowerCase();
      if (ext && LANGUAGE_BY_EXT[ext]) {
        counts[ext] = (counts[ext] || 0) + 1;
      }
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) return LANGUAGE_BY_EXT[top[0]];

    // Fallback: package.json implies JS/TS
    if (pkg) return "JavaScript";
    return "Unknown";
  }

  // ─── Framework detection ───────────────────────────────────────────────────

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

  _buildStack(pkg, framework, language) {
    const stack = new Set([language, framework].filter(Boolean));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };

    // Languages / type layers
    if (all.typescript || all["@types/node"] || all["@types/react"]) stack.add("TypeScript");

    // Styling
    if (all.tailwindcss) stack.add("Tailwind CSS");
    if (all["styled-components"]) stack.add("Styled Components");
    if (all["@emotion/react"] || all["@emotion/styled"]) stack.add("Emotion");
    if (all.sass || all["node-sass"]) stack.add("Sass");
    if (all["@mui/material"] || all["@material-ui/core"]) stack.add("Material UI");
    if (all["@chakra-ui/react"]) stack.add("Chakra UI");
    if (all["@mantine/core"]) stack.add("Mantine");
    if (all["antd"]) stack.add("Ant Design");

    // UI libraries / component systems
    if (all["lucide-react"]) stack.add("Lucide");
    if (all["@radix-ui/react-dialog"] || all["@radix-ui/react-slot"] || Object.keys(all).some((k) => k.startsWith("@radix-ui/"))) stack.add("Radix UI");
    if (all.shadcn || all["@shadcn/ui"]) stack.add("shadcn/ui");
    if (all["framer-motion"]) stack.add("Framer Motion");
    if (all["react-icons"]) stack.add("React Icons");

    // State management
    if (all.zustand) stack.add("Zustand");
    if (all.jotai) stack.add("Jotai");
    if (all.recoil) stack.add("Recoil");
    if (all.redux || all["@reduxjs/toolkit"]) stack.add("Redux Toolkit");
    if (all.mobx) stack.add("MobX");
    if (all.valtio) stack.add("Valtio");

    // Data fetching / query
    if (all["@tanstack/react-query"] || all["react-query"]) stack.add("TanStack Query");
    if (all["@tanstack/react-table"]) stack.add("TanStack Table");
    if (all["@tanstack/react-router"]) stack.add("TanStack Router");
    if (all["react-router-dom"] || all["react-router"]) stack.add("React Router");
    if (all.swr) stack.add("SWR");

    // Database / ORM
    if (all.prisma || all["@prisma/client"]) stack.add("Prisma");
    if (all.mongoose || all.mongodb) stack.add("MongoDB");
    if (all.pg || all.postgres || all["@neondatabase/serverless"]) stack.add("PostgreSQL");
    if (all.mysql2 || all.mysql) stack.add("MySQL");
    if (all.redis || all.ioredis) stack.add("Redis");
    if (all["better-sqlite3"] || all["@libsql/client"]) stack.add("SQLite");
    if (all.drizzle || all["drizzle-orm"]) stack.add("Drizzle ORM");
    if (all["@vercel/postgres"]) stack.add("Vercel Postgres");

    // Backend as a service / cloud
    if (all["@supabase/supabase-js"] || all["@supabase/ssr"]) stack.add("Supabase");
    if (all.firebase || all["firebase-admin"] || all["@firebase/app"]) stack.add("Firebase");
    if (all["aws-sdk"] || all["@aws-sdk/client-s3"]) stack.add("AWS SDK");
    if (all["@vercel/sdk"]) stack.add("Vercel SDK");

    // Auth
    if (all["next-auth"] || all["@auth/core"] || all["@auth/nextjs"]) stack.add("Auth.js");
    if (all["@clerk/nextjs"] || all["@clerk/clerk-react"]) stack.add("Clerk");
    if (all["@lucia-auth/core"] || all.lucia) stack.add("Lucia Auth");
    if (all["better-auth"]) stack.add("Better Auth");

    // APIs / protocols
    if (all.graphql || all["@apollo/server"] || all["@apollo/client"]) stack.add("GraphQL");
    if (all.trpc || all["@trpc/server"]) stack.add("tRPC");
    if (all["openai"] || all["@openai/api"]) stack.add("OpenAI SDK");
    if (all["@anthropic-ai/sdk"]) stack.add("Anthropic SDK");
    if (all["@google/generative-ai"]) stack.add("Google Gemini SDK");
    if (all.langchain || all["langchain"]) stack.add("LangChain");

    // Validation
    if (all.zod) stack.add("Zod");
    if (all.yup) stack.add("Yup");
    if (all["class-validator"]) stack.add("class-validator");

    // Payments
    if (all.stripe) stack.add("Stripe");
    if (all["@lemonsqueezy/lemonsqueezy.js"]) stack.add("Lemon Squeezy");

    // Maps / geo
    if (all.leaflet || all["react-leaflet"]) stack.add("Leaflet / OpenStreetMap");
    if (all["mapbox-gl"] || all["@vis.gl/react-mapbox"]) stack.add("Mapbox");
    if (all["@googlemaps/js-api-loader"]) stack.add("Google Maps");

    // UI theming
    if (all["next-themes"]) stack.add("next-themes");

    // Utilities
    if (all.axios) stack.add("Axios");
    if (all["date-fns"] || all.dayjs || all.moment) stack.add("Date utilities");
    if (all["class-variance-authority"] || all.clsx || all["tailwind-merge"]) stack.add("CVA / clsx");
    if (all.socket || all["socket.io"] || all["socket.io-client"]) stack.add("Socket.IO");

    return [...stack].filter(Boolean).slice(0, 12);
  }

  // ─── Test framework detection ──────────────────────────────────────────────

  _detectTestFramework(pkg, fileTree) {
    if (pkg) {
      for (const rule of TEST_FRAMEWORK_RULES) {
        if (rule.test(pkg)) return rule.name;
      }
    }
    // Python test frameworks
    if (fileTree.some((f) => /(?:^|\/)(test_[^/]+|[^/]+_test|tests?)\.(py)$/.test(f))) {
      if (fileTree.some((f) => f.includes("conftest.py") || f.includes("pytest"))) return "pytest";
      return "pytest (inferred)";
    }
    // Go tests
    if (fileTree.some((f) => /_test\.go$/.test(f))) return "Go testing";
    // Rust tests — inline #[test] blocks; cargo test is the runner
    if (fileTree.some((f) => /\.rs$/.test(f))) return "Rust cargo test";
    // Java tests
    if (fileTree.some((f) => /Test\.java$|Tests\.java$/.test(f))) return "JUnit";
    // C++ test frameworks
    if (fileTree.some((f) => /test[_-].*\.(cpp|cc|cxx)$|.*[_-]test\.(cpp|cc|cxx)$/i.test(f))) {
      if (fileTree.some((f) => /gtest|googletest/i.test(f))) return "Google Test";
      if (fileTree.some((f) => /catch2|catch\.hpp/i.test(f))) return "Catch2";
      if (fileTree.some((f) => /doctest/i.test(f))) return "doctest";
      return "C++ unit tests (inferred)";
    }
    // Infer from JS/TS file patterns
    const testExts = fileTree.filter((f) => f.includes(".test.") || f.includes(".spec."));
    if (testExts.length > 0) {
      if (fileTree.some((f) => f.includes("cypress"))) return "Cypress";
      if (fileTree.some((f) => f.includes("playwright"))) return "Playwright";
      return "Jest (inferred)";
    }
    // HTML/browser game — no conventional test framework is the norm
    if (fileTree.some((f) => /\.html$/.test(f)) && !pkg) return "None (browser app)";
    return "None detected";
  }

  // ─── Dependency analysis ───────────────────────────────────────────────────

  _analyzeDependencies(pkg, repoName, configFiles = {}, isMonorepo = false) {
    const depNodes = [{ id: "root", label: repoName, type: "root", health: "ok" }];
    const depAlerts = [];
    const depOutdated = [];

    // ── Always parse non-JS manifests from config files (handles monorepos) ──
    // This covers: root requirements.txt, backend/requirements.txt, go.mod, Cargo.toml etc.
    this._parseNonJsDeps(configFiles, depNodes);

    if (!pkg) {
      // Pure non-JS project — non-JS deps already added above
      // For C/C++ projects parse CMakeLists.txt and Makefile for library hints
      this._parseCppDeps(configFiles, sourceFiles, fileTree, depNodes);
      // For HTML/CSS web projects scan for CDN script tags
      this._parseHtmlDeps(configFiles, sourceFiles, depNodes);
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

  /**
   * Parse dependency lists from non-JS manifest files and push nodes.
   * Handles: requirements.txt, go.mod, Cargo.toml, pom.xml / build.gradle.
   */
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

    // go.mod — "require (\n\t github.com/pkg/name v1.2.3\n)"
    const goMod = configFiles["go.mod"] || "";
    if (goMod) {
      const requireBlock = goMod.match(/require\s*\(([^)]+)\)/s);
      const lines = requireBlock ? requireBlock[1].split("\n") : goMod.split("\n");
      for (const line of lines) {
        const m = line.trim().match(/^([\w./-]+)\s+(v[\d.]+)/);
        if (m) {
          const name = m[1].split("/").pop(); // use just the last path segment as label
          depNodes.push({ id: m[1], label: `${name}@${m[2]}`, type: "dep", health: "ok" });
        }
      }
    }

    // Cargo.toml — [dependencies]\n pkg = "1.0"  or  pkg = { version = "1.0" }
    const cargoToml = configFiles["Cargo.toml"] || "";
    if (cargoToml) {
      const depSection = cargoToml.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
      if (depSection) {
        for (const line of depSection[1].split("\n")) {
          const m = line.trim().match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([^"'\s{]+)/);
          if (m && !line.trim().startsWith("#")) {
            depNodes.push({ id: m[1], label: `${m[1]}@${m[2]}`, type: "dep", health: "ok" });
          }
        }
      }
    }

    // pom.xml — <artifactId> + <version>
    const pomXml = configFiles["pom.xml"] || "";
    if (pomXml) {
      const artifactRe = /<artifactId>([^<]+)<\/artifactId>/g;
      const versionRe = /<version>([^<]+)<\/version>/g;
      const artifacts = [];
      const versions = [];
      let m;
      while ((m = artifactRe.exec(pomXml)) !== null) artifacts.push(m[1]);
      while ((m = versionRe.exec(pomXml)) !== null) versions.push(m[1]);
      // Skip first artifact/version (they belong to the project itself)
      for (let i = 1; i < artifacts.length; i++) {
        depNodes.push({
          id: artifacts[i],
          label: `${artifacts[i]}@${versions[i] || "*"}`,
          type: "dep",
          health: "ok",
        });
      }
    }
  }

  /**
   * Parse C/C++ project dependencies from CMakeLists.txt, Makefile, vcpkg.json,
   * and #include directives in source files.
   */
  _parseCppDeps(configFiles, sourceFiles, fileTree, depNodes) {
    const existingIds = new Set(depNodes.map((n) => n.id));
    const addDep = (id, label) => {
      if (!existingIds.has(id)) {
        depNodes.push({ id, label, type: "dep", health: "ok" });
        existingIds.add(id);
      }
    };

    // vcpkg.json — {"dependencies": ["sdl2", "openssl"]}
    const vcpkg = configFiles["vcpkg.json"] || configFiles["vcpkg.json"];
    if (vcpkg) {
      try {
        const parsed = typeof vcpkg === "object" ? vcpkg : JSON.parse(vcpkg);
        for (const dep of parsed.dependencies || []) {
          const name = typeof dep === "string" ? dep : dep.name;
          if (name) addDep(name, name);
        }
      } catch { /* ignore parse errors */ }
    }

    // CMakeLists.txt — find_package(SDL2 REQUIRED), target_link_libraries, pkg_check_modules
    const cmake = configFiles["CMakeLists.txt"] || "";
    if (cmake) {
      const findPkg = /find_package\(\s*([A-Za-z0-9_]+)/gi;
      const pkgCheck = /pkg_check_modules\([^)]*\s+([A-Za-z0-9_-]+)/gi;
      const targetLink = /target_link_libraries\([^)]+\s+([A-Za-z0-9_:]+)\)/gi;
      let m;
      while ((m = findPkg.exec(cmake)) !== null) {
        const name = m[1];
        if (!["REQUIRED", "COMPONENTS", "CONFIG", "NO_MODULE", "CMAKE"].includes(name.toUpperCase()))
          addDep(name.toLowerCase(), name);
      }
      while ((m = pkgCheck.exec(cmake)) !== null) addDep(m[1].toLowerCase(), m[1]);
      while ((m = targetLink.exec(cmake)) !== null) {
        const lib = m[1].split("::")[0].toLowerCase();
        if (!["target", "project", "main", "public", "private", "interface"].includes(lib))
          addDep(lib, lib);
      }
    }

    // Makefile — -l<lib> linker flags
    const makefile = configFiles["Makefile"] || configFiles["makefile"] || "";
    if (makefile) {
      const linkRe = /-l([A-Za-z0-9_]+)/g;
      let m;
      while ((m = linkRe.exec(makefile)) !== null) addDep(m[1], `lib${m[1]}`);
    }

    // Scan #include <header.h> in source files for well-known libraries
    const KNOWN_HEADERS = {
      "SDL.h": "SDL2", "SDL2/SDL.h": "SDL2", "SFML/Graphics.hpp": "SFML",
      "SFML/Window.hpp": "SFML", "SFML/Audio.hpp": "SFML",
      "raylib.h": "raylib", "glad/glad.h": "GLAD/OpenGL", "GL/glew.h": "GLEW",
      "GL/gl.h": "OpenGL", "GLFW/glfw3.h": "GLFW", "glm/glm.hpp": "GLM",
      "Box2D/Box2D.h": "Box2D", "bullet/btBulletDynamicsCommon.h": "Bullet Physics",
      "nlohmann/json.hpp": "nlohmann/json", "boost/asio.hpp": "Boost.Asio",
      "openssl/ssl.h": "OpenSSL", "curl/curl.h": "libcurl",
      "imgui.h": "Dear ImGui", "vulkan/vulkan.h": "Vulkan",
    };
    const includeRe = /#include\s+[<"]([^>"]+)[>"]/g;
    const allSrc = Object.values(sourceFiles).join("\n").slice(0, 200_000);
    let m2;
    const seenHeaders = new Set();
    while ((m2 = includeRe.exec(allSrc)) !== null) {
      const header = m2[1];
      if (seenHeaders.has(header)) continue;
      seenHeaders.add(header);
      if (KNOWN_HEADERS[header]) addDep(KNOWN_HEADERS[header].toLowerCase().replace(/\s/g, "-"), KNOWN_HEADERS[header]);
    }
  }

  /**
   * Parse HTML/CSS/JS web projects for CDN script/link tags and inline deps.
   */
  _parseHtmlDeps(configFiles, sourceFiles, depNodes) {
    const existingIds = new Set(depNodes.map((n) => n.id));
    const addDep = (id, label, version = "*") => {
      if (!existingIds.has(id)) {
        depNodes.push({ id, label: `${label}@${version}`, type: "dep", health: "ok" });
        existingIds.add(id);
      }
    };

    // Well-known CDN libraries by hostname/path pattern
    const CDN_PATTERNS = [
      { re: /jquery[.-]([\d.]+)(?:\.min)?\.js/i, name: "jQuery" },
      { re: /bootstrap[.-]([\d.]+)(?:\.min)?\.(?:js|css)/i, name: "Bootstrap" },
      { re: /react(?:\.development|\.production\.min)?\.js/i, name: "React" },
      { re: /vue(?:@([\d.]+))?(?:\.min)?\.js/i, name: "Vue.js" },
      { re: /three(?:\.min)?\.js/i, name: "Three.js" },
      { re: /pixi(?:\.min)?\.js/i, name: "PixiJS" },
      { re: /phaser(?:[.-]([\d.]+))?(?:\.min)?\.js/i, name: "Phaser" },
      { re: /babylon(?:\.min)?\.js/i, name: "Babylon.js" },
      { re: /tailwindcss/i, name: "Tailwind CSS" },
      { re: /animate\.css/i, name: "Animate.css" },
      { re: /font-awesome/i, name: "Font Awesome" },
      { re: /socket\.io/i, name: "Socket.IO" },
      { re: /axios(?:\.min)?\.js/i, name: "Axios" },
      { re: /lodash(?:\.min)?\.js/i, name: "Lodash" },
      { re: /d3(?:\.min)?\.js/i, name: "D3.js" },
      { re: /gsap(?:\.min)?\.js/i, name: "GSAP" },
    ];

    const allContent = [
      ...Object.values(configFiles),
      ...Object.values(sourceFiles),
    ].join("\n").slice(0, 300_000);

    for (const { re, name } of CDN_PATTERNS) {
      const m = re.exec(allContent);
      if (m) addDep(name.toLowerCase().replace(/\s/g, "-"), name, m[1] || "*");
    }
  }

  // ─── Environment variable extraction ──────────────────────────────────────

  _extractEnvVars(sourceFiles, configFiles) {
    const vars = new Map();

    // Priority 1: .env.example / .env.sample (most reliable source)
    for (const [path, content] of Object.entries(configFiles)) {
      if (/\.env\.(example|sample|template)/i.test(path) || path === ".env.example") {
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=?(.*)?$/);
          if (m) {
            vars.set(m[1], { key: m[1], example: (m[2] || "").trim().replace(/^["']|["']$/g, ""), required: true });
          }
        }
      }
    }

    // Priority 2: process.env.XXX references in source files
    const envRe = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    for (const [, content] of Object.entries(sourceFiles)) {
      let match;
      while ((match = envRe.exec(content)) !== null) {
        const key = match[1];
        if (!vars.has(key)) vars.set(key, { key, example: "", required: true });
      }
    }

    // Priority 3: import.meta.env.VITE_XXX for Vite projects
    const viteEnvRe = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;
    for (const [, content] of Object.entries(sourceFiles)) {
      let match;
      while ((match = viteEnvRe.exec(content)) !== null) {
        const key = match[1];
        if (!vars.has(key)) vars.set(key, { key, example: "", required: true });
      }
    }

    return [...vars.values()].slice(0, 20);
  }

  // ─── Setup steps ──────────────────────────────────────────────────────────

  _buildSetupSteps(pkg, repoName, configFiles, language, framework, metadata, isMonorepo = false, monorepoServices = [], fileTree = []) {
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
      } else if (lang === "c++" || lang === "c" || lang === "c/c++") {
        const hasCmake = Object.keys(configFiles).some((f) => f.includes("CMakeLists.txt"));
        const hasMakefile = Object.keys(configFiles).some((f) => f === "Makefile" || f === "makefile");
        if (hasCmake) {
          steps.push({ id: id++, title: "Configure with CMake", command: "cmake -B build -DCMAKE_BUILD_TYPE=Release", description: "Generate build files in the build/ directory." });
          steps.push({ id: id++, title: "Compile the project", command: "cmake --build build --config Release", description: "Compile all source files." });
          steps.push({ id: id++, title: "Run the application", command: "./build/" + repoName.toLowerCase().replace(/\s/g, "-"), description: "Execute the compiled binary." });
        } else if (hasMakefile) {
          steps.push({ id: id++, title: "Build the project", command: "make", description: "Compile using the Makefile." });
          steps.push({ id: id++, title: "Run the application", command: "./" + repoName.toLowerCase().replace(/\s/g, "-"), description: "Execute the compiled binary." });
        } else {
          steps.push({ id: id++, title: "Compile the project", command: `g++ -std=c++17 -o ${repoName.toLowerCase()} *.cpp`, description: "Compile all .cpp files with GCC." });
          steps.push({ id: id++, title: "Run the application", command: "./" + repoName.toLowerCase().replace(/\s/g, "-"), description: "Execute the compiled binary." });
        }
      } else if (lang === "html" || lang === "css") {
        // Plain HTML/CSS/JS web app — just open the index.html
        const hasIndex = Object.keys(configFiles).some((f) => f.endsWith("index.html")) ||
          (fileTree || []).some((f) => f === "index.html" || f.endsWith("/index.html"));
        if (hasIndex) {
          steps.push({ id: id++, title: "Open in your browser", command: "open index.html  # or double-click the file", description: "No build step needed — open index.html directly in any modern browser." });
        } else {
          steps.push({ id: id++, title: "Open in your browser", command: "open index.html", description: "Open the main HTML file in your browser to run the project." });
        }
        steps.push({ id: id++, title: "(Optional) Run a local dev server", command: "npx serve .  # or: python -m http.server 8080", description: "Serve the files locally to avoid CORS issues when loading assets." });
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

  // ─── Runtime requirements ─────────────────────────────────────────────────

  _runtimeRequirements(pkg, language) {
    const reqs = [];
    if (language === "Python") reqs.push("Python 3.10+");
    else if (language === "Go") reqs.push("Go 1.22+");
    else if (language === "Rust") reqs.push("Rust 1.75+ (via rustup)");
    else if (language === "Dart") reqs.push("Flutter 3.x / Dart 3.x");
    else if (pkg) {
      const engines = pkg.engines || {};
      if (engines.node) reqs.push(`Node.js ${engines.node}`);
      else reqs.push("Node.js 18+");
      if (engines.npm) reqs.push(`npm ${engines.npm}`);
      if (engines.pnpm) reqs.push(`pnpm ${engines.pnpm}`);
    }
    return reqs;
  }

  // ─── README quality scoring ───────────────────────────────────────────────

  _scoreReadme(readme) {
    if (!readme) {
      return {
        qualityScore: 0,
        missingSections: ["Title", "Description", "Installation", "Usage", "Contributing", "License"],
        readmeIssues: ["No README.md found in the repository."],
      };
    }

    const lower = readme.toLowerCase();
    const missing = [];
    let score = 0;

    // Title (15 pts)
    if (readme.match(/^#\s+\S/m)) { score += 15; } else { missing.push("Title"); }

    // Description (15 pts) — any meaningful content beyond a bare title
    if (readme.length > 300 || lower.includes("description") || lower.includes("platform") || lower.includes("application") || lower.includes("library") || lower.includes("tool")) {
      score += 15;
    } else {
      missing.push("Description");
    }

    // Installation (20 pts)
    if (lower.includes("install") || lower.includes("getting started") || lower.includes("setup") || lower.includes("npm install") || lower.includes("pip install")) {
      score += 20;
    } else {
      missing.push("Installation");
    }

    // Usage / Features (20 pts)
    if (lower.includes("usage") || lower.includes("example") || lower.includes("features") || lower.includes("how to use") || lower.includes("## demo") || lower.includes("## live")) {
      score += 20;
    } else {
      missing.push("Usage");
    }

    // Contributing / Deployment / About (15 pts)
    if (lower.includes("contribut") || lower.includes("deployment") || lower.includes("deploy") || lower.includes("## about") || lower.includes("tech stack")) {
      score += 15;
    } else {
      missing.push("Contributing");
    }

    // License (15 pts)
    if (lower.includes("license") || lower.includes("licence") || lower.includes("mit") || lower.includes("apache") || lower.includes("gpl")) {
      score += 15;
    } else {
      missing.push("License");
    }

    const issues = [];
    if (readme.length < 300) issues.push("README is very short — add more detail.");
    if (!lower.includes("```") && !lower.includes("~~~")) issues.push("No code examples found — add usage snippets.");
    if (!lower.includes("badge") && !lower.includes("[![") && !lower.includes("img.shields.io")) {
      issues.push("Consider adding status badges (CI, version, stars, etc.).");
    }
    if (!lower.includes("screenshot") && !lower.includes("demo") && !lower.includes("preview")) {
      issues.push("Add a screenshot or live demo link to improve discoverability.");
    }

    return { qualityScore: score, missingSections: missing, readmeIssues: issues };
  }

  // ─── README generation ────────────────────────────────────────────────────

  _generateReadme(name, metadata, pkg, language, framework, stack, steps, envVars, fileTree, existingReadme) {
    // Normalise language/framework — never let "Unknown" appear in output
    const knownFw   = framework && !["Unknown", "unknown"].includes(framework) ? framework : null;
    const knownLang = language  && !["Unknown", "unknown"].includes(language)  ? language  : null;
    const techLabel = knownFw || knownLang || "software";

    // Description: GitHub meta → extracted from existing README → smart fallback
    const extractedDesc = existingReadme ? this._extractDescription(existingReadme) : null;
    const fallbackDesc = `A ${techLabel} project.`;
    const desc = (metadata?.description && metadata.description.trim()) || extractedDesc || fallbackDesc;

    const ghSlug = metadata?.githubSlug;
    const version = pkg?.version || null;

    // Detect license file
    const licenseFile = fileTree.find((f) =>
      /^license(\.md|\.txt)?$/i.test(f.split("/").pop())
    );
    const licenseName = licenseFile ? this._inferLicenseName(fileTree) : null;

    // ── Badges ───────────────────────────────────────────────────────────────
    const badgeBase = `https://img.shields.io/github`;
    const badges = ghSlug
      ? [
          `[![Stars](${badgeBase}/stars/${ghSlug}?style=flat-square)](https://github.com/${ghSlug})`,
          version && version !== "0.0.0"
            ? `[![Version](https://img.shields.io/badge/version-${encodeURIComponent(version)}-blue?style=flat-square)](https://github.com/${ghSlug})`
            : null,
          licenseName
            ? `[![License](https://img.shields.io/badge/license-${encodeURIComponent(licenseName)}-green?style=flat-square)](./LICENSE)`
            : null,
        ].filter(Boolean).join(" ")
      : "";

    // ── Features ─────────────────────────────────────────────────────────────
    const features = this._extractFeatures(existingReadme, pkg, fileTree, stack, framework);

    // ── Prerequisites section ─────────────────────────────────────────────────
    const prereqs = this._buildPrerequisites(language, framework, pkg);
    const prereqSection = prereqs.length > 0
      ? `\n## 📋 Prerequisites\n\n${prereqs.map((p) => `- ${p}`).join("\n")}`
      : "";

    // ── Tech stack section ────────────────────────────────────────────────────
    const cleanStack = stack.filter((s) => s && !["Unknown", "unknown"].includes(s));
    const stackSection = cleanStack.length > 0
      ? `\n## 🚀 Tech Stack\n\n${cleanStack.map((s) => `- **${s}**`).join("\n")}`
      : knownLang
      ? `\n## 🚀 Tech Stack\n\n- **${knownLang}**`
      : "";

    // ── Setup steps ──────────────────────────────────────────────────────────
    const stepsSection = steps.length > 0
      ? `\n## 🛠️ Getting Started\n\n${steps.map((s) =>
          `### ${s.title}\n\n\`\`\`bash\n${s.command}\n\`\`\`\n\n${s.description}`
        ).join("\n\n")}`
      : `\n## 🛠️ Getting Started\n\n\`\`\`bash\ngit clone https://github.com/${ghSlug || `your-username/${name.toLowerCase()}`}.git\ncd ${name.toLowerCase()}\n# See project documentation for build steps\n\`\`\``;

    // ── Environment variables ─────────────────────────────────────────────────
    const envSection = envVars.length > 0
      ? `\n## ⚙️ Environment Variables\n\nCopy \`.env.example\` to \`.env\` and fill in the values:\n\n` +
        `| Variable | Required | Description |\n|---|---|---|\n` +
        envVars.map((v) => `| \`${v.key}\` | ${v.required ? "✅ Yes" : "No"} | ${v.example ? `e.g. \`${v.example}\`` : "—"} |`).join("\n")
      : "";

    // ── Scripts (JS/TS only) ──────────────────────────────────────────────────
    const scriptsSection = pkg?.scripts && Object.keys(pkg.scripts).length > 0
      ? `\n## 📜 Available Scripts\n\n` +
        `| Command | Description |\n|---|---|\n` +
        Object.entries(pkg.scripts)
          .map(([k, v]) => `| \`npm run ${k}\` | \`${v}\` |`)
          .join("\n")
      : "";

    // ── Deployment section ────────────────────────────────────────────────────
    const deploySection = this._buildDeploySection(fileTree, pkg, ghSlug, framework);

    // ── Contributing section ──────────────────────────────────────────────────
    const contributingSection = `\n## 🤝 Contributing\n\nContributions are welcome! Please follow these steps:\n\n1. Fork the repository\n2. Create a feature branch (\`git checkout -b feature/your-feature\`)\n3. Commit your changes (\`git commit -m 'Add some feature'\`)\n4. Push to the branch (\`git push origin feature/your-feature\`)\n5. Open a Pull Request`;

    // ── License ───────────────────────────────────────────────────────────────
    const licenseSection = licenseName
      ? `\n## 📄 License\n\nThis project is licensed under the **${licenseName} License** — see the [LICENSE](./LICENSE) file for details.`
      : `\n## 📄 License\n\nThis project is currently unlicensed. Consider adding a [LICENSE](https://choosealicense.com/) file.`;

    return `# ${name}

${badges}

> ${desc}

${prereqSection}
${stepsSection}
${features ? `\n## ✨ Features\n\n${features}` : ""}
${envSection}
${stackSection}
${scriptsSection}
${deploySection}
${contributingSection}
${licenseSection}

---

*Generated by [RepoPilot](https://github.com) — AI-powered repository analysis*
`.replace(/\n{3,}/g, "\n\n").trim();
  }

  /** Infer license name from file tree context. */
  _inferLicenseName(fileTree) {
    // We can't read the license file contents here, so default to MIT as the most common
    // A more accurate check would require fetching the file, which is done upstream
    return "MIT";
  }

  /** Build a prerequisites list based on the detected language/framework. */
  _buildPrerequisites(language, framework, pkg) {
    const prereqs = [];
    const lang = (language || "").toLowerCase();
    if (lang === "python") {
      prereqs.push("Python 3.9+");
      prereqs.push("pip or [uv](https://github.com/astral-sh/uv)");
    } else if (lang === "go") {
      prereqs.push("Go 1.21+");
    } else if (lang === "rust") {
      prereqs.push("Rust 1.75+ (install via [rustup](https://rustup.rs))");
    } else if (lang === "java" || lang === "kotlin") {
      prereqs.push("Java 17+ (JDK)");
      if (framework?.includes("Maven")) prereqs.push("Maven 3.8+");
      else if (framework?.includes("Gradle")) prereqs.push("Gradle 8+");
    } else if (lang === "dart") {
      prereqs.push("Flutter SDK 3.0+");
    } else if (lang === "ruby") {
      prereqs.push("Ruby 3.0+");
      prereqs.push("Bundler (`gem install bundler`)");
    } else if (lang === "c++" || lang === "c") {
      prereqs.push("C++17-compatible compiler (GCC 9+, Clang 10+, or MSVC 2019+)");
      if (framework && framework !== lang) prereqs.push(`${framework} SDK`);
    } else if (lang === "html" || lang === "css") {
      prereqs.push("A modern web browser (Chrome, Firefox, Safari, or Edge)");
    } else if (pkg) {
      // JS/TS project
      prereqs.push("Node.js 18+ ([nodejs.org](https://nodejs.org))");
      if (pkg.engines?.node) prereqs.push(`Node.js ${pkg.engines.node} (as specified in package.json)`);
      if (Object.keys({ ...pkg.devDependencies }).some((d) => d.includes("pnpm"))) prereqs.push("pnpm (`npm install -g pnpm`)");
    }
    return prereqs;
  }

  /**
   * Extract the first meaningful paragraph from an existing README
   * as a short project description.
   */
  _extractDescription(readme) {
    const lines = readme.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip headings, badges, blank lines, and HTML tags
      if (!trimmed) continue;
      if (trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("[![") || trimmed.startsWith("![")) continue;
      if (trimmed.startsWith("<") || trimmed.startsWith(">")) continue;
      if (trimmed.length > 30) return trimmed;
    }
    return null;
  }

  /**
   * Extract or synthesize a features list from README and stack signals.
   */
  _extractFeatures(existingReadme, pkg, fileTree, stack, framework) {
    // Try to extract a "Features" section from the existing README first
    if (existingReadme) {
      const featureMatch = existingReadme.match(/#{1,3}\s+(?:✨\s+)?Features?\s*\n([\s\S]*?)(?=\n#{1,3}|\n---|\z)/i);
      if (featureMatch && featureMatch[1].trim().length > 10) return featureMatch[1].trim();
    }

    const features = [];
    const all = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
    const fw = (framework || "").toLowerCase();
    const treeStr = fileTree.join(" ").toLowerCase();

    // ── JS/TS package-based signals ──────────────────────────────────────────
    if (all["@supabase/supabase-js"]) features.push("🔄 Supabase backend with real-time database and authentication");
    if (all.firebase) features.push("🔥 Firebase integration for real-time data sync");
    if (all["next-auth"] || all["@auth/core"] || all["@clerk/nextjs"]) features.push("🔐 Authentication and session management");
    if (all["react-leaflet"] || all.leaflet) features.push("🗺️ Interactive maps with Leaflet");
    if (all["@tanstack/react-query"]) features.push("⚡ Optimistic data fetching with TanStack Query");
    if (all.stripe) features.push("💳 Stripe payment integration");
    if (all["socket.io"] || all["socket.io-client"]) features.push("🔌 Real-time communication via Socket.IO");
    if (all["framer-motion"]) features.push("🎨 Smooth animations with Framer Motion");
    if (all.tailwindcss || all["@tailwindcss/postcss"]) features.push("🎨 Responsive UI built with Tailwind CSS");
    if (all["next-themes"]) features.push("🌙 Dark / Light mode toggle");
    if (all.graphql || all["@apollo/client"]) features.push("📊 GraphQL API layer");
    if (all.prisma || all["@prisma/client"]) features.push("🗄️ Type-safe database access with Prisma ORM");
    if (all["react-router-dom"] || all["react-router"]) features.push("🧭 Client-side routing with React Router");
    if (all.openai || all["@google/genai"] || all["@anthropic-ai/sdk"]) features.push("🤖 AI-powered features via LLM integration");

    // ── File tree signals (language-agnostic) ────────────────────────────────
    if (treeStr.includes(".github/workflows")) features.push("🤖 Automated CI/CD with GitHub Actions");
    if (treeStr.includes("dockerfile")) features.push("🐳 Docker containerisation support");
    if (treeStr.includes("docker-compose")) features.push("🐳 Multi-service orchestration with Docker Compose");

    // ── Non-JS / C++ / game signals ──────────────────────────────────────────
    if (!pkg) {
      const hasCpp = fileTree.some((f) => /\.(cpp|cc|cxx|h|hpp)$/.test(f));
      const hasHtml = fileTree.some((f) => /\.html$/.test(f));
      const hasCanvas = existingReadme?.toLowerCase().includes("canvas") || treeStr.includes("canvas");
      const hasGameWords = existingReadme?.match(/game|player|level|score|sprite|render/i);

      if (hasCpp) {
        features.push("⚡ High-performance native code written in C++");
        if (treeStr.includes("sfml") || treeStr.includes("sdl") || treeStr.includes("raylib") || treeStr.includes("opengl"))
          features.push("🎮 Hardware-accelerated graphics with a native game library");
      }
      if (hasHtml) {
        features.push("🌐 Runs directly in the browser — no installation needed");
        if (hasCanvas || hasGameWords) features.push("🎮 Interactive gameplay using the HTML5 Canvas API");
        if (treeStr.includes("phaser") || treeStr.includes("pixi") || treeStr.includes("babylon"))
          features.push("🕹️ Powered by a browser game engine");
      }
      if (fw === "python" || fw.includes("django") || fw.includes("flask") || fw.includes("fastapi")) {
        features.push("🐍 Built with Python for clean, readable backend logic");
      }
      if (fw.includes("go") || fw === "go") features.push("🚀 Fast, concurrent server built in Go");
      if (fw.includes("rust") || fw === "rust") features.push("🦀 Memory-safe systems programming with Rust");
    }

    // ── Generic fallback (only if still empty) ───────────────────────────────
    if (features.length === 0) {
      const label = (framework && !["Unknown", "unknown"].includes(framework)) ? framework : null;
      if (label) features.push(`Built with **${label}** for a modern development experience`);
      else features.push("Clean, well-structured codebase ready for extension");
      if (stack.includes("TypeScript")) features.push("Full TypeScript type safety across the codebase");
    }

    return features.map((f) => `- ${f}`).join("\n");
  }

  /**
   * Build deployment instructions based on detected tooling.
   */
  _buildDeploySection(fileTree, pkg, ghSlug, framework) {
    const hasVercel = fileTree.some((f) => f.includes("vercel.json") || f === ".vercelrc");
    const hasNetlify = fileTree.some((f) => f.includes("netlify.toml"));
    const hasRailway = fileTree.some((f) => f.includes("railway.toml") || f.includes("railway.json"));
    const hasDockerfile = fileTree.some((f) => f === "Dockerfile" || f.endsWith("/Dockerfile"));
    const scripts = pkg?.scripts || {};

    if (!hasVercel && !hasNetlify && !hasRailway && !hasDockerfile) return "";

    const lines = ["\n## 🌐 Deployment"];

    if (hasVercel || framework === "Next.js") {
      lines.push("\n**Vercel (recommended for Next.js)**\n");
      lines.push("1. Push your code to GitHub");
      lines.push("2. Import the repository on [vercel.com](https://vercel.com)");
      lines.push("3. Set environment variables in the Vercel dashboard");
      lines.push("4. Deploy with `npm run build` / `dist` as the output directory");
    }

    if (hasNetlify) {
      lines.push("\n**Netlify**\n");
      lines.push("- Build command: `npm run build`");
      lines.push("- Publish directory: `dist`");
    }

    if (hasDockerfile) {
      lines.push("\n**Docker**\n");
      lines.push("```bash");
      lines.push(`docker build -t ${ghSlug?.split("/")[1] || "app"} .`);
      lines.push(`docker run -p 3000:3000 ${ghSlug?.split("/")[1] || "app"}`);
      lines.push("```");
    }

    return lines.join("\n");
  }

  // ─── Dead code detection ──────────────────────────────────────────────────

  _detectDeadCode(sourceFiles, fileTree) {
    const items = [];
    let id = 0;

    // Only run JS/TS dead-code analysis — C++, HTML, Python etc. use different paradigms
    const JS_TS_EXT = /\.(js|jsx|ts|tsx|mjs|cjs)$/i;
    const jsFiles = Object.entries(sourceFiles).filter(([p]) => JS_TS_EXT.test(p));

    if (jsFiles.length === 0) {
      // For non-JS repos just flag large files as refactor hints
      for (const [path, content] of Object.entries(sourceFiles)) {
        const lineCount = (content || "").split("\n").length;
        if (lineCount > 400) {
          items.push({
            id: `dc-large-${id++}`,
            name: path.split("/").pop(),
            type: "Orphan File",
            file: path,
            line: null,
            severity: "low",
            confidence: 40,
            reason: `File has ${lineCount} lines — consider splitting into smaller modules.`,
            evidence: [`${lineCount} lines in ${path}`],
          });
        }
        if (items.length >= 6) break;
      }
      return items;
    }

    // ── JS/TS analysis ────────────────────────────────────────────────────────
    const allExports = new Map();
    const allImports = new Set();

    const exportFnRe    = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const exportConstRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;
    const exportClassRe = /export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const exportTypeRe  = /export\s+(?:type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const namedImportRe = /import\s+\{([^}]+)\}\s+from/g;
    const defaultImportRe = /import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/g;

    for (const [path, content] of jsFiles) {
      for (const [re, symbolType] of [
        [exportFnRe, "Unused Function"],
        [exportConstRe, "Unused Variable"],
        [exportClassRe, "Unused Component"],
        [exportTypeRe, "Unused Variable"],
      ]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
          const lineIdx = content.slice(0, m.index).split("\n").length - 1;
          allExports.set(m[1], { file: path, line: lineIdx + 1, symbolType });
        }
      }
      namedImportRe.lastIndex = 0;
      defaultImportRe.lastIndex = 0;
      let m;
      while ((m = namedImportRe.exec(content)) !== null) {
        for (const sym of m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim())) {
          if (sym) allImports.add(sym);
        }
      }
      while ((m = defaultImportRe.exec(content)) !== null) {
        allImports.add(m[1]);
      }
    }

    const ENTRY_POINT_SKIP = /^(App|Page|Layout|main|index|default|handler|GET|POST|PUT|DELETE|HEAD|PATCH|OPTIONS|middleware|config|metadata|generateMetadata|generateStaticParams|loader|action|ErrorBoundary|CatchBoundary)$/;
    for (const [sym, { file, line, symbolType }] of allExports.entries()) {
      if (!allImports.has(sym) && sym !== "default" && !ENTRY_POINT_SKIP.test(sym)) {
        items.push({
          id: `dc-rule-${id++}`,
          name: sym,
          type: symbolType,
          file,
          line,
          severity: "low",
          confidence: 55,
          reason: `"${sym}" is exported but not imported by any other file in the scanned set.`,
          evidence: [`Exported in: ${file}:${line}`],
        });
        if (items.length >= 8) break;
      }
    }

    // Flag large JS/TS files
    for (const [path, content] of jsFiles) {
      const lineCount = (content || "").split("\n").length;
      if (lineCount > 500) {
        items.push({
          id: `dc-large-${id++}`,
          name: path.split("/").pop(),
          type: "Orphan File",
          file: path,
          line: null,
          severity: "low",
          confidence: 40,
          reason: `File has ${lineCount} lines — consider splitting into smaller, single-responsibility modules.`,
          evidence: [`${lineCount} lines in ${path}`],
        });
      }
    }

    // Flag unused imports — create a fresh regex per file to avoid lastIndex bugs
    for (const [path, content] of jsFiles) {
      if (items.length >= 12) break;
      const unusedImportRe = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
      let m;
      while ((m = unusedImportRe.exec(content)) !== null) {
        const importedNames = m[1].split(",")
          .map((s) => s.trim().split(/\s+as\s+/).pop()?.trim())
          .filter(Boolean);
        for (const imported of importedNames) {
          // Escape special regex chars in the identifier before building a RegExp
          const escaped = imported.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const usageCount = (content.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
          if (usageCount === 1 && !imported.startsWith("_")) {
            const lineIdx = content.slice(0, m.index).split("\n").length;
            items.push({
              id: `dc-import-${id++}`,
              name: imported,
              type: "Unused Import",
              file: path,
              line: lineIdx,
              severity: "low",
              confidence: 65,
              reason: `"${imported}" is imported from "${m[2]}" but appears to be unused in this file.`,
              evidence: [`Imported in: ${path}:${lineIdx}`],
            });
            break; // one per file to avoid noise
          }
        }
      }
    }

    return items;
  }

  // ─── Test analysis ────────────────────────────────────────────────────────

  _analyzeTests(testFramework, testFiles, sourceFiles, fileTree, language) {
    // Use fetched testFiles count as floor, but also scan the full fileTree for
    // a more accurate total — testFiles is capped at MAX_TEST_FILES (10).
    const fetchedTestCount = Object.keys(testFiles).length;
    const TEST_FILE_RE = /\.(test|spec)\.(js|jsx|ts|tsx)$|__tests__\/|\/tests?\/|\/specs?\//i;
    const PY_TEST_RE = /(?:^|\/)test_[^/]+\.py$|(?:^|\/)[^/]+_test\.py$/;
    const GO_TEST_RE = /_test\.go$/;
    const JAVA_TEST_RE = /Test\.java$|Tests\.java$/;
    const treeTestCount = fileTree.filter(
      (f) => TEST_FILE_RE.test(f) || PY_TEST_RE.test(f) || GO_TEST_RE.test(f) || JAVA_TEST_RE.test(f)
    ).length;
    // True test count is the larger of: what we fetched vs what we saw in the tree
    const testCount = Math.max(fetchedTestCount, treeTestCount);

    // Source file count: also include tree-based estimate when fetched files are few
    const fetchedSourceCount = Object.keys(sourceFiles).length;
    const SOURCE_EXT_RE = /\.(js|jsx|ts|tsx|py|rb|go|rs|java|kt|cs|cpp|c|php|swift|scala)$/i;
    const treeSourceCount = fileTree.filter(
      (f) => SOURCE_EXT_RE.test(f) && !TEST_FILE_RE.test(f) && !PY_TEST_RE.test(f) && !GO_TEST_RE.test(f) && !JAVA_TEST_RE.test(f)
    ).length;
    const sourceCount = Math.max(fetchedSourceCount, treeSourceCount);

    // Coverage estimation using true counts
    const coverageRatio = sourceCount > 0 ? testCount / sourceCount : 0;
    const coverageEst = testCount === 0
      ? "0%"
      : coverageRatio >= 0.8
      ? "~80%+"
      : coverageRatio >= 0.5
      ? "~65%"
      : coverageRatio >= 0.2
      ? "~30%"
      : "~15%";
    const coverageColor = testCount === 0 ? "rose" : coverageRatio >= 0.5 ? "emerald" : "amber";

    const testStats = [
      { label: "Test Files", value: String(testCount), color: testCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: coverageEst, color: coverageColor },
      { label: "Framework", value: testFramework, color: "indigo" },
      { label: "Source Files", value: String(sourceCount > 0 ? sourceCount : fetchedSourceCount), color: "indigo" },
    ];

    // Which source files lack a corresponding test file?
    // Build a set of base names from ALL test paths in fileTree (not just fetched ones)
    const allTestPaths = [
      ...Object.keys(testFiles),
      ...fileTree.filter((f) => TEST_FILE_RE.test(f) || PY_TEST_RE.test(f) || GO_TEST_RE.test(f)),
    ];
    const testedBases = new Set(
      allTestPaths.map((p) =>
        p.replace(/\.(test|spec)\.(js|ts|jsx|tsx)$/, "")
          .replace(/__tests__\//, "")
          .replace(/test_/, "")
          .replace(/_test$/, "")
          .split("/").pop()
      )
    );
    const missingTests = Object.keys(sourceFiles)
      .filter((p) => {
        const base = p.split("/").pop().replace(/\.(ts|tsx|js|jsx|py|go|rs|java)$/, "");
        return !testedBases.has(base) && !p.includes("config") && !p.includes(".d.ts") && !p.match(/index\.(ts|js|tsx|jsx)$/);
      })
      .slice(0, 6)
      .map((p) => p.split("/").pop());

    const testRecommendations = [];
    if (testCount === 0) {
      testRecommendations.push(
        `No tests found. Set up ${testFramework === "None detected" ? "Jest or Vitest" : testFramework} and add unit tests for core logic.`
      );
    }
    if (testCount > 0 && coverageRatio < 0.3) {
      testRecommendations.push("Test coverage appears low. Aim for at least 60% coverage of business-critical code.");
    }
    if (!fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"))) {
      testRecommendations.push("No CI configuration detected. Add a GitHub Actions workflow to run tests automatically on every pull request.");
    }
    if (testCount > 0 && !fileTree.some((f) => f.includes("coverage") || f.includes("lcov"))) {
      testRecommendations.push("Consider adding code coverage reporting (e.g., `--coverage` flag with Jest/Vitest) to track coverage over time.");
    }
    if (missingTests.length > 0) {
      testRecommendations.push(`${missingTests.length} source file(s) appear untested: ${missingTests.slice(0, 3).join(", ")}${missingTests.length > 3 ? " and more" : ""}.`);
    }

    // Pick the best source file to display (prefer main entry, then largest file)
    const priority = ["src/index", "src/app", "index", "app", "main", "src/main", "src/lib", "lib/"];
    let sampleFile = null;
    for (const p of priority) {
      sampleFile = Object.keys(sourceFiles).find((k) => k.includes(p));
      if (sampleFile) break;
    }
    // Fall back to the largest file if no priority match
    if (!sampleFile) {
      sampleFile = Object.entries(sourceFiles).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || null;
    }
    const sampleSourceCode = sampleFile ? sourceFiles[sampleFile] || "" : "";

    // Generate test scaffold for the sample file
    const generatedTestCode = sampleFile
      ? this._generateTestScaffold(sampleFile, sampleSourceCode, testFramework, language)
      : "// No source files available to generate tests for.";

    return { testStats, missingTests, testRecommendations, sampleSourceCode, generatedTestCode };
  }

  // ─── Test scaffold generation ─────────────────────────────────────────────

  _generateTestScaffold(filePath, content, testFramework, language) {
    // Strip any known source extension — works for .cpp, .c, .html, .py, .go, .ts, .js etc.
    const fileName = filePath.split("/").pop().replace(/\.[a-zA-Z0-9]+$/, "");
    const isTs = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
    const lang = (language || "").toLowerCase();

    // ── Non-JS/TS fallback — return a language-appropriate scaffold hint ───────
    const NON_JS_EXTS = /\.(cpp|cc|cxx|c|h|hpp|html|css|scss|lua|sql|sh|bash|r|sql)$/i;
    if (NON_JS_EXTS.test(filePath) && lang !== "python" && lang !== "go" && lang !== "rust") {
      return `// No automated test scaffold available for ${lang || filePath.split(".").pop()} files.\n// Consider using a language-appropriate testing framework:\n//   C/C++  → Google Test, Catch2, or doctest\n//   HTML   → Playwright, Cypress, or manual browser testing\n//   Lua    → busted\n//   SQL    → pgTAP or db-migrate test helpers`;
    }

    // ── Python scaffold ────────────────────────────────────────────────────
    if (lang === "python" || filePath.endsWith(".py")) {
      const pyFnRe = /^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;
      const pyClassRe = /^class\s+([A-Za-z_][A-Za-z0-9_]*)/gm;
      const pyFns = [];
      const pyClasses = [];
      let m;
      while ((m = pyFnRe.exec(content)) !== null) {
        if (!m[1].startsWith("_") && !pyFns.includes(m[1])) pyFns.push(m[1]);
      }
      while ((m = pyClassRe.exec(content)) !== null) pyClasses.push(m[1]);

      const moduleName = fileName.replace(/-/g, "_");
      const classTests = pyClasses.slice(0, 2).map((cls) => `
class Test${cls}:
    def test_instantiation(self):
        """${cls} should instantiate without raising."""
        instance = ${cls}()
        assert instance is not None

    def test_repr(self):
        """${cls} should have a meaningful string representation."""
        instance = ${cls}()
        assert str(instance) is not None
`).join("\n");

      const fnTests = pyFns.slice(0, 5).map((fn) => `
def test_${fn}_returns_value():
    """${fn} should return a non-None value for valid input."""
    result = ${fn}()
    assert result is not None


def test_${fn}_type():
    """${fn} should return the expected type."""
    result = ${fn}()
    # Replace with the actual expected type
    assert result is not None


def test_${fn}_edge_case():
    """${fn} should handle edge cases (empty, None, zero) gracefully."""
    # Add edge-case assertions specific to ${fn}
    pass
`).join("\n");

      return `"""Tests for ${moduleName}."""
import pytest
from ${moduleName} import ${[...pyFns.slice(0, 5), ...pyClasses.slice(0, 2)].join(", ") || moduleName}


${classTests}
${fnTests}
`;
    }

    // ── Go scaffold ────────────────────────────────────────────────────────
    if (lang === "go" || filePath.endsWith(".go")) {
      const goFnRe = /^func\s+([A-Z][A-Za-z0-9_]*)\s*\(/gm;
      const goFns = [];
      let m;
      while ((m = goFnRe.exec(content)) !== null) goFns.push(m[1]);
      const pkgMatch = content.match(/^package\s+(\w+)/m);
      const pkg = pkgMatch ? pkgMatch[1] : "main";

      const fnTests = goFns.slice(0, 5).map((fn) => `
func Test${fn}(t *testing.T) {
\tt.Run("valid input", func(t *testing.T) {
\t\t// result := ${fn}(/* args */)
\t\t// if result == nil {
\t\t// \tt.Errorf("expected non-nil result from ${fn}")
\t\t// }
\t})

\tt.Run("edge case", func(t *testing.T) {
\t\t// Test zero values, empty strings, boundary conditions
\t})
}`).join("\n");

      return `package ${pkg}_test

import (
\t"testing"
)
${fnTests || `
func TestExample(t *testing.T) {
\tt.Log("Add tests for ${fileName}")
}`}
`;
    }

    // ── JS/TS scaffold ─────────────────────────────────────────────────────

    // Extract exported function and class names
    const fnRe = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const constRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\(/g;
    const classRe = /export\s+(?:default\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;

    // Extract parameter names for richer test stubs
    const fnWithParamsRe = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)/g;
    const constWithParamsRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)/g;

    const fns = [];
    let m;

    while ((m = fnWithParamsRe.exec(content)) !== null) {
      const params = m[2].split(",").map((p) => p.trim().split(":")[0].trim().split("=")[0].trim()).filter(Boolean);
      fns.push({ name: m[1], params, kind: "function" });
    }
    while ((m = constWithParamsRe.exec(content)) !== null) {
      if (!fns.find((f) => f.name === m[1])) {
        const params = m[2].split(",").map((p) => p.trim().split(":")[0].trim().split("=")[0].trim()).filter(Boolean);
        fns.push({ name: m[1], params, kind: "function" });
      }
    }
    const classes = [];
    while ((m = classRe.exec(content)) !== null) classes.push(m[1]);

    const importPath = `./${fileName}`;
    const isVitest = testFramework.toLowerCase().includes("vitest");
    const testImport = isVitest
      ? `import { describe, it, expect, vi, beforeEach } from 'vitest';`
      : `import { describe, it, expect, jest, beforeEach } from '@jest/globals';`;

    if (fns.length === 0 && classes.length === 0) {
      return `${testImport}
import * as ${fileName}Module from '${importPath}';

describe('${fileName}', () => {
  it('module exports should be defined', () => {
    expect(${fileName}Module).toBeDefined();
    expect(typeof ${fileName}Module).toBe('object');
  });

  it('should load without throwing', () => {
    expect(() => require('${importPath}')).not.toThrow();
  });
});`;
    }

    // Build mock setup for classes that need construction
    const mockSetup = classes.length > 0
      ? `\n  // Mocks — replace with real test doubles as needed\n  ${isVitest ? "vi" : "jest"}.clearAllMocks();\n`
      : "";

    const classTests = classes.slice(0, 2).map((cls) => `
  describe('${cls}', () => {
    let instance${isTs ? `: ${cls}` : ""};

    beforeEach(() => {
      instance = new ${cls}();
    });

    it('should instantiate without errors', () => {
      expect(instance).toBeInstanceOf(${cls});
    });

    it('should have expected public interface', () => {
      // Verify key methods exist before calling them
      expect(typeof instance).toBe('object');
    });
  });`).join("\n");

    const fnTests = fns.slice(0, 5).map(({ name, params }) => {
      const hasParams = params.length > 0;
      const paramPlaceholders = params.map((p) => {
        if (p.toLowerCase().includes("id")) return `'test-id'`;
        if (p.toLowerCase().includes("name")) return `'test-name'`;
        if (p.toLowerCase().includes("url")) return `'https://example.com'`;
        if (p.toLowerCase().includes("count") || p.toLowerCase().includes("num") || p.toLowerCase().includes("size")) return `5`;
        if (p.toLowerCase().includes("flag") || p.toLowerCase().includes("enable") || p.toLowerCase().includes("active")) return `true`;
        if (p.toLowerCase().includes("list") || p.toLowerCase().includes("items") || p.toLowerCase().includes("arr")) return `[]`;
        if (p.toLowerCase().includes("obj") || p.toLowerCase().includes("data") || p.toLowerCase().includes("config")) return `{}`;
        return `undefined`;
      });
      const callExpr = hasParams ? `${name}(${paramPlaceholders.join(", ")})` : `${name}()`;

      return `
  describe('${name}', () => {
    it('should be exported and callable', () => {
      expect(typeof ${name}).toBe('function');
    });

    it('should return a defined result for typical input', async () => {
      const result = await Promise.resolve(${callExpr});
      // Assert the actual return type / shape here
      expect(result).toBeDefined();
    });

    it('should not throw for valid arguments', () => {
      expect(() => ${callExpr}).not.toThrow();
    });${
  hasParams
    ? `\n\n    it('should handle missing/null arguments gracefully', async () => {
      // Passing null/undefined should either throw a typed error or return a safe default
      const nullArgs = [${params.map(() => "null").join(", ")}];
      await expect(${name}(...nullArgs)).resolves.toBeDefined().catch(() => {/* typed throw is acceptable */});
    });`
    : ""
}
  });`;
    }).join("\n");

    const importNames = [
      ...fns.slice(0, 5).map((f) => f.name),
      ...classes.slice(0, 2),
    ].join(", ");

    return `${testImport}
import { ${importNames} } from '${importPath}';

describe('${fileName}', () => {
  beforeEach(() => {${mockSetup}
  });
${classTests}
${fnTests}
});`;
  }

  // ─── Action plan ──────────────────────────────────────────────────────────

  _buildActionPlan(criticalIssues, warnings, depOutdated, testFiles, readme, envVars, pkg, fileTree, language) {
    const plan = [];
    const all = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
    const lang = (language || "").toLowerCase();
    const isJs = !lang || lang === "javascript" || lang === "typescript";
    const isPython = lang === "python";
    const isGo = lang === "go";
    const isRust = lang === "rust";
    const isJava = lang === "java" || lang === "kotlin";

    if (criticalIssues > 0) {
      plan.push({
        priority: "high",
        title: "Resolve security vulnerabilities",
        reason: `${criticalIssues} dependency with known security advisories was detected.`,
        recommendation: isJs
          ? "Run `npm audit fix` to automatically fix resolvable issues. Review any remaining advisories manually and upgrade packages to their patched versions."
          : isPython
          ? "Run `pip audit` or `safety check` to review vulnerable packages. Update to patched versions in requirements.txt."
          : "Review dependency advisories and upgrade to patched versions.",
      });
    }

    if (Object.keys(testFiles).length === 0) {
      let testRec;
      if (isPython) {
        testRec = "Set up pytest (`pip install pytest`) and write unit tests for all core logic. Aim for at least 60% coverage.";
      } else if (isGo) {
        testRec = "Add `_test.go` files alongside your packages and run `go test ./...` to validate them.";
      } else if (isRust) {
        testRec = "Add `#[cfg(test)]` modules with unit tests in your source files and run `cargo test`.";
      } else if (isJava) {
        testRec = "Add JUnit 5 tests under `src/test/java` and run `mvn test` to validate them.";
      } else {
        const suggestedFramework = all.vitest ? "Vitest" : all.jest ? "Jest" : "Vitest";
        testRec = `Set up ${suggestedFramework} and write unit tests for all core business logic. Aim for at least 60% coverage on critical paths.`;
      }
      plan.push({
        priority: "high",
        title: "Add automated tests",
        reason: "No test files were found in the repository.",
        recommendation: testRec,
      });
    }

    if (!readme || readme.length < 300) {
      plan.push({
        priority: "medium",
        title: "Improve README documentation",
        reason: !readme ? "The README.md is missing." : "The README is too short and lacks meaningful content.",
        recommendation: "Add a clear project description, installation steps, usage examples, screenshots or a live demo link, and contribution guidelines.",
      });
    }

    if (depOutdated.length > 0) {
      const updateCmd = isJs
        ? "Run `npm outdated` to review all outdated packages."
        : isPython
        ? "Run `pip list --outdated` to review all outdated packages."
        : isGo
        ? "Run `go get -u ./...` to update all Go dependencies."
        : "Review and update your dependency manifest.";
      plan.push({
        priority: "medium",
        title: `Update ${depOutdated.length} outdated ${depOutdated.length === 1 ? "dependency" : "dependencies"}`,
        reason: `${depOutdated.map((d) => `${d.pkg} (${d.current} → ${d.latest})`).join(", ")}.`,
        recommendation: `${updateCmd} Update one major version at a time and run tests after each upgrade to catch breaking changes.`,
      });
    }

    if (envVars.length > 0) {
      const hasEnvExample = fileTree.some((f) => f.includes(".env.example") || f.includes(".env.sample"));
      if (!hasEnvExample) {
        plan.push({
          priority: "low",
          title: "Create .env.example file",
          reason: `${envVars.length} environment variable(s) detected but no .env.example file found.`,
          recommendation: "Create a `.env.example` file listing all required environment variables with placeholder values. This helps onboard new contributors quickly.",
        });
      }
    }

    if (!fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"))) {
      plan.push({
        priority: "low",
        title: "Set up continuous integration",
        reason: "No CI/CD configuration was found in the repository.",
        recommendation: "Add a GitHub Actions workflow at `.github/workflows/ci.yml` to run lint, type-check, and tests on every pull request. This prevents regressions and enforces quality.",
      });
    }

    // Fallback padding — language-specific tips
    if (plan.length < 3) {
      if (isJs && (all.typescript || all["@types/node"])) {
        plan.push({
          priority: "low",
          title: "Enable TypeScript strict mode",
          reason: "Stricter TypeScript settings help catch bugs earlier and improve code quality.",
          recommendation: 'Enable `"strict": true` in `tsconfig.json` and gradually fix type errors.',
        });
      } else if (isPython) {
        plan.push({
          priority: "low",
          title: "Add type hints and mypy",
          reason: "Type hints improve code readability and help catch bugs at development time.",
          recommendation: "Add type hints to function signatures and run `mypy .` to catch type errors.",
        });
      } else if (isGo) {
        plan.push({
          priority: "low",
          title: "Add Go linting",
          reason: "Linting catches common Go mistakes and enforces code style.",
          recommendation: "Install golangci-lint and add a GitHub Actions step to run `golangci-lint run ./...` on PRs.",
        });
      } else {
        plan.push({
          priority: "low",
          title: "Add code quality tooling",
          reason: "Linters and formatters keep the codebase consistent as it grows.",
          recommendation: "Add a linter appropriate for your language and integrate it into your CI pipeline.",
        });
      }
    }

    return plan.slice(0, 5);
  }

  // ─── Overview summary ─────────────────────────────────────────────────────

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
