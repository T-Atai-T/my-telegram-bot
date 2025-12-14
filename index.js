const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  },
  request: {
    family: 4
  }
});

const USERS_FILE = './users.json';

// если файла нет — создаём
if (!fs.existsSync(USERS_FILE)) {
  fs.writeJsonSync(USERS_FILE, {});
}

// получить всех пользователей
function getUsers() {
  return fs.readJsonSync(USERS_FILE);
}

// сохранить пользователя
function saveUsers(users) {
  fs.writeJsonSync(USERS_FILE, users, { spaces: 2 });
}

// состояния пользователей
const userSteps = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const users = getUsers();

  if (users[chatId]) {
    bot.sendMessage(chatId, "Ты уже зарегистрирован ✅\nНапиши /profile");
    return;
  }

  userSteps[chatId] = { step: 'name' };
  bot.sendMessage(chatId, "Привет 👋\nКак тебя зовут?");
});

bot.onText(/\/profile/, (msg) => {
  const chatId = msg.chat.id;
  const users = getUsers();

  if (!users[chatId]) {
    bot.sendMessage(chatId, "Ты ещё не зарегистрирован.\nНапиши /start");
    return;
  }

  const user = users[chatId];
  bot.sendMessage(chatId,
    `👤 Профиль\n\n` +
    `Имя: ${user.name}\n` +
    `Телефон: ${user.phone}\n` +
    `Код клиента: ${user.code}`
  );
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userSteps[chatId]) return;
  const users = getUsers();

  // шаг 1 — имя
  if (userSteps[chatId].step === 'name') {
    userSteps[chatId].name = text;
    userSteps[chatId].step = 'phone';

    bot.sendMessage(chatId, "Отправь номер телефона 📱", {
      reply_markup: {
        keyboard: [[{ text: "Отправить номер", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }
});

// ловим контакт
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;

  if (!userSteps[chatId]) return;

  const users = getUsers();

  const newUser = {
    name: userSteps[chatId].name,
    phone: msg.contact.phone_number,
    code: "JC-" + chatId.toString().slice(-6) // простой код клиента
  };

  users[chatId] = newUser;
  saveUsers(users);

  delete userSteps[chatId];

  bot.sendMessage(chatId,
    "✅ Регистрация завершена!\n\n" +
    `Твой код клиента: ${newUser.code}\n\n` +
    "Напиши /profile",
    { reply_markup: { remove_keyboard: true } }
  );
});
