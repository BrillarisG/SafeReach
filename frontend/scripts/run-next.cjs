const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const command = process.argv[2] || "dev";
const extraArgs = process.argv.slice(3);
const projectDir = path.resolve(__dirname, "..");
const depsRoot = path.join(os.tmpdir(), "safereach-deps");
const depsDir = path.join(depsRoot, "node_modules");
const runDir =
  command === "dev"
    ? path.join(os.tmpdir(), "safereach-runtime-dev")
    : path.join(os.tmpdir(), "safereach-runtime-prod");
const nextBin = path.join(runDir, "node_modules", "next", "dist", "bin", "next");
const depsNextBin = path.join(depsDir, "next", "dist", "bin", "next");

function run(command, args, options = {}) {
  const successCodes = options.successCodes || [0];
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    cwd: options.cwd,
    env: options.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (typeof result.status === "number" && !successCodes.includes(result.status)) {
    process.exit(result.status);
  }
}

function removeIfExists(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function syncSource() {
  fs.mkdirSync(runDir, { recursive: true });

  if (process.platform === "win32") {
    run("robocopy", [
      projectDir,
      runDir,
      "/E",
      "/XD",
      "node_modules",
      ".next",
      "/NFL",
      "/NDL",
      "/NJH",
      "/NJS",
      "/NP",
    ], { successCodes: [0, 1, 2, 3, 4, 5, 6, 7] });
    return;
  }

  run("rsync", [
    "-a",
    "--exclude",
    "node_modules",
    "--exclude",
    ".next",
    `${projectDir}${path.sep}`,
    `${runDir}${path.sep}`,
  ]);
}

function ensureDependencies() {
  fs.mkdirSync(depsRoot, { recursive: true });

  for (const file of ["package.json", "package-lock.json"]) {
    const source = path.join(projectDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(depsRoot, file));
    }
  }

  if (fs.existsSync(depsNextBin)) {
    return;
  }

  console.log("Installing SafeReach frontend dependencies in the local runtime cache...");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npmCommand, ["install", "--no-audit", "--no-fund"], { cwd: depsRoot });
}

function linkDependencies() {
  const target = path.join(runDir, "node_modules");
  if (fs.existsSync(nextBin)) {
    return;
  }

  removeIfExists(target);

  if (process.platform === "win32") {
    run("cmd.exe", ["/c", "mklink", "/J", target, depsDir], { cwd: runDir });
    return;
  }

  fs.symlinkSync(depsDir, target, "dir");
}

ensureDependencies();
syncSource();
linkDependencies();

if (command === "build") {
  removeIfExists(path.join(runDir, ".next"));
}

if (command === "start" && !fs.existsSync(path.join(runDir, ".next", "BUILD_ID"))) {
  console.error("Production build is missing. Run `npm run build` first, then `npm start`.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, command, ...extraArgs], {
  cwd: runDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_PATH: depsDir,
  },
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
