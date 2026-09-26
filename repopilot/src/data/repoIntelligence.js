/**
 * repoIntelligence.js
 *
 * Generates fully dynamic, context-aware analysis data for any repo name or
 * uploaded filename.  Every unique input produces unique numbers (via a
 * deterministic string hash) while the language / framework profile is picked
 * by keyword detection.
 */

// ─── Deterministic string hash (djb2) ───────────────────────────────────────

function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

/** Pick a pseudo-random integer in [min, max] seeded by a hash + salt. */
function pick(hash, salt, min, max) {
  return min + ((hash * (salt + 1)) % (max - min + 1));
}

/** Extract a short display name from a URL or filename. */
function extractRepoName(input) {
  if (!input) return "my-repo";
  // Strip .zip / .tar.gz / common extensions
  let name = input.replace(/\.(zip|tar\.gz|tgz|tar|gz)$/i, "");
  // If it looks like a URL, take the last path segment
  if (name.includes("/")) name = name.split("/").filter(Boolean).pop() || name;
  // Strip query strings
  name = name.split("?")[0].split("#")[0];
  return name || "my-repo";
}

// ─── Repo type detection ─────────────────────────────────────────────────────

export function detectRepoType(input = "") {
  const s = (input || "").toLowerCase();

  if (/django|flask|fastapi|\.py$|python|requirements\.txt/.test(s))
    return "backend";
  if (/react|next|vue|svelte|nuxt|gatsby|angular|vite|tailwind|frontend|ui|webapp/.test(s))
    return "frontend";
  if (/express|rails|spring|laravel|nest|backend|api|server/.test(s))
    return "backend";
  if (/ml|machine.?learning|pytorch|tensorflow|sklearn|keras|model|predict|dataset|notebook/.test(s))
    return "ml";
  if (/mobile|react.?native|flutter|expo|android|ios|swift|kotlin/.test(s))
    return "mobile";
  if (/cli|terminal|tool|script|util|devtool|automation|bash|shell/.test(s))
    return "cli";

  return "fullstack";
}

// ─── Profile templates (language, badges, commands keyed by type) ────────────

