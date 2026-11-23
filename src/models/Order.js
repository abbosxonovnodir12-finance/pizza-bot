const prisma = require('../database/connection');

const STATUSES = ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'];

function create(data) {
  return prisma.order.create({ data });
}

function findByUser(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

function findOneForUser(id, userId) {
  return prisma.order.findFirst({ where: { id, userId } });
}

function findAll({ status } = {}) {
  let where;
  if (status === 'ACTIVE') where = { status: { not: 'DELIVERED' } };
  else if (STATUSES.includes(status)) where = { status };

  return prisma.order.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });
}

function updateStatus(id, status, { courierName, courierPhone } = {}) {
  const now = new Date();
  const data = { status };
  if (status === 'PREPARING') data.preparingAt = now;
  if (status === 'ON_THE_WAY') {
    data.onTheWayAt = now;
    data.courierName = courierName;
    data.courierPhone = courierPhone;
  }
  if (status === 'DELIVERED') data.deliveredAt = now;
  return prisma.order.update({ where: { id }, data, include: { user: true } });
}

async function getStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = { createdAt: { gte: startOfDay } };

  const [todayOrders, activeOrders, todayRevenue, totalOrders] = await Promise.all([
    prisma.order.count({ where: today }),
    prisma.order.count({ where: { status: { not: 'DELIVERED' } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: today }),
    prisma.order.count(),
  ]);

  return {
    todayOrders,
    activeOrders,
    todayRevenue: todayRevenue._sum.total || 0,
    totalOrders,
  };
}

module.exports = { STATUSES, create, findByUser, findOneForUser, findAll, updateStatus, getStats };
