// events/ready.js
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`ログイン完了: ${client.user.tag}`);
    },
};
