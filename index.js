const api_token = 'YOUR_KEY';
const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const Scene = require('telegraf/scenes/base');
const describe_module = require('./scenes/describe');

const stage = new Stage();
const bot = new Telegraf(api_token);

bot.use(session());
bot.use(stage.middleware());
describe_module.describe(stage);

bot.start(async ctx => {
    ctx.reply(`Привет! Если ты владелец бизнеса, и испытываешь проблемы с регуляторными органами, то возможно, я смогу тебе помочь`, {
        reply_markup: {
            inline_keyboard: [[Markup.callbackButton("Помоги", 'start')]]
        }
    });
});

bot.action('start', async ctx => {
    ctx.session.info = {
        object: null,
        action: null,
        action_reason: null,
        reject: null,
        opinion: null,
        duplicate: null,
    }
    await ctx.reply("Для начала, расскажи мне свою ситуацию");
    ctx.scene.enter("describe");
});

bot.launch();