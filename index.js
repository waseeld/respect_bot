const ranidb = require('ranidb');
let db = new ranidb("./db/users.json");
const { Telegraf } = require('telegraf')
const conf = require('./conf.json');
const bot = new Telegraf(conf.token)

const mang = require('./lib/mang');

bot.command("/balance", async(ctx) => {
    // let data = db.find({id: ctx.message.from.id});
    // console.log(data);
    let data = await mang.balance(ctx.message.from.id)
    console.log(data);
    ctx.reply("Your Balance : " + data.data, {reply_to_message_id: ctx.message.message_id})
})
bot.launch()

bot.on('text', async(ctx) => {
    if (ctx.message.text.indexOf("respect") != -1) {
        console.log(ctx.message);
        if (ctx.message.reply_to_message != undefined) {
            let amount = ctx.message.text.split("respect");
            let to = ctx.message.reply_to_message.from;
            let send = await mang.send(ctx.message.from.id, to.id, parseInt(amount));
            console.log(send);
            if (send.state == 200) {
                ctx.reply("@" + ctx.message.from.username + " sent " + parseInt(amount) + " respect to " + "@" + to.username, {reply_to_message_id: ctx.message.message_id});
            } else {
                ctx.reply("You haven't enough", {reply_to_message_id: ctx.message.message_id});
            }
        }
    }
})
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))