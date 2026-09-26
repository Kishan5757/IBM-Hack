"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Star,
  Clock,
  GitCommit,
  Users,
  FileCode2,
  Rocket,
  TestTube2,
  FileText,
  Trash2,
  Package,
  Sun,
  Moon,
  ChevronLeft,
  Home,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { generateDynamicRepoData } from "@/data/repoIntelligence";
import { buildRepositoryPayload } from "@/utils/repoExtractor";
import SetupAssistant from "./FeatureTabs/SetupAssistant";
import TestGenerator from "./FeatureTabs/TestGenerator";
import ReadmeGenerator from "./FeatureTabs/ReadmeGenerator";
import DeadCodeDetector from "./FeatureTabs/DeadCodeDetector";
import DependencyAnalyzer from "./FeatureTabs/DependencyAnalyzer";

const TABS = [
  { id: "setup", label: "Setup Assistant", shortLabel: "Setup", icon: Rocket, color: "indigo" },
  { id: "tests", label: "Test Generator", shortLabel: "Tests", icon: TestTube2, color: "emerald" },
  { id: "readme", label: "README Generator", shortLabel: "README", icon: FileText, color: "amber" },
  { id: "deadcode", label: "Dead Code Detector", shortLabel: "Dead Code", icon: Trash2, color: "rose" },
  { id: "deps", label: "Dependency Analyzer", shortLabel: "Deps", icon: Package, color: "purple" },
];

const COLOR_MAP = {
  indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  amber: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  rose: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/30",
};

const ACTIVE_MAP = {
  indigo: "bg-indigo-600 text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-600 text-white",
  rose: "bg-rose-600 text-white",
  purple: "bg-purple-600 text-white",
};

// Analysis progress stages
const ANALYSIS_STAGES = [
  { id: "load",    label: "Repository loaded" },
  { id: "tree",    label: "Reading project structure" },
  { id: "deps",    label: "Inspecting dependencies" },
  { id: "analyze", label: "Analyzing code" },
  { id: "recs",    label: "Generating recommendations" },
];

