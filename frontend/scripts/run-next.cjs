const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const command = process.argv[2] || "dev";
const extraArgs = process.argv.slice(3);
const projectDir = path.resolve(__dirname, "..");
const nextBin = path.join(projectDir, "node_modules", "next", "dist", "bin", "next");

function run(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    stdio: "inherit",
    cwd: options.cwd || projectDir,
    env: { ...process.env, ...(options.env || {}) },
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

function ensureDependencies() {
  if (fs.existsSync(nextBin)) return;
  console.log("Installing SafeReach frontend dependencies with npm...");
  run("npm", ["install", "--no-audit", "--no-fund"]);
}

ensureDependencies();

if (command === "start" && !fs.existsSync(path.join(projectDir, ".next", "BUILD_ID"))) {
  console.error("Production build is missing. Run `npm run build` first, then `npm start`.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, command, ...extraArgs], {
  cwd: projectDir,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code || 0);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
