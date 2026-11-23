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
  // Har bir kategoriya uchun o'z sozlamalari (o'lcham, xamir, qo'shimchalar).
  // Kategoriya nomi mahsulotning "category" maydoniga aynan mos bo'lishi kerak.
  menuOptions: {
    Pizza: {
      sizeLabel: "O'lchami",
      sizes: [
        { id: 'S', name: 'Kichik', sub: '25 sm', delta: -10000 },
        { id: 'M', name: "O'rta", sub: '30 sm', delta: 0 },
        { id: 'L', name: 'Katta', sub: '35 sm', delta: 20000 },
      ],
      crusts: [
        { id: 'thin', name: 'Yupqa', delta: 0 },
        { id: 'classic', name: 'Klassik', delta: 0 },
        { id: 'thick', name: 'Qalin', delta: 5000 },
      ],
      extras: [
        { id: 'cheese', name: "Qo'shimcha pishloq", emoji: '🧀', price: 8000 },
        { id: 'mushroom', name: "Qo'ziqorin", emoji: '🍄', price: 6000 },
        { id: 'jalapeno', name: 'Jalapeno', emoji: '🌶️', price: 6000 },
        { id: 'olive', name: 'Zaytun', emoji: '🫒', price: 6000 },
        { id: 'tomato', name: 'Pomidor', emoji: '🍅', price: 5000 },
        { id: 'sausage', name: 'Kolbasa', emoji: '🥓', price: 9000 },
      ],
      defaults: { size: 'M', crust: 'classic' },
    },
    Burger: {
      sizeLabel: "O'lchami",
      sizes: [
        { id: 'R', name: 'Oddiy', sub: '180 g', delta: 0 },
        { id: 'L', name: 'Katta', sub: '250 g', delta: 9000 },
        { id: 'XL', name: 'XL', sub: '320 g', delta: 16000 },
      ],
      crusts: [],
      extras: [
        { id: 'cheese', name: 'Pishloq', emoji: '🧀', price: 5000 },
        { id: 'patty', name: "Qo'shimcha kotlet", emoji: '🥩', price: 12000 },
        { id: 'jalapeno', name: 'Jalapeno', emoji: '🌶️', price: 4000 },
        { id: 'egg', name: 'Tuxum', emoji: '🍳', price: 4000 },
      ],
      defaults: { size: 'R' },
    },
    Lavash: {
      sizeLabel: "O'lchami",
      sizes: [
        { id: 'MINI', name: 'Mini', sub: '200 g', delta: -6000 },
        { id: 'R', name: 'Oddiy', sub: '300 g', delta: 0 },
        { id: 'L', name: 'Katta', sub: '400 g', delta: 9000 },
      ],
      crusts: [],
      extras: [
        { id: 'cheese', name: 'Pishloq', emoji: '🧀', price: 5000 },
        { id: 'meat', name: "Qo'shimcha go'sht", emoji: '🥩', price: 10000 },
        { id: 'fries', name: 'Ichida kartoshka fri', emoji: '🍟', price: 4000 },
        { id: 'spicy', name: 'Achchiq sous', emoji: '🌶️', price: 2000 },
      ],
      defaults: { size: 'R' },
    },
    Ichimlik: {
      sizeLabel: 'Hajmi',
      sizes: [
        { id: '05', name: '0.5 L', sub: '', delta: 0 },
        { id: '1', name: '1 L', sub: '', delta: 6000 },
        { id: '15', name: '1.5 L', sub: '', delta: 10000 },
      ],
      crusts: [],
      extras: [],
      defaults: { size: '05' },
    },
  },
  minUnitPrice: 5000,
  initDataMaxAgeSec: 24 * 60 * 60,
};
