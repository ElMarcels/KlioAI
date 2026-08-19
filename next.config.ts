import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    AUTH_URL: process.env.AUTH_URL || "https://klio-ai.vercel.app",
  },
};

export default nextConfig;
