/**
 * repoExtractor.js  — CLIENT-SIDE utility
 *
 * Reads a repository ZIP archive (File object) and extracts
 * source code, configuration files, test files, etc. into
 * a payload that can be sent to /api/analyze-repository.
 *
 * Uses the browser's native DecompressionStream / zip parsing
 * via a lightweight pure-JS approach (no extra packages).
 * Falls back to filename-only mode when content is unavailable.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const EXCLUDED_DIRS = new Set([
  ".git", "node_modules", ".next", "dist", "build", "coverage",
  "__pycache__", ".mypy_cache", ".pytest_cache", "venv", ".venv",
  "env", ".env", ".tox", "htmlcov", ".DS_Store",
]);

const EXCLUDED_FILES = new Set([
  ".env", ".env.local", ".env.production", ".env.staging",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "Thumbs.db", ".DS_Store",
]);

const SOURCE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".rb", ".go", ".rs", ".java", ".kt",
  ".c", ".cpp", ".cc", ".cxx", ".h", ".hpp", ".cs",
  ".php", ".swift", ".scala", ".clj",
  ".html", ".css", ".scss", ".sass",
  ".lua", ".r", ".sql", ".sh", ".bash",
]);

const CONFIG_EXTENSIONS = new Set([
  ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
  ".env.example", ".env.sample",
  "Dockerfile", "docker-compose.yml", ".dockerignore",
  ".gitignore", "Makefile", "makefile", "CMakeLists.txt", "Procfile",
  "tsconfig.json", "next.config.js", "next.config.ts",
  "vite.config.js", "vite.config.ts", "webpack.config.js",
  "babel.config.js", ".babelrc", "eslint.config.js", ".eslintrc",
  "jest.config.js", "jest.config.ts", "vitest.config.ts",
  "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt",
  "vcpkg.json", "conanfile.txt", "conanfile.py",
]);

const TEST_PATTERNS = [
  /\.(test|spec)\.(js|jsx|ts|tsx)$/i,
  /__tests__\//i,
  /\/tests?\//i,
  /\/specs?\//i,
  /test_.*\.py$/i,
  /_test\.py$/i,
];

const MAX_FILE_CHARS = 40_000;
const MAX_SOURCE_FILES = 30;
const MAX_CONFIG_FILES = 20;
const MAX_TEST_FILES = 10;

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * buildRepositoryPayload
 *
 * @param {string} repoInput  — GitHub URL string or uploaded filename
 * @param {File|null} file    — optional ZIP File object from file input
 * @returns {Promise<object>}  — payload ready for POST /api/analyze-repository
 */
