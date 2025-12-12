const TelegramBot = require('node-telegram-bot-api');

// Токен берем из переменной окружения
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, "Привет! Я работаю бесплатно на Render 😄");
});
