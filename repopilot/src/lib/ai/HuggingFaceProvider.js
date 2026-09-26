/**
 * HuggingFaceProvider.js — SERVER-SIDE ONLY
 *
 * Fallback AI provider using the Hugging Face Inference API.
 * Zero user setup required — just a free HF account and API token.
 * No software to install, no local server, works anywhere Next.js runs.
 *
 * Free tier limits (as of 2025):
 *   - Requests: ~1000/day on the free tier
 *   - Models: all public models on serverless inference endpoints
 *   - Context: model-dependent (Qwen2.5-72B: 128k tokens)
 *
 * Controlled by environment variables:
 *   HF_API_TOKEN      — Hugging Face API token (required for fallback)
 *   HF_MODEL          — model to use (default: Qwen/Qwen2.5-72B-Instruct)
 *
 * How to get a free token:
 *   1. Sign up at https://huggingface.co/join (free)
 *   2. Go to https://huggingface.co/settings/tokens
 *   3. Create a token with "Make calls to Inference API" scope
 *   4. Add HF_API_TOKEN=hf_... to your .env.local
 *
 * Models tried in order if a model-specific 503 is returned:
 *   1. Qwen/Qwen2.5-72B-Instruct    (best quality, free tier)
 *   2. meta-llama/Llama-3.1-8B-Instruct  (lighter, widely available)
 *   3. microsoft/Phi-3.5-mini-instruct   (tiny, very fast)
 */

import { buildAnalysisPrompt } from "./promptBuilder.js";
import { parseAndNormalize } from "./responseNormalizer.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const HF_INFERENCE_URL = "https://api-inference.huggingface.co/models";

const MODEL_FALLBACK_CHAIN = [
  "Qwen/Qwen2.5-72B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "microsoft/Phi-3.5-mini-instruct",
];

const REQUEST_TIMEOUT_MS = 180_000; // 3 minutes — HF cold starts can be slow

/**
 * HuggingFace serverless inference has a 4096-token output limit for most
 * models, and a context window that varies by model. We trim the prompt to a
 * safe size so we don't hit the input limit.
 */
const HF_MAX_PROMPT_CHARS = 80_000; // ~20k tokens — safe for all chain models

// ─── Provider ─────────────────────────────────────────────────────────────────

export class HuggingFaceProvider {
  constructor() {
    this.token = process.env.HF_API_TOKEN || null;
    this.preferredModel = process.env.HF_MODEL || MODEL_FALLBACK_CHAIN[0];
    // Build the model chain: preferred first, then the rest
    const others = MODEL_FALLBACK_CHAIN.filter((m) => m !== this.preferredModel);
    this.modelChain = [this.preferredModel, ...others];
    this.model = this.preferredModel; // set after first successful call
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<import('./schemas.js').RepositoryAnalysis>}
   * @throws {Error} if all models in the chain fail
   */
  async analyzeRepository(repositoryContext) {
    if (!this.token) {
      throw new Error(
        "HF_API_TOKEN is not configured. " +
          "Get a free token at https://huggingface.co/settings/tokens and add it to .env.local."
      );
    }

    const trimmedContext = this._trimContext(repositoryContext);
    const prompt = buildAnalysisPrompt(trimmedContext);

    console.log(
      `[HuggingFaceProvider] Request — repo: ${repositoryContext.repositoryName}, ` +
        `prompt: ~${prompt.length} chars`
    );

    let lastError;
    for (const model of this.modelChain) {
      try {
        console.log(`[HuggingFaceProvider] Trying model: ${model}`);
        const rawText = await this._callHuggingFace(model, prompt);

        if (!rawText || rawText.trim() === "") {
          throw new Error(`${model} returned an empty response.`);
        }

        console.log(
          `[HuggingFaceProvider] Response from ${model} — ${rawText.length} chars`
        );

        const analysis = parseAndNormalize(rawText, repositoryContext, `HuggingFace(${model})`);
        // Record the model that actually succeeded
        this.model = model;
        return analysis;
      } catch (err) {
        lastError = err;
        const shouldTryNext = this._isModelUnavailable(err);
        console.warn(
          `[HuggingFaceProvider] ${model} failed: ${err.message}` +
            (shouldTryNext ? " — trying next model in chain" : "")
        );
        if (!shouldTryNext) break; // Hard error, don't try the next model
      }
    }

    throw lastError || new Error("All Hugging Face models in the fallback chain failed.");
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  /**
   * Call the HF Inference API for a given model.
   * Uses the chat completions endpoint for instruction-tuned models.
   */
  async _callHuggingFace(model, prompt) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(
        `${HF_INFERENCE_URL}/${model}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert software engineer. " +
                  "You MUST respond with ONLY valid JSON — no markdown fences, no explanation. " +
                  "Your entire response must be a single JSON object.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 4096,
            temperature: 0.3,
            stream: false,
          }),
          signal: controller.signal,
        }
      );
    } catch (err) {
      clearTimeout(timer);
      if (err?.name === "AbortError") {
        throw new Error(
          `HuggingFace request timed out after ${REQUEST_TIMEOUT_MS / 1000}s for model ${model}.`
        );
      }
      throw new Error(`HuggingFace network error: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      let body = "";
      try { body = await response.text(); } catch { /* ignore */ }
      const err = new Error(
        `HuggingFace HTTP ${response.status} for ${model}: ${body.slice(0, 200)}`
      );
      err.status = response.status;
      err.body = body;
      throw err;
    }

    let json;
    try {
      json = await response.json();
    } catch (e) {
      throw new Error(`HuggingFace returned non-JSON response from ${model}: ${e.message}`);
    }

    // OpenAI-compatible chat completions response
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error(
        `Unexpected response shape from ${model}. ` +
          `Got: ${JSON.stringify(json).slice(0, 200)}`
      );
    }

    return content;
  }

  /**
   * Decide whether to try the next model in the chain.
   * Only skip to next model for availability errors (503, 429 with retry-after,
   * cold start messages), not for auth or hard errors.
   */
  _isModelUnavailable(err) {
    const status = err?.status;
    const body = (err?.body || err?.message || "").toLowerCase();

    // Model loading / cold start / overloaded → try next
    if (status === 503) return true;
    if (status === 429) return true; // rate limited on this model — try another
    if (body.includes("loading") || body.includes("currently loading")) return true;
    if (body.includes("overloaded") || body.includes("too many requests")) return true;
    if (body.includes("model is currently unavailable")) return true;

    return false;
  }

  /**
   * Trim source/config/test file content to fit within HF_MAX_PROMPT_CHARS.
   * Budgets: 55% source, 25% config, 10% test — leaves 10% for structural prompt text.
   */
  _trimContext(ctx) {
    const budget = HF_MAX_PROMPT_CHARS;
    const sourceFiles = trimFileMap(ctx.sourceFiles || {}, budget * 0.55);
    const configurationFiles = trimFileMap(ctx.configurationFiles || {}, budget * 0.25);
    const testFiles = trimFileMap(ctx.testFiles || {}, budget * 0.10);
    return { ...ctx, sourceFiles, configurationFiles, testFiles };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
