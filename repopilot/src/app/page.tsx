"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OrbitLanding from "@/components/OrbitLanding";
import FeatureSelection from "@/components/FeatureSelection";
import Dashboard from "@/components/Dashboard";
import ChatBot from "@/components/ChatBot";
import { generateDynamicRepoData } from "@/data/repoIntelligence";

export default function Home() {
  // "landing" | "selection" | "dashboard"
  const [view, setView] = useState("landing");
  const [darkMode, setDarkMode] = useState(true);
  const [repoInput, setRepoInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [initialTab, setInitialTab] = useState("setup");

  const handleAnalyze = (input: string, file?: File | null) => {
    setRepoInput(input || "");
    setUploadedFile(file || null);
    setView("selection");
  };

  const handleReset = () => {
    setRepoInput("");
    setUploadedFile(null);
    setView("landing");
  };

  const handleFeatureSelect = (tabId: string) => {
    setInitialTab(tabId);
    setView("dashboard");
  };

  // Compute repoData here so FeatureSelection can also consume it
  const repoData = generateDynamicRepoData(repoInput || "");

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35 }}
          >
            <OrbitLanding
              onAnalyze={handleAnalyze}
              darkMode={darkMode}
              toggleDark={() => setDarkMode((d) => !d)}
            />
          </motion.div>
        )}

        {view === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <FeatureSelection
              repoMeta={repoData}
              onSelect={handleFeatureSelect}
              darkMode={darkMode}
              toggleDark={() => setDarkMode((d) => !d)}
            />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <Dashboard
              onBack={() => setView("selection")}
              onReset={handleReset}
              darkMode={darkMode}
              toggleDark={() => setDarkMode((d) => !d)}
              repoName={repoInput}
              uploadedFile={uploadedFile}
              initialTab={initialTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global chatbot — visible on selection + dashboard */}
      {view !== "landing" && <ChatBot darkMode={darkMode} />}
    </>
  );
}
