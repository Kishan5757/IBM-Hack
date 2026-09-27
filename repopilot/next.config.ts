import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose ONLY the GitHub token to the browser (it is already NEXT_PUBLIC_).
  // All other secrets (GEMINI_API_KEY) stay server-side only.
  env: {},

  // Strict mode for React — catches common bugs early.
  reactStrictMode: true,

  // Strip console.log in production to avoid leaking internals.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
};

export default nextConfig;
