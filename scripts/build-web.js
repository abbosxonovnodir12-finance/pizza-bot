// Vercel uchun build: Mini App -> /, Admin Panel -> /admin
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

const run = (cmd) => {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
};

run('npm install --prefix miniapp --no-audit --no-fund');
run('npm install --prefix admin --no-audit --no-fund');
run('npm run build --prefix miniapp');
run('npm run build --prefix admin');

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'miniapp', 'dist'), OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'admin', 'dist'), path.join(OUT, 'admin'), { recursive: true });

console.log('\n✅ Build tayyor: public/ (Mini App) va public/admin/ (Admin Panel)');
