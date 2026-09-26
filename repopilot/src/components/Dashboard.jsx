"use client";
import { useState } from "react";
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
} from "lucide-react";
import { mockRepoMeta } from "@/data/mockRepoData";
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

export default function Dashboard({ onBack, darkMode, toggleDark }) {
  const [activeTab, setActiveTab] = useState("setup");

  const tab = TABS.find((t) => t.id === activeTab);

  const components = {
    setup: <SetupAssistant darkMode={darkMode} />,
    tests: <TestGenerator darkMode={darkMode} />,
    readme: <ReadmeGenerator darkMode={darkMode} />,
    deadcode: <DeadCodeDetector darkMode={darkMode} />,
    deps: <DependencyAnalyzer darkMode={darkMode} />,
  };

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
              <GitBranch className={`w-5 h-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <span className={`font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>RepoPilot</span>
            </div>

            {/* Divider */}
            <span className={`hidden sm:block ${darkMode ? "text-slate-700" : "text-slate-300"}`}>|</span>

            {/* Repo meta */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <FileCode2 className={`w-3.5 h-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{mockRepoMeta.name}</span>
              </div>
              <MetaChip icon={GitCommit} label={mockRepoMeta.language} darkMode={darkMode} />
              <MetaChip icon={FileCode2} label={`${mockRepoMeta.files} files`} darkMode={darkMode} />
              <MetaChip icon={Star} label={`${mockRepoMeta.stars.toLocaleString()} stars`} darkMode={darkMode} />
              <MetaChip icon={Clock} label={`Updated ${mockRepoMeta.lastCommit}`} darkMode={darkMode} />
              <MetaChip icon={Users} label={`${mockRepoMeta.contributors} contributors`} darkMode={darkMode} />
            </div>

            <div className="ml-auto">
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
              AI-powered · Repo: {mockRepoMeta.name}
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
