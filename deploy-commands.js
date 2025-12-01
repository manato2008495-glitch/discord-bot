require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// .env から取得
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

if (!clientId || !token) {
    console.error("❌ CLIENT_ID または TOKEN が環境変数に設定されていません");
    process.exit(1);
}

// コマンドを読み込む
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

// RESTクライアント作成
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🌍 グローバルスラッシュコマンドを登録中...');

        // グローバルコマンドとして登録（全サーバー対象）
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ ${data.length} 個のグローバルコマンドを登録しました`);
        console.log('⚠️ 注意: グローバルコマンドは反映に最大1時間かかる場合があります');

    } catch (error) {
        console.error('❌ コマンド登録中にエラー:', error);
    }
})();
