const WizardScene = require("telegraf/scenes/wizard");
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const axios = require('axios');

function describe(stage) {
    const describe = new WizardScene(
        "describe",
    
    async (ctx) => {
        ctx.reply("Выбери предмет, по которому требуется принять решение", {
            reply_markup: {
                inline_keyboard: [[
                    Markup.callbackButton("Ипотека", 'mortgage'),
                    Markup.callbackButton('Недвижимость под залог', 'pledge'),
                    Markup.callbackButton('Арендованная недвижимость', 'rent')
                ]]
            }
        });
        return ctx.wizard.next();
    },

    async (ctx) => {
        if (!(ctx.update.callback_query && ctx.update.callback_query.data)) {
            ctx.reply("Выбери из предложенных вариантов");
            return;
        }
        ctx.session.info.object = ctx.update.callback_query.data;
        await ctx.reply("Что вам необходимо сделать?", {
            reply_markup: {
                inline_keyboard: [[
                    Markup.callbackButton('Внести изменения', 'change'),
                    Markup.callbackButton('Зарегистрировать', 'register')
                ]]
            }
        });
        return ctx.wizard.next();
    },

    async (ctx) => {
        if (ctx.update.callback_query && ctx.update.callback_query.data && !ctx.session.info.action) {
            ctx.session.info.action = ctx.update.callback_query.data;
            if (ctx.session.info.action == 'change') {
                ctx.reply("Опишите причины для внесения изменений");
                return;
            }
        } else if (ctx.update.message.text && ctx.session.info.action) {
            ctx.session.info.action_reason = ctx.update.message.text;
        } else {
            ctx.reply("Выбери из предложенных вариантов");
            return;
        }
        await ctx.reply("Как мотивировал отказ Росреестр?");
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.session.info.reject = ctx.update.message.text;
        await ctx.reply("Почему вы считаете, что Росреестр допустил ошибку?");
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.session.info.opinion = ctx.update.message.text;
        await ctx.reply("Забыл спросить, вы уже обращались к нам по этому вопросу?", {
            reply_markup: {
                inline_keyboard: [[
                    Markup.callbackButton('Да, уже обращался', 'yes'),
                    Markup.callbackButton('Нет, я в первый раз', 'no')
                ]]
            }
        });
        return ctx.wizard.next();
    },

    async (ctx) => {
        if (ctx.session.info.duplicate && ctx.update.message.text) {
            ctx.session.info.duplicate = ctx.update.message.text;
        } else if (!(ctx.update.callback_query && ctx.update.callback_query.data)) {
            ctx.reply("Выбери из предложенных вариантов");
            return;
        }
        if (ctx.session.info.duplicate) { // сработает при втором заходе, при вводе обращения
            await ctx.reply("Окей. Загрузи ответ, который ты получил от Росреестра", {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            return ctx.wizard.next();
        }
        ctx.session.info.duplicate = ctx.update.callback_query.data == 'yes' ? true : false;
        if (ctx.session.info.duplicate) {
            await ctx.reply("Может быть вы помните тикет обращения? Если так, введите его", {
                reply_markup: {
                    keyboard: [[Markup.button('Не помню')]]
                }
            });
            return;
        } else {
            await ctx.reply("Окей. Загрузи ответ, который ты получил от Росреестра", {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            return ctx.wizard.next();
        }
    },

    async (ctx) => {
        if (ctx.update.message.document) {
            let doc_name = ctx.update.message.document.file_name;
            let doc_id = ctx.update.message.document.thumb.file_id;
            let url = null;
            await ctx.telegram.getFileLink(doc_id).then(src => url = src);
            axios({url, responseType: 'blob'}).then(response => axios.post('http://127.0.0.1:8000/documents', response.data, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            }
            ).then(res => console.log('success')));
        }
    }
    )

    stage.register(describe);
    return describe;
}

module.exports = {describe};