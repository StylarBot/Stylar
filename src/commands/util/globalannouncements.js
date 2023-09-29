const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client, ChannelType, PermissionFlagsBits } = require('discord.js');
const ga = require('../../models/GlobalAnnouncements');
const { default: axios } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('globalannouncements')
    .setDescription('Configure Stylar\'s global announcements!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
        sub.setName('setchannel')
        .setDescription('Set the channel you want Stylar\'s global announcements to be sent to!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want global announcements to be sent to!')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('off')
        .setDescription('Turn off Stylar global announcements! (NOT RECOMMENDED)')
    )
    .addSubcommand((sub) =>
        sub.setName('send')
        .setDescription('Send a global announcement to all servers that use Stylar! (DEVELOPER ONLY)')
        .addStringOption((opt) =>
            opt.setName('status')
            .setDescription('The type of status you want.')
            .setRequired(true)
            .addChoices(
                { name: 'Error', value: 'error' },
                { name: 'Update', value: 'update' },
                { name: 'Downtime', value: 'downtime' }
            )
        )
        .addStringOption((opt) =>
            opt.setName('message')
            .setDescription('The message you want to send!')
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { options, guild } = interaction;

        const sub = options.getSubcommand();
        const channel = options.getChannel('channel') || interaction.channel;
        if(!channel) throw "That channel is not in this server.";
        const status = options.getString('status');
        const message = options.getString('message') || "No message from developers.";

        switch(sub) {
            case 'setchannel': {
                const validanc = await ga.findOne({ Guild: guild.id });
                if(validanc) {
                    await validanc.updateOne({ Guild: guild.id }, { Channel: channel.id }, { new: true });
                    await validanc.save();

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`✅ Channel Updated`)
                            .setDescription(`The channel that Stylar's global announcements will be sent to has been changed.`)
                            .addFields(
                                { name: 'New Channel', value: `<#${channel.id}>` },
                                { name: `Changed By`, value: `<@${interaction.user.id}>` }
                            )
                            .setColor('Blue')
                            .setFooter({ text: `https://github.com/StylarBot` })
                        ]
                    });
                } else {
                    await ga.create({
                        Guild: guild.id,
                        Channel: channel.id
                    });

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`✅ Channel Set`)
                            .setDescription(`The channel that Stylar's global announcements will be sent to has been set.`)
                            .addFields(
                                { name: 'Channel', value: `<#${channel.id}>` },
                                { name: `Changed By`, value: `<@${interaction.user.id}>` }
                            )
                            .setColor('Blue')
                            .setFooter({ text: `https://github.com/StylarBot` })
                        ]
                    });
                }
            }
            break;

            case 'off': {
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
                        .setDescription(`Are you sure you want to turn OFF the global announcements system?\nYou will not receive status notifications if Stylar goes down or updates.`)
                        .setColor('Orange')
                    ], components: [row], ephemeral: true
                });

                const collector = await msg.createMessageComponentCollector({ time: 30000 });

                collector.on('collect', async(results) => {
                    if(results.user.id !== interaction.user.id) return results.reply({ content: `This is not your prompt!`, ephemeral: true });

                    if(results.customId === 'confirm') {
                        const global = await ga.findOne({ Guild: guild.id });
                        if(!global) {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`✅ Disabled Global Announcements`)
                                    .setDescription(`You will **no longer** receive status updates about Stylar.\n:warning: This may result in the bot going down/updating without your knowledge.`)
                                    .setColor('Blue')
                                ], components: []
                            });
                        } else {
                            await global.deleteOne();

                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`✅ Disabled Global Announcements`)
                                    .setDescription(`You will **no longer** receive status updates about Stylar.\n:warning: This may result in the bot going down/updating without your knowledge.`)
                                    .setColor('Blue')
                                ], components: []
                            });
                        }
                    } else if (results.customId === 'abort') {
                        await msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`❌ Operation Aborted`)
                                .setDescription(`The operation has been cancelled.`)
                                .setColor('Red')
                            ], components: []
                        });
                    }
                }).on('end', async() => {
                    await msg.edit({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`❌ Operation Aborted`)
                            .setDescription(`The operation has been cancelled.`)
                            .setColor('Red')
                        ], components: []
                    });
                });
            }
            break;

            case 'send': {
                const developers = (await axios.get(`https://stylar-dev.discordand.repl.co/api/developers`)).data.developers;

                if(!developers.includes(interaction.user.id)) throw "This is a DEVELOPER ONLY command!";

                const global = await ga.find();

                global.forEach(async(gas) => {
                    const guild = await client.guilds.cache.get(gas.Guild);
                    if(!guild) {
                        return gas.deleteOne();
                    } else {
                        const channel = await guild.channels.cache.get(gas.Channel);
                        if(!channel) {
                            return gas.deleteOne();
                        } else {
                            if(!channel.permissionsFor(client.user).has('SendMessages')) return;
                            if(!channel.permissionsFor(client.user).has('EmbedLinks')) return;
                            if(channel.type !== ChannelType.GuildText) return;

                            let emoji;
                            let color;
                            let basemsg;

                            switch(status) {
                                case 'error': {
                                    emoji = '❌';
                                    color = 'Red';
                                    basemsg = 'Stylar is experiencing an error.';
                                }
                                break;

                                case 'update': {
                                    emoji = '<:update:1156624941245009960>';
                                    color = 'Green';   
                                    basemsg = 'Stylar is updating.';
                                }
                                break;

                                case 'downtime': {
                                    emoji = '🕒';
                                    color = 'Blue';
                                    basemsg = 'Stylar is undergoing downtime.';
                                }
                                break;
                            }

                            channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${emoji} ${basemsg}`)
                                    .setDescription(`${message}`)
                                    .setColor(color)
                                ]
                            });
                        }
                    }
                });

                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setTitle(`Global Announcement Sent`)
                    .setDescription(`A global announcement has been sent to all servers with this bot.`)
                    .setColor('Blue')
                    .addFields(
                        { name: `Sender`, value: `<@${interaction.user.id}>` },
                        { name: `Status`, value: `${status}` },
                        { name: `Message`, value: `${message}` }
                    )
                ], ephemeral: true });
            }
            break;
        }
    }
}