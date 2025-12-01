const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, './data/timetable.json');

function dailyNotify(client) {
    const checkInterval = 60 * 1000; // 1分ごと

    setInterval(async () => {

        // ★★★ JST に変換 ★★★
        const now = new Date(Date.now() + 1000 * 60 * 60 * 9);

        const day = now.getDay(); 
        if (day === 0 || day === 6) return; 

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

                const dayNameMap = ['日','月','火','水','木','金','土'];
                const dayName = dayNameMap[day];

                let message = `📅 本日の時間割 (${dayName}曜日)\n`;

                for (const userId in guildData.users) {
                    const subjects = guildData.users[userId][day];
                    if (subjects && subjects.length > 0) {
                        message += `<@${userId}>: ${subjects.join(', ')}\n`;
                    }
                }

                if (message.trim() !== `📅 本日の時間割 (${dayName}曜日)`) {
                    try {
                        await channel.send(message);
                    } catch (err) {
                        console.error(`通知送信失敗: ${guildId}`, err);
                    }
                }
            }
        }
    }, checkInterval);
}

module.exports = dailyNotify;
