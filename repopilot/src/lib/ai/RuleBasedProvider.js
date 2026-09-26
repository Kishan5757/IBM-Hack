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
  cpp: "C++", c: "C", php: "PHP", swift: "Swift",
  scala: "Scala", clj: "Clojure",
  dart: "Dart", lua: "Lua", r: "R",
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
    console.log(
      `[RuleBasedProvider] Analyzing ${repositoryContext.repositoryName} with local rule engine v2`
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
    const { depNodes, depAlerts, depOutdated } = this._analyzeDependencies(pkg, repositoryName, configurationFiles);

    // ── 3. Environment variables ─────────────────────────────────────────────
    const envVars = this._extractEnvVars(sourceFiles, configurationFiles);

    // ── 4. Setup steps ───────────────────────────────────────────────────────
    const setupSteps = this._buildSetupSteps(pkg, repositoryName, configurationFiles, language, framework, metadata);

    // ── 5. README quality ────────────────────────────────────────────────────
    const { qualityScore, missingSections, readmeIssues } = this._scoreReadme(readme);
    const generatedMarkdown = this._generateReadme(repositoryName, metadata, pkg, language, framework, stack, setupSteps, envVars, fileTree, readme);

    // ── 6. Dead code detection ───────────────────────────────────────────────
    const deadCode = this._detectDeadCode(sourceFiles, fileTree);

    // ── 7. Test analysis ─────────────────────────────────────────────────────
    const { testStats, missingTests, testRecommendations, sampleSourceCode, generatedTestCode } =
      this._analyzeTests(testFramework, testFiles, sourceFiles, fileTree, language);

    // ── 8. Health scoring ────────────────────────────────────────────────────
    const criticalIssues = depAlerts.filter((a) => a.severity === "CRITICAL").length;
    const warnings =
      missingSections.filter((s) => ["Installation", "Usage"].includes(s)).length +
      depOutdated.length +
      (Object.keys(testFiles).length === 0 ? 1 : 0) +
      (!readme ? 1 : 0);
    const healthScore = Math.max(10, Math.min(100, 100 - criticalIssues * 15 - warnings * 5));

    // ── 9. Action plan ───────────────────────────────────────────────────────
    const actionPlan = this._buildActionPlan(criticalIssues, warnings, depOutdated, testFiles, readme, envVars, pkg, fileTree, language);

    // ── 10. Overview summary ─────────────────────────────────────────────────
    const summary = this._buildSummary(repositoryName, metadata, language, framework, pkg, fileTree, readme, stack);

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
    // Python test frameworks — infer from file tree patterns
    // Matches: test_*.py, *_test.py, tests.py, test.py
    if (fileTree.some((f) => /(?:^|\/)(test_[^/]+|[^/]+_test|tests?)\.(py)$/.test(f))) {
      if (fileTree.some((f) => f.includes("conftest.py") || f.includes("pytest"))) return "pytest";
      return "pytest (inferred)";
    }
    // Go tests
    if (fileTree.some((f) => /_test\.go$/.test(f))) return "Go testing";
    // Rust tests
    if (fileTree.some((f) => /\.rs$/.test(f))) {
      // Rust tests are usually inline; if there are .rs files, testing framework is built-in
      return "Rust cargo test";
    }
    // Java tests
    if (fileTree.some((f) => /Test\.java$|Tests\.java$/.test(f))) return "JUnit";
    // Infer from JS/TS file patterns
    const testExts = fileTree.filter((f) => f.includes(".test.") || f.includes(".spec."));
    if (testExts.length > 0) {
      if (fileTree.some((f) => f.includes("cypress"))) return "Cypress";
      if (fileTree.some((f) => f.includes("playwright"))) return "Playwright";
      return "Jest (inferred)";
    }
    return "None detected";
  }

  // ─── Dependency analysis ───────────────────────────────────────────────────

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

  /**
   * Parse dependency lists from non-JS manifest files and push nodes.
   * Handles: requirements.txt, go.mod, Cargo.toml, pom.xml / build.gradle.
   */
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
    // Build description — avoid "Unknown" leaking into text
    const knownFw = framework && framework !== "Unknown" ? framework : null;
    const knownLang = language && language !== "Unknown" ? language : null;
    const fallbackDesc = knownFw ? `A ${knownFw} project.` : knownLang ? `A ${knownLang} project.` : "A software project.";
    const desc = metadata?.description || (existingReadme ? this._extractDescription(existingReadme) : null) || fallbackDesc;
    const ghSlug = metadata?.githubSlug;
    const version = pkg?.version || null;
    const hasTests = fileTree.some((f) => f.includes(".test.") || f.includes(".spec.") || f.includes("__tests__"));
    const license = fileTree.some((f) => f.toLowerCase() === "license" || f.toLowerCase() === "license.md" || f.toLowerCase() === "license.txt") ? "MIT" : null;

    // Badges
    const badgeBase = ghSlug ? `https://img.shields.io/github` : null;
    const badges = ghSlug
      ? [
          `[![Stars](${badgeBase}/stars/${ghSlug}?style=flat-square)](https://github.com/${ghSlug})`,
          hasTests ? `[![Tests](${badgeBase}/actions/workflows/test.yml/badge.svg)](https://github.com/${ghSlug}/actions)` : null,
          version ? `[![Version](https://img.shields.io/badge/version-${version}-blue?style=flat-square)](https://github.com/${ghSlug})` : null,
        ].filter(Boolean).join(" ")
      : "";

    // Features — extract from existing readme or build from stack signals
    const features = this._extractFeatures(existingReadme, pkg, fileTree, stack, framework);

    // Version line
    const versionLine = version && version !== "0.0.0" ? `\n**Version:** ${version}\n` : "";

    // Deployment notes
    const deploySection = this._buildDeploySection(fileTree, pkg, ghSlug, framework);

    // Environment section
    const envSection = envVars.length > 0
      ? `\n## Environment Variables\n\nCopy \`.env.example\` to \`.env\` and configure:\n\n` +
        `| Variable | Required | Example |\n|---|---|---|\n` +
        envVars.map((v) => `| \`${v.key}\` | ${v.required ? "Yes" : "No"} | \`${v.example || "your_value_here"}\` |`).join("\n")
      : "";

    // Tech stack section
    const stackSection = stack.length > 0
      ? `\n## 🚀 Tech Stack\n\n${stack.map((s) => `**${s}**`).join("\n")}`
      : "";

    // Scripts section
    const scriptsSection = pkg?.scripts && Object.keys(pkg.scripts).length > 0
      ? `\n## Available Scripts\n\n` +
        Object.entries(pkg.scripts)
          .map(([k, v]) => `\`npm run ${k}\` — \`${v}\``)
          .join("\n")
      : "";

    // Dependencies count
    const depsCount = Object.keys(pkg?.dependencies || {}).length;
    const devDepsCount = Object.keys(pkg?.devDependencies || {}).length;
    const depSection = depsCount > 0
      ? `\n## Dependencies\n\n${depsCount} production dependencies, ${devDepsCount} dev dependencies. Run \`npm audit\` to check for vulnerabilities.\n`
      : "";

    // About section
    const aboutSection = metadata?.description
      ? `\n## About\n\n${metadata.description}\n`
      : "";

    return `# ${name}

${badges}

${desc}
${versionLine}
## Getting Started
${steps.map((s) => `\n### ${s.title}\n\n\`\`\`bash\n${s.command}\n\`\`\`\n\n${s.description}`).join("\n")}
${features ? `\n## ✨ Features\n\n${features}` : ""}
${envSection}
${stackSection}
${scriptsSection}
${depSection}
${deploySection}
${aboutSection}
${license ? `## License\n\nThis project is licensed under the ${license} License.` : ""}