const PROFILES = {
  frontend: {
    language: "TypeScript / React",
    installCmd: "npm install",
    startCmd: "npm run dev",
    testFramework: "Jest · React Testing Library",
    badgeColor: "3178C6",
    badgeLogo: "typescript",
    badgeLabel: "TypeScript",
    extraBadges: `![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)`,
    stackRows: [
      ["UI Framework", "React 18, TypeScript"],
      ["Styling", "Tailwind CSS 3"],
      ["State", "Zustand"],
      ["Routing", "React Router v6"],
      ["Build", "Vite / Next.js"],
    ],
    envVars: [
      { key: "NEXT_PUBLIC_API_URL", example: "https://api.example.com", required: true },
      { key: "NEXTAUTH_SECRET", example: "your-secret-key", required: true },
      { key: "NEXT_PUBLIC_GA_ID", example: "G-XXXXXXXXXX", required: false },
    ],
    dockerPort: "3000:3000",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "react", label: "react@18.3.1", type: "dep", health: "ok" },
      { id: "typescript", label: "typescript@5.4.5", type: "dep", health: "ok" },
      { id: "tailwind", label: "tailwindcss@3.4.3", type: "dep", health: "ok" },
      { id: "framer", label: "framer-motion@11.1.9", type: "dep", health: "ok" },
      { id: "zustand", label: "zustand@4.5.2", type: "dep", health: "ok" },
      { id: "lodash", label: "lodash@4.17.19", type: "dep", health: "critical" },
      { id: "axios", label: "axios@1.6.8", type: "dep", health: "warning" },
    ],
    depAlerts: [
      { pkg: "lodash@4.17.19", severity: "CRITICAL", cve: "CVE-2021-23337", desc: "Prototype pollution — upgrade to 4.17.21." },
      { pkg: "axios@1.6.8", severity: "MEDIUM", cve: "CVE-2023-45857", desc: "CSRF via XSRF-TOKEN — upgrade to 1.7.0+." },
    ],
    depOutdated: [
      { pkg: "lodash", current: "4.17.19", latest: "4.17.21", status: "outdated" },
      { pkg: "axios", current: "1.6.8", latest: "1.7.2", status: "patch" },
      { pkg: "tailwindcss", current: "3.4.3", latest: "3.4.4", status: "patch" },
    ],
  },

  backend: {
    language: "Python / FastAPI",
    installCmd: "pip install -r requirements.txt",
    startCmd: "uvicorn app.main:app --reload --port 8000",
    testFramework: "PyTest · FastAPI TestClient",
    badgeColor: "3776AB",
    badgeLogo: "python",
    badgeLabel: "Python",
    extraBadges: `![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)`,
    stackRows: [
      ["Framework", "FastAPI 0.111"],
      ["ORM", "SQLAlchemy 2.0 + Alembic"],
      ["Database", "PostgreSQL 15"],
      ["Auth", "JWT / OAuth2"],
      ["Deployment", "Docker + Nginx"],
    ],
    envVars: [
      { key: "DATABASE_URL", example: "postgresql://user:pass@localhost:5432/db", required: true },
      { key: "SECRET_KEY", example: "your-jwt-secret-key", required: true },
      { key: "REDIS_URL", example: "redis://localhost:6379/0", required: false },
      { key: "CORS_ORIGINS", example: "http://localhost:3000", required: false },
    ],
    dockerPort: "8000:8000",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "fastapi", label: "fastapi@0.111.0", type: "dep", health: "ok" },
      { id: "sqlalchemy", label: "sqlalchemy@2.0.29", type: "dep", health: "ok" },
      { id: "alembic", label: "alembic@1.13.1", type: "dep", health: "ok" },
      { id: "pydantic", label: "pydantic@2.7.1", type: "dep", health: "ok" },
      { id: "cryptography", label: "cryptography@41.0.3", type: "dep", health: "critical" },
      { id: "requests", label: "requests@2.31.0", type: "dep", health: "warning" },
      { id: "celery", label: "celery@5.3.6", type: "dep", health: "ok" },
      { id: "psycopg2", label: "psycopg2@2.9.9", type: "dep", health: "ok" },
    ],
    depAlerts: [
      { pkg: "cryptography@41.0.3", severity: "CRITICAL", cve: "CVE-2024-26130", desc: "NULL pointer dereference in PKCS12 — upgrade to 42.0.4+." },
      { pkg: "requests@2.31.0", severity: "MEDIUM", cve: "CVE-2024-35195", desc: "Incorrect proxy handling — upgrade to 2.32.0." },
    ],
    depOutdated: [
      { pkg: "cryptography", current: "41.0.3", latest: "42.0.5", status: "outdated" },
      { pkg: "requests", current: "2.31.0", latest: "2.32.0", status: "minor" },
      { pkg: "alembic", current: "1.13.1", latest: "1.13.2", status: "patch" },
    ],
  },

  ml: {
    language: "Python / Jupyter",
    installCmd: "pip install -r requirements.txt",
    startCmd: "jupyter notebook notebooks/train.ipynb",
    testFramework: "PyTest · HuggingFace Evaluate",
    badgeColor: "EE4C2C",
    badgeLogo: "pytorch",
    badgeLabel: "PyTorch",
    extraBadges: `![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=flat&logo=huggingface&logoColor=black)`,
    stackRows: [
      ["Framework", "PyTorch 2.1"],
      ["NLP", "HuggingFace Transformers 4.40"],
      ["Experiment Tracking", "Weights & Biases"],
      ["Evaluation", "HuggingFace Evaluate"],
      ["Notebooks", "Jupyter Lab"],
    ],
    envVars: [
      { key: "HUGGINGFACE_TOKEN", example: "hf_xxxxxxxxxxxxx", required: true },
      { key: "WANDB_API_KEY", example: "your-wandb-key", required: false },
      { key: "CUDA_VISIBLE_DEVICES", example: "0", required: false },
      { key: "MODEL_CACHE_DIR", example: "/data/models", required: false },
    ],
    dockerPort: "8888:8888",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "torch", label: "torch@2.1.2", type: "dep", health: "ok" },
      { id: "transformers", label: "transformers@4.40.1", type: "dep", health: "ok" },
      { id: "numpy", label: "numpy@1.26.4", type: "dep", health: "warning" },
      { id: "scikit-learn", label: "scikit-learn@1.4.2", type: "dep", health: "ok" },
      { id: "pillow", label: "pillow@9.5.0", type: "dep", health: "critical" },
      { id: "wandb", label: "wandb@0.16.6", type: "dep", health: "ok" },
    ],
    depAlerts: [
      { pkg: "pillow@9.5.0", severity: "CRITICAL", cve: "CVE-2023-50447", desc: "Arbitrary code execution via crafted image — upgrade to 10.2.0+." },
      { pkg: "numpy@1.26.4", severity: "MEDIUM", cve: "N/A", desc: "NumPy 2.0 breaking changes — plan migration path." },
    ],
    depOutdated: [
      { pkg: "pillow", current: "9.5.0", latest: "10.3.0", status: "outdated" },
      { pkg: "numpy", current: "1.26.4", latest: "2.0.0", status: "outdated" },
      { pkg: "transformers", current: "4.40.1", latest: "4.41.0", status: "minor" },
    ],
  },

  mobile: {
    language: "TypeScript / React Native",
    installCmd: "npm install && npx expo install",
    startCmd: "npx expo start",
    testFramework: "Jest · Expo Testing Library",
    badgeColor: "000020",
    badgeLogo: "expo",
    badgeLabel: "Expo",
    extraBadges: `![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)`,
    stackRows: [
      ["Framework", "React Native 0.74"],
      ["Build", "Expo SDK 51"],
      ["State", "Redux Toolkit"],
      ["Navigation", "React Navigation 6"],
      ["Payments", "Stripe React Native"],
    ],
    envVars: [
      { key: "EXPO_PUBLIC_API_URL", example: "https://api.myapp.com", required: true },
      { key: "EXPO_PUBLIC_STRIPE_KEY", example: "pk_test_xxxxxxxxxxxx", required: true },
      { key: "EXPO_PUBLIC_SENTRY_DSN", example: "https://xxx@sentry.io/xxx", required: false },
    ],
    dockerPort: "19000:19000",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "expo", label: "expo@51.0.9", type: "dep", health: "ok" },
      { id: "react-native", label: "react-native@0.74.1", type: "dep", health: "ok" },
      { id: "redux-toolkit", label: "@reduxjs/toolkit@2.2.3", type: "dep", health: "ok" },
      { id: "stripe-rn", label: "@stripe/stripe-react-native@0.37.2", type: "dep", health: "warning" },
      { id: "netinfo", label: "@react-native-community/netinfo@11.2.1", type: "dep", health: "ok" },
    ],
    depAlerts: [
      { pkg: "@stripe/stripe-react-native@0.37.2", severity: "MEDIUM", cve: "N/A", desc: "PCI DSS 4.0 compliance update required — upgrade to 0.38.0." },
    ],
    depOutdated: [
      { pkg: "stripe-react-native", current: "0.37.2", latest: "0.38.0", status: "minor" },
      { pkg: "expo", current: "51.0.9", latest: "51.0.14", status: "patch" },
    ],
  },

  cli: {
    language: "Node.js / Shell",
    installCmd: "npm install && npm link",
    startCmd: "node src/index.js --help",
    testFramework: "Jest · Node Test Runner",
    badgeColor: "339933",
    badgeLogo: "nodedotjs",
    badgeLabel: "Node.js",
    extraBadges: `![Shell](https://img.shields.io/badge/Shell_Script-121011?style=flat&logo=gnu-bash&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)`,
    stackRows: [
      ["CLI Framework", "Commander.js 12"],
      ["Prompts", "Inquirer 9"],
      ["Colours", "Chalk 4"],
      ["Versioning", "semver 7"],
      ["Packaging", "pkg / esbuild"],
    ],
    envVars: [
      { key: "GITHUB_TOKEN", example: "ghp_xxxxxxxxxxxx", required: true },
      { key: "DEFAULT_BRANCH", example: "main", required: false },
    ],
    dockerPort: "3000:3000",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "commander", label: "commander@12.0.0", type: "dep", health: "ok" },
      { id: "inquirer", label: "inquirer@9.2.20", type: "dep", health: "ok" },
      { id: "chalk", label: "chalk@4.1.2", type: "dep", health: "warning" },
      { id: "semver", label: "semver@7.5.4", type: "dep", health: "ok" },
    ],
    depAlerts: [
      { pkg: "chalk@4.1.2", severity: "LOW", cve: "N/A", desc: "chalk v5+ is ESM-only — migration required for Node 18+ LTS." },
    ],
    depOutdated: [
      { pkg: "chalk", current: "4.1.2", latest: "5.3.0", status: "outdated" },
      { pkg: "semver", current: "7.5.4", latest: "7.6.2", status: "patch" },
    ],
  },

  fullstack: {
    language: "TypeScript / Python",
    installCmd: "npm install && pip install -r requirements.txt",
    startCmd: "npm run dev",
    testFramework: "Jest · TypeScript",
    badgeColor: "000000",
    badgeLogo: "nextdotjs",
    badgeLabel: "Next.js",
    extraBadges: `![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)`,
    stackRows: [
      ["Frontend", "Next.js 14, React, Tailwind CSS"],
      ["Backend", "Python FastAPI"],
      ["Database", "PostgreSQL + Prisma ORM"],
      ["Auth", "NextAuth.js"],
      ["Deployment", "Docker, AWS ECS"],
    ],
    envVars: [
      { key: "DATABASE_URL", example: "postgresql://user:pass@localhost:5432/db", required: true },
      { key: "NEXTAUTH_SECRET", example: "your-secret-key-here", required: true },
      { key: "OPENAI_API_KEY", example: "sk-...", required: true },
      { key: "REDIS_URL", example: "redis://localhost:6379", required: false },
    ],
    dockerPort: "3000:3000",
    depNodes: (name) => [
      { id: "root", label: name, type: "root", health: "ok" },
      { id: "next", label: "next@14.2.5", type: "dep", health: "ok" },
      { id: "react", label: "react@18.3.1", type: "dep", health: "ok" },
      { id: "prisma", label: "prisma@5.16", type: "dep", health: "ok" },
      { id: "nextauth", label: "next-auth@4.24", type: "dep", health: "warning" },
      { id: "lodash", label: "lodash@4.17.19", type: "dep", health: "critical" },
      { id: "axios", label: "axios@1.7.2", type: "dep", health: "ok" },
      { id: "zod", label: "zod@3.23.8", type: "dep", health: "ok" },
    ],
    depAlerts: [
      { pkg: "lodash@4.17.19", severity: "CRITICAL", cve: "CVE-2021-23337", desc: "Prototype pollution vulnerability in lodash before 4.17.21." },
      { pkg: "next-auth@4.24", severity: "MEDIUM", cve: "CVE-2023-48309", desc: "Improper validation of email address allows auth bypass." },
    ],
    depOutdated: [
      { pkg: "lodash", current: "4.17.19", latest: "4.17.21", status: "outdated" },
      { pkg: "next-auth", current: "4.24.0", latest: "4.24.7", status: "patch" },
      { pkg: "prisma", current: "5.16.0", latest: "5.19.0", status: "minor" },
    ],
  },
};

