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
  ".c", ".cpp", ".h", ".hpp", ".cs",
  ".php", ".swift", ".scala", ".clj",
]);

const CONFIG_EXTENSIONS = new Set([
  ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
  ".env.example", ".env.sample",
  "Dockerfile", "docker-compose.yml", ".dockerignore",
  ".gitignore", "Makefile", "Procfile",
  "tsconfig.json", "next.config.js", "next.config.ts",
  "vite.config.js", "vite.config.ts", "webpack.config.js",
  "babel.config.js", ".babelrc", "eslint.config.js", ".eslintrc",
  "jest.config.js", "jest.config.ts", "vitest.config.ts",
  "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt",
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

  // GitHub URL → try public GitHub API to get some real data
  if (repoInput && (repoInput.includes("github.com") || repoInput.match(/^[\w-]+\/[\w-]+$/))) {
    try {
      return await fetchGitHubPayload(repositoryName, repoInput);
    } catch (e) {
      console.warn("[repoExtractor] GitHub API fetch failed, using minimal payload:", e);
    }
  }

  // Minimal fallback: name only
  return buildMinimalPayload(repositoryName);
}

// ─── GitHub API extraction ────────────────────────────────────────────────────

async function fetchGitHubPayload(repoName, input) {
  // Normalise to owner/repo format
  const match = input.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
  const slug = match ? match[1].replace(/\.git$/, "") : input.replace(/^https?:\/\//, "");

  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };

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

  // Fetch key file contents
  const packageManifest = await fetchGitHubFile(slug, "package.json", headers, true);
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

  // Fetch test files
  const testFiles = {};
  for (const p of testFilePaths) {
    const content = await fetchGitHubFile(slug, p, headers);
    if (content) testFiles[p] = content;
  }

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

  const sourceFilePaths = allPaths.filter(isSourceFile).slice(0, MAX_SOURCE_FILES);
  const configFilePaths = allPaths.filter(isConfigFile).slice(0, MAX_CONFIG_FILES);
  const testFilePaths = allPaths.filter(isTestFile).slice(0, MAX_TEST_FILES);

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

  const readmeContent = await getContent("README.md") || await getContent("readme.md");

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

  const testFiles = {};
  for (const p of testFilePaths) {
    const c = await getContent(p);
    if (c) testFiles[p] = c;
  }

  return {
    repositoryName: repoName,
    fileTree: allPaths.slice(0, 800),
    packageManifest,
    readme: readmeContent,
    sourceFiles,
    configurationFiles,
    testFiles,
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

// ─── Minimal fallback payload ─────────────────────────────────────────────────

function buildMinimalPayload(repoName) {
  return {
    repositoryName: repoName,
    fileTree: [],
    packageManifest: null,
    readme: null,
    sourceFiles: {},
    configurationFiles: {},
    testFiles: {},
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
  if (CONFIG_EXTENSIONS.has(base)) return true;
  const ext = "." + base.split(".").pop();
  return [".json", ".yaml", ".yml", ".toml", ".cfg", ".ini"].includes(ext.toLowerCase()) &&
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