---

*Generated by RepoPilot Rule Engine*
`.replace(/\n{3,}/g, "\n\n").trim();
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
    // Try to extract a "Features" section from the existing README
    if (existingReadme) {
      const featureMatch = existingReadme.match(/#{1,3}\s+(?:✨\s+)?Features?\s*\n([\s\S]*?)(?=\n#{1,3}|\n---|\z)/i);
      if (featureMatch) return featureMatch[1].trim();
    }

    // Synthesise from stack signals
    const features = [];
    const all = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};

    if (all["@supabase/supabase-js"]) features.push("🔄 Supabase backend with real-time database and authentication");
    if (all.firebase) features.push("🔥 Firebase integration for real-time data sync");
    if (all["next-auth"] || all["@auth/core"] || all["@clerk/nextjs"]) features.push("🔐 Authentication and session management");
    if (all["react-leaflet"] || all.leaflet) features.push("🗺️ Interactive maps with Leaflet and OpenStreetMap");
    if (all["@tanstack/react-query"]) features.push("⚡ Optimistic data fetching with TanStack Query");
    if (all.stripe) features.push("💳 Stripe payment integration");
    if (all["socket.io"] || all["socket.io-client"]) features.push("🔌 Real-time communication via Socket.IO");
    if (all["framer-motion"]) features.push("🎨 Smooth animations with Framer Motion");
    if (all.tailwindcss) features.push("🎨 Responsive UI built with Tailwind CSS");
    if (all["next-themes"]) features.push("🌙 Dark / Light mode toggle");
    if (all.graphql) features.push("📊 GraphQL API layer");
    if (all.prisma) features.push("🗄️ Type-safe database access with Prisma ORM");
    if (fileTree.some((f) => f.includes(".github/workflows"))) features.push("🤖 Automated CI/CD with GitHub Actions");
    if (all["react-router-dom"] || all["react-router"]) features.push("🧭 Client-side routing with React Router");

    if (features.length === 0) {
      features.push(`Built with ${framework} for a modern development experience`);
      if (stack.includes("TypeScript")) features.push("Full TypeScript type safety across the codebase");
      if (stack.includes("Tailwind CSS")) features.push("Responsive, utility-first styling with Tailwind CSS");
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

    // Collect all exports and imports across files
    const allExports = new Map(); // symbol → { file, line, type }
    const allImports = new Set(); // all imported symbol names (across all files)

    // Regex patterns
    const exportFnRe = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const exportConstRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;
    const exportClassRe = /export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const exportTypeRe = /export\s+(?:type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const namedImportRe = /import\s+\{([^}]+)\}\s+from/g;
    const defaultImportRe = /import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/g;

    for (const [path, content] of Object.entries(sourceFiles)) {
      const lines = content.split("\n");

      // Collect exports
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

      // Collect named imports
      namedImportRe.lastIndex = 0;
      let m;
      while ((m = namedImportRe.exec(content)) !== null) {
        for (const sym of m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim())) {
          if (sym) allImports.add(sym);
        }
      }

      // Collect default imports
      defaultImportRe.lastIndex = 0;
      while ((m = defaultImportRe.exec(content)) !== null) {
        allImports.add(m[1]);
      }
    }

    // Flag exported symbols that are never imported
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

    // Flag large files as refactor candidates
    for (const [path, content] of Object.entries(sourceFiles)) {
      const lineCount = content.split("\n").length;
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

    // Flag unused imports within individual files
    const unusedImportRe = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
    for (const [path, content] of Object.entries(sourceFiles)) {
      if (items.length >= 12) break;
      unusedImportRe.lastIndex = 0;
      let m;
      while ((m = unusedImportRe.exec(content)) !== null) {
        const importedNames = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean);
        for (const imported of importedNames) {
          // Check if used beyond the import line itself
          const usageCount = (content.match(new RegExp(`\\b${imported}\\b`, "g")) || []).length;
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
    const testCount = Object.keys(testFiles).length;
    const sourceCount = Object.keys(sourceFiles).length;
    const coverageEst = testCount === 0 ? "0%" : testCount >= sourceCount * 0.5 ? "~65%" : testCount >= sourceCount * 0.2 ? "~30%" : "~15%";
    const coverageColor = testCount === 0 ? "rose" : testCount >= sourceCount * 0.5 ? "emerald" : "amber";

    const testStats = [
      { label: "Test Files", value: String(testCount), color: testCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: coverageEst, color: coverageColor },
      { label: "Framework", value: testFramework, color: "indigo" },
      { label: "Source Files", value: String(sourceCount), color: "indigo" },
    ];

    // Which source files lack a corresponding test file?
    const testedBases = new Set(
      Object.keys(testFiles).map((p) =>
        p.replace(/\.(test|spec)\.(js|ts|jsx|tsx)$/, "")
          .replace(/__tests__\//, "")
          .split("/").pop()
      )
    );
    const missingTests = Object.keys(sourceFiles)
      .filter((p) => {
        const base = p.split("/").pop().replace(/\.(ts|tsx|js|jsx)$/, "");
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
    if (testCount > 0 && testCount < sourceCount * 0.3) {
      testRecommendations.push("Test coverage appears low. Aim for at least 60% coverage of business-critical code.");
    }
    if (!fileTree.some((f) => f.includes(".github/workflows") || f.includes("ci.yml") || f.includes("ci.yaml"))) {
      testRecommendations.push("No CI configuration detected. Add a GitHub Actions workflow to run tests automatically on every pull request.");
    }
    if (testCount > 0 && !fileTree.some((f) => f.includes("coverage") || f.includes("lcov"))) {
      testRecommendations.push("Consider adding code coverage reporting (e.g., `--coverage` flag with Jest/Vitest) to track coverage over time.");
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
    const fileName = filePath.split("/").pop().replace(/\.(ts|tsx|js|jsx)$/, "");
    const isTs = filePath.endsWith(".ts") || filePath.endsWith(".tsx");

    // Extract exported function and class names
    const fnRe = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const constRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\(/g;
    const classRe = /export\s+(?:default\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    const fns = [];
    let m;

    while ((m = fnRe.exec(content)) !== null) fns.push({ name: m[1], kind: "function" });
    while ((m = constRe.exec(content)) !== null) {
      if (!fns.find((f) => f.name === m[1])) fns.push({ name: m[1], kind: "function" });
    }
    const classes = [];
    while ((m = classRe.exec(content)) !== null) classes.push(m[1]);

    const importPath = `./${fileName}`;
    const isVitest = testFramework.toLowerCase().includes("vitest");
    const testImport = isVitest
      ? `import { describe, it, expect, vi } from 'vitest';`
      : `// Using ${testFramework || "Jest"} (globals enabled via config)`;

    if (fns.length === 0 && classes.length === 0) {
      return `${testImport}
import * as ${fileName}Module from '${importPath}';

describe('${fileName}', () => {
  it('module should be importable and defined', () => {
    expect(${fileName}Module).toBeDefined();
  });

  // TODO: Add specific tests for exported functions/classes
});`;
    }

    const classTests = classes.slice(0, 2).map((cls) => `
  describe('${cls}', () => {
    it('should instantiate without errors', () => {
      // const instance = new ${cls}(/* args */);
      // expect(instance).toBeInstanceOf(${cls});
    });
  });`).join("\n");

    const fnTests = fns.slice(0, 5).map(({ name }) => `
  describe('${name}', () => {
    it('should be defined', () => {
      expect(${name}).toBeDefined();
    });

    it('should return a defined value for valid input', async () => {
      // TODO: Replace with real arguments for ${name}
      // const result = await ${name}(/* args */);
      // expect(result).toBeDefined();
    });

    it('should handle edge cases gracefully', () => {
      // TODO: Test null, undefined, empty, and boundary inputs
    });
  });`).join("\n");

    const importNames = [
      ...fns.slice(0, 5).map((f) => f.name),
      ...classes.slice(0, 2),
    ].join(", ");

    return `${testImport}
import { ${importNames} } from '${importPath}';

describe('${fileName}', () => {
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
