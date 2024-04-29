require("dotenv").config();
const express = require("express");
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const batches = express.Router();
batches.use(express.json());
const CHANNEL_USERNAME = 'KashurTek_Paid';
const TOKEN = process.env.Bot_Token;
const Website = process.env.Website;
const paidUser = process.env.Paid_User

const bot = new TelegramBot(TOKEN, { polling: true });

try {
    bot.on('message', async (message) => {
        let chat_id = message.chat.id;
        const chatMember = await bot.getChatMember(`@${CHANNEL_USERNAME}`, message.from.id);
        if (chatMember.status === "left" || chatMember.status === 'kicked') {
            return bot.sendMessage(chat_id, `You Are Not Member Of Our Paid Group\n\n Please Sende this code : ${chatMember.user.id} with payment screenshot\n\n Please Contact @Ps_YTBot`);

        }


        if (message.text === "/start") {
            bot.sendMessage(chat_id, `<b>Hello 👋 ${message.from.first_name}</b>,\n\n<b>Please Watch Video On Youtube: </b><a href="https://yt.openinapp.co/zs1bo">Link</a>\n\n<b>Note: </b>Kindly ensure there is a minimum one-minute interval between each link sent to avoid being blocked.\n\n<b>Credit:</b> @KashurTek`, {
                parse_mode: "HTML",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "Open Website", web_app: { url: `${Website}/batch.html?user=${chat_id}` } }]
                    ]
                }),
                disable_web_page_preview: true
            });

        }

        if (message.text === "/khazana") {

            bot.sendMessage(chat_id, `<b>Hello 👋 ${message.from.first_name}</b>, \n\n<b>Download Khazana Now</b>\n\n<b>Note: </b>Kindly ensure there is a minimum one-minute interval between each link sent to avoid being blocked.\n\n<b>Credit:</b> @KashurTek`, {
                parse_mode: "HTML",
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{ text: "Open Website", web_app: { url: `${Website}/khazana.html?user=${chat_id}` } }]
                    ]
                }),
                disable_web_page_preview: true
            });

        }

    });
} catch (error) {
    console.log("Bot Message", error.message);
}

const sentFiles = {};

batches.post('/data', async (req, res) => {
    try {
        var chatId = req.body.user;
        var data = req.body.data;
        var resolution = req.body.resolution;
        var chapter = req.body.chapter;
        var device = req.body.device;
        const chatMember = await bot.getChatMember(`@${CHANNEL_USERNAME}`, chatId);
        var newdata = '';

        const mywebsite = /\bMYWEBSITE\b/g;
        const USER_ID = /\bUSER_ID\b/g;

        newdata = data.replace(mywebsite, `${paidUser}`).replace(USER_ID, chatId * 99);


        if (chatMember.status === "left" || chatMember.status === 'kicked') {
            return bot.sendMessage(chatId, `You Are Not Member Of Our Paid Group\n Please Contact @Ps_YTBot`);

        }

        // Ensure chapter and resolution are safe for use as file names
        const safeChapter = chapter.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trimEnd();
        const fileName = `${safeChapter}_${resolution}.bat`;

        // Check if 30 minutes have passed since the last file was sent to this chat ID
        const lastSentTime = sentFiles[chatId] || 0;
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastSentTime;

        if (timeElapsed < 10 * 60 * 1000) {
            const remainingTime = Math.ceil((10 * 60 * 1000 - timeElapsed) / 60000);
            bot.sendMessage(chatId, `<b>Hello 👋 ${chatMember.user.first_name},\n\nPlease Wait 10 Minutes To Get Another Script\n\nPlease Wait : </b><code>${remainingTime}</code> Minutes Remaining`, { parse_mode: 'HTML' });
            return res.status(429).send(`You can send the next file in ${remainingTime} minutes.`);
        }


        // Write file asynchronously
        fs.writeFile(fileName, newdata, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Internal server error');
            }

            // Send file to user
            bot.sendDocument(chatId, fileName, {
                caption: `${chapter}\nResolution: ${resolution}p\nDevice: ${device}\n`,
                parse_mode: "HTML"
            }, {
                contentType: 'application/octet-stream',
            }).then(() => {
                console.log(`${chapter}: ${chatMember.user.first_name}`);

                // Update last sent time for this chat ID
                sentFiles[chatId] = currentTime;

                // Delete the file after sending
                fs.unlink(fileName, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
                res.status(201).send('Script sent to bot')
            }).catch((error) => {
                console.error('Error sending file:', error.message);
            });
        });
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).send('Internal server error');
    }
});

module.exports = batches;
