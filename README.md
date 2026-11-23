# 🍕 TEZ — Pizza yetkazib berish

Telegram orqali pizza buyurtma qilish uchun loyiha.

## Nimalardan iborat

- **Telegram Bot** — mijozni kutib oladi va buyurtma holati haqida xabar yuboradi
- **Mini App** — Telegram ichida ochiladigan ilova: menyu, savatcha, buyurtmani jonli kuzatish
- **Admin Panel** — buyurtmalar va pizzalarni boshqarish uchun sayt

## Qayerda ishlaydi

| Qism | Hosting | Manzil |
|---|---|---|
| Mini App | Vercel | https://pizza-bot-theta.vercel.app |
| Admin Panel | Vercel | https://pizza-bot-theta.vercel.app/admin |
| Backend (API + bot webhook) | Render | https://tez-pizza-api.onrender.com |
| Baza | Neon (PostgreSQL) | — |

Vercel `/api/*` so'rovlarini Render'dagi backendga yo'naltiradi (`vercel.json`).
Render sozlamalari: `render.yaml`. `main` branchga push qilinsa, ikkalasi ham avtomatik yangilanadi.

## Texnologiyalar

Node.js · Express · grammY · React · Vite · PostgreSQL (Neon) · Prisma

## Lokal ishga tushirish

```bash
node scripts/start.js
```

> `.env` fayli (bot tokeni va baza manzili) xavfsizlik uchun repoga qo'shilmaydi.
