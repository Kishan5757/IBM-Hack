"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Code2, Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";

function renderMarkdown(md, darkMode) {
  if (!md) return <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>No README content available.</p>;
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
    if (line.startsWith("```")) return null;
    if (line.startsWith("![")) {
      const alt = line.match(/\[(.+?)\]/)?.[1] || "";
      const src = line.match(/\((.+?)\)/)?.[1] || "";
      if (src.startsWith("http")) {
        return <img key={i} src={src} alt={alt} className="inline-block h-5 mr-1 mt-1 rounded" onError={e => e.target.style.display = "none"} />;
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

export default function ReadmeGenerator({ darkMode, data }) {
  const [view, setView] = useState("preview");
  const [downloaded, setDownloaded] = useState(false);

  const readme = data || {};
  const markdown = readme.markdown || readme.generatedMarkdown || "";
  const qualityScore = readme.qualityScore;
  const missingSections = readme.missingSections || [];
  const issues = readme.issues || [];

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const scoreColor = qualityScore == null ? "text-slate-400"
    : qualityScore >= 75 ? "text-emerald-500"
    : qualityScore >= 45 ? "text-amber-500"
    : "text-rose-500";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>AI-Generated README</span>
          </div>
          {qualityScore != null && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
              qualityScore >= 75
                ? (darkMode ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                : qualityScore >= 45
                ? (darkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")
                : (darkMode ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700")
            }`}>
              <span className={`font-bold ${scoreColor}`}>{qualityScore}</span>
              <span>/100 quality</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className={`flex rounded-lg p-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
            <button onClick={() => setView("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "preview" ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button onClick={() => setView("raw")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "raw" ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}>
              <Code2 className="w-3.5 h-3.5" /> Raw
            </button>
            {(missingSections.length > 0 || issues.length > 0) && (
              <button onClick={() => setView("issues")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === "issues" ? "bg-indigo-600 text-white" : (darkMode ? "text-slate-400 hover:text-white" : "text-slate-600")}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> Issues {missingSections.length + issues.length > 0 && <span className="ml-0.5 bg-amber-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[9px]">{missingSections.length + issues.length}</span>}
              </button>
            )}
          </div>
          <button onClick={download} disabled={!markdown} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
        {view === "preview" && (
          <div className={`p-6 min-h-64 overflow-y-auto max-h-[60vh] ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            <div className="prose max-w-none">
              {renderMarkdown(markdown, darkMode)}
            </div>
          </div>
        )}

        {view === "raw" && (
          <pre className={`p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-[60vh] ${darkMode ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-800"}`}>
            {markdown || "No README content available."}
          </pre>
        )}

        {view === "issues" && (
          <div className={`p-5 space-y-4 overflow-y-auto max-h-[60vh] ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            {missingSections.length > 0 && (
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Missing Sections</p>
                <div className="space-y-1.5">
                  {missingSections.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${darkMode ? "bg-amber-500/8 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {issues.length > 0 && (
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Documentation Issues</p>
                <div className="space-y-1.5">
                  {issues.map((issue, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-400" />
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {missingSections.length === 0 && issues.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                No documentation issues detected.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
