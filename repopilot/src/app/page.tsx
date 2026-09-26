"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OrbitLanding from "@/components/OrbitLanding";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [view, setView] = useState("landing"); // "landing" | "dashboard"
  const [darkMode, setDarkMode] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35 }}
        >
          <OrbitLanding
            onAnalyze={() => setView("dashboard")}
            darkMode={darkMode}
            toggleDark={() => setDarkMode((d) => !d)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
          <Dashboard
            onBack={() => setView("landing")}
            darkMode={darkMode}
            toggleDark={() => setDarkMode((d) => !d)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
