// Server ishga tushirish fayli (Render va lokal kompyuter uchun).
const config = require('./config/default');
const app = require('./app');
const prisma = require('./database/connection');
const bot = require('./core/bot');
const { setupBotMenu } = require('./controllers/botController');
const { seedProducts } = require('../prisma/seed');
const { logError } = require('./core/log');

async function connectWithRetry() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await prisma.init();
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (err) {
      await prisma.reset();
      const wait = Math.min(30, attempt * 5);
      console.error(`⚠️  Bazaga ulanib bo'lmadi (${attempt}-urinish). ${wait} soniyadan keyin qayta urinamiz...`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
  }
}

async function main() {
  // Portni darhol ochamiz (Render shu orqali server tirikligini tekshiradi).
  app.listen(config.port, () => {
    console.log(`🚀 API ishga tushdi: port ${config.port}`);
  });

  await connectWithRetry();
  console.log('🗄️  Bazaga ulanildi');

  if (await seedProducts(prisma)) {
    console.log("🍕 Baza bo'sh edi — 4 ta pizza qo'shildi");
  }

  // Hostingda (Render/Vercel) bot doim webhook orqali ishlaydi — Telegram'ga so'rov shart emas.
  if (process.env.RENDER || process.env.VERCEL) {
    console.log('🤖 Bot webhook rejimida (/api/telegram)');
    return;
  }

  // Lokal: webhook o'rnatilgan bo'lsa, polling yoqilmaydi (aks holda hosting bilan to'qnashadi).
  const webhook = await bot.api.getWebhookInfo();
  if (webhook.url) {
    console.log(`🤖 Bot hostingda ishlayapti (${webhook.url}). Lokal bot yoqilmadi.`);
    return;
  }

  await setupBotMenu();
  bot
    .start({
      drop_pending_updates: true,
      onStart: (info) => console.log(`🤖 Bot ishga tushdi: https://t.me/${info.username}`),
    })
    .catch((err) => {
      logError("❌ Bot to'xtadi, qayta ishga tushiriladi:", err);
      process.exit(1);
    });
}

process.on('unhandledRejection', (err) => {
  logError('⚠️  Kutilmagan xato:', err);
});

async function shutdown() {
  await bot.stop().catch(() => {});
  await prisma.reset();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

main().catch(async (err) => {
  logError('❌ Ishga tushirishda xatolik:', err);
  await prisma.reset();
  process.exit(1);
});
