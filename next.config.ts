// next.config.ts
import type { NextConfig } from "next";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    if (!config.resolve.plugins) {
      config.resolve.plugins = [];
    }
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    return config;
  },
};

export default nextConfig;
