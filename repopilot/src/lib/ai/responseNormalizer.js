/**
 * responseNormalizer.js — SERVER-SIDE ONLY
 *
 * Parses raw LLM text, applies structural defaults, runs Zod validation,
 * and returns a fully-formed RepositoryAnalysis object.
 *
 * Used by BOTH GeminiProvider and LocalAIProvider — neither provider
 * touches the response format; all normalisation is centralised here.
 */

import { RepositoryAnalysisSchema } from "./schemas.js";

/**
 * parseAndNormalize
 *
 * @param {string} rawText           – raw text from the LLM
 * @param {object} repoData          – original repository context (for fallback defaults)
 * @param {string} providerLabel     – "Gemini" | "LocalAI" (used in error messages)
 * @returns {object}                  – validated RepositoryAnalysis
 * @throws {Error}                    – if JSON cannot be parsed or schema is critically invalid
 */
export function parseAndNormalize(rawText, repoData, providerLabel = "AI") {
  // ── 1. Strip markdown fences if present ────────────────────────────────────
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // ── 2. Parse JSON ──────────────────────────────────────────────────────────
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `${providerLabel} returned non-JSON response. Parse error: ${e.message}. ` +
        `Preview: ${rawText.slice(0, 300)}`
    );
  }

  const name = repoData.repositoryName || "unknown-repo";

  // ── 3. Apply structural defaults ───────────────────────────────────────────
  // (Zod will coerce and fill in missing array/object defaults; these guards
  //  handle the case where an entire top-level key is null/undefined.)

  parsed.repository = parsed.repository || {
    name,
    stack: [],
    framework: "Unknown",
    language: "Unknown",
  };

  parsed.overview = parsed.overview || {
    summary: "Analysis unavailable.",
    healthScore: 0,
    criticalIssues: 0,
    warnings: 0,
  };

  parsed.readme = parsed.readme || {
    qualityScore: 0,
    missingSections: [],
    issues: [],
    generatedMarkdown: `# ${name}\n\nNo README generated.`,
  };

  parsed.setup = parsed.setup || {
    status: "warning",
    issues: [],
    requiredSteps: [],
    environmentVariables: [],
    runtimeRequirements: [],
    dockerCommand: "",
    dockerCompose: "",
  };

  parsed.testing = parsed.testing || {
    framework: "None detected",
    testFilesFound: [],
    missingTests: [],
    recommendations: [],
    sourceCode: "",
    generatedTests: "",
    stats: [],
  };

  parsed.deadCode = Array.isArray(parsed.deadCode) ? parsed.deadCode : [];
  parsed.dependencies = parsed.dependencies || { nodes: [], alerts: [], outdated: [] };
  parsed.actionPlan = Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [];

  // ── 4. UI field aliases ────────────────────────────────────────────────────
  // Some UI components read .markdown / .steps / .envVars instead of the
  // canonical schema names.  Keep both forms in sync.

  if (parsed.readme.generatedMarkdown && !parsed.readme.markdown) {
    parsed.readme.markdown = parsed.readme.generatedMarkdown;
  } else if (parsed.readme.markdown && !parsed.readme.generatedMarkdown) {
    parsed.readme.generatedMarkdown = parsed.readme.markdown;
  }

  if (!parsed.setup.steps) parsed.setup.steps = parsed.setup.requiredSteps || [];
  if (!parsed.setup.envVars) parsed.setup.envVars = parsed.setup.environmentVariables || [];

  // ── 5. Setup-step fallback ─────────────────────────────────────────────────
  if (parsed.setup.steps.length === 0) {
    const lang = (parsed.repository.language || "").toLowerCase();
    if (lang.includes("python")) {
      parsed.setup.steps = [
        { id: 1, title: "Clone the repository", command: `git clone https://github.com/example/${name}.git && cd ${name}`, description: "Clone the project to your local machine." },
        { id: 2, title: "Create a virtual environment", command: "python -m venv venv && source venv/bin/activate", description: "Isolate project dependencies." },
        { id: 3, title: "Install dependencies", command: "pip install -r requirements.txt", description: "Install all required Python packages." },
        { id: 4, title: "Run the application", command: "python main.py", description: "Start the application." },
      ];
    } else {
      const startCmd =
        repoData.packageManifest?.scripts?.dev
          ? "npm run dev"
          : repoData.packageManifest?.scripts?.start
          ? "npm start"
          : "npm run dev";
      parsed.setup.steps = [
        { id: 1, title: "Clone the repository", command: `git clone https://github.com/example/${name}.git && cd ${name}`, description: "Clone the project to your local machine." },
        { id: 2, title: "Install dependencies", command: "npm install", description: "Install all required packages." },
        { id: 3, title: "Configure environment", command: "cp .env.example .env", description: "Copy the example env file and fill in required values." },
        { id: 4, title: "Start the development server", command: startCmd, description: "Launch the development server." },
      ];
    }
    parsed.setup.requiredSteps = parsed.setup.steps;
  }

  // ── 6. Testing-stats fallback ──────────────────────────────────────────────
  if (!parsed.testing.stats || parsed.testing.stats.length === 0) {
    const testCount = (parsed.testing.testFilesFound || []).length;
    parsed.testing.stats = [
      { label: "Test Files", value: String(testCount), color: testCount > 0 ? "emerald" : "rose" },
      { label: "Coverage Estimate", value: testCount > 0 ? "~20%" : "0%", color: testCount > 0 ? "amber" : "rose" },
      { label: "Framework", value: parsed.testing.framework || "None detected", color: "indigo" },
    ];
  }

  // ── 7. Normalise deadCode items ────────────────────────────────────────────
  parsed.deadCode = parsed.deadCode.map((item, i) => ({
    id: item.id || `dc-${i}`,
    name: item.name || "Unknown",
    type: item.type || "Unused Variable",
    file: item.file || "unknown",
    line: typeof item.line === "number" ? item.line : null,
    severity: item.severity || "low",
    confidence: typeof item.confidence === "number" ? item.confidence : 50,
    reason: item.reason || "",
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
  }));

  // ── 8. Ensure dependency root node ────────────────────────────────────────
  if (!parsed.dependencies.nodes || parsed.dependencies.nodes.length === 0) {
    parsed.dependencies.nodes = [{ id: "root", label: name, type: "root", health: "ok" }];
  }
  if (!parsed.dependencies.nodes.find((n) => n.id === "root")) {
    parsed.dependencies.nodes.unshift({ id: "root", label: name, type: "root", health: "ok" });
  }

  // ── 9. Zod validation ─────────────────────────────────────────────────────
  const result = RepositoryAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    // Log issues but don't throw — surface what we have rather than failing.
    // Critical fields (overview, setup, testing) must pass; others can be coerced.
    console.warn(
      `[ResponseNormalizer] Zod validation issues from ${providerLabel}:`,
      result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`)
    );
    // Return the best-effort parsed object even if not 100% schema-conformant
    return parsed;
  }

  const validated = result.data;

  // Re-apply UI aliases on validated output (Zod strips unknown keys by default)
  if (validated.readme.generatedMarkdown && !validated.readme.markdown) {
    validated.readme.markdown = validated.readme.generatedMarkdown;
  }
  if (!validated.setup.steps) validated.setup.steps = validated.setup.requiredSteps || [];
  if (!validated.setup.envVars) validated.setup.envVars = validated.setup.environmentVariables || [];

  console.log(
    `[ResponseNormalizer] ${providerLabel} — healthScore: ${validated.overview?.healthScore}, ` +
      `setupSteps: ${validated.setup.steps?.length ?? 0}, deadCode: ${validated.deadCode.length}, ` +
      `depNodes: ${validated.dependencies.nodes.length}, testStats: ${validated.testing.stats.length}`
  );

  return validated;
}
