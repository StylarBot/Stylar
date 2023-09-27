const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const autoreply = require('../../models/Autoreply');
const reply = require('../../utils/reply');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autoreply')
    .setDescription('Setup an autoreply function in your server!')
    .addSubcommand((sub) =>
        sub.setName('add')
        .setDescription('Add an autoreply!')
        .addStringOption((opt) =>
            opt.setName('phrase')
            .setDescription('What do you want the bot to reply to?')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('reply')
            .setDescription('What do you want the bot to reply with?')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('remove')
        .setDescription('Remove an autoreply!')
        .addStringOption((opt) =>
            opt.setName('phrase')
            .setDescription('What was the phrase that triggered the autoreply?')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removeall')
        .setDescription('Remove all autoreplies!')
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const sub = options.getSubcommand();
        const phrase = options.getString('phrase');
        const repli = options.getString('reply');

        switch(sub) {
            case 'add': {
                const exists = await autoreply.findOne({ Guild: guild.id, Phrase: phrase });
                if(exists) throw "An autoreply with that trigger already exists!";

                await autoreply.create({
                    Guild: guild.id,
                    Phrase: phrase,
                    Reply: repli,
                });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`✅ Autoreply set up`)
                        .setDescription('An autoreply has been set up in the server.')
                        .setColor('Blue')
                        .addFields(
                            { name: 'Phrase (trigger)', value: `"${phrase}"` },
                            { name: 'Response', value: `"${repli}"` },
                            { name: 'Added By', value: `<@${interaction.user.id}>` }
                        )
                        .setThumbnail(guild.iconURL({ size: 1024 }))
                    ]
                });
            }
            break;

            case 'remove': {
                const exists = await autoreply.findOne({ Guild: guild.id, Phrase: phrase });
                if(!exists) throw "That autoreply doesn't exist! Make sure you got the phrase right.";

                await exists.deleteOne();
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`✅ Autoreply removed`)
                        .setDescription('An autoreply has been removed from the server.')
                        .setColor('Blue')
                        .addFields(
                            { name: 'Phrase (trigger)', value: `"${phrase}"` },
                            { name: 'Response', value: `"${repli}"` },
                            { name: 'Removed By', value: `<@${interaction.user.id}>` }
                        )
                        .setThumbnail(guild.iconURL({ size: 1024 }))
                    ]
                });
            }
            break;

            case 'removeall': {
                const allreplies = await autoreply.find({ Guild: guild.id });
                if(!allreplies || allreplies.length <= 0) throw "There are no autoreplies set up in this server.";

                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setEmoji('✅')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success)

                const button2 = new ButtonBuilder()
                .setCustomId('abort')
                .setEmoji('❌')
                .setLabel('Abort')
                .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`⚠️ Confirmation Needed.`)
                        .setDescription(`Are you sure you want to remove ALL autoreplies from the server?\nThis cannot be undone.`)
                        .setColor('Orange')
                    ], components: [row], ephemeral: true
                });

                const collector = await msg.createMessageComponentCollector({ time: 30000 });

                collector.on('collect', async(results) => {
                    if(results.user.id !== interaction.user.id) return results.reply({ content: `This is not your prompt!`, ephemeral: true });
                    if(results.customId === 'confirm') {
                        let phrases = [];
                        let replies = [];

                        allreplies.forEach((autoreply) => {
                            phrases.push(`"${autoreply.Phrase}"`);
                            replies.push(`"${autoreply.Reply}"`);
                        });

                        await autoreply.deleteMany({ Guild: guild.id });

                        return msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`✅ All autoreplies removed`)
                                .setDescription('All autoreplies have been removed from the server.')
                                .setColor('Blue')
                                .addFields(
                                    { name: 'Phrase (trigger)', value: `${phrases.join(', ')}` },
                                    { name: 'Response', value: `${replies.join(', ')}` },
                                    { name: 'Removed By', value: `<@${interaction.user.id}>` }
                                )
                                .setThumbnail(guild.iconURL({ size: 1024 }))
                            ], components: []
                        });
                    } else if (results.customId === 'abort') {
                        return msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`❌ Operation Aborted`)
                                .setDescription(`The operation has been cancelled due to inactivity.`)
                                .setColor('Red')
                            ], components: []
                        });
                    }
                }).on('end', async() => {
                    return msg.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`❌ Operation Aborted`)
                            .setDescription(`The operation has been cancelled due to inactivity.`)
                            .setColor('Red')
                        ], components: []
                    });
                })
            }
            break;
        }
    }
}