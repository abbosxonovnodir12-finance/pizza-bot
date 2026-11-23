// Lokal (kompyuterda) ishga tushirish fayli. Vercel'da api/index.js ishlatiladi.
const config = require('./config/default');
const app = require('./app');
const prisma = require('./database/connection');
const bot = require('./core/bot');
const { setupBotMenu } = require('./controllers/botController');
const { seedProducts } = require('../prisma/seed');

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
  await connectWithRetry();
  console.log('🗄️  Bazaga ulanildi');

  if (await seedProducts(prisma)) {
    console.log("🍕 Baza bo'sh edi — 4 ta pizza qo'shildi");
  }

  app.listen(config.port, () => {
    console.log(`🚀 API ishga tushdi: http://localhost:${config.port}`);
  });

  // Bot Vercel'da (webhook) ishlayotgan bo'lsa, lokal nusxa unga xalaqit bermasligi kerak.
  const webhook = await bot.api.getWebhookInfo();
  if (webhook.url) {
    console.log(`ℹ️  Bot Vercel'da ishlayapti (${webhook.url}). Lokal bot yoqilmadi.`);
    return;
  }

  await setupBotMenu();
  bot
    .start({
      drop_pending_updates: true,
      onStart: (info) => console.log(`🤖 Bot ishga tushdi: https://t.me/${info.username}`),
    })
    .catch((err) => {
      console.error("❌ Bot to'xtadi, qayta ishga tushiriladi:", err.message);
      process.exit(1);
    });
}

process.on('unhandledRejection', (err) => {
  console.error('⚠️  Kutilmagan xato:', err && err.message ? err.message : err);
});

async function shutdown() {
  await bot.stop().catch(() => {});
  await prisma.reset();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

main().catch(async (err) => {
  console.error('❌ Ishga tushirishda xatolik:', err);
  await prisma.reset();
  process.exit(1);
});
