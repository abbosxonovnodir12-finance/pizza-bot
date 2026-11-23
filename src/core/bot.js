const { Bot } = require('grammy');
const config = require('../config/default');

const bot = new Bot(config.botToken);

module.exports = bot;