// ─── Source / test code templates per type ───────────────────────────────────

function buildTestData(type, repoName) {
  const src = {
    frontend: {
      framework: "Jest · React Testing Library",
      sourceCode: `// src/components/${repoName}/Button.tsx
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label, onClick, disabled = false, variant = 'primary'
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={\`btn btn-\${variant} \${disabled ? 'opacity-50' : ''}\`}
    data-testid="button"
  >
    {label}
  </button>
);`,
      generatedTests: `// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/${repoName}/Button';

describe('Button component', () => {
  it('renders with correct label', () => {
    render(<Button label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockFn = jest.fn();
    render(<Button label="Submit" onClick={mockFn} />);
    fireEvent.click(screen.getByTestId('button'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const mockFn = jest.fn();
    render(<Button label="Disabled" onClick={mockFn} disabled />);
    fireEvent.click(screen.getByTestId('button'));
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('applies secondary variant class', () => {
    render(<Button label="Secondary" onClick={() => {}} variant="secondary" />);
    expect(screen.getByTestId('button')).toHaveClass('btn-secondary');
  });
});`,
      stats: [
        { label: "Test Cases", value: "6", color: "indigo" },
        { label: "Coverage Target", value: "91%", color: "emerald" },
        { label: "Edge Cases", value: "2", color: "amber" },
      ],
    },

    backend: {
      framework: "PyTest · FastAPI TestClient",
      sourceCode: `# app/routers/users.py  (${repoName})
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import schemas, crud
from .database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/", response_model=schemas.User, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)`,
      generatedTests: `# tests/test_users.py  (${repoName})
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_create_user():
    response = client.post("/users/", json={"email": "test@example.com", "name": "Alice"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_read_user_not_found():
    response = client.get("/users/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_create_duplicate_user():
    client.post("/users/", json={"email": "dup@example.com", "name": "Bob"})
    response = client.post("/users/", json={"email": "dup@example.com", "name": "Bob"})
    assert response.status_code == 400`,
      stats: [
        { label: "Test Cases", value: "9", color: "indigo" },
        { label: "Coverage Target", value: "88%", color: "emerald" },
        { label: "Edge Cases", value: "4", color: "amber" },
      ],
    },

    ml: {
      framework: "PyTest · HuggingFace Evaluate",
      sourceCode: `# src/model.py  (${repoName})
from transformers import pipeline

class SentimentAnalyzer:
    def __init__(self, model_name="distilbert-base-uncased-finetuned-sst-2-english"):
        self.pipe = pipeline("sentiment-analysis", model=model_name)

    def predict(self, text: str) -> dict:
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        result = self.pipe(text[:512])[0]
        return {"label": result["label"], "score": round(result["score"], 4)}

    def batch_predict(self, texts: list) -> list:
        return [self.predict(t) for t in texts]`,
      generatedTests: `# tests/test_model.py  (${repoName})
import pytest
from src.model import SentimentAnalyzer

@pytest.fixture(scope="module")
def analyzer():
    return SentimentAnalyzer()

def test_positive_sentiment(analyzer):
    result = analyzer.predict("I absolutely love this product!")
    assert result["label"] == "POSITIVE"
    assert result["score"] > 0.9

def test_negative_sentiment(analyzer):
    result = analyzer.predict("This is terrible and I hate it.")
    assert result["label"] == "NEGATIVE"

def test_empty_input_raises(analyzer):
    with pytest.raises(ValueError, match="empty"):
        analyzer.predict("")

def test_batch_length(analyzer):
    results = analyzer.batch_predict(["Good", "Bad", "Okay"])
    assert len(results) == 3

def test_score_range(analyzer):
    result = analyzer.predict("Neutral statement.")
    assert 0.0 <= result["score"] <= 1.0`,
      stats: [
        { label: "Test Cases", value: "7", color: "indigo" },
        { label: "Coverage Target", value: "85%", color: "emerald" },
        { label: "Edge Cases", value: "3", color: "amber" },
      ],
    },

    mobile: {
      framework: "Jest · Expo Testing Library",
      sourceCode: `// src/screens/CartScreen.tsx  (${repoName})
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../store/cartSlice';

export default function CartScreen() {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
            <Text>{item.name} - \${item.price}</Text>
          </TouchableOpacity>
        )}
      />
      <Text>Total: \${total.toFixed(2)}</Text>
    </View>
  );
}`,
      generatedTests: `// tests/CartScreen.test.tsx  (${repoName})
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../src/store/cartSlice';
import CartScreen from '../src/screens/CartScreen';

const makeStore = (items = []) =>
  configureStore({ reducer: { cart: cartReducer }, preloadedState: { cart: { items } } });

it('renders cart items', () => {
  const store = makeStore([{ id: 1, name: 'Shirt', price: 29.99, qty: 2 }]);
  const { getByText } = render(<Provider store={store}><CartScreen /></Provider>);
  expect(getByText('Shirt - $29.99')).toBeTruthy();
});

it('calculates total correctly', () => {
  const store = makeStore([{ id: 1, name: 'A', price: 10, qty: 2 }, { id: 2, name: 'B', price: 5, qty: 1 }]);
  const { getByText } = render(<Provider store={store}><CartScreen /></Provider>);
  expect(getByText('Total: $25.00')).toBeTruthy();
});`,
      stats: [
        { label: "Test Cases", value: "5", color: "indigo" },
        { label: "Coverage Target", value: "78%", color: "emerald" },
        { label: "Edge Cases", value: "2", color: "amber" },
      ],
    },

    cli: {
      framework: "Jest · Node Test Runner",
      sourceCode: `// src/commands/branch.js  (${repoName})
const { execSync } = require('child_process');

function createBranch(name, fromBranch = 'main') {
  if (!name || !/^[a-z0-9-/]+$/.test(name)) {
    throw new Error('Invalid branch name: lowercase, numbers, hyphens, slashes only');
  }
  execSync(\`git checkout \${fromBranch}\`);
  execSync(\`git checkout -b \${name}\`);
  return { created: name, from: fromBranch };
}

function deleteBranch(name, force = false) {
  execSync(\`git branch \${force ? '-D' : '-d'} \${name}\`);
}

module.exports = { createBranch, deleteBranch };`,
      generatedTests: `// tests/branch.test.js  (${repoName})
const { createBranch } = require('../src/commands/branch');
jest.mock('child_process', () => ({ execSync: jest.fn() }));
const { execSync } = require('child_process');

describe('createBranch', () => {
  beforeEach(() => execSync.mockClear());

  it('creates branch from main by default', () => {
    const result = createBranch('feature/my-feature');
    expect(result).toEqual({ created: 'feature/my-feature', from: 'main' });
  });

  it('throws on invalid branch name (uppercase)', () => {
    expect(() => createBranch('Feature/Bad')).toThrow('Invalid branch name');
  });

  it('throws on empty name', () => {
    expect(() => createBranch('')).toThrow('Invalid branch name');
  });
});`,
      stats: [
        { label: "Test Cases", value: "5", color: "indigo" },
        { label: "Coverage Target", value: "82%", color: "emerald" },
        { label: "Edge Cases", value: "3", color: "amber" },
      ],
    },

    fullstack: {
      framework: "Jest · TypeScript",
      sourceCode: `// src/utils/auth.ts  (${repoName})
export function validateEmail(email: string): boolean {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

export function hashPassword(password: string): string {
  if (password.length < 8) throw new Error("Password too short");
  return \`hashed_\${password}\`;
}

export function generateToken(userId: string): string {
  return \`token_\${userId}_\${Date.now()}\`;
}`,
      generatedTests: `// tests/utils/auth.test.ts  (${repoName})
import { validateEmail, hashPassword, generateToken } from '../src/utils/auth';

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  it('returns false for missing @', () => {
    expect(validateEmail('invalidemail.com')).toBe(false);
  });
});

describe('hashPassword', () => {
  it('returns hashed string for valid password', () => {
    expect(hashPassword('securePass1')).toContain('hashed_');
  });
  it('throws for short password', () => {
    expect(() => hashPassword('short')).toThrow('Password too short');
  });
});

describe('generateToken', () => {
  it('includes userId in token', () => {
    expect(generateToken('user123')).toContain('user123');
  });
});`,
      stats: [
        { label: "Test Cases", value: "8", color: "indigo" },
        { label: "Coverage Target", value: "94%", color: "emerald" },
        { label: "Edge Cases", value: "3", color: "amber" },
      ],
    },
  };

  return src[type] || src.fullstack;
}

