require('dotenv').config();
console.log("TOKEN 読み込み:", process.env.TOKEN ? "OK" : "NG");

const express = require('express');
const path = require('path');
const fs = require("fs");
const { Client, GatewayIntentBits } = require('discord.js');

// ====== TOKEN チェック ======
if (!process.env.TOKEN) {
    console.log("❌ TOKEN が設定されていません");
    process.exit(1);
}

// ====== Express サーバー ======
const app = express();
const pagesDir = path.join(__dirname, "pages");

// 静的ファイル
if (fs.existsSync(pagesDir)) {
    app.use(express.static(pagesDir));
}

app.get("/", (req, res) => {
    const indexPath = path.join(pagesDir, "index.html");

    if (!fs.existsSync(indexPath)) {
        return res.status(404).send("index.html が見つかりません");
    }

    fs.readFile(indexPath, (err, data) => {
        if (err) return res.status(500).send("ページ読み込みエラー");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`🌐 Webサーバー起動: http://localhost:${PORT}`);
});

// ====== Discord Bot ======
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,     // 必要なら
        GatewayIntentBits.MessageContent     // テキスト取得が必要なら
    ]
});

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    // daily_notify を起動
    const dailyNotify = require('./daily_notify');
    dailyNotify(client);

    // Render がスリープしないように(無料プラン対策)
    setInterval(() => {
        console.log("⏳ keep-alive ping");
    }, 1000 * 60 * 5); // 5分ごと
});

// TOKEN ログイン
client.login(process.env.TOKEN)
    .catch(err => console.error('❌ TOKEN 読み込み失敗', err));
