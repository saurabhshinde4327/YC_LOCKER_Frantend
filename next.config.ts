import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4)$/i,
      type: 'asset/resource'
    });
    return config;
  }
};

export default nextConfig;
