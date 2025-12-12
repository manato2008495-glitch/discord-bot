const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, './data/timetable.json');

function dailyNotify(client) {
    const checkInterval = 60 * 1000; // 1分ごとにチェック

    setInterval(() => {
        const now = new Date();
        const day = now.getDay(); // 0:日曜, 1:月曜 ... 6:土曜
        if (day === 0 || day === 6) return; // 土日はスキップ

        if (!fs.existsSync(dataPath)) return;
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        for (const guildId in data) {
            const guildData = data[guildId];
            if (!guildData.notifyChannelId || guildData.notifyHour === undefined || guildData.notifyMinute === undefined) continue;

            if (now.getHours() === guildData.notifyHour && now.getMinutes() === guildData.notifyMinute) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;
                const channel = guild.channels.cache.get(guildData.notifyChannelId);
                if (!channel) continue;

                let message = `📅 本日の時間割 (${['月','火','水','木','金'][day-1]}曜日)\n`;
                for (const userId in guildData.users) {
                    const userTimetable = guildData.users[userId][day];
                    if (userTimetable) {
                        message += `<@${userId}>: ${userTimetable.join(', ')}\n`;
                    }
                }

                channel.send(message);
            }
        }
    }, checkInterval);
}

module.exports = dailyNotify;
