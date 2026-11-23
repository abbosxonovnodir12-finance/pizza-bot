const crypto = require('crypto');
const config = require('../config/default');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function verifyInitData(initData) {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(config.botToken).digest();
  const calculated = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (!safeEqual(calculated, hash)) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > config.initDataMaxAgeSec) return null;

  try {
    const user = JSON.parse(params.get('user'));
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

function telegramAuth(req, res, next) {
  const user = verifyInitData(req.get('x-telegram-init-data'));
  if (!user) {
    return res.status(401).json({ error: 'Iltimos, ilovani Telegram bot orqali oching' });
  }
  req.tgUser = user;
  next();
}

function makeAdminToken() {
  return crypto.createHmac('sha256', config.botToken).update(`admin:${config.adminPassword}`).digest('hex');
}

function adminAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !safeEqual(token, makeAdminToken())) {
    return res.status(401).json({ error: 'Avtorizatsiyadan o\'tilmagan' });
  }
  next();
}

module.exports = { telegramAuth, adminAuth, makeAdminToken, safeEqual };
