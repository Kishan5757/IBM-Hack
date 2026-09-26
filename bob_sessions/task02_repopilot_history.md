# Role: React / Next.js Front-End Developer

Objective:
Fix two key functionality issues in the "RepoPilot" codebase:
1. Make the mock analysis data dynamic based on the entered/uploaded repository name or ZIP file so different repos show completely different results during hackathon demos.
2. Make the "RepoPilot" logo in the header clickable to navigate back to the home/landing page (resetting the app state).

---

### Required Fixes & Implementation Steps

#### Fix 1: Back to Home Navigation
- Update `src/app/page.tsx` to pass a `onReset` callback function to `<Dashboard />`.
- In `src/components/Dashboard.jsx`:
  - Make the "RepoPilot" logo/title clickable (add `cursor-pointer`, `hover:opacity-80`, and `onClick={onReset}`).
  - Add a "Upload New Repo" or "Home" button in the top header bar next to the dark mode toggle.

#### Fix 2: Dynamic Mock Data Engine
- Update `src/data/mockRepoData.js` to export a dictionary of multiple repository profiles (e.g., `defaultRepo`, `reactRepo`, `pythonRepo`, `expressRepo`) OR export a generator function `getRepoData(repoName, fileName)` that dynamically customizes:
  1. Repository Name & Primary Language (e.g., Python / Django vs TypeScript / React vs Go / Microservices).
  2. Setup Assistant steps (`pip install -r requirements.txt` vs `npm install` vs `go mod download`).
  3. Test Generator code (PyTest / Jest / Go test snippets matching the detected language).
  4. README Generator markdown badges & tech stack description.
  5. Dead Code Detector list items and file paths matching the detected stack.
  6. Dependency Analyzer nodes (e.g., `django`, `psycopg2`, `celery` for Python; `react`, `tailwind`, `framer-motion` for JS).
- Update `src/components/Dashboard.jsx` to pass the dynamically generated/selected dataset down to all 5 feature components (`SetupAssistant`, `TestGenerator`, `ReadmeGenerator`, `DeadCodeDetector`, `DependencyAnalyzer`).

---

### Instructions for Bob
Apply these modifications directly to `page.tsx`, `Dashboard.jsx`, `mockRepoData.js`, and the 5 feature tab components. Ensure smooth transition back to the landing page when resetting.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: React / Next.js Front-End Developer

Objective:
Fix two key functionality issues in the "RepoPilot" codebase:
1. Make the mock analysis data dynamic based on the entered/uploaded repository name or ZIP file so different repos show completely different results during hackathon demos.
2. Make the "RepoPilot" logo in the header clickable to navigate back to the home/landing page (resetting the app state).

---

### Required Fixes & Implementation Steps

#### Fix 1: Back to Home Navigation
- Update `src/app/page.tsx` to pass a `onReset` callback function to `<Dashboard />`.
- In `src/components/Dashboard.jsx`:
  - Make the "RepoPilot" logo/title clickable (add `cursor-pointer`, `hover:opacity-80`, and `onClick={onReset}`).
  - Add a "Upload New Repo" or "Home" button in the top header bar next to the dark mode toggle.

#### Fix 2: Dynamic Mock Data Engine
- Update `src/data/mockRepoData.js` to export a dictionary of multiple repository profiles (e.g., `defaultRepo`, `reactRepo`, `pythonRepo`, `expressRepo`) OR export a generator function `getRepoData(repoName, fileName)` that dynamically customizes:
  1. Repository Name & Primary Language (e.g., Python / Django vs TypeScript / React vs Go / Microservices).
  2. Setup Assistant steps (`pip install -r requirements.txt` vs `npm install` vs `go mod download`).
  3. Test Generator code (PyTest / Jest / Go test snippets matching the detected language).
  4. README Generator markdown badges & tech stack description.
  5. Dead Code Detector list items and file paths matching the detected stack.
  6. Dependency Analyzer nodes (e.g., `django`, `psycopg2`, `celery` for Python; `react`, `tailwind`, `framer-motion` for JS).
- Update `src/components/Dashboard.jsx` to pass the dynamically generated/selected dataset down to all 5 feature components (`SetupAssistant`, `TestGenerator`, `ReadmeGenerator`, `DeadCodeDetector`, `DependencyAnalyzer`).

---

