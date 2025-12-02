require('dotenv').config();
console.log("TOKEN 読み込み:", process.env.TOKEN ? "OK" : "NG");

const express = require('express');
const path = require('path');
const fs = require("fs");
const { Client, GatewayIntentBits } = require('discord.js');

if (!process.env.TOKEN) {
    console.log("TOKENを設定してください");
    process.exit(1);
}

// ===== Expressサーバー部分 =====
const app = express();
app.use(express.static(path.join(__dirname, 'pages')));

app.get("/", (req, res) => {
  fs.readFile("./pages/index.html", (err, data) => {
    if (err) {
      res.status(500).send("Error loading page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
})

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`サーバーを開きました: ${PORT}`);
});

// ===== Discordボット部分 =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] // 必要なIntentを追加
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // daily_notify を呼ぶ（clientが定義されたあと）
  require('./daily_notify')(client);
});

client.login(process.env.TOKEN)
  .catch(err => console.error('TOKEN 読み込み失敗', err));
