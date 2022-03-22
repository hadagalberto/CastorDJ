import Bot from "./bot";
const { token, prefix } = require("./config.json");

const bot = new Bot();

bot.authenticate(token, prefix).then(() => {
    console.log("Bot is ready!");
});