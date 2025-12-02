const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timetable')
        .setDescription('登録済みの時間割を確認します')
        .addStringOption(option =>
            option.setName('day')
                .setDescription('曜日を選択')
                .setRequired(true)
                .addChoices(
                    { name: '月曜日', value: '1' },
                    { name: '火曜日', value: '2' },
                    { name: '水曜日', value: '3' },
                    { name: '木曜日', value: '4' },
                    { name: '金曜日', value: '5' },
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const day = interaction.options.getString('day');

        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        // データが存在しない場合
        if (!data[guildId] || !data[guildId].users || !data[guildId].users[userId]) {
            return await interaction.editReply({ content: '❌ 時間割が登録されていません。' });
        }

        const subjects = data[guildId].users[userId][day];

        if (!subjects || subjects.length === 0) {
            return await interaction.editReply({ content: '❌ この日の時間割は登録されていません。' });
        }

        const message =
            `📅 ${['月','火','水','木','金'][day - 1]}曜日の時間割\n` +
            subjects.map((s, i) => `${i + 1}限: ${s}`).join('\n');

        await interaction.editReply({ content: message });
    },
};
