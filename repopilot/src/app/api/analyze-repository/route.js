/**
 * POST /api/analyze-repository
 *
 * Accepts a repository analysis payload from the browser,
 * sanitises it, calls Gemini (server-side), and returns
 * structured analysis JSON.
 *
 * The GEMINI_API_KEY env var is accessed exclusively here.
 * It is NEVER sent to or exposed in the browser.
 */

import { NextResponse } from "next/server";
import { analyzeRepoWithGemini } from "@/lib/geminiService";

// ─── File/path patterns that must never be forwarded to Gemini ─────────────
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
  ".lock",  // lock files are often massive; we summarise below
]);

const MAX_FILE_SIZE = 50_000;   // chars per file
const MAX_TOTAL_SIZE = 400_000; // total chars across all source files

export async function POST(request) {
  // ── 1. Check API key is configured ────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error: "AI analysis is not configured. Running RepoPilot in demo mode.",
        code: "NO_API_KEY",
      },
      { status: 503 }
    );
  }

  // ── 2. Parse request body ──────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body.", code: "BAD_REQUEST" }, { status: 400 });
  }

  const { repositoryName, fileTree, sourceFiles, packageManifest, readme, configurationFiles, testFiles } = body;

  if (!repositoryName && !fileTree && !sourceFiles) {
    return NextResponse.json({ error: "No repository data provided.", code: "BAD_REQUEST" }, { status: 400 });
  }

  // ── 3. Sanitise payload (strip secrets / oversized content) ───────────────
  const sanitisedSource = sanitiseFiles(sourceFiles || {});
  const sanitisedConfig = sanitiseFiles(configurationFiles || {});
  const sanitisedTests = sanitiseFiles(testFiles || {});

  // Summarise lock files instead of sending raw content
  const lockFileSummary = extractLockSummary(packageManifest);

  const repositoryPayload = {
    repositoryName: repositoryName || "unknown-repo",
    fileTree: (fileTree || []).slice(0, 800),  // cap list length
    packageManifest: sanitisePkgManifest(packageManifest),
    lockFileSummary,
    readme: readme ? readme.slice(0, MAX_FILE_SIZE) : null,
    sourceFiles: sanitisedSource,
    configurationFiles: sanitisedConfig,
    testFiles: sanitisedTests,
  };

  // ── 4. Call Gemini ─────────────────────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyzeRepoWithGemini(repositoryPayload);
  } catch (err) {
    console.error("[analyze-repository] Gemini error:", err);

    const message = err?.message || "Unknown Gemini error";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: message, code: "NO_API_KEY" }, { status: 503 });
    }
    if (message.toLowerCase().includes("quota") || message.includes("429")) {
      return NextResponse.json({ error: "Gemini rate limit reached. Please try again in a moment.", code: "RATE_LIMIT" }, { status: 429 });
    }
    if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("deadline")) {
      return NextResponse.json({ error: "Analysis timed out. The repository may be too large. Try with a smaller subset.", code: "TIMEOUT" }, { status: 504 });
    }

    return NextResponse.json(
      { error: `Gemini analysis failed: ${message}`, code: "GEMINI_ERROR" },
      { status: 502 }
    );
  }

  // ── 5. Return structured analysis ─────────────────────────────────────────
  return NextResponse.json({ analysis, isDemo: false });
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
 * Trims individual files to MAX_FILE_SIZE chars.
 * Caps total to MAX_TOTAL_SIZE chars.
 */
function sanitiseFiles(filesMap) {
  const result = {};
  let totalChars = 0;

  for (const [path, content] of Object.entries(filesMap)) {
    if (isExcluded(path) || hasBinaryExtension(path)) continue;
    if (typeof content !== "string") continue;

    const trimmed = content.slice(0, MAX_FILE_SIZE);
    if (totalChars + trimmed.length > MAX_TOTAL_SIZE) {
      // Include a note that we hit the limit
      result["[truncated]"] = "Repository too large — remaining files omitted.";
      break;
    }
    result[path] = trimmed;
    totalChars += trimmed.length;
  }
  return result;
}

/**
 * Strip fields from package.json that might contain tokens/urls
 * and return a safe subset.
 */
function sanitisePkgManifest(manifest) {
  if (!manifest || typeof manifest !== "object") return null;
  const safe = {};
  const allowed = ["name", "version", "description", "scripts", "dependencies", "devDependencies", "peerDependencies", "engines", "main", "type", "keywords"];
  for (const key of allowed) {
    if (key in manifest) safe[key] = manifest[key];
  }
  return safe;
}

/** Return a short summary of lock-file data rather than the full content. */
function extractLockSummary(manifest) {
  if (!manifest) return null;
  const deps = Object.keys(manifest.dependencies || {}).length;
  const devDeps = Object.keys(manifest.devDependencies || {}).length;
  if (deps === 0 && devDeps === 0) return null;
  return `${deps} production dependencies, ${devDeps} devDependencies detected in package.json.`;
}
