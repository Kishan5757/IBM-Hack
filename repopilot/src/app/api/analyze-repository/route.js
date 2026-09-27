/**
 * POST /api/analyze-repository
 *
 * Accepts a repository analysis payload from the browser,
 * sanitises it, runs it through AIService (Gemini primary → Rule Engine fallback),
 * and returns structured analysis JSON plus provider attribution.
 *
 * All LLM credentials (GEMINI_API_KEY) are accessed exclusively server-side.
 * They are NEVER sent to the browser.
 *
 * The Rule Engine fallback is pure Node.js — no API keys, no installs.
 * AIService.analyzeRepository() NEVER throws; it always returns a result.
 *
 * Response shape:
 *   {
 *     analysis:     RepositoryAnalysis,
 *     providerMeta: { provider: "gemini"|"local", fallbackUsed: boolean, model: string },
 *     isDemo:       false
 *   }
 */

import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";

// ─── File/path patterns that must never be forwarded to any LLM ──────────────
const EXCLUDED_PATTERNS = [
  /^\.env/i,
  /^\.git\//,
  /node_modules\//,
  /\.next\//,
  /dist\//,
  /build\//,
  /coverage\//,
  /\.secret/i,
  /private/i,
  /credentials/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.p12$/i,
];

// Binary/media extensions we skip
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".mp4", ".mov", ".mp3", ".wav",
  ".zip", ".tar", ".gz", ".rar",
  ".pdf", ".docx", ".xlsx",
  ".woff", ".woff2", ".ttf", ".eot",
  ".lock",
]);

const MAX_FILE_SIZE = 50_000;    // chars per file
const MAX_TOTAL_SIZE = 400_000;  // total chars across all source files

export async function POST(request) {
  // ── 1. Parse request body ──────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const {
    repositoryName,
    fileTree,
    sourceFiles,
    packageManifest,
    readme,
    configurationFiles,
    testFiles,
    metadata,
  } = body;

  if (!repositoryName && !fileTree && !sourceFiles) {
    return NextResponse.json(
      { error: "No repository data provided.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  // ── 2. Sanitise payload (strip secrets / oversized content) ───────────────
  const sanitisedSource = sanitiseFiles(sourceFiles || {});
  const sanitisedConfig = sanitiseFiles(configurationFiles || {});
  const sanitisedTests  = sanitiseFiles(testFiles || {});
  const lockFileSummary = extractLockSummary(packageManifest);

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

  console.log(`[RepoPilot] Repository: ${repositoryName || "unknown"}`);
  console.log(`[RepoPilot] Files discovered: ${(fileTree || []).length}`);
  console.log(`[RepoPilot] Source files selected: ${Object.keys(sanitisedSource).length}`);
  console.log(`[RepoPilot] Context — pkg: ${!!packageManifest}, readme: ${!!readme}, meta: ${JSON.stringify(sanitisedMetadata)}`);

  /** @type {import('@/lib/ai').RepositoryContext} */
  const repositoryContext = {
    repositoryName:     repositoryName || "unknown-repo",
    fileTree:           (fileTree || []).slice(0, 800),
    packageManifest:    sanitisePkgManifest(packageManifest),
    lockFileSummary,
    readme:             readme ? readme.slice(0, MAX_FILE_SIZE) : null,
    sourceFiles:        sanitisedSource,
    configurationFiles: sanitisedConfig,
    testFiles:          sanitisedTests,
    metadata:           sanitisedMetadata,
  };

  // ── 3. Run AI analysis (Gemini → Rule Engine fallback, never throws) ───────
  console.log("[RepoPilot] Starting AI analysis...");
  const aiService = getAIService();
  // AIService always resolves — rule engine is the guaranteed fallback
  const result = await aiService.analyzeRepository(repositoryContext);

  // ── 4. Return structured analysis + provider attribution ───────────────────
  const { analysis, providerMeta } = result;
  console.log(
    `[RepoPilot] Analysis complete — provider: ${providerMeta.provider}, ` +
      `model: ${providerMeta.model}, fallback: ${providerMeta.fallbackUsed}`
  );

  return NextResponse.json({
    analysis,
    providerMeta,
    isDemo: false,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExcluded(path) {
  return EXCLUDED_PATTERNS.some((re) => re.test(path));
}

function hasBinaryExtension(path) {
  const lower = path.toLowerCase();
  return Array.from(BINARY_EXTENSIONS).some((ext) => lower.endsWith(ext));
}

/**
 * Sanitise a map of { filePath: fileContent } objects.
 * Removes secrets, binaries, and oversized files.
 */
function sanitiseFiles(filesMap) {
  const result = {};
  let totalChars = 0;

  for (const [path, content] of Object.entries(filesMap)) {
    if (isExcluded(path) || hasBinaryExtension(path)) continue;
    if (typeof content !== "string") continue;

    const trimmed = content.slice(0, MAX_FILE_SIZE);
    if (totalChars + trimmed.length > MAX_TOTAL_SIZE) {
      result["[truncated]"] = "Repository too large — remaining files omitted.";
      break;
    }
    result[path] = trimmed;
    totalChars += trimmed.length;
  }
  return result;
}

/** Strip fields from package.json that might contain tokens/urls. */
function sanitisePkgManifest(manifest) {
  if (!manifest || typeof manifest !== "object") return null;
  const safe = {};
  const allowed = [
    "name", "version", "description", "scripts",
    "dependencies", "devDependencies", "peerDependencies",
    "engines", "main", "type", "keywords",
  ];
  for (const key of allowed) {
    if (key in manifest) safe[key] = manifest[key];
  }
  return safe;
}

/** Return a short summary of lock-file data rather than full content. */
function extractLockSummary(manifest) {
  if (!manifest) return null;
  const deps    = Object.keys(manifest.dependencies    || {}).length;
  const devDeps = Object.keys(manifest.devDependencies || {}).length;
  if (deps === 0 && devDeps === 0) return null;
  return `${deps} production dependencies, ${devDeps} devDependencies detected in package.json.`;
}
