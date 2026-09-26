/**
 * schemas.js — SERVER-SIDE ONLY
 *
 * Zod schemas for:
 *   - RepositoryContext  (input to any AI provider)
 *   - RepositoryAnalysis (output from any AI provider)
 *   - ProviderMeta       (provider attribution metadata)
 *
 * Both GeminiProvider and LocalAIProvider MUST validate their
 * responses through RepositoryAnalysisSchema before returning.
 */

import { z } from "zod";

// ─── Input ────────────────────────────────────────────────────────────────────

export const RepositoryContextSchema = z.object({
  repositoryName: z.string(),
  fileTree: z.array(z.string()).default([]),
  packageManifest: z.record(z.unknown()).nullable().default(null),
  lockFileSummary: z.string().nullable().default(null),
  readme: z.string().nullable().default(null),
  sourceFiles: z.record(z.string()).default({}),
  configurationFiles: z.record(z.string()).default({}),
  testFiles: z.record(z.string()).default({}),
  metadata: z
    .object({
      githubSlug: z.string().optional(),
      language: z.string().optional(),
      description: z.string().optional(),
      stars: z.number().optional(),
      defaultBranch: z.string().optional(),
    })
    .default({}),
});

// ─── Output ───────────────────────────────────────────────────────────────────

const SetupStepSchema = z.object({
  id: z.number(),
  title: z.string(),
  command: z.string(),
  description: z.string(),
});

const EnvVarSchema = z.object({
  key: z.string(),
  example: z.string().optional().default(""),
  required: z.boolean().optional().default(true),
});

const TestStatSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
});

const DeadCodeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  file: z.string(),
  line: z.number().nullable().optional(),
  severity: z.enum(["high", "medium", "low"]),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
  evidence: z.array(z.string()).default([]),
});

const DepNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["root", "dep", "devDep"]),
  health: z.enum(["ok", "warning", "critical"]),
});

const DepAlertSchema = z.object({
  pkg: z.string(),
  severity: z.enum(["CRITICAL", "MEDIUM", "LOW"]),
  cve: z.string().optional().default(""),
  desc: z.string(),
});

const DepOutdatedSchema = z.object({
  pkg: z.string(),
  current: z.string(),
  latest: z.string(),
  status: z.enum(["outdated", "minor", "patch"]),
});

const ActionPlanItemSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  reason: z.string(),
  recommendation: z.string(),
});

export const RepositoryAnalysisSchema = z.object({
  repository: z.object({
    name: z.string(),
    stack: z.array(z.string()).default([]),
    framework: z.string(),
    language: z.string(),
  }),
  overview: z.object({
    summary: z.string(),
    healthScore: z.number().min(0).max(100),
    criticalIssues: z.number().min(0),
    warnings: z.number().min(0),
  }),
  readme: z.object({
    qualityScore: z.number().min(0).max(100),
    missingSections: z.array(z.string()).default([]),
    issues: z.array(z.string()).default([]),
    generatedMarkdown: z.string(),
    // convenience alias kept for UI compatibility
    markdown: z.string().optional(),
  }),
  setup: z.object({
    status: z.string(),
    issues: z.array(z.string()).default([]),
    requiredSteps: z.array(SetupStepSchema).default([]),
    environmentVariables: z.array(EnvVarSchema).default([]),
    runtimeRequirements: z.array(z.string()).default([]),
    dockerCommand: z.string().optional().default(""),
    dockerCompose: z.string().optional().default(""),
    // convenience aliases kept for UI compatibility
    steps: z.array(SetupStepSchema).optional(),
    envVars: z.array(EnvVarSchema).optional(),
  }),
  testing: z.object({
    framework: z.string(),
    testFilesFound: z.array(z.string()).default([]),
    missingTests: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
    sourceCode: z.string().optional().default(""),
    generatedTests: z.string().optional().default(""),
    stats: z.array(TestStatSchema).default([]),
  }),
  deadCode: z.array(DeadCodeItemSchema).default([]),
  dependencies: z.object({
    nodes: z.array(DepNodeSchema).default([]),
    alerts: z.array(DepAlertSchema).default([]),
    outdated: z.array(DepOutdatedSchema).default([]),
  }),
  actionPlan: z.array(ActionPlanItemSchema).default([]),
});

// ─── Provider attribution ─────────────────────────────────────────────────────

export const ProviderMetaSchema = z.object({
  provider: z.enum(["gemini", "local"]),
  fallbackUsed: z.boolean(),
  model: z.string(),
});

/**
 * Errors that should immediately trigger fallback (no retry).
 * These indicate auth/quota problems that won't resolve on a quick retry.
 */
export const IMMEDIATE_FALLBACK_CODES = new Set([429, 401, 403]);

/**
 * HTTP status codes that are worth retrying with exponential backoff
 * before falling back to the local model.
 */
export const RETRYABLE_CODES = new Set([408, 500, 502, 503, 504]);

/** Network-level error codes that are treated as transient. */
export const RETRYABLE_NETWORK_ERRORS = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
]);
