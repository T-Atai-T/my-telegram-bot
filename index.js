const TelegramBot = require('node-telegram-bot-api');

// Токен берём из переменной окружения
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Привет, ${msg.from.first_name}! 👋\nЯ ваш помощник @JetCargo_KGbot. Напиши /help, чтобы узнать, что я умею.`);
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, "Вот что я могу:\n/start — приветствие\n/help — список команд\nВы можете писать мне любое сообщение, и я отвечу!");
});

// Ответ на любое сообщение
bot.on('message', (msg) => {
  if (!msg.text.startsWith("/")) {
    bot.sendMessage(msg.chat.id, "Спасибо за сообщение! 😄\nНапиши /help, чтобы узнать команды.");
  }
});
