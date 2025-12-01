require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// .envから読み込み
const clientId = process.env.CLIENT_ID; // ← Discord開発者ポータルのアプリID
const token = process.env.TOKEN;        // ← Botのトークン

// コマンドを読み込み
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
    
    // 全サーバー対応（グローバル登録）
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`✅ ${data.length} 個のグローバルコマンドを登録しました。`);
    console.log('⚠️ 反映には最大1時間かかる場合があります。');
  } catch (error) {
    console.error('❌ コマンド登録中にエラー:', error);
  }
})();
