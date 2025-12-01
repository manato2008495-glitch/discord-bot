const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, './data/timetable.json');

function dailyNotify(client) {
    const checkInterval = 60 * 1000; // 1分ごと

    setInterval(async () => {
        const now = new Date(Date.now() + 1000 * 60 * 60 * 9); // JST補正
        const day = now.getDay();
        if (day === 0 || day === 6) return; // 土日スキップ

        if (!fs.existsSync(dataPath)) return;
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        for (const guildId in data) {
            const guildData = data[guildId];
            if (!guildData.notifyChannelId || !guildData.users) continue;
            const channel = client.channels.cache.get(guildData.notifyChannelId);
            if (!channel) continue;

            for (const userId in guildData.users) {
                const userData = guildData.users[userId];
                if (!userData.notifyHour || userData.notifyMinute === undefined) continue;

                if (now.getHours() === userData.notifyHour && now.getMinutes() === userData.notifyMinute) {
                    const dayNameMap = ['日','月','火','水','木','金','土'];
                    const dayName = dayNameMap[day];
                    const subjects = userData[day] || [];

                    if (subjects.length > 0) {
                        const message = `📅 本日の時間割 (${dayName}曜日)\n<@${userId}>: ${subjects.join(', ')}`;
                        try {
                            await channel.send(message);
                        } catch (err) {
                            console.error(`通知送信失敗: ${guildId} / ${userId}`, err);
                        }
                    }
                }
            }
        }
    }, checkInterval);
}

module.exports = dailyNotify;
