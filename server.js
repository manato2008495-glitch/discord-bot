require('dotenv').config();
console.log("TOKEN 読み込み:", process.env.TOKEN ? "OK" : "NG");

const express = require('express');
const path = require('path');
const fs = require("fs");
const app = express();

app.use(express.static(path.join(__dirname, 'pages')));

app.get("/", (req, res) => {
  fs.readFile("./pages/index.html", (err, data) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
})

// Render対応ポート
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`サーバーを開きました: ${PORT}`);
});

if (!process.env.TOKEN) {
    console.log("TOKENを設定してください");
    process.exit(1);
}

require('./main.js');