### Instructions for Bob
Apply these modifications directly to `page.tsx`, `Dashboard.jsx`, `mockRepoData.js`, and the 5 feature tab components. Ensure smooth transition back to the landing page when resetting.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Read existing codebase to understand current structure
[ ] Update src/app/page.tsx to pass onReset callback to Dashboard
[ ] Update src/data/mockRepoData.js with dynamic getRepoData() function
[ ] Update src/components/Dashboard.jsx with clickable logo, home button, and dynamic data
[ ] Update SetupAssistant.jsx to accept and use dynamic data props
[ ] Update TestGenerator.jsx to accept and use dynamic data props
[ ] Update ReadmeGenerator.jsx to accept and use dynamic data props
[ ] Update DeadCodeDetector.jsx to accept and use dynamic data props
[ ] Update DependencyAnalyzer.jsx to accept and use dynamic data props


### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/app/page.tsx

> 🔧 **read_file** — repopilot/src/components/Dashboard.jsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/components/FeatureTabs/SetupAssistant.jsx

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/components/FeatureTabs/TestGenerator.jsx

> 🔧 **read_file** — repopilot/src/components/FeatureTabs/ReadmeGenerator.jsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/components/FeatureTabs/DeadCodeDetector.jsx

> 🔧 **read_file** — repopilot/src/components/FeatureTabs/DependencyAnalyzer.jsx

### 🤖 Assistant

> 🔧 called: glob

Now I have a complete picture. Let me check if `mockRepoData.js` exists (the feature components import from it):

> 🔧 **glob** — repopilot/src/data/*.js

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — repopilot/src/data/**/*

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Get-ChildItem -Path "repopilot/src/data" -Recurse

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/data/mockRepoData.js

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I have a full understanding of the codebase. Let me also check the `repoIntelligence.js` `getRepoData` function to understand what it returns, since `page.tsx` already uses it:

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have everything I need. The architecture is already well-set up — `repoIntelligence.js` already has the full dynamic `getRepoData()` function that `page.tsx` uses, and `Dashboard.jsx` already passes the data down. The issues are:

1. The 5 feature components still import from `mockRepoData.js` as their fallback — they should fall back to `repoIntelligence.js` data instead.
2. The "RepoPilot" logo is not clickable — needs `onReset` callback.
3. `page.tsx` needs an `onReset` prop passed to `Dashboard`.

Let me also check what `repoIntelligence.js` exports for the legacy compat, and note that the feature components import `mockSetupData`, `mockTestData`, etc. from `@/data/mockRepoData` — these should be updated to use the `repoIntelligence.js` fallbacks instead.

> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[-] Update src/app/page.tsx to pass onReset callback to Dashboard
[ ] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[ ] Update src/components/Dashboard.jsx with clickable logo and home button
[ ] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[ ] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[ ] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback


### 🤖 Assistant

> 🔧 called: apply_diff

Now let me implement all the changes. I'll do them all in parallel since they're independent:

> 🔧 **apply_diff** — repopilot/src/app/page.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[-] Update src/components/Dashboard.jsx with clickable logo and home button
[ ] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[ ] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[ ] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[ ] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — repopilot/src/components/Dashboard.jsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now update `mockRepoData.js` to re-export from `repoIntelligence.js` so all 5 feature components get the same dynamic data:

> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[x] Update src/components/Dashboard.jsx with clickable logo and home button
[-] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[ ] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[ ] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[ ] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — repopilot/src/data/mockRepoData.js

### 🤖 Assistant

> 🔧 called: update_todo_list

Now update all 5 feature components to fix their fallback imports. The `mockRepoData.js` now re-exports from `repoIntelligence.js`, but there's one mismatch: `TestGenerator` uses `mockTestData.sourceCode` and `mockTestData.generatedTests` directly, while `repoIntelligence.js` exports `mockTestData` the same way. Let me verify and then update all components:

> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[x] Update src/components/Dashboard.jsx with clickable logo and home button
[x] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[-] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[ ] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[ ] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[ ] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback


### 🤖 Assistant

> 🔧 called: execute_command

The feature components already import from `@/data/mockRepoData` and use the data as fallbacks. Since `mockRepoData.js` now re-exports from `repoIntelligence.js`, the imports will automatically pick up the dynamic fullstack data. However, I need to check that `mockTestData` exported by `repoIntelligence.js` has the right structure (it wraps `sourceCode`/`generatedTests` which `TestGenerator` expects):

Looking at line 902 of `repoIntelligence.js`: `export const mockTestData = { sourceCode: TEST_DATA.fullstack.sourceCode, generatedTests: TEST_DATA.fullstack.generatedTests }` — this matches what `TestGenerator` expects. Good.