export default function Dashboard({ onBack, onReset, darkMode, toggleDark, repoName, uploadedFile, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "setup");

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0); // 0-4 index into ANALYSIS_STAGES
  const [analysisDone, setAnalysisDone] = useState(false);

  // Fallback: mock data from intelligence layer
  const mockData = useMemo(() => generateDynamicRepoData(repoName || ""), [repoName]);

  // Track whether we've already kicked off analysis for this repo
  const analysisTriggeredRef = useRef(false);

  useEffect(() => {
    // Only run once per mount / repoName change
    if (analysisTriggeredRef.current) return;
    analysisTriggeredRef.current = true;
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage(0);
    setAnalysisDone(false);

    try {
      // Stage 0 → 1: build payload
      setAnalysisStage(1);
      const payload = await buildRepositoryPayload(repoName, uploadedFile);

      // Stage 1 → 2: send to server
      setAnalysisStage(2);

      // Stage 2 → 3: wait for Gemini
      setAnalysisStage(3);

      const response = await fetch("/api/analyze-repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000), // 2-minute timeout
      });

      const json = await response.json();

      // Stage 3 → 4
      setAnalysisStage(4);

      if (!response.ok) {
        const code = json?.code;
        if (code === "NO_API_KEY") {
          // Graceful demo mode
          setIsDemo(true);
          setAnalysisData(null);
        } else {
          throw new Error(json?.error || `Server error ${response.status}`);
        }
      } else {
        setAnalysisData(json.analysis);
        setIsDemo(json.isDemo === true);
      }
    } catch (err) {
      console.error("[Dashboard] Analysis error:", err);
      const message = err?.message || "Unknown error";
      if (message.includes("NO_API_KEY") || message.includes("not configured")) {
        setIsDemo(true);
        setAnalysisData(null);
      } else {
        setAnalysisError(message);
      }
    } finally {
      setAnalysisStage(4);
      setAnalysisDone(true);
      setIsAnalyzing(false);
    }
  }

  function retryAnalysis() {
    analysisTriggeredRef.current = false;
    analysisTriggeredRef.current = true;
    runAnalysis();
  }

  // ── Derive component data ──────────────────────────────────────────────────
  // Use AI data when available, fall back to mock otherwise
  const aiData = analysisData;
  const tab = TABS.find((t) => t.id === activeTab);

  // Meta: prefer AI result, fall back to mock
  const meta = useMemo(() => {
    if (aiData?.repository) {
      return {
        name: aiData.repository.name || mockData.meta.name,
        language: aiData.repository.language || mockData.meta.language,
        files: mockData.meta.files,
        stars: mockData.meta.stars,
        lastCommit: mockData.meta.lastCommit,
        contributors: mockData.meta.contributors,
      };
    }
    return mockData.meta;
  }, [aiData, mockData]);

  // Map AI data → each feature tab's expected data shape
  const setupData = useMemo(() => {
    if (aiData?.setup) {
      return {
        steps: aiData.setup.steps || aiData.setup.requiredSteps || [],
        envVars: aiData.setup.envVars || aiData.setup.environmentVariables || [],
        dockerCommand: aiData.setup.dockerCommand || "docker compose up --build -d",
        dockerCompose: aiData.setup.dockerCompose || "",
      };
    }
    return mockData.setup;
  }, [aiData, mockData]);

  const testsData = useMemo(() => {
    if (aiData?.testing) {
      return {
        framework: aiData.testing.framework || "Unknown",
        sourceCode: aiData.testing.sourceCode || "",
        generatedTests: aiData.testing.generatedTests || "",
        stats: aiData.testing.stats || [],
      };
    }
    return mockData.tests;
  }, [aiData, mockData]);

  const readmeData = useMemo(() => {
    if (aiData?.readme) {
      return {
        markdown: aiData.readme.markdown || aiData.readme.generatedMarkdown || "",
        qualityScore: aiData.readme.qualityScore,
        missingSections: aiData.readme.missingSections || [],
        issues: aiData.readme.issues || [],
      };
    }
    return mockData.readme;
  }, [aiData, mockData]);

  const deadCodeData = useMemo(() => {
    if (aiData?.deadCode && Array.isArray(aiData.deadCode)) {
      return aiData.deadCode;
    }
    return mockData.deadCode;
  }, [aiData, mockData]);

  const dependenciesData = useMemo(() => {
    if (aiData?.dependencies) {
      return aiData.dependencies;
    }
    return mockData.dependencies;
  }, [aiData, mockData]);

  const components = {
    setup: <SetupAssistant darkMode={darkMode} data={setupData} />,
    tests: <TestGenerator darkMode={darkMode} data={testsData} />,
    readme: <ReadmeGenerator darkMode={darkMode} data={readmeData} />,
    deadcode: <DeadCodeDetector darkMode={darkMode} data={deadCodeData} />,
    deps: <DependencyAnalyzer darkMode={darkMode} data={dependenciesData} />,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Back + Logo */}
            <div className="flex items-center gap-2">
              <button onClick={onBack} className={`p-1.5 rounded-lg transition-all ${darkMode ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onReset}
                className={`flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80`}
              >
                <GitBranch className={`w-5 h-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                <span className={`font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>RepoPilot</span>
              </button>
            </div>

            {/* Divider */}
            <span className={`hidden sm:block ${darkMode ? "text-slate-700" : "text-slate-300"}`}>|</span>

            {/* Repo meta */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <FileCode2 className={`w-3.5 h-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{meta.name || "my-awesome-app"}</span>
              </div>
              <MetaChip icon={GitCommit} label={meta.language || "TypeScript"} darkMode={darkMode} />
              <MetaChip icon={FileCode2} label={`${meta.files || 42} files`} darkMode={darkMode} />
              <MetaChip icon={Star} label={`${(meta.stars || 1284).toLocaleString()} stars`} darkMode={darkMode} />
              <MetaChip icon={Clock} label={`Updated ${meta.lastCommit || "2 hours ago"}`} darkMode={darkMode} />
              <MetaChip icon={Users} label={`${meta.contributors || 7} contributors`} darkMode={darkMode} />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* AI status badge */}
              {analysisDone && !isAnalyzing && (
                <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
                  isDemo
                    ? (darkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")
                    : analysisError
                    ? (darkMode ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700")
                    : (darkMode ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                }`}>
                  <Sparkles className="w-3 h-3" />
                  {isDemo ? "Demo Mode" : analysisError ? "AI Error" : "AI Analysis"}
                </div>
              )}

              {onReset && (
                <button
                  onClick={onReset}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"}`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Repo</span>
                </button>
              )}
              <button
                onClick={toggleDark}
                className={`p-2 rounded-full border transition-all ${darkMode ? "border-slate-700 bg-slate-800 text-yellow-300 hover:bg-slate-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-200"}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className={`border-b sticky top-[60px] z-40 ${darkMode ? "bg-slate-950/95 border-slate-800" : "bg-white/95 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {TABS.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    isActive
                      ? `${ACTIVE_MAP[t.color]} border-transparent shadow-sm`
                      : `border-transparent ${darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.label}</span>
                  <span className="md:hidden">{t.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">

        {/* ── Loading / Progress overlay ── */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 rounded-2xl border p-6 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <div>
                  <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>Analyzing your repository…</h3>
                  <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Gemini is reading the actual codebase contents</p>
                </div>
              </div>
              <div className="space-y-2">
                {ANALYSIS_STAGES.map((stage, i) => {
                  const done = i < analysisStage;
                  const active = i === analysisStage;
                  return (
                    <div key={stage.id} className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
                      ) : (
                        <Circle className={`w-4 h-4 flex-shrink-0 ${darkMode ? "text-slate-700" : "text-slate-300"}`} />
                      )}
                      <span className={`text-sm ${done ? (darkMode ? "text-emerald-400" : "text-emerald-600") : active ? (darkMode ? "text-white" : "text-slate-900") : (darkMode ? "text-slate-600" : "text-slate-400")}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Demo Mode Banner ── */}
        {!isAnalyzing && isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 rounded-xl border p-4 flex items-start gap-3 ${darkMode ? "bg-amber-500/8 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${darkMode ? "text-amber-400" : "text-amber-700"}`}>Demo Analysis</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-amber-500/80" : "text-amber-600"}`}>
                AI analysis is not configured (GEMINI_API_KEY missing). Showing representative demo data.
                Add a <code className="font-mono">GEMINI_API_KEY</code> to your <code className="font-mono">.env.local</code> to enable real analysis.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Error Banner ── */}
        {!isAnalyzing && analysisError && !isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 rounded-xl border p-4 flex items-start gap-3 ${darkMode ? "bg-rose-500/8 border-rose-500/25" : "bg-rose-50 border-rose-200"}`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${darkMode ? "text-rose-400" : "text-rose-700"}`}>Analysis Failed</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-rose-500/80" : "text-rose-600"}`}>{analysisError}</p>
            </div>
            <button
              onClick={retryAnalysis}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${darkMode ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Analysis
            </button>
          </motion.div>
        )}

        {/* ── Success Banner (briefly shown after analysis) ── */}
        {!isAnalyzing && analysisDone && !analysisError && !isDemo && analysisData && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-5 rounded-xl border p-3 flex items-center gap-3 ${darkMode ? "bg-emerald-500/8 border-emerald-500/25" : "bg-emerald-50 border-emerald-200"}`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className={`text-xs font-medium ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                Repository analysis complete · Results powered by Gemini 2.5 Flash
                {analysisData.overview?.healthScore != null && (
                  <span className="ml-2 font-bold">· Health score: {analysisData.overview.healthScore}/100</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Feature header */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-5"
        >
          <div className={`p-2 rounded-xl border ${COLOR_MAP[tab.color]}`}>
            <tab.icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-bold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>{tab.label}</h2>
            <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              {isDemo ? "Demo data" : isAnalyzing ? "Analyzing…" : "AI-powered"} · Repo: {meta.name || "my-awesome-app"}
            </p>
          </div>
        </motion.div>

        {/* Feature panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {components[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function MetaChip({ icon: Icon, label, darkMode }) {
  return (
    <div className={`flex items-center gap-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
