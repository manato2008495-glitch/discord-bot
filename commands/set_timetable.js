const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_timetable')
        .setDescription('自分の時間割を登録します')
        .addIntegerOption(option =>
            option.setName('day')
                .setDescription('曜日を選択 (1=月曜, 2=火曜...)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('subjects')
                .setDescription('カンマ区切りで教科を入力')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const day = interaction.options.getInteger('day'); // 1〜5
        const subjects = interaction.options.getString('subjects').split(',').map(s => s.trim());

        // JSON読み込み
        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        const guildId = interaction.guild.id;
        if (!data[guildId]) {
            data[guildId] = { users: {}, notifyChannelId: null, notifyHour: 7, notifyMinute: 0 };
        }

        // ユーザーIDがなければ自動で追加
        if (!data[guildId].users[userId]) {
            data[guildId].users[userId] = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
        }

        // 登録
        data[guildId].users[userId][day] = subjects;

        // JSON保存
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        await interaction.editReply({ content: `✅ ${['月','火','水','木','金','土'][day-1]}曜日の時間割を登録しました。\n${subjects.join(', ')}` });
    },
};
