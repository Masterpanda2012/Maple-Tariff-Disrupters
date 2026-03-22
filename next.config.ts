/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";

import "./src/env.js";

/**
 * Product listings use arbitrary HTTPS image URLs from businesses (project-spec: marketplace).
 * `remotePatterns` allows `next/image` to optimize those assets. Prefer tightening hosts in production
 * if all product images are known to come from specific CDNs.
 *
 * `NEXT_PUBLIC_APP_URL` is validated in `src/env.js` (client) and available as `process.env.NEXT_PUBLIC_APP_URL`
 * in the browser after build.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  },
};

export default nextConfig;
