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
                });

                await ar.create({
                    Guild: guild.id,
                    Channel: channel.id,
                    Emojis: [emoji]
                });

                return Reply(interaction, `Autoreaction system set up in ${channel.name}. All messages will be reacted with ${emoji}.`, '✅', false);
            }
            break;

            case 'addemoji': {
                const autoreactions = await ar.find({ Guild: guild.id });
                if(!autoreactions || autoreactions.length <= 0) throw "There are no autoreactions in this server to add an emoji to!";

                autoreactions.forEach((autoreaction) => {
                    if(autoreaction.Channel === channel.id) {
                        if(autoreaction.Emojis.includes(emoji)) throw "That emoji is already included in this autoreaction channel!";

                        autoreaction.Emojis.push(emoji);
                    }
                });

                return Reply(interaction, `Successfully added ${emoji} as an autoreaction in ${channel.name}.`, '✅', false);
            }
            break;

            case 'removeemoji': {
                const autoreactions = await ar.find({ Guild: guild.id });
                if(!autoreactions || autoreactions.length <= 0) throw "There are no autoreactions in this server to add an emoji to!";

                autoreactions.forEach((autoreaction) => {
                    if(autoreaction.Channel === channel.id) {
                        if(!autoreaction.Emojis.includes(emoji)) throw "That emoji is not included in this autoreaction channel!";

                        const index = autoreaction.Emojis.indexOf(emoji);

                        autoreaction.Emojis.splice(index, 1);
                    }
                });

                return Reply(interaction, `Successfully removed ${emoji} as an autoreaction from ${channel.name}.`, '✅', false);
            }
            break;

            case 'removechannel': {
                const autoreactions = await ar.find({ Guild: guild.id });

                const autoreactionchannel = await ar.findOne({ Guild: guild.id, Channel: channel.id });
                if(!autoreactionchannel) throw "That channel does not have an auto reaction system set up! If you want to add another emoji, use /autoreact addemoji!";

                await autoreactionchannel.deleteOne();
                await autoreactionchannel.save();

                return Reply(interaction, `Autoreaction system removed from ${channel.name}. All messages sent in this channel will not receive a reaction from now on..`, '✅', false);
            }
            break;

            case 'removeall': {
                const allars = await ar.find({ Guild: guild.id });
                if(!allars || allars.length <= 0) throw "There are no auto reactions set up in this server!";

                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
                
                const button2 = new ButtonBuilder()
                .setCustomId('abort')
                .setLabel('Abort')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)
                
                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`⚠️ Confirmation Required.`)
                        .setDescription(`Are you sure you want to remove all autoreactions from this server? This cannot be undone.`)
                        .setColor('Orange')
                    ], components: [row]
                });

                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async(results) => {
                    if(results.customId === 'confirm') {
                        await ar.deleteMany({ Guild: guild.id });

                        await msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`✅ All Autoreactions Removed`)
                                .setDescription(`All autoreactions have been removed from this server.`)
                                .setColor('Green')
                            ], components: []
                        });
                    } else {
                        await msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`❌ Operation Aborted`)
                                .setDescription(`The operation has been cancelled.`)
                                .setColor('Red')
                            ], components: []
                        });
                    }
                })
            }
            break;
        }
    }
}