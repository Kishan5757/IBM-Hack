/**
 * lib/ai/index.js — SERVER-SIDE ONLY
 *
 * Barrel export for the AI abstraction layer.
 * Import from "@/lib/ai" to access all public API surface.
 */

export { AIService, getAIService, DualProviderError } from "./AIService.js";
export { GeminiProvider, AIProviderError } from "./GeminiProvider.js";
export { RuleBasedProvider } from "./RuleBasedProvider.js";
export { RepositoryAnalysisSchema, RepositoryContextSchema, ProviderMetaSchema } from "./schemas.js";
export { parseAndNormalize } from "./responseNormalizer.js";
export { buildAnalysisPrompt } from "./promptBuilder.js";
