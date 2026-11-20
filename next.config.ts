import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ...(process.env.K360_QA_SINGLE_WORKER === "1"
    ? { experimental: { cpus: 1, workerThreads: true } }
    : {}),
};

export default nextConfig;
