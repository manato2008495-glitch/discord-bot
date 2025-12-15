const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/timetable.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_notify_time')
    .setDescription('通知時間を設定')
    .addIntegerOption(opt =>
      opt.setName('hour').setDescription('時(0-23)').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('minute').setDescription('分(0-59)').setRequired(true)),

  async execute(interaction) {
    try {
      // ★★★ ここに入れる ★★★
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral
      });

      // ===== ここから通常処理 =====
      const hour = interaction.options.getInteger('hour');
      const minute = interaction.options.getInteger('minute');

      if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, '{}');
      }

      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      if (!data[guildId]) {
        data[guildId] = { notifyChannelId: interaction.channelId, users: {} };
      }

      if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
          notifyHour: null,
          notifyMinute: null,
          1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        };
      }

      data[guildId].notifyChannelId = interaction.channelId;
      data[guildId].users[userId].notifyHour = hour;
      data[guildId].users[userId].notifyMinute = minute;

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      await interaction.editReply(
        `✅ あなたの通知時間を **${hour}時${minute}分** に設定した`
      );

    } catch (err) {
      console.error(err);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('❌ エラーが発生した');
      }
    }
  }
};
