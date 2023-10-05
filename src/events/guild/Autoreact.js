const { Message, Client } = require('discord.js');
const autoreact = require('../../models/Auto-Reaction');

module.exports = {
    name: 'autoreact',

    /**
     * 
     * @param {Message} message
     * @param {Client} client
     */

    async execute(message, client) {
        const ars = await autoreact.findOne({ Guild: message.guildId, Channel: message.channel.id });
        if(!ars) return;
    
        ars.Emojis.forEach(async(emoji) => {
            try {
                await message.react(emoji);
            } catch (err) {
                return;
            }
        });
    }
}