require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// .env から読み込む
const clientId = process.env.CLIENT_ID; 
const token = process.env.TOKEN;

// コマンドを読み込む
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

// RESTクライアント作成
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🚀 スラッシュコマンドを全サーバーに登録中...');

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ ${data.length} 個のスラッシュコマンドを登録しました。`);
        console.log('⚠️ 注意: グローバルコマンドは反映に最大1時間かかる場合があります。');
    } catch (error) {
        console.error('❌ コマンド登録中にエラー:', error);
    }
})();
