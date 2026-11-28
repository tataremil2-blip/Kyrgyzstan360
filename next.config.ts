import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/:lang(en|ru)/plan-my-trip", destination: "/:lang/plan-your-trip", permanent: true },
      { source: "/plan-my-trip", destination: "/en/plan-your-trip", permanent: true },
    ];
  },
  ...(process.env.K360_QA_SINGLE_WORKER === "1"
    ? { experimental: { cpus: 1, workerThreads: true } }
    : {}),
};

export default nextConfig;
