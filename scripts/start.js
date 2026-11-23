const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const BIN = path.join(ROOT, 'tools', 'cloudflared.exe');
const DOWNLOAD_URL =
  'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
const LOCAL_MINIAPP = 'http://127.0.0.1:5173';

const METRICS = '127.0.0.1:20241';
const CHECK_EVERY_MS = 30000;
const FAILS_BEFORE_RESTART = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const time = () => new Date().toLocaleTimeString();

let tunnel = null;
let app = null;
let stopping = false;

async function ensureCloudflared() {
  if (fs.existsSync(BIN)) return;
  console.log('⬇️  Tunnel dasturi (cloudflared) yuklab olinmoqda...');
  fs.mkdirSync(path.dirname(BIN), { recursive: true });
  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`cloudflared yuklab olinmadi (HTTP ${res.status})`);
  fs.writeFileSync(BIN, Buffer.from(await res.arrayBuffer()));
  console.log('✅ cloudflared tayyor');
}

function setMiniAppUrl(url) {
  let text = fs.readFileSync(ENV_FILE, 'utf8');
  const line = `MINI_APP_URL="${url}"`;
  text = /^MINI_APP_URL=.*$/m.test(text) ? text.replace(/^MINI_APP_URL=.*$/m, line) : `${text.trimEnd()}\n${line}\n`;
  fs.writeFileSync(ENV_FILE, text);
}

function killTree(proc) {
  if (!proc || proc.exitCode !== null) return;
  try {
    execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
  } catch {
    try {
      proc.kill();
    } catch {
      /* ignore */
    }
  }
}

function openTunnel() {
  return new Promise((resolve, reject) => {
    const proc = spawn(BIN, ['tunnel', '--no-autoupdate', '--metrics', METRICS, '--url', LOCAL_MINIAPP], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let found = false;

    const onData = (chunk) => {
      if (found) return;
      const urls = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g) || [];
      const url = urls.find((u) => !u.startsWith('https://api.'));
      if (url) {
        found = true;
        resolve({ proc, url });
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (!found) reject(new Error(`Tunnel ochilmadi (kod ${code}). Internetni tekshiring.`));
    });

    setTimeout(() => {
      if (!found) {
        killTree(proc);
        reject(new Error("Tunnel manzili 60 soniyada olinmadi."));
      }
    }, 60000);
  });
}

// Tunnel holatini cloudflared'ning o'zidan so'raymiz (lokal, DNS kerak emas).
// /ready 200 qaytarsa — Cloudflare bilan kamida bitta faol ulanish bor.
async function isReachable() {
  try {
    const res = await fetch(`http://${METRICS}/ready`, { signal: AbortSignal.timeout(5000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function waitUntilReachable(url, timeoutMs) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (await isReachable(url)) return true;
    await sleep(3000);
  }
  return false;
}

function startApp() {
  return new Promise((resolve) => {
    app = spawn('npm', ['run', 'start:all'], { cwd: ROOT, stdio: 'inherit', shell: true });
    app.on('exit', () => {
      if (!stopping) resolve('app-exited');
    });
    app.resolveRestart = resolve;
  });
}

let currentRun = 0;

async function monitor(url, runId) {
  let fails = 0;
  while (!stopping) {
    await sleep(CHECK_EVERY_MS);
    if (stopping || runId !== currentRun) return;
    if (tunnel.exitCode !== null) return 'tunnel-exited';
    if (await isReachable(url)) {
      fails = 0;
    } else {
      fails += 1;
      console.log(`\n⚠️  [${time()}] Tunnel javob bermadi (${fails}/${FAILS_BEFORE_RESTART})`);
      if (fails >= FAILS_BEFORE_RESTART) return 'tunnel-down';
    }
  }
}

async function runOnce() {
  console.log(`\n🌐 [${time()}] Tunnel ochilmoqda...`);
  const opened = await openTunnel();
  tunnel = opened.proc;
  const { url } = opened;

  process.stdout.write('⏳ Tunnel internetda paydo bo\'lishi kutilmoqda');
  const ready = await waitUntilReachable(url, 90000);
  console.log(ready ? ' ✓' : ' — kutish vaqti tugadi, baribir davom etamiz');

  setMiniAppUrl(url);
  console.log(`\n✅ Mini App manzili: ${url}`);
  console.log('   (.env yangilandi, bot tugmasi avtomatik yangilanadi)\n');

  currentRun += 1;
  const appDone = startApp();
  const reason = await Promise.race([appDone, monitor(url, currentRun)]);
  currentRun += 1;

  if (stopping) return;
  console.log(`\n🔁 [${time()}] Qayta ishga tushirilmoqda (${reason})...`);
  killTree(app);
  killTree(tunnel);
  await sleep(3000);
}

async function main() {
  await ensureCloudflared();
  for (;;) {
    if (stopping) return;
    try {
      await runOnce();
    } catch (err) {
      console.error(`❌ ${err.message} 15 soniyadan keyin qayta urinamiz...`);
      killTree(tunnel);
      await sleep(15000);
    }
  }
}

function shutdown() {
  stopping = true;
  killTree(app);
  killTree(tunnel);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
