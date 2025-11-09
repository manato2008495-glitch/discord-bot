const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_timetable')
        .setDescription('曜日ごとの時間割を設定します')
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
                    { name: '土曜日', value: '6' },
                ))
        .addStringOption(option =>
            option.setName('subjects')
                .setDescription('時間割をカンマ区切りで入力 (例: 数学,英語,国語,物理,体育)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const day = interaction.options.getString('day');
        const subjects = interaction.options.getString('subjects').split(',');

        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        if (!data[userId]) data[userId] = {};
        data[userId][day] = subjects;

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        const dayName = ['月','火','水','木','金','土'][day - 1];

        await interaction.reply({
            content: `✅ 時間割を登録しました。\n📅 ${dayName}曜日: ${subjects.join(', ')}`,
            ephemeral: true
        });
    },
};
