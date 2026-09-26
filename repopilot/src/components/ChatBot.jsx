"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";

// ─── Knowledge base ───────────────────────────────────────────────
const KB = [
  // Navigation
  { q: ["how do i navigate", "how to navigate", "where to go", "how to use", "guide me"], a: "Use the **tab bar** at the top of the workspace to switch between the 5 features. Click any feature tab (Setup, Tests, README, Dead Code, Deps) to instantly load that feature's analysis. You can also go back to the home screen with the ← button." },
  { q: ["what is this", "what does repopilot do", "what is repopilot", "explain repopilot", "what does this app do", "purpose"], a: "**RepoPilot** is an AI-powered repository co-pilot that analyzes any GitHub repository and gives you 5 instant insights: setup guides, auto-generated tests, README automation, dead code detection, and dependency vulnerability scanning." },

  // Features
  { q: ["setup assistant", "what is setup", "setup guide", "how to set up", "project setup"], a: "The **Setup Assistant** auto-generates step-by-step setup instructions tailored to your repo's stack. It detects whether you're using Node.js, Python, Docker, etc., and produces the exact commands, environment variables, and docker-compose config you need." },
  { q: ["test generator", "what is test", "generate tests", "unit tests", "pytest", "jest"], a: "The **Test Generator** analyzes your source files and generates unit tests using the appropriate framework (Jest for TypeScript/JS, PyTest for Python, React Testing Library for React components). The tests cover happy paths, edge cases, and error scenarios." },
  { q: ["readme", "readme generator", "documentation", "what is readme automation"], a: "The **README Generator** creates a polished README.md with tech stack badges, quick-start commands, project structure, and contribution guidelines — all inferred from your repository's code and configuration files. You can download it as a `.md` file instantly." },
  { q: ["dead code", "unused code", "dead code detector", "orphan files", "unused variables"], a: "The **Dead Code Detector** scans your codebase for unused variables, unreachable functions, orphaned files, unused imports, and dead branches. Each issue has a confidence score (0–100%) and severity level (high/medium/low) to help you prioritize cleanup." },
  { q: ["dependency", "dependencies", "packages", "vulnerabilities", "cve", "security", "outdated"], a: "The **Dependency Analyzer** builds a visual node map of your packages, flags CVE security vulnerabilities with severity levels (CRITICAL/MEDIUM/LOW), and shows a table of outdated dependencies with the latest available versions." },

  // Intelligence
  { q: ["different repos", "smart", "intelligent", "how does it know", "how does it detect", "repo type"], a: "RepoPilot detects your **repo type** by scanning the URL or filename for keywords. It recognizes: React/Next.js frontends, FastAPI/Django backends, ML/PyTorch projects, React Native mobile apps, and CLI tools — then serves customized analysis for each type." },
  { q: ["how accurate", "accuracy", "confidence", "how reliable", "how good"], a: "RepoPilot uses pattern matching and static analysis heuristics. Dead code confidence scores range from 80–100%. For live repos, you'd connect an LLM like IBM Granite for even deeper analysis. In this demo, all data is intelligently tailored to your repo type." },

  // Technical
  { q: ["copy code", "how to copy", "copy button"], a: "Every code block and command in RepoPilot has a **Copy** button (📋 icon) in the top-right corner. Click it to copy the content to your clipboard — great for commands, tests, and the README markdown." },
  { q: ["download readme", "how to download", "export"], a: "In the **README Generator** tab, click the **Download README** button in the top-right. It saves a `README.md` file directly to your downloads folder — ready to drop into your repository." },
  { q: ["theme", "dark mode", "light mode", "toggle theme"], a: "Use the **☀️/🌙 toggle** in the top-right corner of any page to switch between dark and light mode. RepoPilot remembers your preference for the session." },
  { q: ["back", "home", "return", "go back"], a: "Click the **← arrow** (top-left of the dashboard) to return to the home screen where you can analyze a new repository." },

  // General
  { q: ["hello", "hi", "hey", "what's up", "good morning"], a: "👋 Hi! I'm **PilotBot**, your RepoPilot assistant. Ask me anything about how to navigate the app, what each feature does, or how the AI analysis works!" },
  { q: ["thank", "thanks", "great", "awesome", "cool", "nice"], a: "You're welcome! 😊 Let me know if you have more questions about RepoPilot." },
  { q: ["help", "what can you do", "what can i ask", "commands"], a: "I can help with:\n- 🗺️ **Navigation** — how to use the app\n- 🔧 **Features** — what each tab does\n- 🤖 **AI intelligence** — how repo detection works\n- 📋 **Actions** — copying, downloading, theming\n\nJust ask in natural language!" },
];

function getReply(input) {
  const text = input.toLowerCase().trim();
  for (const entry of KB) {
    if (entry.q.some((kw) => text.includes(kw))) {
      return entry.a;
    }
  }
  return "I'm not sure about that specific question 🤔. Try asking about a **feature** (setup, tests, README, dead code, dependencies), **navigation**, or **how the AI works**. Type `help` to see what I can answer!";
}

// Simple markdown bold renderer
function renderBotText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

const QUICK_PROMPTS = [
  "What is RepoPilot?",
  "How does repo detection work?",
  "What is the Dead Code Detector?",
  "How do I download my README?",
];

export default function ChatBot({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "bot",
      text: "👋 Hi! I'm **PilotBot** — your AI guide for RepoPilot. Ask me anything about features, navigation, or how the analysis works!",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(msg);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply }]);
      setTyping(false);
      if (!open) setUnread((n) => n + 1);
    }, 600 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          darkMode
            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
            : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
        style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.5)" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={open ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              darkMode
                ? "bg-slate-900/95 border border-slate-700"
                : "bg-white/95 border border-slate-200"
            }`}
            style={{ backdropFilter: "blur(20px)", maxHeight: "70vh" }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">PilotBot</p>
                  <p className="text-[10px] text-indigo-200">AI Navigation Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : darkMode
                        ? "bg-slate-800 text-slate-200 rounded-bl-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <span className="whitespace-pre-line">{renderBotText(msg.text)}</span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className={`rounded-2xl rounded-bl-sm px-3 py-2 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className={`px-3 pt-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 ${darkMode ? "border-t border-slate-700/50" : "border-t border-slate-100"}`}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all ${
                    darkMode
                      ? "border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                      : "border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className={`p-3 flex-shrink-0 ${darkMode ? "border-t border-slate-700/50" : "border-t border-slate-100"}`}>
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                darkMode ? "bg-slate-800 border-slate-600 focus-within:border-indigo-500" : "bg-slate-50 border-slate-200 focus-within:border-indigo-400"
              }`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask PilotBot anything..."
                  className={`flex-1 bg-transparent text-xs outline-none placeholder:text-slate-500 ${darkMode ? "text-white" : "text-slate-900"}`}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    input.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : darkMode ? "bg-slate-700 text-slate-600" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
