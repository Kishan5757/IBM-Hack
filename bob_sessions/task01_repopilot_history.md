# Role: Front-End UI/UX Engineer & Rapid Prototyper

Objective:
Build a fast, interactive single-page Web Application prototype for the IBM Hackathon called "RepoPilot" (AI Repository Co-Pilot). Focus on UI animations, responsive theme switching, and instant mock interactive states for a smooth live demo presentation.

---

### Core Concept & Problem Statement
"Developers lose time on setup, testing, documentation, dead code, and dependency tracking. RepoPilot unifies these five pain points into an instant AI co-pilot workspace."

---

### UI/UX & Interactive Design Specs (Prototype Mode)

1. Landing Page / Hero Section (Opening View):
   - Title & Subtitle: "RepoPilot" - "Your AI Co-Pilot for Codebase Health".
   - Central Upload Component: A large dropzone card with a drag-and-drop icon and a text input for pasting GitHub URLs, plus a prominent "Analyze Repository" button.
   - 360-Degree Orbit Animation: Position 5 floating feature badges that continuously rotate in a slow circle around the central dropzone:
     1. Project Setup Assistant
     2. Test Generator
     3. README Automation
     4. Dead Code Detector
     5. Dependency Analyzer
   - Theme Toggle: Fixed top-right switch between Dark Mode (slate/indigo background) and Light Mode (clean gray/blue background).

2. Demo Transition:
   - Clicking "Analyze Repository" or dropping a file triggers a brief 1.5-second simulated "AI Scanning..." progress spinner, then transitions directly to the main Workspace Dashboard.

3. Workspace Dashboard (Post-Scan View):
   - Header Bar: Displays mock repo metadata ("Repo: my-awesome-app | Language: TypeScript / Python | Files: 42").
   - Navigation: Tab bar or side drawer to seamlessly switch between the 5 features:
     - Feature 1 (Setup Assistant): Displays pre-generated step-by-step setup guides, required environment variables, and Docker run commands.
     - Feature 2 (Test Generator): Side-by-side view with sample source code on the left and generated PyTest/Jest unit tests on the right with a working "Copy Code" button.
     - Feature 3 (README Generator): Split-screen markdown preview showing auto-generated badges, installation steps, and tech stack summaries with a "Download README" button.
     - Feature 4 (Dead Code Detector): A card list showing unused variables, unreachable functions, and orphan files with mock confidence scores (e.g., 95% unused).
     - Feature 5 (Dependency Analyzer): A visual interactive node map or visual tree diagram highlighting package health and security alerts.

---

### Prototype Implementation Guidelines

- Tech Stack: React / Next.js, Tailwind CSS, Lucide React icons, and Framer Motion.
- Data Flow: Hardcode all analysis outputs inside a mock JSON file (`mockRepoData.js`) so clicking around the UI feels instantaneous and reliable during a hackathon judge demonstration.
- Structure: Build lightweight component files (`/components/OrbitLanding.jsx`, `/components/Dashboard.jsx`, `/components/FeatureTabs/*.jsx`).

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: Front-End UI/UX Engineer & Rapid Prototyper

Objective:
Build a fast, interactive single-page Web Application prototype for the IBM Hackathon called "RepoPilot" (AI Repository Co-Pilot). Focus on UI animations, responsive theme switching, and instant mock interactive states for a smooth live demo presentation.

---

### Core Concept & Problem Statement
"Developers lose time on setup, testing, documentation, dead code, and dependency tracking. RepoPilot unifies these five pain points into an instant AI co-pilot workspace."

---

### UI/UX & Interactive Design Specs (Prototype Mode)

1. Landing Page / Hero Section (Opening View):
   - Title & Subtitle: "RepoPilot" - "Your AI Co-Pilot for Codebase Health".
   - Central Upload Component: A large dropzone card with a drag-and-drop icon and a text input for pasting GitHub URLs, plus a prominent "Analyze Repository" button.
   - 360-Degree Orbit Animation: Position 5 floating feature badges that continuously rotate in a slow circle around the central dropzone:
     1. Project Setup Assistant
     2. Test Generator
     3. README Automation
     4. Dead Code Detector
     5. Dependency Analyzer
   - Theme Toggle: Fixed top-right switch between Dark Mode (slate/indigo background) and Light Mode (clean gray/blue background).

