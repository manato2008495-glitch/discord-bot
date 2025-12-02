const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const dataPath = path.join(__dirname, './data/timetable.json');

module.exports = (client) => {
    console.log('✅ daily_notify 起動');

    // 毎分チェック
    cron.schedule('* * * * *', async () => {
        try {
            if (!fs.existsSync(dataPath)) return;

            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const now = new Date();
            const nowHour = now.getHours();
            const nowMinute = now.getMinutes();
            const weekday = now.getDay(); // 0=日曜, 1=月曜, ...

            if (weekday < 1 || weekday > 5) return; // 平日のみ

            for (const guildId of Object.keys(data)) {
                const guildData = data[guildId];
                if (!guildData.notifyChannelId) continue;
                if (guildData.notifyHour !== nowHour || guildData.notifyMinute !== nowMinute) continue;

                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                const channel = guild.channels.cache.get(guildData.notifyChannelId);
                if (!channel) continue;

                // メッセージ作成
                let msg = `⏰ **${['月','火','水','木','金'][weekday-1]}曜日の時間割通知**\n\n`;
                for (const userId of Object.keys(guildData.users || {})) {
                    const subjects = guildData.users[userId][weekday.toString()] || [];
                    msg += `<@${userId}>: ${subjects.join(', ') || '未登録'}\n`;
                }

                await channel.send(msg);
                console.log(`✅ 通知送信: ${guildId}`);
            }

        } catch (err) {
            console.error('daily_notify エラー:', err);
        }
    });
};
