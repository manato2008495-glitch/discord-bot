const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// dataフォルダ作成（Render対策）
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dataPath = path.join(dataDir, 'timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_notify_time')
        .setDescription('サーバー通知時間を設定')
        .addIntegerOption(opt => opt.setName('hour').setDescription('通知時刻(時)').setRequired(true))
        .addIntegerOption(opt => opt.setName('minute').setDescription('通知時刻(分)').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 }); // ephemeral: true の代わり

        try {
            const hour = interaction.options.getInteger('hour');
            const minute = interaction.options.getInteger('minute');

            if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '{}');

            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const guildId = interaction.guildId;

            if (!data[guildId]) {
                data[guildId] = { notifyChannelId: interaction.channelId, notifyHour: hour, notifyMinute: minute, users: {} };
            } else {
                data[guildId].notifyHour = hour;
                data[guildId].notifyMinute = minute;
                data[guildId].notifyChannelId = interaction.channelId;
            }

            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

            await interaction.editReply({ content: `通知時間を ${hour}時${minute}分 に設定しました` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ コマンド実行中にエラーが発生しました' });
        }
    },
};