2. Demo Transition:
   - Clicking "Analyze Repository" or dropping a file triggers a brief 1.5-second simulated "AI Scanning..." progress spinner, then transitions directly to the main Workspace Dashboard.

3. Workspace Dashboard (Post-Scan View):
   - Header Bar: Displays mock repo metadata ("Repo: my-awesome-app | Language: TypeScript / Python | Files: 42").
   - Navigation: Tab bar or side drawer to seamlessly switch between the 5 features:
     - Feature 1 (Setup Assistant): Displays pre-generated step-by-step setup guides, required environment variables, and Docker run commands.
     - Feature 2 (Test Generator): Side-by-side view with sample source code on the left and generated PyTest/Jest unit tests on the right with a working "Copy Code" button.
     - Feature 3 (README Generator): Split-screen markdown preview showing auto-generated badges, installation steps, and tech stack summaries with a "Download README" button.
     - Feature 4 (Dead Code Detector): A card list showing unused variables, unreachable functions, and orphan files with mock confidence scores (e.g., 95% unused).
     - Feature 5 (Dependency Analyzer): A visual interactive node map or visual tree diagram highlighting package health and security alerts.

---

### Prototype Implementation Guidelines

- Tech Stack: React / Next.js, Tailwind CSS, Lucide React icons, and Framer Motion.
- Data Flow: Hardcode all analysis outputs inside a mock JSON file (`mockRepoData.js`) so clicking around the UI feels instantaneous and reliable during a hackathon judge demonstration.
- Structure: Build lightweight component files (`/components/OrbitLanding.jsx`, `/components/Dashboard.jsx`, `/components/FeatureTabs/*.jsx`).

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Scaffold Next.js + Tailwind CSS project with required dependencies
[ ] Create mockRepoData.js with all hardcoded analysis outputs
[ ] Build OrbitLanding.jsx - Hero section with orbit animation, dropzone, theme toggle
[ ] Build Dashboard.jsx - Header bar, tab navigation, feature routing
[ ] Build FeatureTabs/SetupAssistant.jsx
[ ] Build FeatureTabs/TestGenerator.jsx
[ ] Build FeatureTabs/ReadmeGenerator.jsx
[ ] Build FeatureTabs/DeadCodeDetector.jsx
[ ] Build FeatureTabs/DependencyAnalyzer.jsx
[ ] Wire up main App/page with theme context and view transitions
[ ] Validate build passes with no errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npx create-next-app@latest repopilot --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes 2>&1 | tail -20

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npx create-next-app@latest repopilot --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — cd repopilot && npm install framer-motion lucide-react

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm install framer-motion lucide-react

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — repopilot/src

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Scaffold Next.js + Tailwind CSS project with required dependencies
[-] Create mockRepoData.js with all hardcoded analysis outputs
[ ] Build OrbitLanding.jsx - Hero section with orbit animation, dropzone, theme toggle
[ ] Build Dashboard.jsx - Header bar, tab navigation, feature routing
[ ] Build FeatureTabs/SetupAssistant.jsx
[ ] Build FeatureTabs/TestGenerator.jsx
[ ] Build FeatureTabs/ReadmeGenerator.jsx
[ ] Build FeatureTabs/DeadCodeDetector.jsx
[ ] Build FeatureTabs/DependencyAnalyzer.jsx
[ ] Wire up main App/page with theme context and view transitions
[ ] Validate build passes with no errors


### 🤖 Assistant

> 🔧 called: write_file

Now let me create all the files in parallel:

