// Sets up and starts the backend (FastAPI) and the frontend (Next.js) together. Ctrl+C stops both.
// Works on macOS, Linux and Windows: it only uses Node.js built-ins (Node is already required).
//
// Run it with ./start.sh (macOS/Linux), start.cmd (Windows) or `node scripts/start.mjs` (anywhere).
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const HELP = `Usage: ./start.sh [options]        (Windows: start.cmd [options])

  --reset   reset the database to the demo meetings, then start
  --open    also open the app in your browser
  --help    show this help

Different ports:
  macOS/Linux:  BACKEND_PORT=8001 FRONTEND_PORT=3001 ./start.sh
  PowerShell:   $env:BACKEND_PORT=8001; $env:FRONTEND_PORT=3001; .\\start.cmd
  Command Prompt: set BACKEND_PORT=8001 && set FRONTEND_PORT=3001 && start.cmd`;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKEND = path.join(ROOT, "backend");
const FRONTEND = path.join(ROOT, "frontend");
const IS_WINDOWS = process.platform === "win32";
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 8000);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 3000);
const OPTIONS = new Set(process.argv.slice(2));

const children = [];
let stopping = false;

// ---------- small helpers ----------

const paint = (code, text) => `\x1b[${code}m${text}\x1b[0m`;
const step = (message) => console.log(paint("1;35", `▸ ${message}`));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const readText = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : "");

function fail(message) {
  console.error(paint("1;31", `✖ ${message}`));
  stopServers(1);
}

/** Runs a setup command and shows its output; stops everything if it fails. */
function run(command, args, cwd, { shell = false } = {}) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell });
  if (result.status !== 0) fail(`Command failed: ${command} ${args.join(" ")}`);
}

/** A port is "in use" if anything accepts a connection on it. */
function isPortInUse(port) {
  const tryHost = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port, host });
      socket.setTimeout(1000);
      socket.once("connect", () => (socket.destroy(), resolve(true)));
      socket.once("timeout", () => (socket.destroy(), resolve(false)));
      socket.once("error", () => resolve(false));
    });
  return Promise.all([tryHost("127.0.0.1"), tryHost("::1")]).then((results) => results.includes(true));
}

/** A Python 3.10+ for the virtual environment. Slightly older versions are preferred over the
 *  very newest, because brand-new Python releases sometimes lack prebuilt packages. */
function findPython() {
  const candidates = IS_WINDOWS
    ? [["py", "-3.13"], ["py", "-3.12"], ["py", "-3.11"], ["py", "-3.10"], ["py", "-3"], ["python"], ["python3"]]
    : [["python3.13"], ["python3.12"], ["python3.11"], ["python3.10"], ["python3"], ["python"]];
  const versionCheck = "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)";
  return candidates.find(([command, ...args]) => spawnSync(command, [...args, "-c", versionCheck], { stdio: "ignore" }).status === 0);
}

// ---------- 1. setup (only does work when something is missing or changed) ----------

function setUpBackend() {
  const venv = path.join(BACKEND, ".venv");
  const venvPython = IS_WINDOWS ? path.join(venv, "Scripts", "python.exe") : path.join(venv, "bin", "python");

  if (!fs.existsSync(venvPython)) {
    const python = findPython();
    if (!python) fail("Python 3.10+ is required: https://www.python.org/downloads/");
    step(`Creating the Python virtual environment (backend/.venv) with ${python.join(" ")}`);
    run(python[0], [...python.slice(1), "-m", "venv", ".venv"], BACKEND);
  }

  // Reinstall packages only when requirements.txt changed since the last install.
  const hashFile = path.join(venv, ".requirements-hash");
  const hash = createHash("sha256").update(fs.readFileSync(path.join(BACKEND, "requirements.txt"))).digest("hex");
  if (readText(hashFile) !== hash) {
    step("Installing backend dependencies");
    run(venvPython, ["-m", "pip", "install", "--quiet", "--upgrade", "pip"], BACKEND);
    run(venvPython, ["-m", "pip", "install", "--quiet", "-r", "requirements.txt"], BACKEND);
    fs.writeFileSync(hashFile, hash);
  }

  if (OPTIONS.has("--reset")) {
    step("Resetting the database to the demo meetings");
    run(venvPython, ["-m", "app.seed"], BACKEND);
  }
  return venvPython;
}

function setUpFrontend() {
  const lockFile = path.join(FRONTEND, "package-lock.json");
  const installedLock = path.join(FRONTEND, "node_modules", ".package-lock.json");
  if (!fs.existsSync(installedLock) || fs.statSync(lockFile).mtimeMs > fs.statSync(installedLock).mtimeMs) {
    step("Installing frontend dependencies (npm install)");
    // On Windows npm is a .cmd file, which can only be started through a shell.
    run("npm", ["install", "--no-audit", "--no-fund"], FRONTEND, { shell: IS_WINDOWS });
    if (fs.existsSync(installedLock)) fs.utimesSync(installedLock, new Date(), new Date()); // mark as up to date
  }
  if (!fs.existsSync(path.join(FRONTEND, ".env.local"))) {
    fs.copyFileSync(path.join(FRONTEND, ".env.example"), path.join(FRONTEND, ".env.local"));
    step("Created frontend/.env.local");
  }
}

