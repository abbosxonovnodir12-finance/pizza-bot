// Xatolarni logga yozishda maxfiy ma'lumotlarni (bot tokeni, baza paroli) yashiradi.
const SECRETS = [process.env.BOT_TOKEN, process.env.ADMIN_PASSWORD, process.env.TELEGRAM_WEBHOOK_SECRET]
  .filter((s) => s && s.length > 6);

try {
  const db = new URL(process.env.DATABASE_URL || '');
  if (db.password) SECRETS.push(decodeURIComponent(db.password));
} catch {
  /* ignore */
}

function redact(value) {
  let text = value instanceof Error ? value.stack || value.message : typeof value === 'string' ? value : JSON.stringify(value);
  for (const s of SECRETS) text = text.split(s).join('***');
  return text;
}

function logError(prefix, err) {
  console.error(prefix, redact(err && err.error instanceof Error ? `${err.message}\n${err.error.message}` : err));
}

module.exports = { redact, logError };