export async function buildRepositoryPayload(repoInput, file) {
  const repositoryName = extractName(repoInput, file);

  // If a ZIP file was provided, try to extract real content
  if (file && file.name.endsWith(".zip")) {
    try {
      return await extractZipPayload(repositoryName, file);
    } catch (e) {
      console.warn("[repoExtractor] ZIP extraction failed, using fallback:", e);
    }
  }

  // GitHub URL → try authenticated API first, then raw fallback
  if (repoInput && (repoInput.includes("github.com") || repoInput.match(/^[\w-]+\/[\w-]+$/))) {
    // Parse the slug upfront so the raw fallback can use it too
    const match = repoInput.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
    const slug = match
      ? match[1].replace(/\.git$/, "")
      : repoInput.replace(/^https?:\/\//, "").replace(/^github\.com\//, "");

    try {
      return await fetchGitHubPayload(repositoryName, repoInput);
    } catch (e) {
      console.warn("[repoExtractor] GitHub API fetch failed:", e.message);
      // Try raw content fallback before giving up
      if (slug && slug.includes("/")) {
        try {
          console.log("[repoExtractor] Trying raw content fallback for:", slug);
          return await fetchRawFallbackPayload(repositoryName, slug);
        } catch (e2) {
          console.warn("[repoExtractor] Raw fallback also failed:", e2.message);
        }
      }
    }

    // Still return something useful — at least keep the slug in metadata
    if (slug && slug.includes("/")) {
      return buildMinimalPayload(repositoryName, slug);
    }
  }

  // Minimal fallback: name only
  return buildMinimalPayload(repositoryName, null);
}

// ─── GitHub API extraction ────────────────────────────────────────────────────

async function fetchGitHubPayload(repoName, input) {
  // Normalise to owner/repo format
  const match = input.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
  const slug = match ? match[1].replace(/\.git$/, "") : input.replace(/^https?:\/\//, "");

  // Use GitHub token if available (avoids 60 req/hr unauthenticated limit)
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
  };

  console.log(`[RepoPilot] Fetching GitHub repo: ${slug}`);

  // Get repo metadata
  const metaResp = await fetch(`https://api.github.com/repos/${slug}`, { headers });
  if (!metaResp.ok) throw new Error(`GitHub API ${metaResp.status}`);
  const meta = await metaResp.json();

  // Get file tree
  const treeResp = await fetch(`https://api.github.com/repos/${slug}/git/trees/HEAD?recursive=1`, { headers });
  const treeData = treeResp.ok ? await treeResp.json() : null;

  const allFiles = (treeData?.tree || [])
    .filter((f) => f.type === "blob")
    .map((f) => f.path);

  const fileTree = allFiles;

  console.log(`[RepoPilot] Files discovered: ${allFiles.length} total`);

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

  console.log(`[RepoPilot] Source files selected: ${sourceFilePaths.length}, config: ${configFilePaths.length}, tests: ${testFilePaths.length}`);

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

async function fetchGitHubFile(slug, path, headers, parseJson = false) {
  try {
    const resp = await fetch(`https://api.github.com/repos/${slug}/contents/${path}`, { headers });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.content) return null;
    const decoded = atob(data.content.replace(/\n/g, "")).slice(0, MAX_FILE_CHARS);
    if (parseJson) {
      try { return JSON.parse(decoded); } catch { return null; }
    }
    return decoded;
  } catch {
    return null;
  }
}

// ─── ZIP extraction ───────────────────────────────────────────────────────────

async function extractZipPayload(repoName, file) {
  // Dynamic import of JSZip — only used if available
  // We attempt to load it from the browser global or via dynamic import
  const JSZip = await loadJSZip();

  const zip = await JSZip.loadAsync(file);
  const entries = Object.keys(zip.files);

  // Detect common root prefix (zip often wraps in a folder)
  const prefix = detectZipPrefix(entries);

  const allPaths = entries
    .filter((p) => !zip.files[p].dir)
    .map((p) => (prefix ? p.slice(prefix.length) : p))
    .filter((p) => p && !isExcludedPath(p));

  // Separate test files first so they don't consume source file slots
  const testFilePaths = allPaths.filter(isTestFile).slice(0, MAX_TEST_FILES);
  const sourceFilePaths = allPaths.filter((p) => isSourceFile(p) && !isTestFile(p)).slice(0, MAX_SOURCE_FILES);
  const configFilePaths = allPaths.filter(isConfigFile).slice(0, MAX_CONFIG_FILES);

  const getContent = async (path) => {
    const zipPath = prefix ? prefix + path : path;
    const entry = zip.files[zipPath] || zip.files[Object.keys(zip.files).find((k) => k.endsWith("/" + path) || k === path)];
    if (!entry) return null;
    try {
      const text = await entry.async("text");
      return text.slice(0, MAX_FILE_CHARS);
    } catch { return null; }
  };

  const pkgRaw = await getContent("package.json");
  let packageManifest = null;
  try { if (pkgRaw) packageManifest = JSON.parse(pkgRaw); } catch { /* ignore */ }

  const readmeContent = await getContent("README.md") || await getContent("readme.md") || await getContent("Readme.md");

  const sourceFiles = {};
  for (const p of sourceFilePaths) {
    const c = await getContent(p);
    if (c) sourceFiles[p] = c;
  }

  const configurationFiles = {};
  for (const p of configFilePaths) {
    if (p === "package.json") continue;
    const c = await getContent(p);
    if (c) configurationFiles[p] = c;
  }

  // Also try alternative manifests if no package.json
  if (!packageManifest) {
    for (const altPath of ["requirements.txt", "pyproject.toml", "go.mod", "Cargo.toml", "pom.xml"]) {
      const c = await getContent(altPath);
      if (c) { configurationFiles[altPath] = c; break; }
    }
  }

  const testFiles = {};
  for (const p of testFilePaths) {
    const c = await getContent(p);
    if (c) testFiles[p] = c;
  }

  // Detect language from file extensions in the zip
  const extCounts = {};
  for (const p of allPaths) {
    const ext = p.split(".").pop()?.toLowerCase();
    if (ext && ext.length <= 6) extCounts[ext] = (extCounts[ext] || 0) + 1;
  }
  const topExt = Object.entries(extCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const extToLang = { js: "JavaScript", ts: "TypeScript", jsx: "JavaScript", tsx: "TypeScript", py: "Python", rb: "Ruby", java: "Java", go: "Go", rs: "Rust", cs: "C#", php: "PHP" };
  const detectedLanguage = extToLang[topExt] || null;

  console.log(`[RepoPilot] ZIP extracted — source: ${Object.keys(sourceFiles).length}, config: ${Object.keys(configurationFiles).length}, tests: ${Object.keys(testFiles).length}, lang: ${detectedLanguage}`);

  return {
    repositoryName: repoName,
    fileTree: allPaths.slice(0, 800),
    packageManifest,
    readme: readmeContent,
    sourceFiles,
    configurationFiles,
    testFiles,
    metadata: {
      language: detectedLanguage,
      description: null,
      githubSlug: null,
      stars: null,
      defaultBranch: null,
    },
  };
}

async function loadJSZip() {
  // Try dynamic import — works if jszip is installed
  try {
    const mod = await import("jszip");
    return mod.default || mod;
  } catch {
    throw new Error("JSZip not available. Install jszip to enable ZIP upload.");
  }
}

function detectZipPrefix(entries) {
  if (entries.length === 0) return "";
  const first = entries[0];
  const slash = first.indexOf("/");
  if (slash < 0) return "";
  const candidate = first.slice(0, slash + 1);
  // Verify all entries share this prefix
  if (entries.every((e) => e.startsWith(candidate))) return candidate;
  return "";
}

// ─── Raw-content fallback (no auth required) ─────────────────────────────────
//
// raw.githubusercontent.com serves file content without authentication.
// We can fetch well-known files (package.json, README.md, requirements.txt …)
// directly even when the GitHub API is rate-limited.

async function fetchRawFallbackPayload(repoName, slug) {
  // Detect the default branch by racing requests to main/master/develop
  const branches = ["main", "master", "develop"];
  let branch = "main";

  const branchProbes = await Promise.all(
    branches.map((b) =>
      fetchRaw(slug, b, "README.md").then((content) => ({ b, content }))
    )
  );
  for (const { b, content } of branchProbes) {
    if (content !== null) { branch = b; break; }
  }

  console.log(`[repoExtractor] Raw fallback — using branch: ${branch}`);

  const rawFetch = (path) => fetchRaw(slug, branch, path);

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

/**
 * Fetch a single file from raw.githubusercontent.com (no auth).
 * Returns the text content or null on any failure.
 */
async function fetchRaw(slug, branch, path) {
  try {
    const url = `https://raw.githubusercontent.com/${slug}/${branch}/${path}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const text = await resp.text();
    // Reject if we got an HTML error page (GitHub 404 pages are HTML)
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) return null;
    return text.slice(0, MAX_FILE_CHARS);
  } catch {
    return null;
  }
}

// ─── Minimal fallback payload ─────────────────────────────────────────────────

function buildMinimalPayload(repoName, slug = null) {
  return {
    repositoryName: repoName,
    fileTree: [],
    packageManifest: null,
    readme: null,
    sourceFiles: {},
    configurationFiles: {},
    testFiles: {},
    // Always preserve slug so rule engine can generate correct URLs/badges
    metadata: slug ? {
      githubSlug: slug,
      language: null,
      description: null,
      stars: null,
      defaultBranch: null,
    } : {},
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractName(input, file) {
  if (input) {
    const match = input.match(/([^/\s]+?)(?:\.git)?(?:\s*$)/);
    return match ? match[1] : input.split("/").pop() || input;
  }
  if (file) {
    return file.name.replace(/\.(zip|tar\.gz|tgz)$/i, "");
  }
  return "unknown-repo";
}

function isExcludedPath(p) {
  const parts = p.split("/");
  if (parts.some((part) => EXCLUDED_DIRS.has(part))) return true;
  if (EXCLUDED_FILES.has(parts[parts.length - 1])) return true;
  if (/\.(env|secret|credentials)(\.|$)/i.test(p)) return true;
  return false;
}

function isSourceFile(p) {
  const ext = "." + p.split(".").pop();
  return SOURCE_EXTENSIONS.has(ext.toLowerCase());
}

function isConfigFile(p) {
  const base = p.split("/").pop();
  // Exact filename match (e.g. "Makefile", "CMakeLists.txt", "vcpkg.json")
  if (CONFIG_EXTENSIONS.has(base)) return true;
  const ext = "." + base.split(".").pop().toLowerCase();
  return [".json", ".yaml", ".yml", ".toml", ".cfg", ".ini"].includes(ext) &&
    !isTestFile(p);
}

function isTestFile(p) {
  return TEST_PATTERNS.some((re) => re.test(p));
}

/**
 * Return source files sorted by priority:
 * 1. Main entry points (index, main, app)
 * 2. src/ files
 * 3. Other source files
 * Mixed with config files at lower priority.
 */
function prioritizeFiles(sourceFiles, configFiles) {
  const score = (p) => {
    const base = p.split("/").pop().toLowerCase();
    if (/^(index|main|app)\.(ts|tsx|js|jsx|py)$/.test(base)) return 0;
    if (p.startsWith("src/") || p.startsWith("app/")) return 1;
    if (p.startsWith("pages/") || p.startsWith("components/")) return 2;
    return 3;
  };
  return [...sourceFiles].sort((a, b) => score(a) - score(b));
}
