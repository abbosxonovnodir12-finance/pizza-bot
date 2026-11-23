const prisma = require('../database/connection');

function findAll() {
  return prisma.product.findMany({ orderBy: { id: 'asc' } });
}

function findById(id) {
  return prisma.product.findUnique({ where: { id } });
}

function findManyByIds(ids) {
  return prisma.product.findMany({ where: { id: { in: ids } } });
}

function create(data) {
  return prisma.product.create({ data });
}

function update(id, data) {
  return prisma.product.update({ where: { id }, data });
}

function remove(id) {
  return prisma.product.delete({ where: { id } });
}

async function categories() {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category);
}

module.exports = { findAll, findById, findManyByIds, create, update, remove, categories };
