/**
 * GeminiProvider.js — SERVER-SIDE ONLY
 *
 * Primary AI provider.  Calls Gemini via @google/genai.
 *
 * Error handling strategy:
 *   - HTTP 429 / quota messages  → throw AIProviderError(QUOTA_EXCEEDED) — immediate fallback
 *   - HTTP 401 / 403             → throw AIProviderError(AUTH_ERROR)      — immediate fallback
 *   - HTTP 408 / 5xx / network   → retry up to MAX_RETRIES with exponential backoff, then throw TRANSIENT
 *   - JSON parse failure         → throw AIProviderError(PARSE_ERROR)     — immediate fallback
 *   - Empty response             → throw AIProviderError(EMPTY_RESPONSE)  — immediate fallback
 */

import { GoogleGenAI } from "@google/genai";
import { buildAnalysisPrompt } from "./promptBuilder.js";
import { parseAndNormalize } from "./responseNormalizer.js";
import {
  IMMEDIATE_FALLBACK_CODES,
  RETRYABLE_CODES,
  RETRYABLE_NETWORK_ERRORS,
} from "./schemas.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 2;           // up to 2 retries for transient errors
const BACKOFF_BASE_MS = 1_500;   // 1.5 s → 3 s → 6 s

// ─── Error types ──────────────────────────────────────────────────────────────

export class AIProviderError extends Error {
  /**
   * @param {string} message
   * @param {'QUOTA_EXCEEDED'|'AUTH_ERROR'|'PARSE_ERROR'|'EMPTY_RESPONSE'|'TRANSIENT'|'TIMEOUT'} code
   * @param {boolean} immediatelyFallback  – if true, AIService should NOT retry; fall back now
   */
  constructor(message, code, immediatelyFallback = false) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.immediatelyFallback = immediatelyFallback;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class GeminiProvider {
  constructor() {
    this.model = GEMINI_MODEL;
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<import('./schemas.js').RepositoryAnalysis>}
   * @throws {AIProviderError}
   */
  async analyzeRepository(repositoryContext) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        "GEMINI_API_KEY is not configured on the server.",
        "AUTH_ERROR",
        true  // immediate fallback — no key, no point retrying
      );
    }

    const prompt = buildAnalysisPrompt(repositoryContext);
    console.log(
      `[GeminiProvider] Request — model: ${this.model}, repo: ${repositoryContext.repositoryName}, ` +
        `prompt size: ~${prompt.length} chars`
    );

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
        console.log(`[GeminiProvider] Retry ${attempt}/${MAX_RETRIES} — waiting ${delay}ms`);
        await sleep(delay);
      }

      try {
        const rawText = await this._callGemini(apiKey, prompt);

        // Empty response
        if (!rawText || rawText.trim() === "") {
          throw new AIProviderError(
            "Gemini returned an empty response. The model may have refused or truncated the output.",
            "EMPTY_RESPONSE",
            true  // don't retry — the model itself refused
          );
        }

        console.log(
          `[GeminiProvider] Response received — ${rawText.length} chars`
        );

        const analysis = parseAndNormalize(rawText, repositoryContext, "Gemini");
        return analysis;

      } catch (err) {
        lastError = this._classifyError(err);

        // If immediate fallback is required, stop all retry loops
        if (lastError.immediatelyFallback) {
          throw lastError;
        }

        // If we've exhausted retries, propagate the transient error
        if (attempt === MAX_RETRIES) {
          console.error(
            `[GeminiProvider] Failed after ${MAX_RETRIES} retries — ${lastError.message}`
          );
          throw lastError;
        }

        console.warn(
          `[GeminiProvider] Transient error on attempt ${attempt}: ${lastError.message} — will retry`
        );
      }
    }

    throw lastError;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Low-level Gemini call.  Returns raw response text.
   */
  async _callGemini(apiKey, prompt) {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    return response.text;
  }

  /**
   * Map any thrown error to an AIProviderError with the right code and
   * immediatelyFallback flag.
   */
  _classifyError(err) {
    // Already classified
    if (err instanceof AIProviderError) return err;

    const message = err?.message || String(err);
    const lower = message.toLowerCase();

    // Quota / rate limit
    if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("429") || (err?.status === 429)) {
      return new AIProviderError(
        `Gemini quota exceeded: ${message}`,
        "QUOTA_EXCEEDED",
        true  // immediate fallback — quota won't clear on a quick retry
      );
    }

    // Auth errors
    if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("forbidden") ||
        err?.status === 401 || err?.status === 403) {
      return new AIProviderError(
        `Gemini auth error: ${message}`,
        "AUTH_ERROR",
        true
      );
    }

    // HTTP status errors
    if (err?.status) {
      const status = Number(err.status);
      if (IMMEDIATE_FALLBACK_CODES.has(status)) {
        return new AIProviderError(
          `Gemini HTTP ${status}: ${message}`,
          "QUOTA_EXCEEDED",
          true
        );
      }
      if (RETRYABLE_CODES.has(status)) {
        return new AIProviderError(
          `Gemini HTTP ${status} (transient): ${message}`,
          "TRANSIENT",
          false  // worth retrying
        );
      }
      // 400 — bad request
      if (status === 400) {
        return new AIProviderError(
          `Gemini bad request (400): ${message}`,
          "AUTH_ERROR",
          true
        );
      }
    }

    // Network-level errors
    const networkCode = err?.code;
    if (networkCode && RETRYABLE_NETWORK_ERRORS.has(networkCode)) {
      return new AIProviderError(
        `Gemini network error (${networkCode}): ${message}`,
        "TRANSIENT",
        false
      );
    }

    // Timeout
    if (lower.includes("timeout") || lower.includes("deadline") || lower.includes("timed out") ||
        err?.name === "TimeoutError" || err?.code === "ETIMEDOUT") {
      return new AIProviderError(
        `Gemini timeout: ${message}`,
        "TIMEOUT",
        false  // transient — worth one retry
      );
    }

    // JSON parse error
    if (lower.includes("non-json") || lower.includes("json parse") || lower.includes("parse error")) {
      return new AIProviderError(
        `Gemini response parse failure: ${message}`,
        "PARSE_ERROR",
        true  // model gave garbled output; local may do better
      );
    }

    // Generic / unknown — treat as transient
    return new AIProviderError(
      `Gemini error: ${message}`,
      "TRANSIENT",
      false
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
