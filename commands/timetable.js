const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// データファイルへのパス
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
        await interaction.deferReply({ ephemeral: true }); // 先に受信通知

        const userId = interaction.user.id;
        const day = interaction.options.getString('day');

        let data = {};
        try {
            if (fs.existsSync(dataPath)) {
                data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }
        } catch (err) {
            console.error(err);
        }

        if (!data[userId] || !data[userId][day]) {
            return await interaction.editReply({ content: '❌ この日の時間割は登録されていません。' });
        }

        const subjects = data[userId][day];
        const message = `📅 ${['月','火','水','木','金'][day - 1]}曜日の時間割\n` +
                        subjects.map((s, i) => `${i + 1}限: ${s}`).join('\n');

        await interaction.editReply({ content: message });
    },
};

