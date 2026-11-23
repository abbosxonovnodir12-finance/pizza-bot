// Botni Vercel'dagi saytga ulash:      node scripts/setup-telegram.js https://pizza-bot-theta.vercel.app
// Botni yana kompyuterga qaytarish:    node scripts/setup-telegram.js --local
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TOKEN = process.env.BOT_TOKEN;
const SECRET = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();

async function tg(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

async function userIds() {
  const prisma = require('../src/database/connection');
  try {
    await prisma.init();
    const rows = await prisma.user.findMany({ select: { telegramId: true } });
    return rows.map((r) => r.telegramId.toString());
  } finally {
    await prisma.reset();
  }
}

async function main() {
  if (!TOKEN) throw new Error('.env faylida BOT_TOKEN yo\'q');

  if (process.argv.includes('--local')) {
    await tg('deleteWebhook', { drop_pending_updates: true });
    console.log("✅ Webhook o'chirildi. Endi botni kompyuterda (node scripts/start.js) ishlatish mumkin.");
    return;
  }

  const base = (process.argv[2] || '').replace(/\/+$/, '');
  if (!/^https:\/\//.test(base)) throw new Error('Sayt manzilini bering: node scripts/setup-telegram.js https://...');
  if (!SECRET) throw new Error(".env faylida TELEGRAM_WEBHOOK_SECRET yo'q");

  await tg('setWebhook', {
    url: `${base}/api/telegram`,
    secret_token: SECRET,
    drop_pending_updates: true,
    allowed_updates: ['message'],
  });
  console.log(`✅ Webhook: ${base}/api/telegram`);

  await tg('setMyCommands', { commands: [{ command: 'start', description: 'Botni ishga tushirish' }] });

  const menuButton = { type: 'web_app', text: '🍕 Menyu', web_app: { url: base } };
  await tg('setChatMenuButton', { menu_button: menuButton });

  const ids = await userIds();
  for (const id of ids) {
    await tg('setChatMenuButton', { chat_id: Number(id), menu_button: menuButton }).catch(() => {});
  }
  console.log(`✅ Menyu tugmasi yangilandi (umumiy + ${ids.length} ta mijoz)`);

  const info = await tg('getWebhookInfo');
  console.log(`ℹ️  Kutilayotgan xabarlar: ${info.pending_update_count}, oxirgi xato: ${info.last_error_message || 'yo\'q'}`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
