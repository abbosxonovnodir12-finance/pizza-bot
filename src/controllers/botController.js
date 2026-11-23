const { InlineKeyboard, Keyboard } = require('grammy');
const bot = require('../core/bot');
const config = require('../config/default');
const User = require('../models/User');

const formatPrice = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
const hasMiniApp = () => config.miniAppUrl.startsWith('https://');

const menuButton = () => ({ type: 'web_app', text: '🍕 Menyu', web_app: { url: config.miniAppUrl } });

async function setChatMenu(chatId) {
  if (!hasMiniApp()) return;
  await bot.api.setChatMenuButton({ chat_id: Number(chatId), menu_button: menuButton() });
}

async function sendMenu(ctx) {
  if (!hasMiniApp()) {
    return ctx.reply(
      "⚠️ Mini App manzili hali sozlanmagan.\n.env faylidagi MINI_APP_URL qatoriga tunnel bergan https manzilni yozing va backendni qayta ishga tushiring."
    );
  }
  await setChatMenu(ctx.chat.id).catch(() => {});
  return ctx.reply('Mazali pizzalarni tanlash uchun pastdagi tugmani bosing 👇', {
    reply_markup: new InlineKeyboard().webApp('🍕 Menyuni ochish', config.miniAppUrl),
  });
}

async function start(ctx) {
  const user = await User.upsertFromTelegram(ctx.from);

  if (!user.phone) {
    return ctx.reply(
      `Assalomu alaykum, ${user.firstName}! 👋\n\nPizza botimizga xush kelibsiz. Buyurtma berish uchun telefon raqamingizni yuboring 👇`,
      {
        reply_markup: new Keyboard().requestContact('📱 Telefon raqamni yuborish').resized().oneTime(),
      }
    );
  }

  await ctx.reply(`Xush kelibsiz, ${user.firstName}! 🍕`);
  return sendMenu(ctx);
}

async function contact(ctx) {
  const { contact: c } = ctx.message;
  if (c.user_id && c.user_id !== ctx.from.id) {
    return ctx.reply("Iltimos, tugma orqali o'zingizning raqamingizni yuboring.");
  }

  const user = await User.upsertFromTelegram(ctx.from);
  const phone = c.phone_number.startsWith('+') ? c.phone_number : `+${c.phone_number}`;
  await User.setPhone(user.id, phone);

  await ctx.reply('✅ Rahmat! Raqamingiz saqlandi.', { reply_markup: { remove_keyboard: true } });
  return sendMenu(ctx);
}

async function fallback(ctx) {
  return sendMenu(ctx);
}

function trackKeyboard(orderId) {
  if (!hasMiniApp()) return undefined;
  return new InlineKeyboard().webApp('📍 Buyurtmani kuzatish', `${config.miniAppUrl}/?track=${orderId}`);
}

async function notifyOrderAccepted(telegramId, order) {
  const lines = order.items
    .map((i) => `• ${i.name} × ${i.quantity}${i.options ? `\n   ${i.options}` : ''}`)
    .join('\n');
  const text =
    "Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryerimiz tez orada bog'lanadi 🍕\n\n" +
    `🧾 Buyurtma №${order.id}\n${lines}\n\n💰 Jami: ${formatPrice(order.total)}`;
  await bot.api.sendMessage(String(telegramId), text, { reply_markup: trackKeyboard(order.id) });
}

async function notifyStatusChange(telegramId, order) {
  const messages = {
    PREPARING: `👨‍🍳 Buyurtma №${order.id} tayyorlanmoqda! Oshpazlarimiz pizzangizni pishirmoqda.`,
    ON_THE_WAY:
      `🛵 Buyurtma №${order.id} yo'lda!\n\n` +
      `Kuryer: ${order.courierName || '—'}\n📞 ${order.courierPhone || '—'}`,
    DELIVERED: `✅ Buyurtma №${order.id} yetkazildi. Yoqimli ishtaha! 🍕`,
  };
  const text = messages[order.status];
  if (!text) return;
  const reply_markup = order.status === 'DELIVERED' ? undefined : trackKeyboard(order.id);
  await bot.api.sendMessage(String(telegramId), text, { reply_markup });
}

async function setupBotMenu() {
  await bot.api.setMyCommands([{ command: 'start', description: 'Botni ishga tushirish' }]);

  if (hasMiniApp()) {
    await bot.api.setChatMenuButton({ menu_button: menuButton() });
    refreshAllChatMenus().catch((err) => console.error('Menyu tugmalarini yangilashda xato:', err.message));
  } else {
    await bot.api.setChatMenuButton({ menu_button: { type: 'commands' } });
    console.warn("⚠️  MINI_APP_URL bo'sh. Tunnel manzilini .env ga yozing.");
  }
}

// Telegram umumiy tugmani kech yangilaydi, shuning uchun har bir mijozga alohida o'rnatamiz.
async function refreshAllChatMenus() {
  const ids = await User.allTelegramIds();
  for (const id of ids) {
    await setChatMenu(id).catch(() => {});
    await new Promise((r) => setTimeout(r, 60));
  }
  if (ids.length) console.log(`🔄 ${ids.length} ta mijozning menyu tugmasi yangilandi`);
}

module.exports = { start, contact, fallback, notifyOrderAccepted, notifyStatusChange, setupBotMenu };
