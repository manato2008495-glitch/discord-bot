const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, './data/timetable.json');

function dailyNotify(client) {
    const checkInterval = 60 * 1000; // 1分ごと

    setInterval(async () => {

        // ★★★ JST に補正 ★★★
        const now = new Date(Date.now() + 1000 * 60 * 60 * 9);

        // ★★★ JST ログ ★★★
        console.log("現在のJST時刻:", now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));

        const day = now.getDay(); // 0:日曜〜6:土曜
        if (day === 0 || day === 6) return; // 土日は通知しない

        if (!fs.existsSync(dataPath)) return;
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        for (const guildId in data) {
            const guildData = data[guildId];
            if (!guildData) continue;

            // 通知設定がなければスキップ
            if (
                !guildData.notifyChannelId ||
                guildData.notifyHour === undefined ||
                guildData.notifyMinute === undefined
            ) continue;

            // ★★★ 時間一致チェック ★★★
            if (now.getHours() === guildData.notifyHour &&
                now.getMinutes() === guildData.notifyMinute) {

                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                const channel = guild.channels.cache.get(guildData.notifyChannelId);
                if (!channel) continue;

                const dayNameMap = ['日', '月', '火', '水', '木', '金', '土'];
                const dayName = dayNameMap[day];

                let message = `📅 本日の時間割 (${dayName}曜日)\n`;

                // ユーザーごとの時間割を追加
                for (const userId in guildData.users) {
                    const subjects = guildData.users[userId][day];

                    if (subjects && subjects.length > 0) {
                        message += `<@${userId}>: ${subjects.join(', ')}\n`;
                    }
                }

                // 何か書かれていれば送信
                if (message.trim() !== `📅 本日の時間割 (${dayName}曜日)`) {
                    try {
                        await channel.send(message);
                        console.log(`通知送信完了: ${guildId}`);
                    } catch (err) {
                        console.error(`通知送信失敗: ${guildId}`, err);
                    }
                }
            }
        }
    }, checkInterval);
}

module.exports = dailyNotify;
