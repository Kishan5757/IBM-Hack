"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, FileX, Variable, GitBranchPlus, Trash2, ChevronRight } from "lucide-react";
import { mockDeadCodeData } from "@/data/mockRepoData";

const TYPE_ICONS = {
  "Unused Variable": Variable,
  "Unreachable Function": GitBranchPlus,
  "Orphan File": FileX,
  "Unused Import": AlertTriangle,
  "Dead Branch": AlertTriangle,
};

const SEVERITY_STYLES = {
  high: { badge: "bg-rose-500/20 text-rose-400 border-rose-500/30", bar: "bg-rose-500" },
  medium: { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", bar: "bg-amber-500" },
  low: { badge: "bg-slate-500/20 text-slate-400 border-slate-500/30", bar: "bg-slate-500" },
};

export default function DeadCodeDetector({ darkMode }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const severities = ["all", "high", "medium", "low"];
  const filtered = filter === "all" ? mockDeadCodeData : mockDeadCodeData.filter(d => d.severity === filter);

  const totalItems = mockDeadCodeData.length;
  const highCount = mockDeadCodeData.filter(d => d.severity === "high").length;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl border p-3 text-center ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
          <p className="text-2xl font-bold text-rose-500">{totalItems}</p>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Issues Found</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
          <p className="text-2xl font-bold text-amber-500">{highCount}</p>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>High Priority</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
          <p className="text-2xl font-bold text-emerald-500">~18%</p>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Dead Code Ratio</p>
        </div>
      </div>

      {/* Severity filter */}
      <div className={`flex gap-2 p-1 rounded-xl ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
        {severities.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === s
                ? "bg-indigo-600 text-white shadow"
                : darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Trash2;
            const styles = SEVERITY_STYLES[item.severity];
            const isOpen = expanded === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${darkMode ? "bg-slate-800/60 border-slate-700 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300"}`}
                onClick={() => setExpanded(isOpen ? null : item.id)}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className={`p-1.5 rounded-lg border ${styles.badge}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{item.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${styles.badge}`}>{item.type}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{item.file}{item.line ? `:${item.line}` : ""}</p>
                  </div>
                  {/* Confidence bar */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className={`w-20 h-1.5 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}>
                      <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${item.confidence}%` }} />
                    </div>
                    <span className={`text-xs font-mono ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{item.confidence}%</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""} ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`border-t px-4 py-3 text-xs ${darkMode ? "border-slate-700 bg-slate-900/40 text-slate-400" : "border-slate-100 bg-slate-50 text-slate-600"}`}
                    >
                      <p><span className="font-semibold">Severity:</span> <span className="capitalize">{item.severity}</span></p>
                      <p className="mt-1"><span className="font-semibold">Confidence:</span> {item.confidence}% unused</p>
                      <p className="mt-1"><span className="font-semibold">Recommendation:</span> Safe to remove — no external references found in codebase.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
