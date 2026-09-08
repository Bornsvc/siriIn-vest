const fs = require('node:fs');
const path = require('node:path');
const nodeExternals = require('webpack-node-externals');

/**
 * npm workspaces hoist dependencies to the repo root, and Nest's default
 * externals only recognise `./node_modules` — so every hoisted package was
 * being pulled into the bundle. Harmless for pure JavaScript; fatal for
 * bcrypt, whose native binding is located by walking up from its own
 * directory, which no longer exists once it is inlined.
 *
 * Declaring both module directories external puts the bundle back to what a
 * single-package Nest app produces: its own code, requiring node_modules.
 */
const MODULE_DIRS = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
].filter((dir) => fs.existsSync(dir));

module.exports = (options) => ({
  ...options,
  externals: MODULE_DIRS.map((modulesDir) => nodeExternals({ modulesDir })),
});