The only remaining work is to verify the feature components' fallback usage is compatible. Since `mockRepoData.js` now just re-exports identically-named symbols from `repoIntelligence.js`, no changes are needed in the 5 feature components — their imports will resolve through the re-export chain automatically.

Let me do a quick build check to verify everything compiles:

> 🔧 **execute_command** — cd repopilot; npx tsc --noEmit 2>&1 | head -40

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npx tsc --noEmit 2>&1 | Select-Object -First 40

### 🤖 Assistant

> 🔧 called: execute_command

No TypeScript errors. Now let me verify the build succeeds:

> 🔧 **execute_command** — npx next build 2>&1 | Select-Object -Last 20

### 🤖 Assistant

> 🔧 called: update_todo_list

Build passes cleanly. Let me mark all remaining tasks complete:

> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[x] Update src/components/Dashboard.jsx with clickable logo and home button
[x] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[x] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[x] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[x] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback


### 🤖 Assistant

Build passes with zero errors. Here's a summary of every change made:

---

### Fix 1 — Back to Home Navigation

**[`page.tsx`](repopilot/src/app/page.tsx)**
- Added `handleReset()` that clears `repoInput`, `repoData`, and sets `view` back to `"landing"`.
- Passes `onReset={handleReset}` to `<Dashboard />`.

**[`Dashboard.jsx`](repopilot/src/components/Dashboard.jsx)**
- Accepts the new `onReset` prop in the function signature.
- The **RepoPilot logo** is now wrapped in a `<button onClick={onReset}>` with `cursor-pointer` and `hover:opacity-80` — clicking it navigates home.
- Added a **"New Repo"** button in the top-right header bar (next to the dark mode toggle) that also calls `onReset`. It shows the `Home` icon and a label on sm+ screens. The button is only rendered when `onReset` is provided.

---

### Fix 2 — Dynamic Mock Data Engine

**[`mockRepoData.js`](repopilot/src/data/mockRepoData.js)**
- Replaced ~215 lines of hardcoded static data with a **thin re-export shim** that forwards all 6 named exports (`mockRepoMeta`, `mockSetupData`, `mockTestData`, `mockReadmeData`, `mockDeadCodeData`, `mockDependencyData`) from `repoIntelligence.js`.
- All 5 feature components continue to import from `@/data/mockRepoData` unchanged — they now transparently receive the **fullstack profile** from `repoIntelligence.js` as their fallback, which is the same dynamic dataset that `getRepoData()` returns at runtime.
- No changes were needed in the 5 feature tab components — they already accept `data` props and fall back to the mock imports, which now resolve to the correct intelligence-layer exports.

The result is a single source of truth: `repoIntelligence.js` drives both the runtime `getRepoData(input)` call (which detects `frontend` / `backend` / `ml` / `mobile` / `cli` / `fullstack` from the repo name) and the static fallbacks used when no data prop is passed.

---

### 👤 User

run this

---

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run dev

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — C:\Users\kisha\AppData\Local\Temp\bob-task-outputs\fcef4e944da6c54fa1846c4848485df4\processes\bob_execute_command_b2a743d5-ee52-4420-b0ce-5e089660bcfd.log

### 🤖 Assistant

> 🔧 called: execute_command

Process exited immediately — likely a port conflict or missing dependency. Let me check more carefully:

> 🔧 **execute_command** — npm run dev 2>&1

---

### 👤 User

how to run this tell me

---

### 🤖 Assistant

To run the RepoPilot app:

**1. Open a terminal in the project folder:**
```
cd repopilot
```

**2. Start the dev server:**
```
npm run dev
```

**3. Open your browser and go to:**
```
http://localhost:3000
```

---

That's it. The server starts in ~1 second and is ready at `localhost:3000`.

If you hit a port conflict, you can run on a different port:
```
npm run dev -- -p 3001
```

---

### 👤 User

Role: Senior React / Next.js Full-Stack Developer

Objective:
Refactor the RepoPilot state architecture and mock data engine across all dashboard components (`Dashboard.jsx`, `mockRepoData.js`, and all 5 feature tab components) so that uploading/pasting ANY repository generates UNIQUE, context-aware data matching that specific repository name or file stack.

---

### Key Requirements

