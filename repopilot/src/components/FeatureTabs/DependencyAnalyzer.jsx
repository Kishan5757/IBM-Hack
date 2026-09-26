"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Shield, RefreshCw, Package2 } from "lucide-react";
const HEALTH_CONFIG = {
  ok: { color: "bg-emerald-500", text: "text-emerald-500", label: "Healthy", border: "border-emerald-500/30 bg-emerald-500/10" },
  warning: { color: "bg-amber-500", text: "text-amber-500", label: "Warning", border: "border-amber-500/30 bg-amber-500/10" },
  critical: { color: "bg-rose-500", text: "text-rose-500", label: "Critical", border: "border-rose-500/30 bg-rose-500/10" },
};

const ALERT_SEVERITY = {
  CRITICAL: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  LOW: "bg-slate-500/20 text-slate-400 border-slate-500/40",
};

// Health colour lookup by string name
function healthDotColor(health) {
  if (health === "ok") return "#22c55e";
  if (health === "warning") return "#f59e0b";
  return "#ef4444";
}

export default function DependencyAnalyzer({ darkMode, data }) {
  const [activeView, setActiveView] = useState("map");
  const [hoveredNode, setHoveredNode] = useState(null);

  const depData = data || { nodes: [], alerts: [], outdated: [] };
  const nodes = depData.nodes || [];
  const alerts = depData.alerts || [];
  const outdated = depData.outdated || [];
  const deps = nodes.filter(n => n.id !== "root");

  // Compute positions in a circular layout
  const cx = 280, cy = 220, r = 160;
  const nodePositions = deps.map((n, i) => {
    const angle = (i / deps.length) * 2 * Math.PI - Math.PI / 2;
    return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const rootNode = nodes.find(n => n.id === "root");

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="w-4 h-4 text-purple-500" />
          <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Dependency Health</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            alerts.some(a => a.severity === "CRITICAL")
              ? (darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700")
              : (darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700")
          }`}>
            {alerts.filter(a => a.severity === "CRITICAL").length} critical
          </span>
        </div>
        <div className={`flex rounded-lg p-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
          {["map", "alerts", "outdated"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${activeView === v ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {activeView === "map" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"}`}>
          <svg width="100%" viewBox="0 0 560 440" className="w-full">
            {/* Edges from root to nodes */}
            {nodePositions.map((n) => (
              <line
                key={`edge-${n.id}`}
                x1={cx} y1={cy}
                x2={n.x} y2={n.y}
                stroke={darkMode ? "#334155" : "#cbd5e1"}
                strokeWidth="1.5"
                strokeDasharray={n.health === "critical" ? "5,3" : "none"}
              />
            ))}

            {/* Root node */}
            <circle cx={cx} cy={cy} r={32} fill="#6366f1" />
            <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {(rootNode?.label || "repo").slice(0, 12)}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="white" fontSize="7">
              {(rootNode?.label || "").length > 12 ? (rootNode?.label || "").slice(12, 22) : "root"}
            </text>

            {/* Dependency nodes */}
            {nodePositions.map((n) => {
              const isHovered = hoveredNode === n.id;
              return (
                <g key={n.id}
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={n.x} cy={n.y} r={isHovered ? 26 : 22}
                    fill={darkMode ? "#1e293b" : "#ffffff"}
                    stroke={n.health === "critical" ? "#ef4444" : n.health === "warning" ? "#f59e0b" : "#22c55e"}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ transition: "all 0.2s" }}
                  />
                  <circle cx={n.x + 14} cy={n.y - 14} r={5} fill={healthDotColor(n.health)} />
                  <text x={n.x} y={n.y + 1} textAnchor="middle" fill={darkMode ? "#94a3b8" : "#475569"} fontSize="7.5" fontWeight="500">
                    {n.label.split("@")[0]}
                  </text>
                  <text x={n.x} y={n.y + 11} textAnchor="middle" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="6.5">
                    @{n.label.split("@")[1]}
                  </text>
                  {isHovered && (
                    <rect x={n.x - 36} y={n.y + 28} width={72} height={18} rx={4}
                      fill={darkMode ? "#1e293b" : "#f1f5f9"}
                      stroke={darkMode ? "#334155" : "#cbd5e1"}
                      strokeWidth={1}
                    />
                  )}
                  {isHovered && (
                    <text x={n.x} y={n.y + 40} textAnchor="middle" fill={darkMode ? "#94a3b8" : "#475569"} fontSize="7">
                      {HEALTH_CONFIG[n.health]?.label || n.health}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className={`flex gap-4 px-4 py-3 border-t text-xs ${darkMode ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>
            {Object.entries(HEALTH_CONFIG).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />
                <span className="capitalize">{v.label}</span>
              </div>
            ))}
            <span className="ml-auto">{deps.length} packages · {alerts.length} alerts</span>
          </div>
        </motion.div>
      )}

      {activeView === "alerts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {alerts.length === 0 ? (
            <div className={`rounded-xl border p-8 text-center ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
              <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>No Vulnerabilities Found</p>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>All dependencies are clean 🎉</p>
            </div>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className={`rounded-xl border p-4 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex items-start gap-3">
                  <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.severity === "CRITICAL" ? "text-rose-500" : a.severity === "MEDIUM" ? "text-amber-500" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>{a.pkg}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${ALERT_SEVERITY[a.severity]}`}>{a.severity}</span>
                      {a.cve !== "N/A" && <span className={`text-xs font-mono ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>{a.cve}</span>}
                    </div>
                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{a.desc}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {activeView === "outdated" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
          {outdated.length === 0 ? (
            <div className={`p-8 text-center ${darkMode ? "bg-slate-800/60" : "bg-white"}`}>
              <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>All packages up to date ✅</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className={darkMode ? "bg-slate-800" : "bg-slate-100"}>
                <tr>
                  {["Package", "Current", "Latest", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outdated.map((o, i) => (
                  <tr key={i} className={`border-t ${darkMode ? "border-slate-700/50 bg-slate-800/30" : "border-slate-100 bg-white"}`}>
                    <td className={`px-4 py-3 font-mono text-xs font-semibold ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>{o.pkg}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{o.current}</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-500">{o.latest}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${o.status === "outdated" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : o.status === "minor" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </div>
  );
}
