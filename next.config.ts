import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pinned explicitly: an unrelated package-lock.json in a parent directory
    // otherwise makes Turbopack infer a root above the repo.
    root: path.dirname(new URL(import.meta.url).pathname),
  },
};

export default nextConfig;