1. Dynamic Mock Data Generator (`src/data/mockRepoData.js`):
   - Replace the static object with a generator function `generateDynamicRepoData(repoName, inputType)`:
     - Derive repo traits using a hash/string parser on `repoName`:
       - If `repoName` contains "django", "flask", "python", or ends in `.py`: set language to "Python", generate `requirements.txt` setup steps, PyTest test cases, and Python dependency nodes (`django`, `celery`, `psycopg2`).
       - If `repoName` contains "react", "next", "vue", "frontend", or standard JS/TS names: set language to "TypeScript / Next.js", generate `npm install` setup steps, Jest/Vitest unit tests, and npm dependency nodes (`react`, `tailwind`, `framer-motion`).
       - Fallback: Deterministically hash the `repoName` string to pick unique language combinations, file counts, dead code ratios, dependency trees, and generated README badges.

2. Dashboard State Flow (`src/components/Dashboard.jsx` & `src/app/page.tsx`):
   - Update `page.tsx` to pass the user's uploaded `fileName` or pasted `repoUrl` down to `<Dashboard />`.
   - Inside `Dashboard.jsx`, initialize state with `const repoData = useMemo(() => generateDynamicRepoData(activeRepoName), [activeRepoName])`.
   - Pass `repoData` as a prop into all 5 tab components:
     - `<SetupAssistant data={repoData.setup} />`
     - `<TestGenerator data={repoData.testing} />`
     - `<ReadmeGenerator data={repoData.readme} />`
     - `<DeadCodeDetector data={repoData.deadCode} />`
     - `<DependencyAnalyzer data={repoData.dependencies} />`

3. Wire Feature Tab Props:
   - Update `SetupAssistant.jsx`, `TestGenerator.jsx`, `ReadmeGenerator.jsx`, `DeadCodeDetector.jsx`, and `DependencyAnalyzer.jsx` to consume props from `Dashboard.jsx` instead of importing static fallback objects directly.

4. Header Logo Navigation:
   - In `Dashboard.jsx`, bind an `onClick` event to the `RepoPilot` header logo/brand text that calls `onReset()` to return to `OrbitLanding.jsx`.

---

### Implementation Target
Modify `mockRepoData.js`, `Dashboard.jsx`, `page.tsx`, and the 5 feature components in `src/components/FeatureTabs/`. Do not leave static fallback imports in place.

---

### 🤖 Assistant

> 🔧 called: read_file, read_file

Let me read all the current files before making any changes.

> 🔧 **read_file** — repopilot/src/app/page.tsx

> 🔧 **read_file** — repopilot/src/components/Dashboard.jsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — repopilot/src/components/OrbitLanding.jsx

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me read the full `repoIntelligence.js` to understand the complete data shape before rewriting it:

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have everything. Here's the full picture of what needs to happen:

1. **`repoIntelligence.js`** — Replace `getRepoData()` with `generateDynamicRepoData(repoName)` that: (a) uses the existing type detection, (b) **stamps the actual user-supplied repo name** into the meta/README/dependency root node, and (c) deterministically mutates stars/files/contributors from a string hash so every unique name gives unique numbers.
2. **`page.tsx`** — Switch import from `getRepoData` → `generateDynamicRepoData`, pass `repoInput` down to `Dashboard` as `repoName`.
3. **`Dashboard.jsx`** — Add `useMemo` to re-generate data from `repoName` prop; remove dependency on the externally-computed `repoData` prop for the tab data (use the memoized local copy).
4. **Feature components** — Remove all static fallback imports; accept only the `data` prop.

> 🔧 **update_todo_list** — 
[-] Rewrite repoIntelligence.js: add generateDynamicRepoData, stamp real repo name, deterministic hash mutations
[ ] Update page.tsx: switch to generateDynamicRepoData, pass repoName to Dashboard
[ ] Update Dashboard.jsx: useMemo on repoName, remove static repoData prop dependency for tabs
[ ] Strip static fallback imports from all 5 feature tab components
[ ] Build validation


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[x] Update src/components/Dashboard.jsx with clickable logo and home button
[x] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[x] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[x] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[x] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback
[-] Rewrite repoIntelligence.js: add generateDynamicRepoData, stamp real repo name, deterministic hash mutations
[ ] Update page.tsx: switch to generateDynamicRepoData, pass repoName to Dashboard
[ ] Update Dashboard.jsx: useMemo on repoName, remove static repoData prop dependency for tabs
[ ] Strip static fallback imports from all 5 feature tab components
[ ] Build validation


### 🤖 Assistant

> 🔧 called: write_file

