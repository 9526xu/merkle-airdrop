import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'tap', 'tape', 'why-is-node-running');
    return config;
  },
};

export default nextConfig;
