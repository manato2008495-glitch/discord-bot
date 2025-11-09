const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const timetablePath = path.join(__dirname, 'data/timetable.json');

// 通知先チャンネルIDをここにセット
const channelId = '1414423166964727960';

module.exports = (client) => {
    console.log('📢 サーバー通知システム起動');

    // 毎分チェックして07:00になったら通知
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour !== 7 || minute !== 0) return; // 07:00以外はスキップ

        if (!fs.existsSync(timetablePath)) return;

        const timetableData = JSON.parse(fs.readFileSync(timetablePath, 'utf8'));

        const day = now.getDay(); // 0(日)〜6(土)
        if (day === 0) return; // 日曜は通知しない

        const dayName = ['月','火','水','木','金','土'][day - 1];
        const channel = await client.channels.fetch(channelId);

        for (const userId of Object.keys(timetableData)) {
            const userData = timetableData[userId];
            if (!userData || !userData[day]) continue;

            const subjects = userData[day];
            const message = `📅 今日の時間割 (${dayName}曜日)\n` +
                            subjects.map((s, i) => `${i + 1}限: ${s}`).join('\n');

            try {
                await channel.send(`<@${userId}>\n${message}`);
            } catch (err) {
                console.error(`送信失敗: ${userId}`, err);
            }
        }
    }, { timezone: "Asia/Tokyo" });
};
