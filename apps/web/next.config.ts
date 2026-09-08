import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The workspace root, not this package: dependencies are hoisted to
    // ../../node_modules and Turbopack does not resolve outside its root.
    // Pinned explicitly because a stray package-lock.json in a parent
    // directory otherwise makes Turbopack infer a root above the repo.
    root: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.."),
  },
};

export default nextConfig;
