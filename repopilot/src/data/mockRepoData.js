export const mockRepoMeta = {
  name: "my-awesome-app",
  language: "TypeScript / Python",
  files: 42,
  stars: 1284,
  lastCommit: "2 hours ago",
  branch: "main",
  contributors: 7,
};

export const mockSetupData = {
  steps: [
    {
      id: 1,
      title: "Clone the repository",
      command: "git clone https://github.com/org/my-awesome-app.git",
      description: "Clone the project to your local machine.",
    },
    {
      id: 2,
      title: "Install Node dependencies",
      command: "npm install",
      description: "Install all required Node.js packages from package.json.",
    },
    {
      id: 3,
      title: "Install Python dependencies",
      command: "pip install -r requirements.txt",
      description: "Install all Python packages required by the backend.",
    },
    {
      id: 4,
      title: "Configure environment variables",
      command: "cp .env.example .env",
      description: "Copy the example env file and fill in your values.",
    },
    {
      id: 5,
      title: "Run database migrations",
      command: "npx prisma migrate dev",
      description: "Apply all pending database schema migrations.",
    },
    {
      id: 6,
      title: "Start the development server",
      command: "npm run dev",
      description: "Launch the Next.js development server on port 3000.",
    },
  ],
  envVars: [
    { key: "DATABASE_URL", example: "postgresql://user:pass@localhost:5432/db", required: true },
    { key: "NEXTAUTH_SECRET", example: "your-secret-key-here", required: true },
    { key: "OPENAI_API_KEY", example: "sk-...", required: true },
    { key: "REDIS_URL", example: "redis://localhost:6379", required: false },
    { key: "AWS_REGION", example: "us-east-1", required: false },
  ],
  dockerCommand: `docker compose up --build -d`,
  dockerCompose: `version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password`,
};

export const mockTestData = {
  sourceCode: `// src/utils/auth.ts
export function validateEmail(email: string): boolean {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

export function hashPassword(password: string): string {
  // bcrypt hash simulation
  if (password.length < 8) {
    throw new Error("Password too short");
  }
  return \`hashed_\${password}\`;
}

export function generateToken(userId: string): string {
  return \`token_\${userId}_\${Date.now()}\`;
}`,
  generatedTests: `// tests/utils/auth.test.ts  (Jest)
import { validateEmail, hashPassword, generateToken } from '../src/utils/auth';

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns false for missing @', () => {
    expect(validateEmail('invalidemail.com')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('hashPassword', () => {
  it('returns hashed string for valid password', () => {
    const result = hashPassword('securePass1');
    expect(result).toContain('hashed_');
  });

  it('throws error for short password', () => {
    expect(() => hashPassword('short')).toThrow('Password too short');
  });
});

describe('generateToken', () => {
  it('includes userId in token', () => {
    const token = generateToken('user123');
    expect(token).toContain('user123');
  });

  it('generates unique tokens', () => {
    const t1 = generateToken('u1');
    const t2 = generateToken('u1');
    expect(t1).not.toBe(t2);
  });
});`,
};

export const mockReadmeData = {
  markdown: `# my-awesome-app

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> An AI-powered full-stack application built with TypeScript, Python, and Next.js.

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/org/my-awesome-app.git
cd my-awesome-app
npm install && pip install -r requirements.txt
cp .env.example .env
npm run dev
\`\`\`

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Deployment | Docker, AWS ECS |

## 📁 Project Structure

\`\`\`
my-awesome-app/
├── src/          # Next.js application
├── api/          # Python FastAPI backend
├── prisma/       # Database schema
└── docker/       # Container configs
\`\`\`

## 🤝 Contributing

Pull requests are welcome. See CONTRIBUTING.md for guidelines.

## 📄 License

MIT © 2024 my-awesome-app contributors`,
};

export const mockDeadCodeData = [
  { id: 1, type: "Unused Variable", name: "legacyAuthToken", file: "src/utils/auth.ts", line: 45, confidence: 98, severity: "high" },
  { id: 2, type: "Unreachable Function", name: "deprecatedFetchUser()", file: "src/api/users.ts", line: 112, confidence: 95, severity: "high" },
  { id: 3, type: "Orphan File", name: "src/helpers/oldCache.ts", file: "src/helpers/oldCache.ts", line: null, confidence: 99, severity: "high" },
  { id: 4, type: "Unused Import", name: "import { Buffer }", file: "src/middleware/logger.ts", line: 3, confidence: 100, severity: "medium" },
  { id: 5, type: "Dead Branch", name: "if (USE_LEGACY_API)", file: "src/config/features.ts", line: 67, confidence: 88, severity: "medium" },
  { id: 6, type: "Unused Variable", name: "tempDebugFlag", file: "api/routes/health.py", line: 12, confidence: 92, severity: "low" },
  { id: 7, type: "Orphan File", name: "scripts/migrate_v1.py", file: "scripts/migrate_v1.py", line: null, confidence: 97, severity: "medium" },
  { id: 8, type: "Unreachable Function", name: "mockDataFallback()", file: "src/services/data.ts", line: 204, confidence: 85, severity: "low" },
];

export const mockDependencyData = {
  nodes: [
    { id: "root", label: "my-awesome-app", type: "root", health: "ok" },
    { id: "next", label: "next@14.2.5", type: "dep", health: "ok" },
    { id: "react", label: "react@18.3.1", type: "dep", health: "ok" },
    { id: "prisma", label: "prisma@5.16", type: "dep", health: "ok" },
    { id: "nextauth", label: "next-auth@4.24", type: "dep", health: "warning" },
    { id: "lodash", label: "lodash@4.17.19", type: "dep", health: "critical" },
    { id: "axios", label: "axios@1.7.2", type: "dep", health: "ok" },
    { id: "zod", label: "zod@3.23.8", type: "dep", health: "ok" },
    { id: "dayjs", label: "dayjs@1.11.10", type: "dep", health: "ok" },
    { id: "sharp", label: "sharp@0.33.4", type: "dep", health: "warning" },
  ],
  alerts: [
    { pkg: "lodash@4.17.19", severity: "CRITICAL", cve: "CVE-2021-23337", desc: "Prototype pollution vulnerability in lodash before 4.17.21." },
    { pkg: "next-auth@4.24", severity: "MEDIUM", cve: "CVE-2023-48309", desc: "Improper validation of email address allows auth bypass." },
    { pkg: "sharp@0.33.4", severity: "LOW", cve: "N/A", desc: "Outdated libvips dependency — upgrade to 0.33.5 recommended." },
  ],
  outdated: [
    { pkg: "lodash", current: "4.17.19", latest: "4.17.21", status: "outdated" },
    { pkg: "next-auth", current: "4.24.0", latest: "4.24.7", status: "patch" },
    { pkg: "prisma", current: "5.16.0", latest: "5.19.0", status: "minor" },
  ],
};
