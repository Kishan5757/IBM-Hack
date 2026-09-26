/**
 * AIService.js — SERVER-SIDE ONLY
 *
 * Single entry point for all AI analysis in RepoPilot.
 *
 * Fallback strategy — fully automatic, zero user action required:
 *
 *   1. FORCE_LOCAL_AI=true  → skip Gemini, use Rule Engine directly
 *   2. No GEMINI_API_KEY    → skip Gemini, use Rule Engine directly
 *   3. Normal path:
 *        GeminiProvider.analyzeRepository()
 *          on ANY failure → RuleBasedProvider.analyzeRepository()
 *
 * RuleBasedProvider NEVER fails — it runs entirely in Node.js with no
 * external calls, no API keys, and no installs required.
 * It analyzes the actual repository data (package.json, file tree,
 * source files, config files) and produces a complete RepositoryAnalysis.
 *
 * Returns:
 *   { analysis: RepositoryAnalysis, providerMeta: ProviderMeta }
 *
 *   providerMeta = { provider: "gemini"|"local", fallbackUsed: boolean, model: string }
 */

import { GeminiProvider, AIProviderError } from "./GeminiProvider.js";
import { RuleBasedProvider } from "./RuleBasedProvider.js";

// ─── Service ──────────────────────────────────────────────────────────────────

export class AIService {
  constructor() {
    this._gemini = new GeminiProvider();
    this._rules = new RuleBasedProvider();
  }

  /**
   * analyzeRepository
   *
   * @param {import('./schemas.js').RepositoryContext} repositoryContext
   * @returns {Promise<{ analysis: object, providerMeta: object }>}  — never rejects
   */
  async analyzeRepository(repositoryContext) {
    const forceLocal = process.env.FORCE_LOCAL_AI === "true";
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    // ── Fast-path: forced or no Gemini key → rule engine ──────────────────
    if (forceLocal || !hasGeminiKey) {
      if (forceLocal) {
        console.log("[AIService] FORCE_LOCAL_AI=true — using rule engine directly");
      } else {
        console.log("[AIService] No GEMINI_API_KEY — using rule engine fallback");
      }
      return await this._runRuleEngine(repositoryContext, null);
    }

    // ── Primary: try Gemini ────────────────────────────────────────────────
    let geminiError = null;
    try {
      console.log("[AIService] Attempting Gemini (primary)...");
      const analysis = await this._gemini.analyzeRepository(repositoryContext);
      console.log("[AIService] Gemini succeeded");
      return {
        analysis,
        providerMeta: {
          provider: "gemini",
          fallbackUsed: false,
          model: this._gemini.model,
        },
      };
    } catch (err) {
      geminiError = err;
      const code = err instanceof AIProviderError ? err.code : "unknown";
      console.warn(
        `[AIService] Gemini failed (${code}) — activating rule engine: ${err.message}`
      );
    }

    // ── Fallback: rule engine (always succeeds) ────────────────────────────
    return await this._runRuleEngine(repositoryContext, geminiError);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  async _runRuleEngine(repositoryContext, geminiError) {
    console.log("[AIService] Running local rule engine...");
    // RuleBasedProvider never throws — it always produces a valid analysis
    const analysis = await this._rules.analyzeRepository(repositoryContext);
    return {
      analysis,
      providerMeta: {
        provider: "local",
        fallbackUsed: geminiError !== null,
        model: this._rules.model,
      },
    };
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance;
export function getAIService() {
  if (!_instance) _instance = new AIService();
  return _instance;
}

// DualProviderError is no longer used but kept for import compatibility
export class DualProviderError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "DualProviderError";
    this.code = "DUAL_FAILURE";
  }
}
