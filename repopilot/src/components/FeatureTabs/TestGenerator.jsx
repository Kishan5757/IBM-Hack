"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { mockTestData } from "@/data/mockRepoData";

export default function TestGenerator({ darkMode }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(mockTestData.generatedTests);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => setRegenerating(false), 1200);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>AI-Generated Unit Tests</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>Jest · TypeScript</span>
        </div>
        <div className="flex gap-2">
          <button onClick={regenerate} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
            Regenerate
          </button>
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <div className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
          <div className={`flex items-center gap-2 px-4 py-2 border-b text-xs font-medium ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2">src/utils/auth.ts</span>
          </div>
          <motion.pre
            key={regenerating ? "regen" : "stable"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-96 ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-800"}`}
          >
            <code>{mockTestData.sourceCode}</code>
          </motion.pre>
        </div>

        {/* Generated tests */}
        <div className={`rounded-xl border overflow-hidden ${darkMode ? "border-indigo-700/60" : "border-indigo-200"}`}>
          <div className={`flex items-center gap-2 px-4 py-2 border-b text-xs font-medium ${darkMode ? "bg-indigo-900/40 border-indigo-700/60 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
            <Sparkles className="w-3 h-3" />
            <span>tests/utils/auth.test.ts — AI Generated</span>
          </div>
          <motion.pre
            key={regenerating ? "regen-out" : "stable-out"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-96 ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-800"}`}
          >
            {regenerating ? (
              <span className="text-indigo-500 animate-pulse">Generating tests...</span>
            ) : (
              <code>{mockTestData.generatedTests}</code>
            )}
          </motion.pre>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Test Cases", value: "8", color: "indigo" },
          { label: "Coverage Target", value: "94%", color: "emerald" },
          { label: "Edge Cases", value: "3", color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-3 text-center ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
            <p className={`text-xl font-bold text-${stat.color}-500`}>{stat.value}</p>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
