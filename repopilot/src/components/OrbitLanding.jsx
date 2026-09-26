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

// Each planet's visual personality
const PLANETS = [
  {
    label: "Setup Assistant",
    icon: Rocket,
    color: "#6366f1",        // indigo
    glow: "rgba(99,102,241,0.6)",
    size: 48,
    orbitRadius: 230,
    speed: 22,
    emoji: "🚀",
  },
  {
    label: "Test Generator",
    icon: TestTube2,
    color: "#10b981",        // emerald
    glow: "rgba(16,185,129,0.6)",
    size: 44,
    orbitRadius: 230,
    speed: 22,
    emoji: "🧪",
  },
  {
    label: "README Automation",
    icon: FileText,
    color: "#f59e0b",        // amber
    glow: "rgba(245,158,11,0.6)",
    size: 50,
    orbitRadius: 230,
    speed: 22,
    emoji: "📄",
  },
  {
    label: "Dead Code Detector",
    icon: Trash2,
    color: "#ef4444",        // rose
    glow: "rgba(239,68,68,0.6)",
    size: 42,
    orbitRadius: 230,
    speed: 22,
    emoji: "🗑️",
  },
  {
    label: "Dependency Analyzer",
    icon: Package,
    color: "#a855f7",        // purple
    glow: "rgba(168,85,247,0.6)",
    size: 46,
    orbitRadius: 230,
    speed: 22,
    emoji: "📦",
  },
];

