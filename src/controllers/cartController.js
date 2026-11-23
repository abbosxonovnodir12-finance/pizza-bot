const config = require('../config/default');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { notifyOrderAccepted } = require('./botController');

const OPTIONS = config.menuOptions;
const EMPTY_SET = { sizes: [], crusts: [], extras: [], defaults: {} };

function toProfile(user) {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, phone: user.phone };
}

function describeOptions(size, crust, extras) {
  const parts = [];
  if (size) parts.push(size.sub ? `${size.name} ${size.sub}` : size.name);
  if (crust) parts.push(`${crust.name} xamir`);
  if (extras.length) parts.push(`+ ${extras.map((t) => t.name).join(', ')}`);
  return parts.join(' · ');
}

function parseBasic(raw) {
  const productId = Number(raw && raw.productId);
  const quantity = Number(raw && raw.quantity);
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) return null;
  return { productId, quantity, raw };
}

// Mahsulot kategoriyasiga qarab o'lcham/xamir/qo'shimchalarni tekshiradi
function resolveOptions(product, raw) {
  const set = OPTIONS[product.category] || EMPTY_SET;
  const pick = (list, id, fallback) => {
    if (!list.length) return null;
    const found = list.find((x) => x.id === (id || fallback));
    return found || list.find((x) => x.id === fallback) || list[0];
  };
  const size = pick(set.sizes, raw.size, set.defaults.size);
  const crust = pick(set.crusts, raw.crust, set.defaults.crust);
  const ids = Array.isArray(raw.toppings) ? [...new Set(raw.toppings)] : [];
  const extras = ids.map((id) => set.extras.find((e) => e.id === id));
  if (extras.some((e) => !e)) return null;
  return { size, crust, extras };
}

async function getProfile(req, res) {
  const user = await User.upsertFromTelegram(req.tgUser);
  res.json({ profile: toProfile(user) });
}

async function getProducts(req, res) {
  const [products, categories] = await Promise.all([Product.findAll(), Product.categories()]);
  // Kategoriyalar tartibi: avval sozlamalardagi tartib (Pizza, Burger, Lavash, Ichimlik), keyin qolganlari
  const order = Object.keys(OPTIONS);
  const rank = (c) => (order.includes(c) ? order.indexOf(c) : order.length);
  categories.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  res.json({ products, categories, colaPrice: config.colaPrice, colaName: config.colaName, options: OPTIONS });
}

async function getMyOrders(req, res) {
  const user = await User.upsertFromTelegram(req.tgUser);
  res.json({ orders: await Order.findByUser(user.id) });
}

async function getMyOrder(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Noto'g'ri buyurtma raqami" });
  const user = await User.upsertFromTelegram(req.tgUser);
  const order = await Order.findOneForUser(id, user.id);
  if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
  res.json({ order });
}

async function createOrder(req, res) {
  const { items, addCola, phone, address, latitude, longitude, comment } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Savatcha bo'sh" });
  }
  if (items.length > 30) {
    return res.status(400).json({ error: "Savatchada juda ko'p mahsulot bor" });
  }

  const lines = items.map(parseBasic);
  if (lines.some((l) => !l)) {
    return res.status(400).json({ error: "Savatchadagi ma'lumot noto'g'ri. Savatchani yangilang." });
  }

  const ids = [...new Set(lines.map((l) => l.productId))];
  const products = await Product.findManyByIds(ids);
  if (products.length !== ids.length) {
    return res.status(400).json({ error: "Ba'zi mahsulotlar endi mavjud emas. Savatchani yangilang." });
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems = [];
  for (const { productId, quantity, raw } of lines) {
    const p = productMap.get(productId);
    const opts = resolveOptions(p, raw);
    if (!opts) {
      return res.status(400).json({ error: "Savatchadagi ma'lumot noto'g'ri. Savatchani yangilang." });
    }
    const { size, crust, extras } = opts;
    const price = Math.max(
      p.newPrice + (size ? size.delta : 0) + (crust ? crust.delta : 0) + extras.reduce((s, t) => s + t.price, 0),
      config.minUnitPrice
    );
    orderItems.push({
      productId,
      name: p.name,
      price,
      quantity,
      imageUrl: p.imageUrl,
      size: size ? size.id : null,
      crust: crust ? crust.id : null,
      toppings: extras.map((t) => t.id),
      options: describeOptions(size, crust, extras),
    });
  }
  if (addCola) {
    orderItems.push({ productId: null, name: config.colaName, price: config.colaPrice, quantity: 1, imageUrl: null });
  }
  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const user = await User.upsertFromTelegram(req.tgUser);

  const cleanPhone = String(phone || user.phone || '').trim();
  if (cleanPhone.replace(/\D/g, '').length < 9) {
    return res.status(400).json({ error: "Telefon raqamini to'g'ri kiriting" });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasCoords = latitude !== null && longitude !== null && Number.isFinite(lat) && Number.isFinite(lng);
  const cleanAddress = String(address || '').trim().slice(0, 500);
  if (!cleanAddress && !hasCoords) {
    return res.status(400).json({ error: 'Yetkazish manzilini kiriting yoki lokatsiyani yuboring' });
  }

  const order = await Order.create({
    userId: user.id,
    items: orderItems,
    total,
    phone: cleanPhone,
    location: cleanAddress || 'Lokatsiya xaritada',
    latitude: hasCoords ? lat : null,
    longitude: hasCoords ? lng : null,
    comment: comment ? String(comment).trim().slice(0, 500) || null : null,
  });

  if (!user.phone) await User.setPhone(user.id, cleanPhone);

  // Serverless muhitda javobdan oldin xabar yuborilishini kutamiz
  await notifyOrderAccepted(user.telegramId, order).catch((err) =>
    console.error("Botdan xabar yuborib bo'lmadi:", err.message)
  );

  res.status(201).json({ order });
}

module.exports = { getProfile, getProducts, getMyOrders, getMyOrder, createOrder };