// ─── Dead-code templates per type ────────────────────────────────────────────

function buildDeadCode(type, repoName) {
  const templates = {
    frontend: [
      { id: 1, type: "Unused Component", name: "LegacyTable.tsx", file: `src/components/${repoName}/LegacyTable.tsx`, line: null, confidence: 99, severity: "high" },
      { id: 2, type: "Unused Import", name: "import { useEffect }", file: `src/pages/${repoName}/Home.tsx`, line: 2, confidence: 100, severity: "medium" },
      { id: 3, type: "Dead Branch", name: "if (SHOW_BETA_CHART)", file: `src/components/${repoName}/Chart.tsx`, line: 88, confidence: 94, severity: "medium" },
      { id: 4, type: "Unused Variable", name: "const oldColors", file: `src/theme/colors.ts`, line: 14, confidence: 97, severity: "high" },
      { id: 5, type: "Orphan File", name: "legacyFormat.ts", file: `src/utils/legacyFormat.ts`, line: null, confidence: 98, severity: "high" },
      { id: 6, type: "Unused CSS Class", name: ".btn-deprecated", file: `src/styles/global.css`, line: 220, confidence: 92, severity: "low" },
    ],
    backend: [
      { id: 1, type: "Unused Route", name: "/api/v1/legacy_sync", file: `app/routers/${repoName}/sync.py`, line: 34, confidence: 97, severity: "high" },
      { id: 2, type: "Unused Function", name: "format_old_response()", file: `app/utils/${repoName}/formatters.py`, line: 89, confidence: 95, severity: "high" },
      { id: 3, type: "Orphan File", name: "seed_v1.py", file: `scripts/${repoName}/seed_v1.py`, line: null, confidence: 99, severity: "high" },
      { id: 4, type: "Unused Import", name: "import json", file: `app/middleware/auth.py`, line: 3, confidence: 100, severity: "low" },
      { id: 5, type: "Dead Branch", name: "if USE_LEGACY_AUTH:", file: `app/core/${repoName}/security.py`, line: 45, confidence: 91, severity: "medium" },
      { id: 6, type: "Unreachable Code", name: "return None # after raise", file: `app/services/email.py`, line: 67, confidence: 100, severity: "medium" },
    ],
    ml: [
      { id: 1, type: "Orphan Notebook", name: "old_experiment.ipynb", file: `notebooks/${repoName}/old_experiment.ipynb`, line: null, confidence: 99, severity: "medium" },
      { id: 2, type: "Unused Function", name: "tf_idf_fallback()", file: `src/${repoName}/features.py`, line: 203, confidence: 93, severity: "high" },
      { id: 3, type: "Unused Variable", name: "LEGACY_BATCH_SIZE", file: `src/${repoName}/config.py`, line: 12, confidence: 98, severity: "low" },
      { id: 4, type: "Dead Branch", name: "if USE_CPU_ONLY:", file: `src/${repoName}/train.py`, line: 55, confidence: 87, severity: "medium" },
      { id: 5, type: "Orphan File", name: "v0_labels.csv", file: `data/${repoName}/raw/v0_labels.csv`, line: null, confidence: 96, severity: "high" },
    ],
    mobile: [
      { id: 1, type: "Unused Screen", name: "OnboardingV1Screen.tsx", file: `src/screens/${repoName}/OnboardingV1Screen.tsx`, line: null, confidence: 98, severity: "high" },
      { id: 2, type: "Unused Component", name: "LegacyCartBadge.tsx", file: `src/components/${repoName}/LegacyCartBadge.tsx`, line: null, confidence: 97, severity: "high" },
      { id: 3, type: "Dead Branch", name: "if (Platform.OS === 'windows')", file: `src/utils/${repoName}/platform.ts`, line: 22, confidence: 100, severity: "medium" },
      { id: 4, type: "Unused Variable", name: "const oldNavigator", file: `src/navigation/${repoName}/index.tsx`, line: 7, confidence: 95, severity: "medium" },
    ],
    cli: [
      { id: 1, type: "Unused Command", name: "stash-all", file: `src/commands/${repoName}/stash.js`, line: 45, confidence: 93, severity: "high" },
      { id: 2, type: "Orphan File", name: "v1Compat.js", file: `src/utils/${repoName}/v1Compat.js`, line: null, confidence: 99, severity: "high" },
      { id: 3, type: "Unused Variable", name: "DEBUG_FLAG", file: `src/core/${repoName}/runner.js`, line: 8, confidence: 98, severity: "low" },
    ],
    fullstack: [
      { id: 1, type: "Unused Variable", name: "legacyAuthToken", file: `src/${repoName}/utils/auth.ts`, line: 45, confidence: 98, severity: "high" },
      { id: 2, type: "Unreachable Function", name: "deprecatedFetchUser()", file: `src/${repoName}/api/users.ts`, line: 112, confidence: 95, severity: "high" },
      { id: 3, type: "Orphan File", name: "oldCache.ts", file: `src/${repoName}/helpers/oldCache.ts`, line: null, confidence: 99, severity: "high" },
      { id: 4, type: "Unused Import", name: "import { Buffer }", file: `src/${repoName}/middleware/logger.ts`, line: 3, confidence: 100, severity: "medium" },
      { id: 5, type: "Dead Branch", name: "if (USE_LEGACY_API)", file: `src/${repoName}/config/features.ts`, line: 67, confidence: 88, severity: "medium" },
      { id: 6, type: "Unused Variable", name: "tempDebugFlag", file: `api/${repoName}/routes/health.py`, line: 12, confidence: 92, severity: "low" },
    ],
  };
  return templates[type] || templates.fullstack;
}

