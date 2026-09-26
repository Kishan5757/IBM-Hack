"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Upload,
  Link2,
  Zap,
  Sun,
  Moon,
  Rocket,
  TestTube2,
  FileText,
  Trash2,
  Package,
} from "lucide-react";

const ORBIT_FEATURES = [
  { label: "Setup Assistant", icon: Rocket, color: "from-indigo-500 to-indigo-700" },
  { label: "Test Generator", icon: TestTube2, color: "from-emerald-500 to-emerald-700" },
  { label: "README Automation", icon: FileText, color: "from-amber-500 to-amber-700" },
  { label: "Dead Code Detector", icon: Trash2, color: "from-rose-500 to-rose-700" },
  { label: "Dependency Analyzer", icon: Package, color: "from-purple-500 to-purple-700" },
];

export default function OrbitLanding({ onAnalyze, darkMode, toggleDark }) {
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / 1500) * 100, 100);
      setProgress(Math.round(pct));
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(onAnalyze, 150);
      }
    }, 30);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    startScan();
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"}`}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 z-50">
        <div className="flex items-center gap-2">
          <GitBranch className={`w-6 h-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <span className={`font-bold text-xl tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            RepoPilot
          </span>
        </div>
        <button
          onClick={toggleDark}
          className={`p-2 rounded-full border transition-all ${darkMode ? "border-slate-700 bg-slate-800 text-yellow-300 hover:bg-slate-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-200"}`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Orbit ring */}
        <div className="absolute w-[520px] h-[520px] md:w-[620px] md:h-[620px]" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          {/* Ring circle */}
          <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin-slow ${darkMode ? "border-indigo-800/40" : "border-indigo-300/60"}`} />
          {ORBIT_FEATURES.map((feat, i) => (
            <OrbitBadge key={feat.label} feature={feat} index={i} total={ORBIT_FEATURES.length} />
          ))}
        </div>

        {/* Center card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className={`rounded-2xl border shadow-2xl p-8 backdrop-blur-sm ${darkMode ? "bg-slate-900/90 border-slate-700/60" : "bg-white/90 border-slate-200"}`}>
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Repo<span className="text-indigo-500">Pilot</span>
              </h1>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Your AI Co-Pilot for Codebase Health
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!scanning ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-4 transition-all duration-200 ${
                      dragging
                        ? "border-indigo-500 bg-indigo-500/10 scale-105"
                        : darkMode
                        ? "border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/5"
                        : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50"
                    }`}
                  >
                    <input ref={inputRef} type="file" className="hidden" onChange={startScan} />
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      Drop your repo archive here
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                      .zip, .tar.gz — or paste a GitHub URL below
                    </p>
                  </div>

                  {/* URL input */}
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 mb-4 ${darkMode ? "bg-slate-800 border-slate-600" : "bg-slate-50 border-slate-300"}`}>
                    <Link2 className={`w-4 h-4 flex-shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                      className={`flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 ${darkMode ? "text-white" : "text-slate-900"}`}
                    />
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={startScan}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all font-semibold text-white shadow-lg shadow-indigo-500/30"
                  >
                    <Zap className="w-4 h-4" />
                    Analyze Repository
                  </button>
                </motion.div>
              ) : (
                <motion.div key="scan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke={darkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.03s linear" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-indigo-500">{progress}%</span>
                  </div>
                  <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>AI Scanning...</p>
                  <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Analyzing codebase structure & health</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 text-xs text-center z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          Instant AI analysis · No sign-up required · 5 tools in one workspace
        </motion.p>
      </main>
    </div>
  );
}

// Each badge sits at its evenly-spaced angle and rotates with the ring.
// The counter-rotation on the inner div keeps the label text upright.
function OrbitBadge({ feature, index, total }) {
  const Icon = feature.icon;
  const startDeg = (index / total) * 360;   // initial position on ring
  const radius = 260;                        // px — matches the CSS keyframe translateY

  return (
    <div
      className="absolute inset-0"
      style={{
        "--orbit-start": `${startDeg}deg`,
        animation: `orbit 20s linear infinite`,
        animationDelay: `-${(index / total) * 20}s`,
        transformOrigin: "center center",
      }}
    >
      {/* Badge sits at the top of the rotated layer */}
      <div
        className="absolute left-1/2"
        style={{
          top: `calc(50% - ${radius}px)`,
          transform: "translateX(-50%)",
          // Counter-rotate so text stays horizontal as the ring spins
          animation: `orbit-counter 20s linear infinite`,
          animationDelay: `-${(index / total) * 20}s`,
        }}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg whitespace-nowrap bg-gradient-to-r ${feature.color} text-white`}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          {feature.label}
        </div>
      </div>
    </div>
  );
}
