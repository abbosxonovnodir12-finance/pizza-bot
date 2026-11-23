const express = require('express');
const { webhookCallback } = require('grammy');
const config = require('./config/default');
const prisma = require('./database/connection');
const bot = require('./core/bot');
const registerBotRoutes = require('./routes/bot.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');

BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};

registerBotRoutes(bot);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Har bir so'rovdan oldin baza ulanishini tayyorlaymiz (serverless muhitda ham ishlaydi).
app.use('/api', async (req, res, next) => {
  try {
    await prisma.init();
    next();
  } catch (err) {
    next(err);
  }
});

// Telegram bot xabarlari (webhook rejimi — Vercel'da ishlaydi).
if (config.webhookSecret) {
  app.post('/api/telegram', webhookCallback(bot, 'express', { secretToken: config.webhookSecret }));
}

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Topilmadi' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: "Noto'g'ri so'rov" });
  }
  console.error('❌ Server xatosi:', err);
  res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
});

module.exports = app;
