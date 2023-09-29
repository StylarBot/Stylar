const { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const ar = require('../../models/Auto-Reaction');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autoreact')
    .setDescription('Manage the auto reaction system in your server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((sub) =>
        sub.setName('addchannel')
        .setDescription('Add a channel to the auto reaction system!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want the auto reactions to take place in!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('emoji')
            .setDescription('The emoji you want messages to be reacted with!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('addemoji')
        .setDescription('Add another auto reaction to a channel!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want the new auto reaction to take place in!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('emoji')
            .setDescription('The emoji you want new messages to be reacted with!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removeemoji')
        .setDescription('Remove an emoji from an auto reaction!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel the auto reaction is in!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('emoji')
            .setDescription('The emoji that you want to remove!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removechannel')
        .setDescription('Remove a channel from the auto reaction system!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want to remove from the auto reaction')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removeall')
        .setDescription('Remove all auto reactions from the server!')
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const sub = options.getSubcommand();
        const channel = options.getChannel('channel') || interaction.channel;
        const validchannel = await guild.channels.cache.get(channel.id);
        if(!validchannel) throw "That is not a valid channel in the server.";
        const emoji = options.getString('emoji');

        switch(sub) {
            case 'addchannel': {
                const autoreactions = await ar.find({ Guild: guild.id });

                autoreactions.forEach((autoreaction) => {
                    if(autoreaction.Channel === channel.id) throw "That channel already has an auto reaction system set up! If you want to add another emoji, use /autoreact addemoji!";
                    else {
                        
                    }
                });
            }
            break;

            case 'addemoji': {
                
            }
            break;

            case 'removeemoji': {

            }
            break;

            case 'removechannel': {

            }
            break;

            case 'removeall': {

            }
            break;
        }
    }
}