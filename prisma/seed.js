// Menyu ma'lumotlari.
//   node prisma/seed.js          — baza bo'sh bo'lsa, butun menyuni yozadi
//   node prisma/seed.js --sync   — bazada yo'q mahsulotlarni qo'shadi, eski pizza kategoriyalarini "Pizza" ga o'zgartiradi
const img = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

const PRODUCTS = [
  // ---------- Pizza ----------
  {
    name: 'Margarita',
    description: "Klassik italyan pizzasi: shirali pomidor sousi, cho'ziluvchan mozzarella va xushbo'y rayhon.",
    ingredients: ['Pomidor sousi', "Mozzarella pishlog'i", 'Yangi rayhon', 'Zaytun moyi'],
    imageUrl: img('photo-1574071318508-1cdbab80d002'),
    oldPrice: 75000,
    newPrice: 65000,
    category: 'Pizza',
  },
  {
    name: 'Peperoni',
    description: "Dunyodagi eng mashhur pizza: achchiqroq peperoni kolbasasi va mo'l pishloq.",
    ingredients: ['Pomidor sousi', "Mozzarella pishlog'i", 'Peperoni kolbasasi', 'Oregano'],
    imageUrl: img('photo-1628840042765-356cda07504e'),
    oldPrice: 89000,
    newPrice: 79000,
    category: 'Pizza',
  },
  {
    name: 'Qazi pizza',
    description: "Milliy ta'm va italyan an'anasi uyg'unligi: mazali qazi, piyoz va bulg'or qalampiri.",
    ingredients: ['Pomidor sousi', "Mozzarella pishlog'i", 'Qazi', 'Qizil piyoz', "Bulg'or qalampiri"],
    imageUrl: img('photo-1565299624946-b28f40a0ae38'),
    oldPrice: 110000,
    newPrice: 95000,
    category: 'Pizza',
  },
  {
    name: 'Pishloqli',
    description: "Pishloq ixlosmandlari uchun: to'rt xil pishloq va nozik qaymoqli sous.",
    ingredients: ['Qaymoqli sous', 'Mozzarella', 'Cheddar', 'Parmezan', 'Gauda'],
    imageUrl: img('photo-1513104890138-7c749659a591'),
    oldPrice: 95000,
    newPrice: 85000,
    category: 'Pizza',
  },

  // ---------- Burger ----------
  {
    name: 'Klassik burger',
    description: "Mol go'shtidan suvli kotlet, yangi sabzavotlar va maxsus sous yumshoq bulkada.",
    ingredients: ["Mol go'shti kotleti", 'Salat bargi', 'Pomidor', 'Tuzlangan bodring', 'Maxsus sous'],
    imageUrl: img('photo-1568901346375-23c9450c58cd'),
    oldPrice: 45000,
    newPrice: 39000,
    category: 'Burger',
  },
  {
    name: 'Chizburger',
    description: "Ikki qavat eritilgan cheddar pishlog'i bilan klassik burgerning eng sevimli varianti.",
    ingredients: ["Mol go'shti kotleti", 'Cheddar pishlog\'i', 'Piyoz', 'Tuzlangan bodring', 'Ketchup va xantal'],
    imageUrl: img('photo-1586190848861-99aa4a171e90'),
    oldPrice: 52000,
    newPrice: 45000,
    category: 'Burger',
  },
  {
    name: 'Achchiq tovuq burger',
    description: "Qarsildoq tovuq go'shti, achchiq jalapeno sousi va yangi karam salati.",
    ingredients: ['Qarsildoq tovuq', 'Jalapeno sousi', 'Karam salati', 'Pishloq', 'Brioche bulka'],
    imageUrl: img('photo-1606755962773-d324e0a13086'),
    oldPrice: null,
    newPrice: 42000,
    category: 'Burger',
  },
  {
    name: 'Dabl burger',
    description: "Haqiqiy och odamlar uchun: ikki kotlet, ikki qavat pishloq va qovurilgan piyoz.",
    ingredients: ["2 ta mol go'shti kotleti", "2 qavat pishloq", 'Qovurilgan piyoz', 'Salat bargi', 'BBQ sous'],
    imageUrl: img('photo-1615297928064-24977384d0da'),
    oldPrice: 69000,
    newPrice: 59000,
    category: 'Burger',
  },

  // ---------- Lavash ----------
  {
    name: "Mol go'shtli lavash",
    description: "Yupqa lavashga o'ralgan mol go'shti, yangi sabzavotlar va sarimsoqli sous.",
    ingredients: ["Mol go'shti", 'Pomidor', 'Bodring', 'Karam', 'Sarimsoqli sous'],
    imageUrl: img('photo-1633321702518-7feccafb94d5'),
    oldPrice: 40000,
    newPrice: 35000,
    category: 'Lavash',
  },
  {
    name: 'Tovuqli lavash',
    description: "Grilda pishirilgan tovuq go'shti, yangi sabzavotlar va qaymoqli sous.",
    ingredients: ["Tovuq go'shti", 'Pomidor', 'Bodring', 'Salat bargi', 'Qaymoqli sous'],
    imageUrl: img('photo-1626700051175-6818013e1d4f'),
    oldPrice: null,
    newPrice: 32000,
    category: 'Lavash',
  },
  {
    name: 'Achchiq lavash',
    description: "Achchiq taom ixlosmandlari uchun: go'sht, jalapeno va chili sousi.",
    ingredients: ["Mol go'shti", 'Jalapeno', 'Chili sousi', 'Piyoz', 'Pishloq'],
    imageUrl: img('photo-1529006557810-274b9b2fc783'),
    oldPrice: 39000,
    newPrice: 34000,
    category: 'Lavash',
  },

  // ---------- Ichimlik ----------
  {
    name: 'Coca-Cola',
    description: 'Muzdek salqin Coca-Cola — har qanday taomga mos.',
    ingredients: [],
    imageUrl: img('photo-1622483767028-3f66f32aef97'),
    oldPrice: null,
    newPrice: 12000,
    category: 'Ichimlik',
  },
  {
    name: 'Apelsin sharbati',
    description: 'Yangi siqilgan apelsin sharbati, shakar qo\'shilmagan.',
    ingredients: ['Apelsin'],
    imageUrl: img('photo-1600271886742-f049cd451bba'),
    oldPrice: null,
    newPrice: 18000,
    category: 'Ichimlik',
  },
  {
    name: 'Muzli choy',
    description: 'Limon bilan sovuq qora choy — chanqoqni bosadi.',
    ingredients: ['Qora choy', 'Limon', 'Muz'],
    imageUrl: img('photo-1556679343-c7306c1976bc'),
    oldPrice: null,
    newPrice: 14000,
    category: 'Ichimlik',
  },
  {
    name: 'Yalpizli limonad',
    description: 'Yalpiz va laym qo\'shilgan tetiklantiruvchi uy limonadi.',
    ingredients: ['Yalpiz', 'Laym', 'Gazli suv', 'Muz'],
    imageUrl: img('photo-1513558161293-cdaf765ed2fd'),
    oldPrice: 18000,
    newPrice: 15000,
    category: 'Ichimlik',
  },
  {
    name: 'Limonad',
    description: 'Klassik uy limonadi: limon, yalpiz va muz.',
    ingredients: ['Limon', 'Yalpiz', 'Muz'],
    imageUrl: img('photo-1621263764928-df1444c5e859'),
    oldPrice: null,
    newPrice: 14000,
    category: 'Ichimlik',
  },
  {
    name: 'Qulupnayli limonad',
    description: 'Yangi qulupnay va laym bilan yozgi limonad.',
    ingredients: ['Qulupnay', 'Laym', 'Yalpiz', 'Muz'],
    imageUrl: img('photo-1497534446932-c925b458314e'),
    oldPrice: null,
    newPrice: 16000,
    category: 'Ichimlik',
  },
];

