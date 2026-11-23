const { PrismaClient } = require('@prisma/client');

const PRODUCTS = [
  {
    name: 'Margarita',
    description: "Klassik italyan pizzasi: shirali pomidor sousi, cho'ziluvchan mozzarella va xushbo'y rayhon.",
    ingredients: ['Pomidor sousi', 'Mozzarella pishlog\'i', 'Yangi rayhon', 'Zaytun moyi'],
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    oldPrice: 75000,
    newPrice: 65000,
    category: 'Klassik',
  },
  {
    name: 'Peperoni',
    description: "Dunyodagi eng mashhur pizza: achchiqroq peperoni kolbasasi va mo'l pishloq.",
    ingredients: ['Pomidor sousi', 'Mozzarella pishlog\'i', 'Peperoni kolbasasi', 'Oregano'],
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    oldPrice: 89000,
    newPrice: 79000,
    category: "Go'shtli",
  },
  {
    name: 'Qazi pizza',
    description: "Milliy ta'm va italyan an'anasi uyg'unligi: mazali qazi, piyoz va bulg'or qalampiri.",
    ingredients: ['Pomidor sousi', 'Mozzarella pishlog\'i', 'Qazi', 'Qizil piyoz', 'Bulg\'or qalampiri'],
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    oldPrice: 110000,
    newPrice: 95000,
    category: "Go'shtli",
  },
  {
    name: 'Pishloqli',
    description: "Pishloq ixlosmandlari uchun: to'rt xil pishloq va nozik qaymoqli sous.",
    ingredients: ['Qaymoqli sous', 'Mozzarella', 'Cheddar', 'Parmezan', 'Gauda'],
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    oldPrice: 95000,
    newPrice: 85000,
    category: 'Pishloqli',
  },
];

async function seedProducts(prisma) {
  const count = await prisma.product.count();
  if (count > 0) return false;
  await prisma.product.createMany({ data: PRODUCTS });
  return true;
}

module.exports = { seedProducts, PRODUCTS };

if (require.main === module) {
  require('dotenv').config();
  const prisma = new PrismaClient();
  seedProducts(prisma)
    .then((seeded) => {
      console.log(seeded ? '✅ 4 ta pizza bazaga yozildi' : "ℹ️ Bazada mahsulotlar allaqachon bor, seed o'tkazib yuborildi");
    })
    .catch((err) => {
      console.error('❌ Seed xatosi:', err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