Now write the new `repoIntelligence.js` with `generateDynamicRepoData`:

> 🔧 **write_file** — repopilot/src/data/repoIntelligence.js

### 🤖 Assistant

> 🔧 called: apply_diff

Now update `page.tsx` to pass `repoInput` (the raw input string) down to Dashboard as `repoName`:

> 🔧 **apply_diff** — repopilot/src/app/page.tsx

### 🤖 Assistant

> 🔧 called: apply_diff

Now update `Dashboard.jsx` to use `useMemo` on `repoName` and remove the external `repoData` prop:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:1
-------
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
=======
"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:20
-------
} from "lucide-react";
import SetupAssistant from "./FeatureTabs/SetupAssistant";
=======
} from "lucide-react";
import { generateDynamicRepoData } from "@/data/repoIntelligence";
import SetupAssistant from "./FeatureTabs/SetupAssistant";
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:51
-------
export default function Dashboard({ onBack, onReset, darkMode, toggleDark, repoData, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "setup");

  const tab = TABS.find((t) => t.id === activeTab);
  const meta = repoData?.meta || {};

  const components = {
    setup: <SetupAssistant darkMode={darkMode} data={repoData?.setup} />,
    tests: <TestGenerator darkMode={darkMode} data={repoData?.tests} />,
    readme: <ReadmeGenerator darkMode={darkMode} data={repoData?.readme} />,
    deadcode: <DeadCodeDetector darkMode={darkMode} data={repoData?.deadCode} />,
    deps: <DependencyAnalyzer darkMode={darkMode} data={repoData?.dependencies} />,
  };
=======
export default function Dashboard({ onBack, onReset, darkMode, toggleDark, repoName, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "setup");

  const repoData = useMemo(() => generateDynamicRepoData(repoName || ""), [repoName]);

  const tab = TABS.find((t) => t.id === activeTab);
  const meta = repoData.meta;

  const components = {
    setup: <SetupAssistant darkMode={darkMode} data={repoData.setup} />,
    tests: <TestGenerator darkMode={darkMode} data={repoData.tests} />,
    readme: <ReadmeGenerator darkMode={darkMode} data={repoData.readme} />,
    deadcode: <DeadCodeDetector darkMode={darkMode} data={repoData.deadCode} />,
    deps: <DependencyAnalyzer darkMode={darkMode} data={repoData.dependencies} />,
  };
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff

Now strip static fallback imports from all 5 feature tab components in one batch:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:5
-------
import { mockSetupData } from "@/data/mockRepoData";

export default function SetupAssistant({ darkMode, data }) {
  const [activeTab, setActiveTab] = useState("steps");
  const [copiedId, setCopiedId] = useState(null);

  // Use intelligent data if provided, fall back to mock
  const setup = data || mockSetupData;
=======
export default function SetupAssistant({ darkMode, data }) {
  const [activeTab, setActiveTab] = useState("steps");
  const [copiedId, setCopiedId] = useState(null);

  const setup = data;
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:5
-------
import { mockTestData } from "@/data/mockRepoData";

export default function TestGenerator({ darkMode, data }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Use intelligent data if provided, fall back to mock
  const tests = data || { sourceCode: mockTestData.sourceCode, generatedTests: mockTestData.generatedTests, framework: "Jest · TypeScript", stats: [
    { label: "Test Cases", value: "8", color: "indigo" },
    { label: "Coverage Target", value: "94%", color: "emerald" },
    { label: "Edge Cases", value: "3", color: "amber" },
  ]};
=======
export default function TestGenerator({ darkMode, data }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const tests = data;
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:5
-------
import { mockReadmeData } from "@/data/mockRepoData";

function renderMarkdown(md, darkMode) {
=======
function renderMarkdown(md, darkMode) {
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:50
-------
  // Use intelligent data if provided, fall back to mock
  const readme = data || mockReadmeData;
=======
  const readme = data;
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:5
-------
import { mockDeadCodeData } from "@/data/mockRepoData";

const TYPE_ICONS = {
=======
const TYPE_ICONS = {
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:30
-------
export default function DeadCodeDetector({ darkMode, data }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  // Use intelligent data if provided, fall back to mock
  const deadCodeData = data || mockDeadCodeData;
=======
export default function DeadCodeDetector({ darkMode, data }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const deadCodeData = data;
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:5
-------
import { mockDependencyData } from "@/data/mockRepoData";

const HEALTH_CONFIG = {
=======
const HEALTH_CONFIG = {
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:27
-------
export default function DependencyAnalyzer({ darkMode, data }) {
  const [activeView, setActiveView] = useState("map");
  const [hoveredNode, setHoveredNode] = useState(null);

  // Use intelligent data if provided, fall back to mock
  const depData = data || mockDependencyData;
=======
export default function DependencyAnalyzer({ darkMode, data }) {
  const [activeView, setActiveView] = useState("map");
  const [hoveredNode, setHoveredNode] = useState(null);

  const depData = data;
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: execute_command

Now run the build to validate everything:

> 🔧 **execute_command** — npx next build 2>&1 | Select-Object -Last 25

### 🤖 Assistant

> 🔧 called: update_todo_list

Clean build. Let me mark everything done:

> 🔧 **update_todo_list** — 
[x] Read existing codebase to understand current structure
[x] Update src/app/page.tsx to pass onReset callback to Dashboard
[x] Update src/components/Dashboard.jsx with clickable logo and home button
[x] Update src/data/mockRepoData.js to re-export from repoIntelligence.js so feature components get consistent data
[x] Update SetupAssistant.jsx to fix import to use repoIntelligence fallback
[x] Update TestGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update ReadmeGenerator.jsx to fix import to use repoIntelligence fallback
[x] Update DeadCodeDetector.jsx to fix import to use repoIntelligence fallback
[x] Update DependencyAnalyzer.jsx to fix import to use repoIntelligence fallback
[x] Rewrite repoIntelligence.js: add generateDynamicRepoData, stamp real repo name, deterministic hash mutations
[x] Update page.tsx: switch to generateDynamicRepoData, pass repoName to Dashboard
[x] Update Dashboard.jsx: useMemo on repoName, remove static repoData prop dependency for tabs
[x] Strip static fallback imports from all 5 feature tab components
[x] Build validation


### 🤖 Assistant

Clean build, zero warnings. Here's a precise account of every change made:

---

### `repoIntelligence.js` — Complete rewrite as a generator engine

**`generateDynamicRepoData(rawInput)`** is now the single entry point. For every unique input it:

- **`extractRepoName()`** — strips `.zip`/`.tar.gz`, GitHub URL paths, and query strings to get a clean display name (e.g. `github.com/acme/django-blog` → `django-blog`).
- **`detectRepoType()`** — keyword-matches the raw input; Python/Django/Flask keywords now take priority so `django-blog.zip` reliably returns `backend`.
- **`hashStr()` + `pick()`** — djb2 hash on the display name seeds deterministic-but-varied values for `files`, `stars`, `contributors`, and `lastCommit`. Every unique repo name produces a unique set of numbers that stays stable across page refreshes.
- **`PROFILES[type]`** — a compact object per type carrying the install command, start command, badge colors, tech stack rows, env vars, docker port, and dependency node/alert/outdated arrays as functions of `name`. The root dependency node label is set to the actual repo name.
- **`buildTestData(type, repoName)`** and **`buildDeadCode(type, repoName)`** — inject the real repo name into every file path, comment, and import string in the generated test and dead-code data.
- **README markdown** — built inline from `PROFILES` data using the actual `displayName` in the `#` heading, badges, quick start commands, and git clone URL.
- **`getRepoData()`** — kept as a backwards-compat alias that delegates to `generateDynamicRepoData`.
- **Legacy named exports** — `mockSetupData` etc. are now derived from `generateDynamicRepoData("")` (fullstack default), so `mockRepoData.js`'s re-export shim still works.

---

### `page.tsx`

- Imports `generateDynamicRepoData` instead of `getRepoData`.
- Drops the separate `repoData` state — `repoData` is now a plain derived value computed from `repoInput` on every render (cheap, pure).
- Passes **`repoName={repoInput}`** to `<Dashboard />` instead of the pre-computed object, so Dashboard owns its own memoization.

---

### `Dashboard.jsx`

- Accepts **`repoName`** prop (the raw input string) instead of `repoData`.
- `const repoData = useMemo(() => generateDynamicRepoData(repoName || ""), [repoName])` — data is regenerated only when the repo input changes.
- All 5 tab components receive **`data={repoData.<section>}`** — no optional chaining needed since `generateDynamicRepoData` always returns a fully-formed object.

---

### All 5 feature tab components

- **`import { mock* } from "@/data/mockRepoData"`** lines removed entirely.
- `const x = data || mockX` fallback replaced with `const x = data` — props are always present now, no static fallback needed.