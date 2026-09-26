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
 */

// ─── Framework detection rules ────────────────────────────────────────────────

const FRAMEWORK_RULES = [
  { test: (p) => p.dependencies?.next || p.devDependencies?.next, name: "Next.js", type: "Full-Stack Framework" },
  { test: (p) => p.dependencies?.["@angular/core"], name: "Angular", type: "Frontend Framework" },
  { test: (p) => p.dependencies?.vue || p.devDependencies?.vue, name: "Vue.js", type: "Frontend Framework" },
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
];

const LANGUAGE_BY_EXT = {
  ts: "TypeScript", tsx: "TypeScript",
  js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", rb: "Ruby", go: "Go", rs: "Rust",
  java: "Java", kt: "Kotlin", cs: "C#",
  cpp: "C++", c: "C", php: "PHP", swift: "Swift",
  scala: "Scala", clj: "Clojure",
};

// Known CVEs / outdated patterns (no CVE number invented — only well-known advisories)
const KNOWN_VULNERABLE = new Set([
  "lodash", "minimist", "node-fetch", "axios", "serialize-javascript",
  "ws", "tough-cookie", "semver", "word-wrap", "json5",
]);

// ─── Provider ─────────────────────────────────────────────────────────────────

export class RuleBasedProvider {
  constructor() {
    this.model = "rule-engine-v1";
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<import('./schemas.js').RepositoryAnalysis>}  — always resolves, never rejects
   */
  async analyzeRepository(repositoryContext) {
    console.log(
      `[RuleBasedProvider] Analyzing ${repositoryContext.repositoryName} with local rule engine`
    );
    // Synchronous analysis — wrapped in Promise so the interface is consistent
    const analysis = this._analyze(repositoryContext);
    console.log(
      `[RuleBasedProvider] Done — healthScore: ${analysis.overview.healthScore}, ` +
        `steps: ${analysis.setup.steps.length}, deps: ${analysis.dependencies.nodes.length}`
    );
    return analysis;
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

    // ── 1. Language & framework detection ───────────────────────────────────
    const language = this._detectLanguage(pkg, fileTree, metadata);
    const { framework, stack } = this._detectFramework(pkg, fileTree, configurationFiles, language);
    const testFramework = this._detectTestFramework(pkg, fileTree);

    // ── 2. Dependency analysis ───────────────────────────────────────────────
    const { depNodes, depAlerts, depOutdated } = this._analyzeDependencies(pkg, repositoryName);

    // ── 3. Environment variables ─────────────────────────────────────────────
    const envVars = this._extractEnvVars(sourceFiles, configurationFiles);

    // ── 4. Setup steps ───────────────────────────────────────────────────────
    const setupSteps = this._buildSetupSteps(pkg, repositoryName, configurationFiles, language, framework);

    // ── 5. README quality ────────────────────────────────────────────────────
    const { qualityScore, missingSections, readmeIssues } = this._scoreReadme(readme);
    const generatedMarkdown = this._generateReadme(repositoryName, metadata, pkg, language, framework, stack, setupSteps, envVars, fileTree);

    // ── 6. Dead code detection ───────────────────────────────────────────────
    const deadCode = this._detectDeadCode(sourceFiles, fileTree);

    // ── 7. Test analysis ─────────────────────────────────────────────────────
    const { testStats, missingTests, testRecommendations, sampleSourceCode, generatedTestCode } =
      this._analyzeTests(testFramework, testFiles, sourceFiles, fileTree, language);

    // ── 8. Health scoring ────────────────────────────────────────────────────
    const criticalIssues = depAlerts.filter((a) => a.severity === "CRITICAL").length;
    const warnings =
      missingSections.length +
      depOutdated.length +
      (Object.keys(testFiles).length === 0 ? 1 : 0) +
      (!readme ? 1 : 0);
    const healthScore = Math.max(10, Math.min(100, 100 - criticalIssues * 15 - warnings * 5));

    // ── 9. Action plan ───────────────────────────────────────────────────────
    const actionPlan = this._buildActionPlan(criticalIssues, warnings, depOutdated, testFiles, readme, envVars, pkg);

    // ── 10. Overview summary ─────────────────────────────────────────────────
    const summary = this._buildSummary(repositoryName, metadata, language, framework, pkg, fileTree);

    // ── 11. Setup status ─────────────────────────────────────────────────────
    const setupStatus = criticalIssues > 0 ? "critical" : warnings > 2 ? "warning" : "healthy";

    // ── 12. Docker detection ─────────────────────────────────────────────────
    const hasDockerfile = fileTree.some((f) => f === "Dockerfile" || f.endsWith("/Dockerfile"));
    const hasCompose = fileTree.some((f) => f.includes("docker-compose"));
    const dockerCommand = hasDockerfile ? "docker build -t " + repositoryName + " . && docker run -p 3000:3000 " + repositoryName : "";
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

  // ─── Language detection ────────────────────────────────────────────────────

  _detectLanguage(pkg, fileTree, metadata) {
    if (metadata?.language) return metadata.language;

    // Count file extensions
    const counts = {};
    for (const f of fileTree) {
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

  _detectFramework(pkg, fileTree, configFiles, language) {
    if (!pkg) {
      // Non-JS: detect from config files
      const configKeys = Object.keys(configFiles).join(" ").toLowerCase();
      if (configKeys.includes("requirements.txt") || configKeys.includes("pyproject.toml")) {
        const reqContent = configFiles["requirements.txt"] || "";
        if (reqContent.includes("django")) return { framework: "Django", stack: ["Python", "Django"] };
        if (reqContent.includes("flask")) return { framework: "Flask", stack: ["Python", "Flask"] };
        if (reqContent.includes("fastapi")) return { framework: "FastAPI", stack: ["Python", "FastAPI"] };
        return { framework: "Python", stack: ["Python"] };
      }
      if (configKeys.includes("go.mod")) return { framework: "Go", stack: ["Go"] };
      if (configKeys.includes("cargo.toml")) return { framework: "Rust / Cargo", stack: ["Rust"] };
      if (configKeys.includes("pom.xml") || configKeys.includes("build.gradle")) return { framework: "Java / Maven", stack: ["Java"] };
      return { framework: language, stack: [language] };
    }

    for (const rule of FRAMEWORK_RULES) {
      if (rule.test(pkg)) {
        const stack = this._buildStack(pkg, rule.name, language);
        return { framework: rule.name, stack };
      }
    }

    return { framework: language === "TypeScript" ? "TypeScript (Node.js)" : "Node.js", stack: this._buildStack(pkg, "Node.js", language) };
  }

  _buildStack(pkg, framework, language) {
    const stack = new Set([language, framework]);
    const all = { ...pkg.dependencies, ...pkg.devDependencies };

    if (all.typescript || all["@types/node"]) stack.add("TypeScript");
    if (all.tailwindcss) stack.add("Tailwind CSS");
    if (all.prisma || all["@prisma/client"]) stack.add("Prisma");
    if (all.mongoose || all.mongodb) stack.add("MongoDB");
    if (all.pg || all.postgres) stack.add("PostgreSQL");
    if (all.mysql2 || all.mysql) stack.add("MySQL");
    if (all.redis || all.ioredis) stack.add("Redis");
    if (all.graphql || all["@apollo/server"]) stack.add("GraphQL");
    if (all.trpc || all["@trpc/server"]) stack.add("tRPC");
    if (all.zod) stack.add("Zod");
    if (all.stripe) stack.add("Stripe");
    if (all["next-auth"] || all["@auth/core"]) stack.add("Auth.js");
    if (all["framer-motion"]) stack.add("Framer Motion");
    if (all["lucide-react"]) stack.add("Lucide");
    if (all["@radix-ui/react-dialog"] || all["@radix-ui/react-slot"]) stack.add("Radix UI");
    if (all.shadcn) stack.add("shadcn/ui");

    return [...stack].filter(Boolean).slice(0, 8);
  }

  // ─── Test framework detection ──────────────────────────────────────────────

  _detectTestFramework(pkg, fileTree) {
    if (pkg) {
      for (const rule of TEST_FRAMEWORK_RULES) {
        if (rule.test(pkg)) return rule.name;
      }
    }
    // Infer from file patterns
    const testExts = fileTree.filter((f) => f.includes(".test.") || f.includes(".spec."));
    if (testExts.length > 0) {
      if (fileTree.some((f) => f.includes("cypress"))) return "Cypress";
      if (fileTree.some((f) => f.includes("playwright"))) return "Playwright";
      return "Jest (inferred)";
    }
    return "None detected";
  }

  // ─── Dependency analysis ───────────────────────────────────────────────────

  _analyzeDependencies(pkg, repoName) {
    const depNodes = [{ id: "root", label: repoName, type: "root", health: "ok" }];
    const depAlerts = [];
    const depOutdated = [];

    if (!pkg) return { depNodes, depAlerts, depOutdated };

    const prod = pkg.dependencies || {};
    const dev = pkg.devDependencies || {};

    for (const [name, version] of Object.entries(prod)) {
      const health = KNOWN_VULNERABLE.has(name) ? "warning" : "ok";
      depNodes.push({ id: name, label: `${name}@${version}`, type: "dep", health });
    }
    for (const [name, version] of Object.entries(dev)) {
      const health = KNOWN_VULNERABLE.has(name) ? "warning" : "ok";
      depNodes.push({ id: `dev-${name}`, label: `${name}@${version}`, type: "devDep", health });
    }

    // Flag potentially vulnerable known packages
    for (const [name] of Object.entries(prod)) {
      if (KNOWN_VULNERABLE.has(name)) {
        depAlerts.push({
          pkg: name,
          severity: "MEDIUM",
          cve: "",
          desc: `${name} has had historical security advisories. Consider running \`npm audit\` to check the installed version.`,
        });
      }
    }

    // Detect very old major versions (heuristic based on version string)
    const oldPatterns = [
      { pkg: "react", old: /^\^?[0-9]\.|^\^?1[0-5]\./, latest: "19.x" },
      { pkg: "next", old: /^\^?[0-9]\.|^\^?1[0-2]\./, latest: "15.x" },
      { pkg: "typescript", old: /^\^?[0-4]\./, latest: "5.x" },
      { pkg: "tailwindcss", old: /^\^?[0-2]\./, latest: "4.x" },
      { pkg: "eslint", old: /^\^?[0-7]\./, latest: "9.x" },
    ];
    for (const { pkg: name, old: re, latest } of oldPatterns) {
      const v = prod[name] || dev[name];
      if (v && re.test(v)) {
        depOutdated.push({ pkg: name, current: v, latest, status: "outdated" });
      }
    }

    return { depNodes, depAlerts, depOutdated };
  }

  // ─── Environment variable extraction ──────────────────────────────────────

  _extractEnvVars(sourceFiles, configFiles) {
    const vars = new Map();

    // From .env.example / .env.sample
    for (const [path, content] of Object.entries(configFiles)) {
      if (/\.env\.(example|sample|template)/i.test(path) || path === ".env.example") {
        for (const line of content.split("\n")) {
          const m = line.match(/^([A-Z_][A-Z0-9_]*)=?(.*)?$/);
          if (m && !line.startsWith("#")) {
            vars.set(m[1], { key: m[1], example: (m[2] || "").trim(), required: true });
          }
        }
      }
    }

    // From source files: process.env.XXX
    const envRe = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    for (const [, content] of Object.entries(sourceFiles)) {
      let match;
      while ((match = envRe.exec(content)) !== null) {
        const key = match[1];
        if (!vars.has(key)) vars.set(key, { key, example: "", required: true });
      }
    }

    return [...vars.values()].slice(0, 20);
  }

  // ─── Setup steps ──────────────────────────────────────────────────────────

  _buildSetupSteps(pkg, repoName, configFiles, language, framework) {
    const steps = [];
    let id = 1;

    const slug = repoName.toLowerCase().replace(/\s+/g, "-");

    // Clone
    steps.push({
      id: id++,
      title: "Clone the repository",
      command: `git clone https://github.com/example/${slug}.git && cd ${slug}`,
      description: "Clone the project to your local machine.",
    });

    if (!pkg) {
      // Non-JS languages
      const lang = language.toLowerCase();
      if (lang === "python") {
        steps.push({ id: id++, title: "Create virtual environment", command: "python -m venv venv && source venv/bin/activate", description: "Isolate project dependencies." });
        steps.push({ id: id++, title: "Install dependencies", command: "pip install -r requirements.txt", description: "Install required Python packages." });
        const hasEnvExample = Object.keys(configFiles).some((f) => f.includes(".env.example"));
        if (hasEnvExample) steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Set up environment variables." });
        steps.push({ id: id++, title: "Run the application", command: "python main.py", description: "Start the application." });
      } else if (lang === "go") {
        steps.push({ id: id++, title: "Install dependencies", command: "go mod tidy", description: "Download Go module dependencies." });
        steps.push({ id: id++, title: "Build the project", command: "go build ./...", description: "Compile the project." });
        steps.push({ id: id++, title: "Run the application", command: "go run .", description: "Start the application." });
      } else if (lang === "rust") {
        steps.push({ id: id++, title: "Build the project", command: "cargo build --release", description: "Compile with Cargo." });
        steps.push({ id: id++, title: "Run the application", command: "cargo run", description: "Start the application." });
      } else {
        steps.push({ id: id++, title: "Install dependencies", command: "# See project documentation for install instructions", description: "Follow the project README." });
        steps.push({ id: id++, title: "Run the application", command: "# See project documentation", description: "Start the application." });
      }
      return steps;
    }

    // Node.js/JS path
    const hasPnpm = Object.keys(configFiles).some((f) => f.includes("pnpm-lock"));
    const hasYarn = Object.keys(configFiles).some((f) => f.includes("yarn.lock"));
    const pm = hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";

    const installCmd = pm === "npm" ? "npm install" : `${pm} install`;
    steps.push({ id: id++, title: "Install dependencies", command: installCmd, description: `Install all required packages using ${pm}.` });

    const hasEnvExample = Object.keys(configFiles).some((f) => /\.env\.(example|sample)/i.test(f));
    if (hasEnvExample) {
      steps.push({ id: id++, title: "Configure environment", command: "cp .env.example .env", description: "Copy the example env file and fill in required values." });
    }

    // Check for a prisma schema
    const hasPrisma = Object.keys(configFiles).some((f) => f.includes("schema.prisma"));
    if (hasPrisma) {
      steps.push({ id: id++, title: "Generate Prisma client", command: "npx prisma generate", description: "Generate the Prisma database client." });
      steps.push({ id: id++, title: "Run database migrations", command: "npx prisma db push", description: "Apply database schema migrations." });
    }

    const scripts = pkg.scripts || {};
    const startCmd = scripts.dev ? `${pm} run dev` : scripts.start ? `${pm === "npm" ? "npm start" : `${pm} start`}` : `${pm} run dev`;
    const startDesc = scripts.dev ? "Launch the development server with hot-reload." : "Start the application.";

    steps.push({ id: id++, title: "Start the development server", command: startCmd, description: startDesc });

    // Build step if this looks like a production deploy
    if (scripts.build) {
      steps.push({ id: id++, title: "Build for production (optional)", command: `${pm} run build`, description: "Create an optimized production build." });
    }

    return steps;
  }

  // ─── Runtime requirements ─────────────────────────────────────────────────

  _runtimeRequirements(pkg, language) {
    const reqs = [];
    if (language === "Python") reqs.push("Python 3.8+");
    else if (language === "Go") reqs.push("Go 1.21+");
    else if (language === "Rust") reqs.push("Rust 1.70+ (via rustup)");
    else if (pkg) {
      const engines = pkg.engines || {};
      if (engines.node) reqs.push(`Node.js ${engines.node}`);
      else reqs.push("Node.js 18+");
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

    if (readme.includes("#")) { score += 15; } else { missing.push("Title"); }
    if (lower.includes("description") || readme.length > 200) { score += 15; } else { missing.push("Description"); }
    if (lower.includes("install") || lower.includes("getting started")) { score += 20; } else { missing.push("Installation"); }
    if (lower.includes("usage") || lower.includes("example")) { score += 20; } else { missing.push("Usage"); }
    if (lower.includes("contribut")) { score += 15; } else { missing.push("Contributing"); }
    if (lower.includes("license") || lower.includes("licence")) { score += 15; } else { missing.push("License"); }

    const issues = [];
    if (readme.length < 300) issues.push("README is very short — add more detail.");
    if (!lower.includes("```")) issues.push("No code examples found — add usage snippets.");
    if (!lower.includes("badge") && !lower.includes("[![")) issues.push("Consider adding status badges (CI, npm version, etc.).");

    return { qualityScore: score, missingSections: missing, readmeIssues: issues };
  }

  // ─── README generation ────────────────────────────────────────────────────

  _generateReadme(name, metadata, pkg, language, framework, stack, steps, envVars, fileTree) {
    const desc = metadata?.description || `A ${framework} project.`;
    const ghSlug = metadata?.githubSlug;
    const version = pkg?.version || "1.0.0";
    const hasTests = fileTree.some((f) => f.includes(".test.") || f.includes(".spec.") || f.includes("__tests__"));
    const license = fileTree.some((f) => f.toLowerCase().startsWith("license")) ? "MIT" : null;

    const badgeBase = ghSlug ? `https://img.shields.io/github` : null;
    const badges = ghSlug
      ? `[![Stars](${badgeBase}/stars/${ghSlug}?style=flat-square)](https://github.com/${ghSlug}) ` +
        (hasTests ? `[![Tests](${badgeBase}/actions/workflows/test.yml/badge.svg)](https://github.com/${ghSlug}/actions) ` : "")
      : "";

    const installStep = steps.find((s) => s.title.toLowerCase().includes("install"));
    const startStep = steps.find((s) => s.title.toLowerCase().includes("start") || s.title.toLowerCase().includes("run"));

    const envSection = envVars.length > 0
      ? `\n## Environment Variables\n\nCopy \`.env.example\` to \`.env\` and configure:\n\n` +
        `| Variable | Required | Example |\n|---|---|---|\n` +
        envVars.map((v) => `| \`${v.key}\` | ${v.required ? "Yes" : "No"} | \`${v.example || "..."}\` |`).join("\n")
      : "";

    const stackSection = stack.length > 0
      ? `\n## Tech Stack\n\n${stack.map((s) => `- **${s}**`).join("\n")}`
      : "";

    const scriptsSection = pkg?.scripts && Object.keys(pkg.scripts).length > 0
      ? `\n## Available Scripts\n\n` +
        Object.entries(pkg.scripts)
          .map(([k, v]) => `- \`npm run ${k}\` — \`${v}\``)
          .join("\n")
      : "";

    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const devDepsCount = Object.keys(pkg?.devDependencies || {}).length;
    const depSection = depsCount > 0
      ? `\n## Dependencies\n\n${depsCount} production dependencies, ${devDepsCount} dev dependencies. Run \`npm audit\` to check for vulnerabilities.`
      : "";

    return `# ${name}

${badges}

${desc}
${version !== "1.0.0" ? `\n**Version:** ${version}` : ""}

## Getting Started
${steps.map((s) => `\n### ${s.title}\n\`\`\`bash\n${s.command}\n\`\`\`\n${s.description}`).join("\n")}
${envSection}
${stackSection}
${scriptsSection}
${depSection}
${license ? `\n## License\n\nThis project is licensed under the ${license} License.` : ""}

---
*Generated by RepoPilot Rule Engine*
`.trim();
  }

  // ─── Dead code detection ──────────────────────────────────────────────────

  _detectDeadCode(sourceFiles, fileTree) {
    const items = [];
    let id = 0;

    // Collect all exports across files
    const allExports = new Map(); // symbol → file
    const allImports = new Map(); // symbol → [files that import it]

    const exportRe = /export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const importRe = /import\s+(?:\{([^}]+)\}|([A-Za-z_$][A-Za-z0-9_$]*))\s+from/g;

    for (const [path, content] of Object.entries(sourceFiles)) {
      let m;
      exportRe.lastIndex = 0;
      while ((m = exportRe.exec(content)) !== null) {
        allExports.set(m[1], path);
      }
    }

    for (const [, content] of Object.entries(sourceFiles)) {
      let m;
      importRe.lastIndex = 0;
      while ((m = importRe.exec(content)) !== null) {
        const named = m[1];
        if (named) {
          for (const sym of named.split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim())) {
            if (sym) {
              const arr = allImports.get(sym) || [];
              arr.push(true);
              allImports.set(sym, arr);
            }
          }
        }
      }
    }

    // Flag exported symbols that are never imported
    for (const [sym, file] of allExports.entries()) {
      if (!allImports.has(sym) && sym !== "default") {
        // Heuristic: skip common entry-point names
        if (/^(App|Page|Layout|main|index|default|handler|GET|POST|PUT|DELETE|HEAD|middleware)$/.test(sym)) continue;
        const lineMatch = (sourceFiles[file] || "").split("\n").findIndex((l) => l.includes(`export`) && l.includes(sym));
        items.push({
          id: `dc-rule-${id++}`,
          name: sym,
          type: "Unused Export",
          file,
          line: lineMatch >= 0 ? lineMatch + 1 : null,
          severity: "low",
          confidence: 55,
          reason: `"${sym}" is exported but not imported by any other file in the scanned set.`,
          evidence: [`Exported in: ${file}`],
        });
        if (items.length >= 10) break; // cap at 10 items
      }
    }

    // Flag very large files (>500 lines) as candidates for splitting
    for (const [path, content] of Object.entries(sourceFiles)) {
      const lines = content.split("\n").length;
      if (lines > 500) {
        items.push({
          id: `dc-large-${id++}`,
          name: path.split("/").pop(),
          type: "Orphan File",
          file: path,
          line: null,
          severity: "low",
          confidence: 40,
          reason: `File has ${lines} lines — consider splitting into smaller modules.`,
          evidence: [`${lines} lines detected in ${path}`],
        });
      }
    }

    return items;
  }

  // ─── Test analysis ────────────────────────────────────────────────────────

  _analyzeTests(testFramework, testFiles, sourceFiles, fileTree, language) {
    const testCount = Object.keys(testFiles).length;
    const sourceCount = Object.keys(sourceFiles).length;
    const coverageEst = testCount === 0 ? "0%" : testCount >= sourceCount * 0.5 ? "~60%" : "~25%";
    const coverageColor = testCount === 0 ? "rose" : testCount >= sourceCount * 0.5 ? "emerald" : "amber";

    const testStats = [
      { label: "Test Files", value: String(testCount), color: testCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: coverageEst, color: coverageColor },
      { label: "Framework", value: testFramework, color: "indigo" },
      { label: "Source Files", value: String(sourceCount), color: "indigo" },
    ];

    // What files lack tests?
    const testedPaths = new Set(
      Object.keys(testFiles).map((p) =>
        p.replace(/\.(test|spec)\.(js|ts|jsx|tsx)$/, ".$2").replace(/__tests__\//, "")
      )
    );
    const missingTests = Object.keys(sourceFiles)
      .filter((p) => !testedPaths.has(p) && !p.includes("config") && !p.includes("index"))
      .slice(0, 6)
      .map((p) => p.split("/").pop());

    const testRecommendations = [];
    if (testCount === 0) testRecommendations.push(`No tests found. Set up ${testFramework === "None detected" ? "Jest or Vitest" : testFramework} and add unit tests for core logic.`);
    if (testCount > 0 && testCount < sourceCount * 0.3) testRecommendations.push("Test coverage appears low. Aim for at least 60% coverage.");
    if (!fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"))) {
      testRecommendations.push("No CI configuration detected. Add a GitHub Actions workflow to run tests automatically on push.");
    }

    // Pick a source file to display (prefer the main entry point)
    const priority = ["src/index", "src/app", "index", "app", "main", "src/main"];
    let sampleFile = null;
    for (const p of priority) {
      sampleFile = Object.keys(sourceFiles).find((k) => k.includes(p));
      if (sampleFile) break;
    }
    if (!sampleFile) sampleFile = Object.keys(sourceFiles)[0];
    const sampleSourceCode = sampleFile ? sourceFiles[sampleFile] || "" : "";

    // Generate a test scaffold based on the sample file
    const generatedTestCode = sampleFile
      ? this._generateTestScaffold(sampleFile, sampleSourceCode, testFramework, language)
      : "// No source files available to generate tests for.";

    return { testStats, missingTests, testRecommendations, sampleSourceCode, generatedTestCode };
  }

  // ─── Test scaffold generation ─────────────────────────────────────────────

  _generateTestScaffold(filePath, content, testFramework, language) {
    const fileName = filePath.split("/").pop().replace(/\.(ts|tsx|js|jsx)$/, "");
    const isTs = filePath.endsWith(".ts") || filePath.endsWith(".tsx");

    // Extract exported function names from the file
    const fnRe = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const fns = [];
    let m;
    while ((m = fnRe.exec(content)) !== null) fns.push(m[1]);

    const constRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;
    while ((m = constRe.exec(content)) !== null) {
      if (!fns.includes(m[1])) fns.push(m[1]);
    }

    const importPath = `./${fileName}`;
    const isVitest = testFramework.toLowerCase().includes("vitest");
    const importLine = isVitest
      ? `import { describe, it, expect } from 'vitest';`
      : `// Using ${testFramework || "Jest"}`;

    if (fns.length === 0) {
      return `${importLine}
import * as module from '${importPath}';

describe('${fileName}', () => {
  it('should be importable', () => {
    expect(module).toBeDefined();
  });

  // TODO: Add specific tests for exported functions/classes
});`;
    }

    const testCases = fns.slice(0, 5).map((fn) => `
  describe('${fn}', () => {
    it('should be defined', () => {
      expect(${fn}).toBeDefined();
    });

    it('should handle valid input', () => {
      // TODO: Replace with real arguments for ${fn}
      // const result = ${fn}(/* args */);
      // expect(result).toBeDefined();
    });

    it('should handle edge cases', () => {
      // TODO: Test null, undefined, empty inputs
    });
  });`).join("\n");

    return `${importLine}
import { ${fns.slice(0, 5).join(", ")} } from '${importPath}';

describe('${fileName}', () => {
${testCases}
});`;
  }

  // ─── Action plan ──────────────────────────────────────────────────────────

  _buildActionPlan(criticalIssues, warnings, depOutdated, testFiles, readme, envVars, pkg) {
    const plan = [];

    if (criticalIssues > 0) {
      plan.push({
        priority: "high",
        title: "Resolve security vulnerabilities",
        reason: `${criticalIssues} dependency with known security advisories was found.`,
        recommendation: "Run `npm audit fix` to automatically fix resolvable issues, then manually review any remaining advisories.",
      });
    }

    if (Object.keys(testFiles).length === 0) {
      plan.push({
        priority: "high",
        title: "Add automated tests",
        reason: "No test files were found in the repository.",
        recommendation: "Set up Jest or Vitest and write unit tests for all core business logic. Aim for at least 60% coverage.",
      });
    }

    if (!readme || readme.length < 300) {
      plan.push({
        priority: "medium",
        title: "Improve README documentation",
        reason: "The README is missing or very short.",
        recommendation: "Add a clear description, installation steps, usage examples, and contribution guidelines.",
      });
    }

    if (depOutdated.length > 0) {
      plan.push({
        priority: "medium",
        title: `Update ${depOutdated.length} outdated dependencies`,
        reason: `${depOutdated.map((d) => d.pkg).join(", ")} are behind their latest major versions.`,
        recommendation: "Run `npm outdated` to see all outdated packages. Update incrementally, testing after each major update.",
      });
    }

    if (envVars.length > 0 && !Object.keys(pkg?.devDependencies || {}).some((d) => d.includes("dotenv"))) {
      plan.push({
        priority: "low",
        title: "Document environment variables",
        reason: `${envVars.length} environment variables detected. Ensure they are documented.`,
        recommendation: "Maintain a `.env.example` file with all required variables and their expected format.",
      });
    }

    if (plan.length < 3) {
      plan.push({
        priority: "low",
        title: "Set up continuous integration",
        reason: "Automated CI ensures code quality is maintained as the project grows.",
        recommendation: "Add a GitHub Actions workflow (`/.github/workflows/ci.yml`) that runs lint, typecheck, and tests on every pull request.",
      });
    }

    return plan.slice(0, 5);
  }

  // ─── Overview summary ─────────────────────────────────────────────────────

  _buildSummary(name, metadata, language, framework, pkg, fileTree) {
    const desc = metadata?.description;
    if (desc && desc.length > 30) {
      return `${name} is a ${language} project using ${framework}. ${desc} The repository contains ${fileTree.length} files.`;
    }
    const testCount = fileTree.filter((f) => f.includes(".test.") || f.includes(".spec.")).length;
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    return `${name} is a ${language} application built with ${framework}. ` +
      `It has ${fileTree.length} files${depsCount > 0 ? `, ${depsCount} production dependencies` : ""}` +
      `${testCount > 0 ? `, and ${testCount} test file(s)` : " with no tests detected"}.`;
  }
}
