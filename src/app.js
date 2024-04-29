require('dotenv').config();
const express = require('express');
const batches = require('./batch');

const PORT = process.env.PORT || 6579;
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

app.get('/check', (req, res) => {
    res.send({ msg: "Bot is working fine" });
});

app.use('/', batches);

app.listen(PORT, () => {
    console.log(`Bot is Working on Port: ${PORT}`);
});
