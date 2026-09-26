"use client";
import { motion } from "framer-motion";
import {
  Rocket,
  TestTube2,
  FileText,
  Trash2,
  Package,
  ArrowRight,
  GitBranch,
  Sun,
  Moon,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    id: "setup",
    label: "Setup Assistant",
    icon: Rocket,
    color: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
    border: "rgba(99,102,241,0.4)",
    description: "Step-by-step environment setup, Docker commands, and required env variables auto-detected from your stack.",
    badge: "5-step guide",
    emoji: "🚀",
  },
  {
    id: "tests",
    label: "Test Generator",
    icon: TestTube2,
    color: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    border: "rgba(16,185,129,0.4)",
    description: "Automatically generate Jest, PyTest, or React Testing Library unit tests for your source files.",
    badge: "AI-generated",
    emoji: "🧪",
  },
  {
    id: "readme",
    label: "README Generator",
    icon: FileText,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    border: "rgba(245,158,11,0.4)",
    description: "Auto-generate a polished README with badges, tech stack, install guide, and project structure.",
    badge: "Markdown ready",
    emoji: "📄",
  },
  {
    id: "deadcode",
    label: "Dead Code Detector",
    icon: Trash2,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    border: "rgba(239,68,68,0.4)",
    description: "Scan for unused variables, orphaned files, unreachable functions, and dead branches with confidence scores.",
    badge: "Static analysis",
    emoji: "🗑️",
  },
  {
    id: "deps",
    label: "Dependency Analyzer",
    icon: Package,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.35)",
    border: "rgba(168,85,247,0.4)",
    description: "Visualize package health, detect CVE vulnerabilities, and find outdated dependencies in your project.",
    badge: "CVE scanner",
    emoji: "📦",
  },
];

export default function FeatureSelection({ repoMeta, onSelect, darkMode, toggleDark }) {
  const REPO_TYPE_LABELS = {
    frontend: "Frontend (React/TS)",
    backend: "Backend (Python/API)",
    ml: "Machine Learning",
    mobile: "Mobile (React Native)",
    cli: "CLI Tool",
    fullstack: "Full-Stack App",
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${
          darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className={`w-5 h-5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            <span className={`font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Repo<span className="text-indigo-500">Pilot</span>
            </span>
          </div>
          <button
            onClick={toggleDark}
            className={`p-2 rounded-full border transition-all ${
              darkMode
                ? "border-slate-700 bg-slate-800 text-yellow-300 hover:bg-slate-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            darkMode ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Analysis Complete
          </div>

          <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Repository Analyzed
          </h1>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            AI detected a{" "}
            <span className="font-semibold text-indigo-500">
              {REPO_TYPE_LABELS[repoMeta?.type] || "Full-Stack App"}
            </span>{" "}
            — select a feature to explore
          </p>

          {/* Repo pill */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border text-xs font-mono ${
            darkMode
              ? "bg-slate-800/60 border-slate-700 text-slate-300"
              : "bg-white border-slate-200 text-slate-700"
          }`}>
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            {repoMeta?.meta?.name || "my-awesome-app"}
            <span className={`ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              · {repoMeta?.meta?.language}
            </span>
            <span className={`ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              · {repoMeta?.meta?.files} files
            </span>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_CARDS.map((card, i) => (
            <FeatureCard
              key={card.id}
              card={card}
              index={i}
              darkMode={darkMode}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`text-center text-xs mt-8 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          All analysis is powered by AI pattern detection from your repository structure
        </motion.p>
      </main>
    </div>
  );
}

/* ─── Individual Glass Card ─────────────────────────────────────── */
function FeatureCard({ card, index, darkMode, onSelect }) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.45, ease: [0.34, 1.1, 0.64, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(card.id)}
      className="cursor-pointer group relative overflow-hidden rounded-2xl"
      style={{
        background: darkMode
          ? `rgba(15,23,42,0.7)`
          : `rgba(255,255,255,0.65)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${card.border}`,
        boxShadow: darkMode
          ? `0 0 0 0 ${card.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${card.glow}, transparent 65%)`,
        }}
      />

      {/* Shimmer line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}88, transparent)` }}
      />

      <div className="relative p-6">
        {/* Icon + Badge row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${card.color}33, ${card.color}18)`,
              border: `1px solid ${card.color}40`,
              boxShadow: `0 4px 16px ${card.glow}`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: card.color }} />
          </div>

          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: card.color,
              background: `${card.color}18`,
              borderColor: `${card.color}40`,
            }}
          >
            {card.badge}
          </span>
        </div>

        {/* Label */}
        <h3 className={`font-bold text-base mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
          {card.label}
        </h3>

        {/* Description */}
        <p className={`text-xs leading-relaxed mb-5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {card.description}
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className="w-1 h-1 rounded-full"
                style={{ background: j === 0 ? card.color : `${card.color}40` }}
              />
            ))}
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all duration-200"
            style={{ color: card.color }}
          >
            Open Feature
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
