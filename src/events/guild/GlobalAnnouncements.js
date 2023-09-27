const { Message, Client } = require('discord.js');
const ga = require('../../models/GlobalAnnouncements');

module.exports = {
    name: 'messageCreate',

    /**
     * 
     * @param {Message} message
     * @param {Client} client
     */

    async execute(message, client) {
        const global = await ga.findOne({ Guild: message.guildId });
        if(!global) {
            const validchannel = await message.guild.channels.cache.find((ch) => ch.permissionsFor(client.user).has("SendMessages"));
            if(!validchannel) return;

            await ga.create({
                Guild: message.guildId,
                Channel: validchannel.id
            });
        } else return;
    }
}