export default function OrbitLanding({ onAnalyze, darkMode, toggleDark }) {
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const startScan = (inputUrl, uploadedFile = null) => {
    const repoUrl = inputUrl || url;
    setScanning(true);
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / 1800) * 100, 100);
      setProgress(Math.round(pct));
      if (pct >= 100) {
        clearInterval(tick);
        // Pass both the URL/name AND the actual File object upstream
        setTimeout(() => onAnalyze(repoUrl, uploadedFile), 150);
      }
    }, 30);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      startScan(file.name, file);
    } else {
      startScan(url);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && url.trim()) startScan(url.trim());
  };

  // Solar system size — fills the whole viewport
  const ORBIT_SIZE = 520; // diameter of orbit ring (CSS pixels)
  const CENTER = ORBIT_SIZE / 2;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 overflow-hidden ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 text-slate-900"
      }`}
    >
      {/* Starfield dots — dark mode only */}
      {darkMode && <Starfield />}

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 z-50 relative">
        <div className="flex items-center gap-2">
          <GitBranch className={`w-6 h-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <span className={`font-bold text-xl tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
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
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Solar System */}
      <main className="flex-1 flex items-center justify-center relative" style={{ minHeight: "calc(100vh - 70px)" }}>

        {/* Orbit ring container — absolutely centred */}
        <div
          className="absolute"
          style={{
            width: ORBIT_SIZE,
            height: ORBIT_SIZE,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Outer dashed orbit ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin-slow pointer-events-none ${
              darkMode ? "border-white/10" : "border-slate-400/20"
            }`}
          />
          {/* Inner glow ring */}
          <div
            className={`absolute rounded-full pointer-events-none animate-spin-reverse ${
              darkMode ? "border border-indigo-500/15" : "border border-indigo-300/30"
            }`}
            style={{ inset: 28 }}
          />

          {/* 5 Planets */}
          {PLANETS.map((planet, i) => (
            <Planet
              key={planet.label}
              planet={planet}
              index={i}
              total={PLANETS.length}
              orbitDiameter={ORBIT_SIZE}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Sun / Central card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-20"
        >
          {/* Sun glow ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: darkMode
                ? "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0) 70%)"
                : "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
              transform: "scale(2.2)",
            }}
          />

          {/* Circular card */}
          <div
            className={`rounded-full shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
              darkMode
                ? "bg-slate-900/95 border-2 border-yellow-400/40 animate-sun-pulse"
                : "bg-white/90 border-2 border-indigo-300/60"
            }`}
            style={{ width: 280, height: 280 }}
          >
            {/* Radial gradient inner glow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: darkMode
                  ? "radial-gradient(circle at 50% 30%, rgba(251,191,36,0.12), transparent 70%)"
                  : "radial-gradient(circle at 50% 30%, rgba(99,102,241,0.1), transparent 70%)",
              }}
            />

            <AnimatePresence mode="wait">
              {!scanning ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center w-full h-full px-6 py-4 gap-3"
                >
                  {/* Title */}
                  <div className="text-center">
                    <h1 className={`text-2xl font-extrabold tracking-tight leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Repo<span className="text-indigo-400">Pilot</span>
                    </h1>
                    <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      AI Co-Pilot for Codebase Health
                    </p>
                  </div>

                  {/* URL input */}
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 w-full ${
                      darkMode ? "bg-slate-800 border-slate-600" : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <Link2 className={`w-3 h-3 flex-shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="github.com/org/repo"
                      className={`flex-1 bg-transparent text-xs outline-none placeholder:text-slate-500 ${darkMode ? "text-white" : "text-slate-900"}`}
                    />
                  </div>

                  {/* Drop zone mini */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border border-dashed rounded-full w-full py-1.5 text-center cursor-pointer transition-all text-[10px] ${
                      dragging
                        ? "border-indigo-400 bg-indigo-500/15 text-indigo-400"
                        : darkMode
                        ? "border-slate-600 text-slate-500 hover:border-slate-400"
                        : "border-slate-300 text-slate-400 hover:border-indigo-400"
                    }`}
                  >
                    <input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) startScan(f.name, f);
                    }} />
                    <Upload className="w-3 h-3 inline mr-1" />
                    Drop archive or click
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => startScan(url)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all font-semibold text-white shadow-lg shadow-indigo-500/40 text-xs"
                  >
                    <Zap className="w-3 h-3" />
                    Analyze Repository
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-3 px-4"
                >
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke={darkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={darkMode ? "#fbbf24" : "#6366f1"}
                        strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.03s linear" }}
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${darkMode ? "text-yellow-400" : "text-indigo-500"}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>🤖 AI Scanning...</p>
                    <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Analyzing codebase & detecting patterns
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`absolute bottom-8 left-0 right-0 text-center text-xs z-10 ${
            darkMode ? "text-slate-600" : "text-slate-400"
          }`}
        >
          Instant AI analysis · No sign-up required · 5 tools in one workspace
        </motion.p>
      </main>
    </div>
  );
}

/* ─── Planet component ─────────────────────────────────────────── */
function Planet({ planet, index, total, orbitDiameter, darkMode }) {
  const Icon = planet.icon;
  const startDeg = (index / total) * 360;
  const orbitRadius = orbitDiameter / 2; // px from center to planet center

  return (
    <div
      className="absolute inset-0"
      style={{
        "--planet-start": `${startDeg}deg`,
        animation: `solar-orbit ${planet.speed}s linear infinite`,
        animationDelay: `-${(index / total) * planet.speed}s`,
        transformOrigin: "center center",
      }}
    >
      {/* Planet sits at top of orbit layer */}
      <div
        className="absolute left-1/2"
        style={{
          top: `calc(50% - ${orbitRadius}px)`,
          transform: "translateX(-50%)",
          animation: `solar-counter ${planet.speed}s linear infinite`,
          animationDelay: `-${(index / total) * planet.speed}s`,
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.12, type: "spring", stiffness: 260, damping: 18 }}
        >
          {/* Planet sphere */}
          <div
            className="rounded-full flex flex-col items-center justify-center shadow-2xl relative cursor-default select-none"
            style={{
              width: planet.size + 20,
              height: planet.size + 20,
              background: `radial-gradient(circle at 35% 35%, ${planet.color}ee, ${planet.color}88)`,
              boxShadow: `0 0 18px 4px ${planet.glow}, inset 0 2px 6px rgba(255,255,255,0.3)`,
              border: `2px solid ${planet.color}55`,
            }}
          >
            {/* Highlight spot */}
            <div
              className="absolute rounded-full bg-white/25"
              style={{ width: 10, height: 10, top: 8, left: 10 }}
            />
            <Icon className="w-4 h-4 text-white/90" />
          </div>

          {/* Label below planet */}
          <div
            className={`mt-1.5 px-2 py-0.5 rounded-full text-center whitespace-nowrap text-[9px] font-semibold ${
              darkMode
                ? "bg-slate-800/80 text-slate-300 border border-slate-600/60"
                : "bg-white/80 text-slate-700 border border-slate-200/80"
            }`}
            style={{ maxWidth: 100, backdropFilter: "blur(8px)" }}
          >
            {planet.label}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Starfield ─────────────────────────────────────────────────── */
function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
