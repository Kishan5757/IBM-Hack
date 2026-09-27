# 🚀 RepoPilot

### AI-Powered Repository Health & Developer Assistant

> **Give RepoPilot your repository. Understand what needs attention and what to do next.**

RepoPilot is an AI-powered developer tool that analyzes software repositories and turns complex codebases into a structured, actionable health report.

It helps developers understand **setup requirements, dependencies, documentation, testing, and potential code-quality issues** from one centralized workspace.

---

## 🎯 Problem

Developers often spend significant time understanding and maintaining unfamiliar or evolving codebases.

Common problems include:

- Incomplete or outdated setup instructions
- Difficult-to-understand dependency structures
- Missing or insufficient documentation
- Lack of tests for important parts of a project
- Potentially unused code and files
- Scattered information across many project files
- Difficulty knowing which issues should be addressed first

These problems make onboarding, maintenance, debugging, and development slower and more error-prone.

---

## 💡 Solution

**RepoPilot** analyzes a repository and organizes its findings into five developer-focused areas:

1. ⚙️ **Setup Assistant**
2. 📦 **Dependency Analyzer**
3. 📖 **README Generator**
4. 🧪 **Test Generator**
5. 🧹 **Dead Code Detector**

Instead of forcing developers to manually inspect dozens of files, RepoPilot creates a centralized analysis workspace with repository-specific findings and recommendations.

---

## ✨ Features

### ⚙️ Setup Assistant

Analyzes the repository to identify:

- Runtime and framework requirements
- Package manager and installation commands
- Development and build scripts
- Environment variables
- Configuration requirements
- Setup steps
- Docker-related information where available

The result is a practical setup checklist for getting the project running.

---

### 📦 Dependency Analyzer

Examines the project's dependency manifests and provides information about:

- Production dependencies
- Development dependencies
- Dependency categories
- Potentially unnecessary dependencies
- Dependency-related issues
- Version and maintenance signals where supported

The goal is to make the project's dependency structure easier to understand.

---

### 📖 README Generator

Analyzes the existing README and repository information to identify documentation gaps.

RepoPilot can provide:

- README quality analysis
- Missing documentation sections
- Installation information
- Usage information
- Technology stack information
- Feature descriptions
- Deployment information
- An improved README draft

The generated content is based on the repository information available to RepoPilot rather than being a generic template.

---

### 🧪 Test Generator

Analyzes the repository's source and test files to identify areas that may require additional testing.

It can provide:

- Detected testing framework
- Existing test files
- Potentially untested areas
- Testing recommendations
- Example test code appropriate to the detected technology

RepoPilot avoids claiming exact test coverage unless actual coverage information is available.

---

### 🧹 Dead Code Detector

Examines source files and identifies potential code-quality issues such as:

- Potentially unused imports
- Potentially unused variables
- Potentially unused files
- Unreachable-looking code
- TODO/FIXME areas
- Other code-quality signals

Findings are presented as **potential issues requiring developer review**, rather than claiming that code is definitely unused without sufficient evidence.

---

## 🧠 AI Architecture

RepoPilot uses a provider-based AI architecture.

```text
                    Repository
                        │
                        ▼
              Repository Extraction
                        │
                        ▼
             Sanitization & Selection
                        │
                        ▼
                  AI Service
                   /        \
                  /          \
                 ▼            ▼
        Gemini 2.5 Flash   Rule Engine
            Primary          Fallback
                 \            /
                  \          /
                   ▼        ▼
                Structured
                 Analysis
                     │
                     ▼
              RepoPilot Dashboard
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Setup        Dependencies   Documentation
       │             │             │
       └─────────────┼─────────────┘
                     │
             Testing / Code Health
```

## 🏗️ Project Structure

```text
IBM-Hack/
│
├── bob_sessions/
│   ├── task01_repopilot_history.md
│   ├── task01_repopilot_summary.png
│   ├── task02_repopilot_history.md
│   ├── task02_repopilot_summary.png
│   ├── task03_repopilot_history.md
│   ├── task03_repopilot_apiintegration.png
│   ├── task04_repopilot_history.md
│   ├── task04_repopilot_summary.png
│   ├── task05_repopilot_history.md
│   └── task05_repopilot_summary.png
│
└── repopilot/
    │
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   └── analyze-repository/
    │   │   │       └── route.js
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── components/
    │   │   ├── ChatBot.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── FeatureSelection.jsx
    │   │   ├── OrbitLanding.jsx
    │   │   └── FeatureTabs/
    │   │       ├── DeadCodeDetector.jsx
    │   │       ├── DependencyAnalyzer.jsx
    │   │       ├── ReadmeGenerator.jsx
    │   │       ├── SetupAssistant.jsx
    │   │       └── TestGenerator.jsx
    │   │
    │   ├── data/
    │   │   ├── mockRepoData.js
    │   │   └── repoIntelligence.js
    │   │
    │   ├── lib/
    │   │   └── ai/
    │   │       ├── AIService.js
    │   │       ├── GeminiProvider.js
    │   │       ├── HuggingFaceProvider.js
    │   │       ├── LocalAIProvider.js
    │   │       ├── RuleBasedProvider.js
    │   │       ├── index.js
    │   │       ├── promptBuilder.js
    │   │       ├── responseNormalizer.js
    │   │       └── schemas.js
    │   │
    │   ├── lib/
    │   │   └── geminiService.js
    │   │
    │   └── utils/
    │       └── repoExtractor.js
    │
    ├── .env.local.example
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    └── vercel.json
```