// ---------- 2. running the servers ----------

function startServer(name, colorCode, command, args, cwd, extraEnv) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
    // macOS/Linux: give the server its own process group so it can be stopped with all its child processes.
    detached: !IS_WINDOWS,
    windowsHide: true,
  });
  const label = paint(colorCode, `[${name}]`);
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on("line", (line) => console.log(`${label} ${line}`));
  }
  child.on("exit", (code, signal) => {
    if (stopping) return;
    const reason = signal ? `killed by ${signal}` : `exit code ${code}`;
    step(`The ${name} stopped (${reason}), so the other server is being stopped too. See the [${name}] logs above.`);
    stopServers(1);
  });
  children.push(child);
}

function stopServers(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  if (children.length) step("Stopping the servers…");
  for (const child of children) {
    try {
      if (IS_WINDOWS) {
        // /T stops the whole process tree (e.g. uvicorn's reloader and its worker), /F forces it.
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        process.kill(-child.pid, "SIGTERM"); // negative PID = the whole process group
      }
    } catch {
      // already stopped
    }
  }
  // Give the servers a moment to shut down cleanly, then exit.
  const running = children.filter((child) => child.exitCode === null && child.signalCode === null);
  if (!running.length) process.exit(exitCode);
  let remaining = running.length;
  for (const child of running) child.once("exit", () => --remaining === 0 && process.exit(exitCode));
  setTimeout(() => process.exit(exitCode), 5000);
}

/** Polls a URL until it answers (true), or gives up after `seconds` or if a server crashed (false). */
async function waitFor(url, seconds) {
  for (let i = 0; i < seconds && !stopping; i++) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(60_000) });
      return true;
    } catch {
      await sleep(1000);
    }
  }
  return false;
}

function openBrowser(url) {
  const [command, args] = IS_WINDOWS
    ? ["cmd", ["/c", "start", "", url]]
    : process.platform === "darwin"
      ? ["open", [url]]
      : ["xdg-open", [url]];
  spawn(command, args, { stdio: "ignore", detached: true, windowsHide: true }).on("error", () => {}).unref();
}

// ---------- main ----------

async function main() {
  if (OPTIONS.has("--help") || OPTIONS.has("-h")) return console.log(HELP);
  for (const option of OPTIONS) {
    if (!["--reset", "--open"].includes(option)) fail(`Unknown option: ${option} (see --help)`);
  }
  if (Number(process.versions.node.split(".")[0]) < 20) fail("Node.js 20+ is required: https://nodejs.org");
  for (const port of [BACKEND_PORT, FRONTEND_PORT]) {
    if (await isPortInUse(port)) {
      fail(`Port ${port} is already in use. Is the app already running? Stop it, or use other ports (see --help).`);
    }
  }

  const venvPython = setUpBackend();
  setUpFrontend();

  // Ctrl+C (SIGINT), closing the terminal (SIGHUP) or a kill (SIGTERM): stop both servers.
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => stopServers(0));

  step(`Starting the backend on http://localhost:${BACKEND_PORT} and the frontend on http://localhost:${FRONTEND_PORT}`);
  startServer("backend", "36", venvPython, ["-m", "uvicorn", "app.main:app", "--port", String(BACKEND_PORT)], BACKEND, {
    PYTHONUNBUFFERED: "1",
  });
  // Next.js is started with node directly (not through npm), which behaves the same on every OS.
  const nextCli = path.join(FRONTEND, "node_modules", "next", "dist", "bin", "next");
  startServer("frontend", "33", process.execPath, [nextCli, "dev", "--port", String(FRONTEND_PORT)], FRONTEND, {
    // The frontend always talks to the backend started here (overrides .env.local).
    NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}`,
  });

  if (!(await waitFor(`http://127.0.0.1:${BACKEND_PORT}/api/health`, 60))) {
    return fail("The backend didn't start. See the [backend] logs above.");
  }
  if (!(await waitFor(`http://127.0.0.1:${FRONTEND_PORT}`, 180))) {
    return fail("The frontend didn't start. See the [frontend] logs above.");
  }

  const appUrl = `http://localhost:${FRONTEND_PORT}`;
  console.log(`\n${paint("1;32", "✔ Fireflies clone is running")}`);
  console.log(`   App:       ${appUrl}`);
  console.log(`   API docs:  http://localhost:${BACKEND_PORT}/docs`);
  console.log("   Press Ctrl+C to stop both.\n");
  if (OPTIONS.has("--open")) openBrowser(appUrl);
}

main().catch((error) => {
  console.error(error);
  stopServers(1);
});
