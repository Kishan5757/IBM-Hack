"use client";
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
