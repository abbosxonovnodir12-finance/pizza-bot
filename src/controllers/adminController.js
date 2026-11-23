const config = require('../config/default');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { makeAdminToken, safeEqual } = require('../middlewares/auth.middleware');
const { notifyStatusChange } = require('./botController');

function parseId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePrice(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

function validateProduct(body = {}) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const imageUrl = String(body.imageUrl || '').trim();
  const category = String(body.category || '').trim();
  const newPrice = parsePrice(body.newPrice);
  const oldPrice = parsePrice(body.oldPrice);
  const rawIngredients = Array.isArray(body.ingredients)
    ? body.ingredients
    : String(body.ingredients || '').split(/[\n,]/);
  const ingredients = rawIngredients.map((s) => String(s).trim()).filter(Boolean);

  if (!name) return { error: 'Pizza nomini kiriting' };
  if (!category) return { error: 'Kategoriyani kiriting' };
  if (!/^https?:\/\//i.test(imageUrl)) return { error: "Rasm manzili http(s):// bilan boshlanishi kerak" };
  if (!newPrice) return { error: "Yangi narxni to'g'ri kiriting" };
  if (Number.isNaN(oldPrice)) return { error: "Eski narxni to'g'ri kiriting" };

  return { data: { name, description, imageUrl, category, newPrice, oldPrice, ingredients } };
}

async function login(req, res) {
  const password = String((req.body && req.body.password) || '');
  if (!safeEqual(password, config.adminPassword)) {
    return res.status(401).json({ error: "Parol noto'g'ri" });
  }
  res.json({ token: makeAdminToken() });
}

async function getStats(req, res) {
  res.json(await Order.getStats());
}

async function getOrders(req, res) {
  res.json({ orders: await Order.findAll({ status: req.query.status }) });
}

async function updateOrderStatus(req, res) {
  const id = parseId(req);
  const { status } = req.body || {};
  if (!id || !Order.STATUSES.includes(status)) {
    return res.status(400).json({ error: "Noto'g'ri so'rov" });
  }

  const courierName = String((req.body && req.body.courierName) || '').trim().slice(0, 80);
  const courierPhone = String((req.body && req.body.courierPhone) || '').trim().slice(0, 30);
  if (status === 'ON_THE_WAY' && (!courierName || courierPhone.replace(/\D/g, '').length < 9)) {
    return res.status(400).json({ error: 'Kuryer ismi va telefon raqamini kiriting' });
  }

  try {
    const order = await Order.updateStatus(id, status, { courierName, courierPhone });
    await notifyStatusChange(order.user.telegramId, order).catch((err) =>
      console.error("Status xabarini yuborib bo'lmadi:", err.message)
    );
    res.json({ order });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Buyurtma topilmadi' });
    throw err;
  }
}

async function getProducts(req, res) {
  const [products, categories] = await Promise.all([Product.findAll(), Product.categories()]);
  res.json({ products, categories });
}

async function createProduct(req, res) {
  const { data, error } = validateProduct(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json({ product: await Product.create(data) });
}

async function updateProduct(req, res) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: "Noto'g'ri ID" });
  const { data, error } = validateProduct(req.body);
  if (error) return res.status(400).json({ error });
  try {
    res.json({ product: await Product.update(id, data) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Mahsulot topilmadi' });
    throw err;
  }
}

async function deleteProduct(req, res) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: "Noto'g'ri ID" });
  try {
    await Product.remove(id);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Mahsulot topilmadi' });
    throw err;
  }
}

module.exports = {
  login,
  getStats,
  getOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
