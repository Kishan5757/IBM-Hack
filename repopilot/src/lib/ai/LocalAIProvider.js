/**
 * LocalAIProvider.js — SERVER-SIDE ONLY
 *
 * Fallback AI provider that calls a locally-hosted Ollama instance
 * (default: http://localhost:11434) using the /api/generate endpoint.
 *
 * Controlled by environment variables:
 *   LOCAL_AI_BASE_URL  (default: http://localhost:11434)
 *   LOCAL_AI_MODEL     (default: llama3.1:8b)
 *
 * The provider sends the EXACT SAME prompt as GeminiProvider and
 * normalises the output through the same responseNormalizer, so the
 * returned RepositoryAnalysis is schema-identical.
 *
 * Context-size note:
 *   llama3.1:8b has a 128k context window but on consumer hardware the
 *   practical limit before slowdowns is ~30–40k tokens (~120–160k chars).
 *   The shared prompt builder already enforces MAX_TOTAL_SIZE=400k chars
 *   across source files at the API route level; we add a LOCAL_MAX_PROMPT
 *   guard here to trim the prompt to a safe size for local models.
 */

import { buildAnalysisPrompt } from "./promptBuilder.js";
import { parseAndNormalize } from "./responseNormalizer.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.1:8b";

/**
 * Maximum prompt size (chars) we will send to the local model.
 * Anything beyond this is likely to exhaust VRAM or produce garbled output.
 * The prompt is trimmed by dropping source file content beyond this budget.
 */
const LOCAL_MAX_PROMPT_CHARS = 120_000;

/** Request timeout for the local model (ms).  Local inference can be slow. */
const LOCAL_TIMEOUT_MS = 300_000; // 5 minutes

// ─── Provider ─────────────────────────────────────────────────────────────────

export class LocalAIProvider {
  constructor() {
    this.baseUrl = (process.env.LOCAL_AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.model = process.env.LOCAL_AI_MODEL || DEFAULT_MODEL;
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<import('./schemas.js').RepositoryAnalysis>}
   * @throws {Error} if Ollama is not reachable or returns garbage
   */
  async analyzeRepository(repositoryContext) {
    // Trim context for local model limits
    const trimmedContext = this._trimContextForLocal(repositoryContext);

    const prompt = buildAnalysisPrompt(trimmedContext);
    const promptSize = prompt.length;

    console.log(
      `[LocalAIProvider] Request — model: ${this.model}, base: ${this.baseUrl}, ` +
        `repo: ${repositoryContext.repositoryName}, prompt: ~${promptSize} chars`
    );

    const rawText = await this._callOllama(prompt);

    if (!rawText || rawText.trim() === "") {
      throw new Error(
        "LocalAI returned an empty response. The model may have run out of memory or context."
      );
    }

    console.log(`[LocalAIProvider] Response received — ${rawText.length} chars`);

    const analysis = parseAndNormalize(rawText, repositoryContext, "LocalAI");
    return analysis;
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  /**
   * Calls Ollama's /api/generate endpoint (non-streaming, raw response).
   * Uses AbortSignal for the timeout rather than a separate setTimeout.
   */
  async _callOllama(prompt) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            // Ask the model for JSON output if it supports system prompts via options
            // (Ollama itself doesn't enforce JSON mode here; the prompt instructs it)
          },
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      const code = err?.code || "";
      if (err?.name === "AbortError") {
        throw new Error(
          `LocalAI request timed out after ${LOCAL_TIMEOUT_MS / 1000}s. ` +
            "The model may be too large for available hardware."
        );
      }
      if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
        throw new Error(
          `Cannot connect to local AI server at ${this.baseUrl}. ` +
            "Is Ollama running? Try: ollama serve"
        );
      }
      throw new Error(`LocalAI network error: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      let errorBody = "";
      try { errorBody = await response.text(); } catch { /* ignore */ }
      throw new Error(
        `LocalAI HTTP ${response.status}: ${errorBody.slice(0, 200)}`
      );
    }

    let json;
    try {
      json = await response.json();
    } catch (e) {
      throw new Error(`LocalAI returned non-JSON HTTP response: ${e.message}`);
    }

    // Ollama /api/generate (non-streaming) returns { response: "..." }
    if (typeof json.response !== "string") {
      throw new Error(
        `Unexpected LocalAI response shape — missing 'response' field. ` +
          `Got: ${JSON.stringify(json).slice(0, 200)}`
      );
    }

    return json.response;
  }

  /**
   * Trim source/config/test file content to fit within LOCAL_MAX_PROMPT_CHARS.
   * We prioritise the structure (file tree, package.json, readme) and drop
   * source file content first since those are the most token-heavy.
   */
  _trimContextForLocal(ctx) {
    // Build a baseline prompt with no source files to check the base size
    const baseCtx = { ...ctx, sourceFiles: {}, configurationFiles: {}, testFiles: {} };
    const basePrompt = buildAnalysisPrompt(baseCtx);
    const budget = LOCAL_MAX_PROMPT_CHARS - basePrompt.length;

    if (budget <= 0) {
      // Even the base prompt is too large — just return with no source
      console.warn(
        "[LocalAIProvider] Base prompt exceeds local context limit. Sending structure-only context."
      );
      return baseCtx;
    }

    // Prioritise: source files > config files > test files
    // (same priority as the main extractor uses)
    const trimmedSource = trimFileMap(ctx.sourceFiles || {}, budget * 0.6);
    const trimmedConfig = trimFileMap(ctx.configurationFiles || {}, budget * 0.25);
    const trimmedTests = trimFileMap(ctx.testFiles || {}, budget * 0.15);

    return {
      ...ctx,
      sourceFiles: trimmedSource,
      configurationFiles: trimmedConfig,
      testFiles: trimmedTests,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trim a { path: content } map so that the total content doesn't exceed
 * `charBudget` characters.  Files are included in entry order (callers
 * should pre-sort by priority before calling this).
 */
function trimFileMap(fileMap, charBudget) {
  const result = {};
  let used = 0;
  for (const [path, content] of Object.entries(fileMap)) {
    if (typeof content !== "string") continue;
    if (used >= charBudget) break;
    const slice = content.slice(0, Math.max(0, charBudget - used));
    result[path] = slice;
    used += slice.length;
  }
  return result;
}
