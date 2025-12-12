require('dotenv').config();
console.log("TOKEN 読み込み:", process.env.TOKEN ? "OK" : "NG");

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Bot クライアント作成
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// deploy-commands.js を読み込む（スラッシュコマンド登録用）
require("./deploy-commands.js");

//--------------------コマンドを読み込む--------------------------
// スラッシュコマンド
client.commands = new Collection();
const slashcommandsPath = path.join(__dirname, 'commands');
const slashcommandFiles = fs.readdirSync(slashcommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashcommandFiles) {
	const slashfilePath = path.join(slashcommandsPath, file);
	const command = require(slashfilePath);
	console.log(`-> [Loaded Command] ${file.split('.')[0]}`);
	client.commands.set(command.data.name, command);
}

//--------------------イベントを読み込む--------------------------
const eventsPath = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventsFiles) {
	const eventfilePath = path.join(eventsPath, file);
	const event = require(eventfilePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	console.log(`-> [Loaded Event] ${file.split('.')[0]}`);
}

//--------------------daily_notifyを組み込む--------------------------
const dailyNotify = require('./daily_notify');

client.once(Events.ClientReady, () => {
    console.log(`ログイン完了: ${client.user.tag}`);
    dailyNotify(client); // サーバー通知スタート
});

//--------------------interactionCreate--------------------------
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		// interaction のみ渡す
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (!interaction.replied) {
			await interaction.reply({ content: 'コマンド実行中にエラーが発生しました', ephemeral: true });
		}
	}
});

//--------------------Botログイン--------------------------
client.login(process.env.TOKEN);