> 🔧 **write_file** — repopilot/src/data/mockRepoData.js

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Scaffold Next.js + Tailwind CSS project with required dependencies
[x] Create mockRepoData.js with all hardcoded analysis outputs
[-] Build OrbitLanding.jsx - Hero section with orbit animation, dropzone, theme toggle
[ ] Build Dashboard.jsx - Header bar, tab navigation, feature routing
[ ] Build FeatureTabs/SetupAssistant.jsx
[ ] Build FeatureTabs/TestGenerator.jsx
[ ] Build FeatureTabs/ReadmeGenerator.jsx
[ ] Build FeatureTabs/DeadCodeDetector.jsx
[ ] Build FeatureTabs/DependencyAnalyzer.jsx
[ ] Wire up main App/page with theme context and view transitions
[ ] Validate build passes with no errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — repopilot/src/components/OrbitLanding.jsx

### 🤖 Assistant

> 🔧 called: write_file

Now build all 5 feature tabs and Dashboard in parallel:

> 🔧 **write_file** — "use client";
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


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — "use client";
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


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — "use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Code2, Sparkles } from "lucide-react";
import { mockReadmeData } from "@/data/mockRepoData";

function renderMarkdown(md, darkMode) {
  const lines = md.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("# ")) {
      return <h1 key={i} className={`text-2xl font-extrabold mt-2 mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>{line.slice(2)}</h1>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={i} className={`text-lg font-bold mt-4 mb-2 border-b pb-1 ${darkMode ? "text-white border-slate-700" : "text-slate-800 border-slate-200"}`}>{line.slice(3)}</h2>;
    }
    if (line.startsWith("> ")) {
      return <blockquote key={i} className={`border-l-4 pl-3 italic my-2 text-sm ${darkMode ? "border-indigo-500 text-slate-400" : "border-indigo-400 text-slate-600"}`}>{line.slice(2)}</blockquote>;
    }
    if (line.startsWith("| ") && line.endsWith("|")) {
      if (line.replace(/\|/g, "").replace(/-/g, "").trim() === "") return null;
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      const isHeader = i > 0 && lines[i - 1]?.startsWith("| ") && !lines[i - 2]?.startsWith("| ");
      return (
        <tr key={i} className={`border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
          {cells.map((c, j) => {
            const Tag = isHeader ? "th" : "td";
            return <Tag key={j} className={`px-3 py-1.5 text-xs ${isHeader ? (darkMode ? "text-slate-300 font-semibold bg-slate-800" : "text-slate-600 font-semibold bg-slate-100") : (darkMode ? "text-slate-400" : "text-slate-600")}`}>{c}</Tag>;
          })}
        </tr>
      );
    }
    if (line.startsWith("```")) {
      return null;
    }
    if (line.startsWith("![")) {
      const alt = line.match(/\[(.+?)\]/)?.[1] || "";
      const src = line.match(/\((.+?)\)/)?.[1] || "";
      if (src.startsWith("http")) {
        return (
          <img key={i} src={src} alt={alt} className="inline-block h-5 mr-1 mt-1 rounded" onError={e => e.target.style.display = "none"} />
        );
      }
      return null;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={i} className={`ml-4 text-sm list-disc ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{line.slice(2)}</li>;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className={`text-sm my-0.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{line}</p>;
  });
}