// ─── Main generator ──────────────────────────────────────────────────────────

/**
 * generateDynamicRepoData(rawInput)
 *
 * Returns a fully-formed data object for all 5 dashboard features.
 * Every unique rawInput produces unique star counts, file counts, contributor
 * counts and commit times via a deterministic hash, while the language profile
 * and command set are chosen by keyword detection.
 */
export function generateDynamicRepoData(rawInput = "") {
  const displayName = extractRepoName(rawInput);
  const type = detectRepoType(rawInput);
  const profile = PROFILES[type];
  const h = hashStr(displayName);

  // Deterministically varied meta numbers
  const files = pick(h, 1, 18, 94);
  const stars = pick(h, 2, 312, 8740);
  const contributors = pick(h, 3, 2, 14);
  const minutesAgo = pick(h, 4, 5, 840);
  const lastCommit =
    minutesAgo < 60
      ? `${minutesAgo} minutes ago`
      : minutesAgo < 1440
      ? `${Math.floor(minutesAgo / 60)} hours ago`
      : `${Math.floor(minutesAgo / 1440)} days ago`;

  const meta = {
    name: displayName,
    language: profile.language,
    files,
    stars,
    lastCommit,
    branch: pick(h, 5, 0, 1) === 0 ? "main" : "develop",
    contributors,
    description: `${displayName} — ${profile.language} project`,
  };

  const setup = {
    steps: [
      { id: 1, title: "Clone the repository", command: `git clone https://github.com/org/${displayName}.git`, description: "Clone the project to your local machine." },
      { id: 2, title: "Install dependencies", command: profile.installCmd, description: "Install all required packages." },
      { id: 3, title: "Configure environment variables", command: "cp .env.example .env", description: "Copy the example env file and fill in your values." },
      { id: 4, title: "Start the development server", command: profile.startCmd, description: "Launch the dev server." },
    ],
    envVars: profile.envVars,
    dockerCommand: `docker compose up --build -d`,
    dockerCompose: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports: ["${profile.dockerPort}"]\n    env_file: .env`,
  };

  const tests = buildTestData(type, displayName);

  const readme = {
    markdown: `# ${displayName}

![${profile.badgeLabel}](https://img.shields.io/badge/${profile.badgeLabel.replace(/ /g, "_")}-${profile.badgeColor}?style=flat&logo=${profile.badgeLogo}&logoColor=white)
${profile.extraBadges}
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> ${meta.description}.

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/org/${displayName}.git
cd ${displayName}
${profile.installCmd}
cp .env.example .env
${profile.startCmd}
\`\`\`

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
${profile.stackRows.map(([l, t]) => `| ${l} | ${t} |`).join("\n")}

## 📁 Project Structure

\`\`\`
${displayName}/
├── src/          # Application source
├── tests/        # Test suite
├── docs/         # Documentation
└── docker/       # Container configs
\`\`\`

## 🤝 Contributing

Pull requests are welcome. See CONTRIBUTING.md for guidelines.

## 📄 License

MIT © ${new Date().getFullYear()} ${displayName} contributors`,
  };

  const deadCode = buildDeadCode(type, displayName);

  const dependencies = {
    nodes: profile.depNodes(displayName),
    alerts: profile.depAlerts,
    outdated: profile.depOutdated,
  };

  return { type, meta, setup, tests, readme, deadCode, dependencies };
}

// ─── Backwards-compat alias ──────────────────────────────────────────────────

export function getRepoData(repoInput = "") {
  return generateDynamicRepoData(repoInput);
}

// Legacy named exports (fullstack defaults) — used as static fallbacks
const _defaults = generateDynamicRepoData("");
export const mockRepoMeta = _defaults.meta;
export const mockSetupData = _defaults.setup;
export const mockTestData = { sourceCode: _defaults.tests.sourceCode, generatedTests: _defaults.tests.generatedTests };
export const mockReadmeData = _defaults.readme;
export const mockDeadCodeData = _defaults.deadCode;
export const mockDependencyData = _defaults.dependencies;
