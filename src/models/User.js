const prisma = require('../database/connection');

function upsertFromTelegram(tgUser) {
  const data = {
    firstName: tgUser.first_name || 'Mijoz',
    lastName: tgUser.last_name || null,
    username: tgUser.username || null,
  };
  return prisma.user.upsert({
    where: { telegramId: BigInt(tgUser.id) },
    update: data,
    create: { telegramId: BigInt(tgUser.id), ...data },
  });
}

function findByTelegramId(telegramId) {
  return prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
}

function setPhone(userId, phone) {
  return prisma.user.update({ where: { id: userId }, data: { phone } });
}

async function allTelegramIds() {
  const rows = await prisma.user.findMany({ select: { telegramId: true } });
  return rows.map((r) => r.telegramId.toString());
}

module.exports = { upsertFromTelegram, findByTelegramId, setPhone, allTelegramIds };