export default function ReadmeGenerator({ darkMode }) {
  const [view, setView] = useState("preview");
  const [downloaded, setDownloaded] = useState(false);

  const download = () => {
    const blob = new Blob([mockReadmeData.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Auto-Generated README</span>
        </div>
        <div className="flex gap-2">
          <div className={`flex rounded-lg p-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
            <button onClick={() => setView("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "preview" ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button onClick={() => setView("raw")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "raw" ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}>
              <Code2 className="w-3.5 h-3.5" /> Raw
            </button>
          </div>
          <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
            <Download className="w-3.5 h-3.5" />
            {downloaded ? "Downloaded!" : "Download README"}
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700" : "border-slate-200"}`}
      >
        {view === "preview" ? (
          <div className={`p-6 min-h-64 overflow-y-auto max-h-[60vh] ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            <div className="prose max-w-none">
              {renderMarkdown(mockReadmeData.markdown, darkMode)}
            </div>
          </div>
        ) : (
          <pre className={`p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-[60vh] ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-800"}`}>
            {mockReadmeData.markdown}
          </pre>
        )}
      </motion.div>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — "use client";
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


### 🤖 Assistant

> 🔧 called: write_file, write_file



> 🔧 **write_file** — "use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Shield, RefreshCw, Package2 } from "lucide-react";
import { mockDependencyData } from "@/data/mockRepoData";

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

export default function DependencyAnalyzer({ darkMode }) {
  const [activeView, setActiveView] = useState("map");
  const [hoveredNode, setHoveredNode] = useState(null);

  const { nodes, alerts, outdated } = mockDependencyData;
  const deps = nodes.filter(n => n.id !== "root");

  // Compute positions in a circular layout
  const cx = 280, cy = 220, r = 160;
  const nodePositions = deps.map((n, i) => {
    const angle = (i / deps.length) * 2 * Math.PI - Math.PI / 2;
    return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="w-4 h-4 text-purple-500" />
          <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Dependency Health</span>
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
            <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">my-awesome</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="white" fontSize="9">-app</text>

            {/* Dependency nodes */}
            {nodePositions.map((n) => {
              const cfg = HEALTH_CONFIG[n.health];
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
                  <circle cx={n.x + 14} cy={n.y - 14} r={5} fill={HEALTH_CONFIG[n.health].color.replace("bg-", "").includes("emerald") ? "#22c55e" : HEALTH_CONFIG[n.health].color.replace("bg-", "").includes("amber") ? "#f59e0b" : "#ef4444"} />
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
                      {HEALTH_CONFIG[n.health].label}
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
          {alerts.map((a, i) => (
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
          ))}
        </motion.div>
      )}

      {activeView === "outdated" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border overflow-hidden ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
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
                  <td className={`px-4 py-3 font-mono text-xs text-emerald-500`}>{o.latest}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${o.status === "outdated" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : o.status === "minor" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — "use client";
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


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Scaffold Next.js + Tailwind CSS project with required dependencies
[x] Create mockRepoData.js with all hardcoded analysis outputs
[x] Build OrbitLanding.jsx - Hero section with orbit animation, dropzone, theme toggle
[x] Build Dashboard.jsx - Header bar, tab navigation, feature routing
[x] Build FeatureTabs/SetupAssistant.jsx
[x] Build FeatureTabs/TestGenerator.jsx
[x] Build FeatureTabs/ReadmeGenerator.jsx
[x] Build FeatureTabs/DeadCodeDetector.jsx
[x] Build FeatureTabs/DependencyAnalyzer.jsx
[-] Wire up main App/page with theme context and view transitions
[ ] Validate build passes with no errors


### 🤖 Assistant

> 🔧 called: write_file

Now wire up the main page, global CSS, and Tailwind config:

> 🔧 **write_file** — "use client";
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


### 🤖 Assistant

> 🔧 called: read_file

Now update the layout, global CSS, and Tailwind config:

> 🔧 **read_file** — repopilot/src/app/layout.tsx

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/app/globals.css

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — repopilot/src/app/layout.tsx

### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — 
@import "tailwindcss";

:root {
  --background: #020617;
  --foreground: #f8fafc;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

/* Orbit animation */
@keyframes orbit {
  from { transform: rotate(0deg) translateY(-260px) rotate(0deg); }
  to   { transform: rotate(360deg) translateY(-260px) rotate(-360deg); }
}

/* Slow spin for the dashed ring */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 40s linear infinite;
}

/* Hide scrollbar utility */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }


### 🤖 Assistant

> 🔧 called: execute_command

Now run the build to validate:

> 🔧 **execute_command** — npm run build 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Clean build. Let me start the dev server so you can preview it:

> 🔧 **execute_command** — npm run dev

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Start-Sleep -Seconds 4; Get-Content "C:\Users\kisha\AppData\Local\Temp\bob-task-outputs\ac285b6c474bed5026dbfb91f261cd61\processes\bob_execute_command_38c081f0-96d5-4fd8-bb33-419e3b493f6b.log" -Tail 10

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run dev

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Start-Sleep -Seconds 5; Get-Content "C:\Users\kisha\AppData\Local\Temp\bob-task-outputs\ac285b6c474bed5026dbfb91f261cd61\processes\bob_execute_command_2beac6ef-13a5-4326-b844-e02598ae0766.log"

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run dev -- --port 3001

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — C:\Users\kisha\AppData\Local\Temp\bob-task-outputs\ac285b6c474bed5026dbfb91f261cd61\processes\bob_execute_command_f8b7031f-abb7-47ac-a760-797bd1eccef3.log

### 🤖 Assistant

> 🔧 called: execute_command

The dev server is closing instantly — likely port 3000 is already in use. Let me check and start it properly:

> 🔧 **execute_command** — netstat -ano | Select-String ":3000" | Select-Object -First 5

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "C:\Users\kisha\OneDrive\Desktop\IBM-Hack\repopilot" -NoNewWindow; Start-Sleep -Seconds 8; Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode

### 🤖 Assistant

> 🔧 called: execute_command

The build already confirmed ✅ the project compiles cleanly. The dev server requires an interactive terminal — let's verify the build succeeds and confirm port 3000 is accessible by starting it via cmd:

> 🔧 **execute_command** — cmd /c "cd /d C:\Users\kisha\OneDrive\Desktop\IBM-Hack\repopilot && start cmd /k npx next dev"

---

### 👤 User

continue the job

---

### 🤖 Assistant

> 🔧 called: list_files

Let me check the current state and verify everything is solid before starting the dev server properly.

> 🔧 **list_files** — repopilot/src

### 🤖 Assistant

> 🔧 called: read_file

All files are in place. Let me read the OrbitLanding to verify the orbit animation positioning is correct, then do a final build check and launch:

> 🔧 **read_file** — repopilot/src/components/OrbitLanding.jsx

### 🤖 Assistant

> 🔧 called: apply_diff

The `OrbitBadge` positioning needs a fix — the inner div has conflicting `className` and inline `style` transforms, and the orbit animation needs to use a proper rotate+translate pattern so each badge starts at the correct angle. Let me fix this properly:

> 🔧 **apply_diff** — repopilot/src/components/OrbitLanding.jsx

### 🤖 Assistant

> 🔧 called: apply_diff

Now add the `orbit-counter` keyframe and fix the main `orbit` keyframe to use rotate+translate correctly (no translateY needed — we handle radius via `top` positioning):

> 🔧 **apply_diff** — repopilot/src/app/globals.css

### 🤖 Assistant

> 🔧 called: apply_diff

Now update `OrbitBadge` to pass the start angle as a CSS variable so the `orbit` keyframe starts from the right angle:

> 🔧 **apply_diff** — repopilot/src/components/OrbitLanding.jsx

### 🤖 Assistant

> 🔧 called: apply_diff

Also clean up the unused `angle` variable left in the map call:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:78
-------
          {ORBIT_FEATURES.map((feat, i) => {
            const angle = (i / ORBIT_FEATURES.length) * 360;
            return (
              <OrbitBadge key={feat.label} feature={feat} index={i} total={ORBIT_FEATURES.length} darkMode={darkMode} />
            );
          })}
=======
          {ORBIT_FEATURES.map((feat, i) => (
            <OrbitBadge key={feat.label} feature={feat} index={i} total={ORBIT_FEATURES.length} />
          ))}
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: execute_command

Now do a final build to confirm zero errors:

> 🔧 **execute_command** — npm run build 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

✅ Clean build. Now start the dev server:

> 🔧 **execute_command** — npx next dev --port 3000

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Start-Sleep -Seconds 6; Get-Content "C:\Users\kisha\AppData\Local\Temp\bob-task-outputs\ac285b6c474bed5026dbfb91f261cd61\processes\bob_execute_command_34c4b22e-40b4-47d8-8350-d51c4a76ba4b.log"

### 🤖 Assistant

> 🔧 called: execute_command

The background process exits cleanly (exit 0) which on Windows means Next.js started but the shell wrapper exits before attaching to stdout. Let me verify it's actually listening:

> 🔧 **execute_command** — Start-Sleep -Seconds 3; Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 | Select-Object StatusCode, StatusDescription

### 🤖 Assistant

> 🔧 called: update_todo_list

The background mode exits before Next.js binds. The project is fully built and ready — you just need to run it yourself in a terminal. Let me give you the exact command and also update the todo list:

> 🔧 **update_todo_list** — 
[x] Scaffold Next.js + Tailwind CSS project with required dependencies
[x] Create mockRepoData.js with all hardcoded analysis outputs
[x] Build OrbitLanding.jsx - Hero section with orbit animation, dropzone, theme toggle
[x] Build Dashboard.jsx - Header bar, tab navigation, feature routing
[x] Build FeatureTabs/SetupAssistant.jsx
[x] Build FeatureTabs/TestGenerator.jsx
[x] Build FeatureTabs/ReadmeGenerator.jsx
[x] Build FeatureTabs/DeadCodeDetector.jsx
[x] Build FeatureTabs/DependencyAnalyzer.jsx
[x] Wire up main App/page with theme context and view transitions
[x] Validate build passes with no errors


### 🤖 Assistant

All 11 tasks complete. Here's a full summary of what was built:

---

## RepoPilot — Complete ✅

**Production build:** `✓ Compiled successfully` — zero errors, zero warnings.

### To run the app
Open a terminal, navigate to the project and start the dev server:
```
cd repopilot
npm run dev
```
Then open **http://localhost:3000** in your browser.

---

### File Structure
```
repopilot/src/
├── app/
│   ├── globals.css          ← orbit + counter-rotate keyframes, spin-slow
│   ├── layout.tsx           ← "RepoPilot — AI Repository Co-Pilot" metadata
│   └── page.tsx             ← Root: AnimatePresence between landing ↔ dashboard
├── data/
│   └── mockRepoData.js      ← All hardcoded analysis data (setup, tests, readme, dead code, deps)
└── components/
    ├── OrbitLanding.jsx     ← Hero + 360° orbit badges + dropzone + scan progress
    ├── Dashboard.jsx        ← Sticky header with repo meta + 5-tab nav
    └── FeatureTabs/
        ├── SetupAssistant.jsx    ← Steps / Env Vars / Docker sub-tabs + copy buttons
        ├── TestGenerator.jsx     ← Side-by-side source ↔ generated tests + copy/regenerate
        ├── ReadmeGenerator.jsx   ← Live markdown preview ↔ raw + download button
        ├── DeadCodeDetector.jsx  ← Filtered card list with confidence bars + expandable details
        └── DependencyAnalyzer.jsx ← SVG node map + alerts table + outdated packages view
```

### Key UI Features
| Feature | Detail |
|---|---|
| **Orbit animation** | 5 gradient badges rotate around the dropzone at evenly-spaced angles; counter-rotation keeps text upright |
| **Scan progress** | Animated SVG arc fills from 0 → 100% over 1.5s, then transitions to Dashboard |
| **Dark / Light toggle** | Fixed header button, instant theme switch on both Landing and Dashboard |
| **Framer Motion transitions** | `AnimatePresence` fade+slide between Landing ↔ Dashboard and all tab switches |
| **Copy Code** | Works in TestGenerator (copies full test file) and SetupAssistant (per-command + docker) |
| **Download README** | Triggers real browser download of `README.md` via Blob URL |
| **Dependency map** | Pure SVG circular node graph with hover tooltips; health colour-coded (green/amber/red) |

### 🤖 Assistant

Previous conversation summary:

## Goal
Build a fast, interactive single-page Web Application prototype for the IBM Hackathon called **"RepoPilot"** (AI Repository Co-Pilot) — a demo-ready UI with animations, responsive theme switching, and instant mock interactive states for live judge presentation.

## Instructions
- **Role:** Front-End UI/UX Engineer & Rapid Prototyper
- **Core concept:** "Developers lose time on setup, testing, documentation, dead code, and dependency tracking. Rep

