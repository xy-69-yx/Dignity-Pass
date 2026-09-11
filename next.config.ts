import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Wallet-supported browsers provide native async functions for WASM loading.
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        "isomorphic-ws": require.resolve("./lib/isomorphic-ws-fix.mjs"),
      };
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;
