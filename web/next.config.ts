// web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail the Vercel build on lint errors (temporarily)
    ignoreDuringBuilds: true,
  },
  // If you later hit type errors in CI and need to unblock temporarily:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
