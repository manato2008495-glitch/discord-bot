const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, './data/timetable.json');
const cron = require('node-cron');

module.exports = (client) => {

    // 毎分チェック
    cron.schedule('* * * * *', async () => {
        let data = {};

        if (fs.existsSync(dataPath)) {
            try {
                data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            } catch (e) {
                console.error('JSON parse error:', e);
                return;
            }
        }

        const now = new Date();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        for (const guildId of Object.keys(data)) {
            const guildData = data[guildId];

            if (!guildData.notifyChannelId) continue;

            // 時刻一致?
            if (guildData.notifyHour !== nowHour || guildData.notifyMinute !== nowMinute) {
                continue;
            }

            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const channel = guild.channels.cache.get(guildData.notifyChannelId);
            if (!channel) continue;

            // 全ユーザーの今日の時間割をまとめる
            const weekday = now.getDay(); // 1=月

            if (weekday < 1 || weekday > 5) continue;

            let msg = `⏰ **${weekday}曜日の時間割通知**\n\n`;

            for (const userId of Object.keys(guildData.users)) {
                const subjects = guildData.users[userId][weekday.toString()] || [];
                msg += `<@${userId}>: ${subjects.join(', ') || '未登録'}\n`;
            }

            channel.send(msg);
            console.log('Sent notify to', guildId);
        }
    });

};
