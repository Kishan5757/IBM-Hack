/**
 * mockRepoData.js
 *
 * Re-exports from repoIntelligence.js so that all feature tab components
 * get the same dynamic, language-aware data when no prop is passed in.
 *
 * Previously this file held hardcoded "fullstack" data. Now the canonical
 * defaults come from the intelligence layer (fullstack profile), keeping
 * a single source of truth.
 */

export {
  mockRepoMeta,
  mockSetupData,
  mockTestData,
  mockReadmeData,
  mockDeadCodeData,
  mockDependencyData,
} from "@/data/repoIntelligence";
