const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const required = ['DATABASE_URL', 'BOT_TOKEN', 'ADMIN_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ .env faylida quyidagilar to'ldirilmagan: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  botToken: process.env.BOT_TOKEN,
  miniAppUrl: (process.env.MINI_APP_URL || '').trim().replace(/\/+$/, ''),
  adminPassword: process.env.ADMIN_PASSWORD,
  webhookSecret: (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim(),
  colaPrice: 5000,
  colaName: 'Coca-Cola 0.5L',
  menuOptions: {
    sizes: [
      { id: 'S', name: 'Kichik', cm: 25, delta: -10000 },
      { id: 'M', name: "O'rta", cm: 30, delta: 0 },
      { id: 'L', name: 'Katta', cm: 35, delta: 20000 },
    ],
    crusts: [
      { id: 'thin', name: 'Yupqa', delta: 0 },
      { id: 'classic', name: 'Klassik', delta: 0 },
      { id: 'thick', name: 'Qalin', delta: 5000 },
    ],
    toppings: [
      { id: 'cheese', name: "Qo'shimcha pishloq", emoji: '🧀', price: 8000 },
      { id: 'mushroom', name: "Qo'ziqorin", emoji: '🍄', price: 6000 },
      { id: 'jalapeno', name: 'Jalapeno', emoji: '🌶️', price: 6000 },
      { id: 'olive', name: 'Zaytun', emoji: '🫒', price: 6000 },
      { id: 'tomato', name: 'Pomidor', emoji: '🍅', price: 5000 },
      { id: 'sausage', name: 'Kolbasa', emoji: '🥓', price: 9000 },
    ],
    defaults: { size: 'M', crust: 'classic' },
    minUnitPrice: 10000,
  },
  initDataMaxAgeSec: 24 * 60 * 60,
};
