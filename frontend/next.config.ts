import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'tap', 'tape', 'why-is-node-running');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'aliases/empty-module.js'),
    };
    
    return config;
  },
};

export default nextConfig;