const OLD_PIZZA_CATEGORIES = ['Klassik', "Go'shtli", 'Pishloqli'];

async function seedProducts(prisma) {
  const count = await prisma.product.count();
  if (count > 0) return false;
  await prisma.product.createMany({ data: PRODUCTS });
  return true;
}

async function syncMenu(prisma) {
  const existing = await prisma.product.findMany({ select: { id: true, name: true, category: true } });
  const names = new Set(existing.map((p) => p.name.toLowerCase()));
  const missing = PRODUCTS.filter((p) => !names.has(p.name.toLowerCase()));
  if (missing.length) await prisma.product.createMany({ data: missing });

  const renamed = await prisma.product.updateMany({
    where: { category: { in: OLD_PIZZA_CATEGORIES } },
    data: { category: 'Pizza' },
  });
  return { added: missing.map((p) => p.name), recategorized: renamed.count };
}

module.exports = { seedProducts, syncMenu, PRODUCTS };

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const prisma = require('../src/database/connection');
  (async () => {
    await prisma.init();
    if (process.argv.includes('--sync')) {
      const r = await syncMenu(prisma);
      console.log(`✅ Qo'shildi: ${r.added.length ? r.added.join(', ') : "yo'q"}`);
      console.log(`✅ "Pizza" kategoriyasiga o'tkazildi: ${r.recategorized} ta`);
    } else {
      const seeded = await seedProducts(prisma);
      console.log(seeded ? `✅ ${PRODUCTS.length} ta mahsulot bazaga yozildi` : "ℹ️ Bazada mahsulotlar bor. Yetishmaganlarini qo'shish: node prisma/seed.js --sync");
    }
  })()
    .catch((err) => {
      console.error('❌ Seed xatosi:', err.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.reset());
}
