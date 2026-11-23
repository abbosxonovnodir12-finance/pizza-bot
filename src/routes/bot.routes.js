const botController = require('../controllers/botController');

function registerBotRoutes(bot) {
  bot.command('start', botController.start);
  bot.on('message:contact', botController.contact);
  bot.on('message', botController.fallback);

  bot.catch((err) => {
    console.error('🤖 Bot xatosi:', err.error || err);
  });
}

module.exports = registerBotRoutes;
