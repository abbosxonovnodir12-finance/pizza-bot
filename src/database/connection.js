const dns = require('dns');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Ba'zi tarmoqlarda (masalan, telefon hotspoti) mahalliy DNS baza manzilini topa olmaydi.
// Shuning uchun baza manzilini to'g'ridan-to'g'ri ishonchli ochiq DNS serverlardan so'raymiz.
const PUBLIC_DNS = ['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4'];

let client = null;

async function resolveHost(host) {
  const resolver = new dns.promises.Resolver({ timeout: 4000, tries: 2 });
  resolver.setServers(PUBLIC_DNS);
  try {
    const ips = await resolver.resolve4(host);
    if (ips.length) return ips[0];
  } catch {
    /* ochiq DNS ishlamasa — oddiy usulga qaytamiz */
  }
  return host;
}

async function init() {
  if (client) return client;

  const url = new URL(process.env.DATABASE_URL);
  const host = url.hostname;
  // Vercel'da oddiy DNS ishonchli ishlaydi; lokal kompyuterda esa ochiq DNS orqali topamiz.
  const onVercel = Boolean(process.env.VERCEL);
  const address = onVercel ? host : await resolveHost(host);

  const adapter = new PrismaPg({
    host: address,
    port: Number(url.port) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    // IP orqali ulansak ham sertifikat asl domen nomi bo'yicha tekshiriladi.
    ssl: { servername: host, rejectUnauthorized: true },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 60000,
    max: onVercel ? 3 : 10,
  });

  client = new PrismaClient({ adapter });
  return client;
}

async function reset() {
  if (!client) return;
  const old = client;
  client = null;
  await old.$disconnect().catch(() => {});
}

module.exports = new Proxy(
  {},
  {
    get(_, prop) {
      if (prop === 'init') return init;
      if (prop === 'reset') return reset;
      if (!client) throw new Error("Baza hali ulanmagan (prisma.init() chaqirilmagan)");
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
