const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_notify_time')
        .setDescription('サーバーごとの通知時間を設定します')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('通知を送るチャンネル')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('hour')
                .setDescription('通知する時（0〜23）')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('minute')
                .setDescription('通知する分（0〜59）')
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const channelId = interaction.options.getChannel('channel').id;
        const hour = interaction.options.getInteger('hour');
        const minute = interaction.options.getInteger('minute');

        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        if (!data[guildId]) data[guildId] = { users: {} };
        data[guildId].notifyChannelId = channelId;
        data[guildId].notifyHour = hour;
        data[guildId].notifyMinute = minute;

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        await interaction.reply({ content: `✅ 通知時間を設定しました：<#${channelId}> ${hour}:${minute}`, ephemeral: true });
    },
};
