/**
 * geminiService.js  — SERVER-SIDE ONLY
 *
 * Communicates with Gemini (gemini-2.5-flash) using GEMINI_API_KEY.
 * Never import this file from client components.
 */

import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.8-flash";

/**
 * analyzeRepoWithGemini
 * Sends actual repository content to Gemini and returns structured analysis JSON.
 *
 * @param {object} repositoryData  – sanitised payload built by the API route
 * @returns {object}               – validated structured analysis
 */
export async function analyzeRepoWithGemini(repositoryData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = buildPrompt(repositoryData);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawText = response.text;
  return parseAndValidateResponse(rawText, repositoryData);
}

// ─── Prompt construction ──────────────────────────────────────────────────────

function buildPrompt(repoData) {
  const repoJson = JSON.stringify(repoData, null, 2);

  return `You are an expert software engineer performing a thorough static repository analysis.

Analyze the ACTUAL repository contents provided below.
Do NOT invent files, dependencies, functions, test coverage, or problems that are not supported by the supplied repository data.
If evidence is insufficient for any field, say so explicitly.

Use language like "Potentially unused" rather than "Definitely unused" when you lack full proof.
Never fabricate numerical scores — base them on clear heuristics from the provided data.

Analyze the following aspects:
1. Developer setup (package manager, runtime, env vars, scripts, config files)
2. Dependencies (from package.json / requirements.txt / lock files)
3. Documentation quality (README presence, sections, completeness)
4. Testing (frameworks found, test files, coverage gaps)
5. Potential dead code (unused imports, variables, files, with evidence)

Repository data:
${repoJson}

Return ONLY valid JSON — no markdown fences, no explanation outside the JSON — matching this schema exactly:

{
  "repository": {
    "name": "string",
    "stack": ["string"],
    "framework": "string",
    "language": "string"
  },
  "overview": {
    "summary": "string",
    "healthScore": 0,
    "criticalIssues": 0,
    "warnings": 0
  },
  "readme": {
    "qualityScore": 0,
    "missingSections": ["string"],
    "issues": ["string"],
    "generatedMarkdown": "string"
  },
  "setup": {
    "status": "healthy",
    "issues": ["string"],
    "requiredSteps": [
      { "id": 1, "title": "string", "command": "string", "description": "string" }
    ],
    "environmentVariables": [
      { "key": "string", "example": "string", "required": true }
    ],
    "runtimeRequirements": ["string"],
    "dockerCommand": "string",
    "dockerCompose": "string"
  },
  "testing": {
    "framework": "string",
    "testFilesFound": ["string"],
    "missingTests": ["string"],
    "recommendations": ["string"],
    "sourceCode": "string",
    "generatedTests": "string",
    "stats": [
      { "label": "string", "value": "string", "color": "string" }
    ]
  },
  "deadCode": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "file": "string",
      "line": 0,
      "severity": "high",
      "confidence": 0,
      "reason": "string",
      "evidence": ["string"]
    }
  ],
  "dependencies": {
    "nodes": [
      { "id": "string", "label": "string", "type": "string", "health": "ok" }
    ],
    "alerts": [
      { "pkg": "string", "severity": "CRITICAL", "cve": "string", "desc": "string" }
    ],
    "outdated": [
      { "pkg": "string", "current": "string", "latest": "string", "status": "string" }
    ]
  },
  "actionPlan": [
    {
      "priority": "high",
      "title": "string",
      "reason": "string",
      "recommendation": "string"
    }
  ]
}

For "healthScore", use this heuristic:
- Start at 100
- Subtract 15 per critical issue, 5 per warning
- Minimum 0, maximum 100

For "readme.qualityScore":
- 0–100 based on presence of key sections: title, description, installation, usage, contributing, license

For "deadCode[].type", use one of:
"Unused Variable" | "Unreachable Function" | "Orphan File" | "Unused Import" | "Dead Branch" | "Unused Component" | "Unused Route" | "Unused Function"

For "deadCode[].severity": "high" | "medium" | "low"
For "dependencies.nodes[].health": "ok" | "warning" | "critical"
For "setup.status": "healthy" | "warning" | "critical"
For "actionPlan[].priority": "high" | "medium" | "low"

If package.json is not provided, note that dependencies could not be analyzed.
If no test files are found, generate example tests appropriate for the detected technology.`;
}

// ─── Response parsing & validation ───────────────────────────────────────────

function parseAndValidateResponse(rawText, repoData) {
  let parsed;
  try {
    // Strip accidental markdown fences if present
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  // Apply minimal structural defaults so the frontend never crashes
  const name = repoData.repositoryName || "unknown-repo";
  parsed.repository = parsed.repository || { name, stack: [], framework: "Unknown", language: "Unknown" };
  parsed.overview = parsed.overview || { summary: "Analysis unavailable.", healthScore: 0, criticalIssues: 0, warnings: 0 };
  parsed.readme = parsed.readme || { qualityScore: 0, missingSections: [], issues: [], generatedMarkdown: `# ${name}\n\nNo README generated.` };
  parsed.setup = parsed.setup || { status: "warning", issues: [], requiredSteps: [], environmentVariables: [], runtimeRequirements: [], dockerCommand: "", dockerCompose: "" };
  parsed.testing = parsed.testing || { framework: "Unknown", testFilesFound: [], missingTests: [], recommendations: [], sourceCode: "", generatedTests: "", stats: [] };
  parsed.deadCode = Array.isArray(parsed.deadCode) ? parsed.deadCode : [];
  parsed.dependencies = parsed.dependencies || { nodes: [], alerts: [], outdated: [] };
  parsed.actionPlan = Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [];

  // Ensure readme backward compat field name
  if (parsed.readme.generatedMarkdown && !parsed.readme.markdown) {
    parsed.readme.markdown = parsed.readme.generatedMarkdown;
  }

  // Ensure setup backward compat field names
  if (!parsed.setup.steps) parsed.setup.steps = parsed.setup.requiredSteps || [];
  if (!parsed.setup.envVars) parsed.setup.envVars = parsed.setup.environmentVariables || [];

  // Ensure deadCode items have required fields
  parsed.deadCode = parsed.deadCode.map((item, i) => ({
    id: item.id || `dc-${i}`,
    name: item.name || "Unknown",
    type: item.type || "Unused Variable",
    file: item.file || "unknown",
    line: item.line || null,
    severity: item.severity || "low",
    confidence: item.confidence || 50,
    reason: item.reason || "",
    evidence: item.evidence || [],
  }));

  return parsed;
}
