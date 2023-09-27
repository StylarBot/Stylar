const { Message, Client } = require('discord.js');
const autoreply = require('../../models/Autoreply');

module.exports = {
    name: 'messageCreate',

    /**
     * 
     * @param {Message} message
     * @param {Client} client
     */

    async execute(message, client) {
        const autoreplies = await autoreply.find({ Guild: message.guild.id });
        if(!autoreplies || autoreplies.length <= 0) return;

        autoreplies.forEach((auto) => {
            if(message.content.includes(auto.Phrase)) {
                return message.reply({ content: `${auto.Reply}` });
            } else return;
        });
    }
}