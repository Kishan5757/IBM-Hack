"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Copy, Check, Terminal, KeyRound, Container } from "lucide-react";
import { mockSetupData } from "@/data/mockRepoData";

export default function SetupAssistant({ darkMode }) {
  const [activeTab, setActiveTab] = useState("steps");
  const [copiedId, setCopiedId] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = [
    { id: "steps", label: "Setup Steps", icon: CheckCircle2 },
    { id: "env", label: "Environment Variables", icon: KeyRound },
    { id: "docker", label: "Docker", icon: Container },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className={`flex gap-2 p-1 rounded-xl ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === t.id
                ? "bg-indigo-600 text-white shadow"
                : darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "steps" && (
          <motion.div key="steps" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            {mockSetupData.steps.map((step) => (
              <div key={step.id} className={`rounded-xl border p-4 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{step.id}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>{step.title}</p>
                    <p className={`text-xs mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{step.description}</p>
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs ${darkMode ? "bg-slate-900 text-emerald-400" : "bg-slate-100 text-emerald-700"}`}>
                      <Terminal className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 truncate">{step.command}</span>
                      <button onClick={() => copy(step.command, step.id)} className="flex-shrink-0 ml-1">
                        {copiedId === step.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "env" && (
          <motion.div key="env" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <table className="w-full text-sm">
                <thead className={`${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Variable</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Example Value</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSetupData.envVars.map((ev, i) => (
                    <tr key={ev.key} className={`border-t ${darkMode ? "border-slate-700/50" : "border-slate-100"} ${i % 2 === 0 ? (darkMode ? "bg-slate-800/30" : "bg-white") : (darkMode ? "bg-slate-800/10" : "bg-slate-50")}`}>
                      <td className={`px-4 py-3 font-mono text-xs font-semibold ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>{ev.key}</td>
                      <td className={`px-4 py-3 font-mono text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{ev.example}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ev.required ? "bg-rose-500/20 text-rose-400" : "bg-slate-500/20 text-slate-400"}`}>
                          {ev.required ? "Required" : "Optional"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "docker" && (
          <motion.div key="docker" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className={`rounded-xl border p-4 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Quick Start Command</p>
                <button onClick={() => copy(mockSetupData.dockerCommand, "docker-run")} className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {copiedId === "docker-run" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <pre className={`rounded-lg p-3 font-mono text-xs overflow-x-auto ${darkMode ? "bg-slate-900 text-emerald-400" : "bg-slate-100 text-emerald-700"}`}>{mockSetupData.dockerCommand}</pre>
            </div>
            <div className={`rounded-xl border p-4 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>docker-compose.yml</p>
                <button onClick={() => copy(mockSetupData.dockerCompose, "docker-compose")} className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {copiedId === "docker-compose" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <pre className={`rounded-lg p-3 font-mono text-xs overflow-x-auto ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-800"}`}>{mockSetupData.dockerCompose}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
