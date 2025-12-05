require('dotenv').config();
console.log("TOKEN 読み込み:", process.env.TOKEN ? "OK" : "NG");

const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ================== Express サーバー ==================
const app = express();
app.use(express.static(path.join(__dirname, 'pages')));

app.get("/", (req, res) => {
    fs.readFile("./pages/index.html", (err, data) => {
        if (err) return res.status(500).send("Error loading page");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🌍 サーバー起動: ${PORT}`));

// ================== Discord Bot ==================
if (!process.env.TOKEN) {
    console.error("❌ TOKEN が設定されていません");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// -------------------- コマンド読み込み --------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.data.name, command);
        console.log(`-> [Loaded Command] ${command.data.name}`);
    }
}

// -------------------- イベント読み込み --------------------
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`-> [Loaded Event] ${event.name}`);
    }
}

// -------------------- daily_notify 起動 --------------------
client.once(Events.ClientReady, () => {
    console.log(`✅ ログイン完了: ${client.user.tag}`);
    require('./daily_notify')(client);
});

// -------------------- interactionCreate --------------------
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return console.error(`No command matching ${interaction.commandName} found`);

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ コマンド実行中にエラーが発生しました' });
        } else {
            await interaction.reply({ content: '❌ コマンド実行中にエラーが発生しました', flags: 64 });
        }
    }
});

// -------------------- Botログイン --------------------
client.login(process.env.TOKEN)
    .catch(err => console.error('❌ TOKEN 読み込み失敗', err));
