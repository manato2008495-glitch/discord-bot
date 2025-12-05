const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_timetable')
        .setDescription('自分の時間割を登録します')
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
                ))
        .addStringOption(option =>
            option.setName('subjects')
                .setDescription('カンマ区切りで教科を入力')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.user.id;
            const day = parseInt(interaction.options.getString('day')); // STRING -> int
            const subjects = interaction.options.getString('subjects')
                .split(',')
                .map(s => s.trim());

            let data = {};
            if (fs.existsSync(dataPath)) {
                data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }

            const guildId = interaction.guild.id;
            if (!data[guildId]) {
                data[guildId] = { users: {}, notifyChannelId: null, notifyHour: 7, notifyMinute: 0 };
            }

            if (!data[guildId].users[userId]) {
                data[guildId].users[userId] = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
            }

            data[guildId].users[userId][day] = subjects;
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

            await interaction.editReply({
                content: `✅ ${['月','火','水','木','金'][day-1]}曜日の時間割を登録しました\n${subjects.join(', ')}`
            });

        } catch (err) {
            console.error(err);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: '❌ コマンド実行中にエラーが発生しました'
                });
            } else {
                await interaction.reply({
                    content: '❌ コマンド実行中にエラーが発生しました',
                    flags: 64 // ephemeral
                });
            }
        }
    },
};
