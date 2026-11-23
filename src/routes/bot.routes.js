const botController = require('../controllers/botController');
const { logError } = require('../core/log');

function registerBotRoutes(bot) {
  bot.command('start', botController.start);
  bot.on('message:contact', botController.contact);
  bot.on('message', botController.fallback);

  bot.catch((err) => {
    logError('🤖 Bot xatosi:', err.error || err);
  });
}

module.exports = registerBotRoutes;
