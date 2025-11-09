const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/notify_time.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_notify_time')
        .setDescription('通知する時間を設定します（例: 16:15）')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('通知時刻を HH:MM 形式で入力')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const timeStr = interaction.options.getString('time');

        // 時刻形式チェック
        if (!/^\d{1,2}:\d{2}$/.test(timeStr)) {
            await interaction.reply({ content: '⛔ 時刻は HH:MM 形式で入力してください（例: 16:15）', ephemeral: true });
            return;
        }

        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        data[userId] = timeStr;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        await interaction.reply({ content: `✅ 通知時刻を ${timeStr} に設定しました（通知は月〜土曜）`, ephemeral: true });
    }
};
