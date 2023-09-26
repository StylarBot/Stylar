const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChannelType
} = require('discord.js');

const ticket = require('../../models/Ticket');
const ticketsystem = require('../../models/TicketSystem');
const reply = require('../../utils/Reply');
const splitter = require('../../utils/splitter');
const pages = require('../../utils/Pagination');

module.exports = {
    clientPermissions: ['ManageChannels', 'SendMessages', 'ReadMessageHistory'],
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket management commands for Stylar!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
        sub.setName('create')
        .setDescription('Create a ticket button prompt!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want the ticket button prompt to be in!')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption((opt) =>
            opt.setName('staff')
            .setDescription('The staff role you want to be pinged when a ticket is created!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('viewactive')
        .setDescription('View all active tickets in the server!')
    )
    .addSubcommand((sub) =>
        sub.setName('info')
        .setDescription('Get the info on a specific ticket in the server!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the ticket. (obtainable through /ticket viewactive)')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('viewall')
        .setDescription('View all active/inactive tickets in the server!')
    )
    .addSubcommand((sub) =>
        sub.setName('close')
        .setDescription('Close an active ticket with its ID!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the ticket. (obtainable through /ticket viewactive)')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('remove')
        .setDescription('Remove the ticket button prompt from a channel!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want to remove the ticket button prompt from!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removeall')
        .setDescription('Remove the ticket button prompt from a channel!')
    )
    .addSubcommand((sub) =>
        sub.setName('transcript')
        .setDescription('View the transcript of any ticket with its ID!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the ticket!')
            .setMaxLength(24)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('access')
        .setDescription('Grant/revoke a user\'s access to a ticket!')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user who\'s access you want to change!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('ticketid')
            .setDescription('The ID of the ticket you want to add the user to!')
            .setMaxLength(24)
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const channel = options.getChannel('channel');
        const staff = options.getRole('staff');
        const id = options.getString('id');
        const ticketid = options.getString('ticketid');
        const user = options.getUser('user');

        const sub = options.getSubcommand();

        const alltickets = await ticket.find({ Guild: interaction.guildId });

        switch(sub) {
            case 'create': {
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

                const button3 = new ButtonBuilder()
                .setCustomId('openticket')
                .setLabel('Open Ticket')
                .setEmoji('📭')
                .setStyle(ButtonStyle.Primary)

                const row1 = new ActionRowBuilder()
                .addComponents(button1, button2)

                const row2 = new ActionRowBuilder()
                .addComponents(button3)

                const validchannel = await guild.channels.cache.get(channel.id);
                const validstaff = await guild.roles.cache.get(staff.id);

                const exists = await ticketsystem.findOne({ Guild: guild.id, Channel: validchannel.id });
                if(exists) throw "There is already a ticket system set up in that channel.";

                if(!validstaff) throw "That is not a valid role in this server.";

                if(!validchannel.name.includes('ticket')) {
                    const msg = await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setDescription(`Are you sure you want to set up the ticket system in a channel not dedicated for it?`)
                            .setColor('Orange')
                            .setFooter({ text: `⚠️ Stylar Warning` })
                        ], components: [row1], ephemeral: true
                    });

                    const collector = await msg.createMessageComponentCollector({ time: 30000 });

                    collector.on('collect', async(results) => {
                        if(results.customId === 'confirm') {
                            const ticketmsg = await validchannel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Ticket System`)
                                    .setDescription(`📭 Press the button below if you wish to make a ticket!\nStaff will get back to you as soon as possible when you open one :D`)
                                    .setThumbnail(guild.iconURL({ size: 1024 }))
                                    .setColor('Blue')
                                ], components: [row2]
                            });

                            msg.edit({
                                content: `\`\`\`Ticket system successfully created!\`\`\``,
                                components: [],
                            });
        
                            await ticketsystem.create({
                                Guild: guild.id,
                                Channel: validchannel.id,
                                StaffRoleID: staff.id,
                                MessageID: ticketmsg
                            });
                        } else {
                            msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Operation Cancelled`)
                                    .setDescription(`The operation was cancelled by the user.`)
                                    .setColor('Red')
                                ], components: []
                            });
                        }
                    });
                } else {
                    const ticketmsg = await validchannel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Ticket System`)
                            .setDescription(`📭 Press the button below if you wish to make a ticket!\nStaff will get back to you as soon as possible when you open one :D`)
                            .setThumbnail(guild.iconURL({ size: 1024 }))
                            .setColor('Blue')
                        ], components: [row2]
                    });

                    await ticketsystem.create({
                        Guild: guild.id,
                        Channel: validchannel.id,
                        StaffRoleID: staff.id,
                        MessageID: ticketmsg
                    });

                    return interaction.reply({
                        content: `Ticket System created!`
                    });
                }
            }
            break;

            case 'viewactive': {
                if(alltickets.length <= 0) throw "There are no tickets in this server.";
                const activetickets = await alltickets.filter((ticket) => ticket.Active === true);

                if(activetickets.length <= 0) throw "There are no active tickets in this server.";

                let actives = [];
                let contributors = [];

                activetickets.forEach((ticket) => {
                    if(ticket.Contributors.length > 0) {
                        ticket.Contributors.forEach((contributor) => contributors.push(`<@${contributor}>`))
                        actives.push(`User: <@${ticket.User}>\nContributors: ${contributors.join('\n')}\nLink to ticket: <#${ticket.Channel}>\nTicket ID: ${ticket._id}`)
                    } else {
                        actives.push(`User: <@${ticket.User}>\nContributors: None\nLink to ticket: <#${ticket.Channel}>\nTicket ID: ${ticket._id}`)
                    }
                });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`All Active Tickets - ${interaction.guild.name}`)
                        .setDescription(`${actives.join('\n\n')}`)
                        .setColor('Blue')
                        .setThumbnail(interaction.guild.iconURL({ size: 1024 }))
                    ]
                });
            }
            break;

            case 'info': {
                if(id.length !== 24) return reply (interaction, "The ID must be 24 characters in length.", '🚫');
                const validticket = await ticket.findById(id);
                if(!validticket) return reply(interaction, `That is not a valid ticket.`, `🚫`, true);
                if(validticket.Guild !== guild.id) throw "That ticket is not in this server!";

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Ticket Info - ${id}`)
                        .addFields(
                            { name: 'ID', value: `${id}` },
                            { name: `User`, value: `${validticket.User}` },
                            { name: `Guild ID`, value: `${validticket.Guild}` },
                            { name: `Channel`, value: `<#${validticket.Channel}>` },
                            { name: `Active?`, value: `${validticket.Active}` }
                        )
                        .setColor('Blue')
                        .setFooter({ text: `Stylar Ticket System` })
                    ]
                });
            }
            break;

            case 'viewall': {
                if(alltickets.length <= 0) throw "There are no tickets in this server.";

                let allticks = [];
                let contributors = [];

                alltickets.forEach((ticket) => {
                    if(ticket.Contributors.length > 0) {
                        ticket.Contributors.forEach((contributor) => contributors.push(`<@${contributor}>`))
                        allticks.push(`User: <@${ticket.User}>\nContributors: ${contributors.join('\n')}\nLink to ticket: <#${ticket.Channel}>\nTicket ID: ${ticket._id}\nActive: ${ticket.Active}`)
                    } else {
                        allticks.push(`User: <@${ticket.User}>\nContributors: None\nLink to ticket: <#${ticket.Channel}>\nTicket ID: ${ticket._id}\nActive: ${ticket.Active}`)
                    }
                });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`All Tickets - ${interaction.guild.name}`)
                        .setDescription(`${allticks.join('\n\n')}`)
                        .setColor('Blue')
                        .setThumbnail(interaction.guild.iconURL({ size: 1024 }))
                    ]
                });
            }
            break;

            case 'close': {
                if(id.length !== 24) return reply (interaction, "The ID must be 24 characters in length.", '🚫');
                const validticket = await ticket.findById(id);
                if(!validticket) return reply(interaction, `That is not a valid ticket.`, `🚫`, true);
                if(validticket.Guild !== guild.id) throw "That ticket is not in this server!";

                const channel = await guild.channels.cache.get(validticket.Channel);
                if(!channel) {
                    validticket.Active === false;
                    validticket.save();
                    throw "That channel was not found. Ticket closing automatically.";
                }

                validticket.Active === false;
                validticket.save();
                await channel.delete();

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Ticket Successfully Closed`)
                        .setDescription(`This ticket has successfully been closed.\nClosed by: ${interaction.user}.`)
                        .setColor('Blue')
                    ]
                });
            }
            break;

            case 'remove': {
                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setEmoji('✅')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success)

                const button2 = new ButtonBuilder()
                .setCustomId('deny')
                .setEmoji('❌')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)

                const validchannel = await guild.channels.cache.get(channel.id);
                if(!validchannel) throw "That channel is not in this server.";

                const validticket = await ticketsystem.findOne({ Guild: guild.id, Channel: validchannel.id });
                if(!validticket) throw "There is no ticket system setup in that channel.";

                const validmessage = await validchannel.messages.cache.get(validticket.MessageID);
                if(!validmessage) {
                    reply(interaction, `Ticket message not found. Ticket system closing in that channel automatically.`, `❌`, true);
                    await validticket.deleteOne();
                } else {
                    const msg = await interaction.reply({
                        content: `\`\`\`⚠️ Are you sure you want to remove the ticket system from this channel?\nTickets will no longer be able to be opened from this channel.\`\`\``,
                        components: [row],
                        ephemeral: true
                    });

                    const collector = await msg.createMessageComponentCollector();

                    collector.on('collect', async(results) => {
                        if(results.user.id !== interaction.user.id) throw "This is not your interaction!";

                        if(results.customId === 'confirm') {
                            await validticket.deleteOne();
                            await validmessage.delete();
                            await msg.edit({
                                content: `\`\`\`✅ Ticket system disabled in this channel.\`\`\``,
                                components: [],
                            });
                        } else {
                            return msg.edit({
                                content: `\`\`\`🚫 Operation cancelled by user.\`\`\``,
                                components: [],
                            });
                        }
                    })
                }
            }
            break;

            case 'removeall': {
                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setEmoji('✅')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success)

                const button2 = new ButtonBuilder()
                .setCustomId('deny')
                .setEmoji('❌')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)

                const validticketsystems = await ticketsystem.find({ Guild: guild.id });
                if(!validticketsystems || validticketsystems.length <= 0) throw "There are no ticket systems setup in the server.";

                const msg = await interaction.reply({
                    content: `\`\`\`⚠️ Are you sure you want to remove the ticket system from this server?\nTickets will no longer be able to be opened.\`\`\``,
                    components: [row],
                    ephemeral: true
                });

                const collector = await msg.createMessageComponentCollector();

                 collector.on('collect', async(results) => {
                    if(results.user.id !== interaction.user.id) throw "This is not your interaction!";

                    if(results.customId === 'confirm') {
                        await ticketsystem.deleteMany({ Guild: guild.id });
                        await msg.edit({
                            content: `\`\`\`✅ All ${validticketsystems.length} ticket system(s) disabled in the server.\`\`\``,
                            components: [],
                        });
                    } else {
                        return msg.edit({
                            content: `\`\`\`🚫 Operation cancelled by user.\`\`\``,
                            components: [],
                        });
                    }
                });
            }
            break;

            case 'transcript': {
                if(id.length !== 24) return reply (interaction, "The ID must be 24 characters in length.", '🚫');
                const validticket = await ticket.findById(id);
                if(!validticket) return reply(interaction, `That is not a valid ticket.`, `🚫`, true);
                if(validticket.Guild !== guild.id) throw "That ticket is not in this server!";

                if(validticket.Transcript.length > 2048) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Uh oh!`)
                            .setDescription(`The transcription appears to be over 2048 characters in length.\nAs a solution, I have attached it as a text file below.`)
                        ],
                        content: `${validticket.Transcript.join('\n')}`
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Transcript - ${validticket._id}`)
                        .setDescription(validticket.Transcript.join('\n'))
                        .setColor('Blue')
                        .setFooter({ text: `https://www.github.com/StylarBot` })
                    ]
                });
            }
            break;

            case 'access': {
                const ticketchannel = await ticket.findOne({ Guild: guild.id, Channel: interaction.channelId });
                if(!ticketchannel && !ticketid) throw "That channel does not have a valid ticket in it!";

                const member = await guild.members.cache.get(user.id);
                if(!member) throw "That member is not in this server.";

                const channel = await guild.channels.cache.get(ticketchannel.Channel);
                if(!channel) {
                    reply(interaction, `Channel does not exist, deleting ticket automatically.`, `🚫`);
                    return ticketchannel.deleteOne();
                }

                const button1 = new ButtonBuilder()
                .setCustomId('grantaccess')
                .setEmoji('✅')
                .setLabel('Grant Access')
                .setStyle(ButtonStyle.Success)

                const button2 = new ButtonBuilder()
                .setCustomId('revokeaccess')
                .setEmoji('❌')
                .setLabel('Revoke Access')
                .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)

                const b = "<:seperator:1156319256858865745>";

                let status;

                if(ticketchannel.AllUsers.includes(member.id)) status = 'Yes';
                else status = 'No';

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Changing Access for ${member.user.tag}`)
                        .setDescription(`Editing Access As ${interaction.user}\n${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}`)
                        .addFields(
                            { name: `Username:`, value: `<@${member.id}>` },
                            { name: `User ID:`, value: `${member.id}` },
                            { name: `Existing Access?`, value: `${status}` }
                        )
                        .setColor('Blue')
                        .setThumbnail(member.displayAvatarURL({ size: 1024 }))
                        .setFooter({ text: `https://github.com/StylarBot` })
                    ], components: [row]
                });

                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async(results) => {
                    if(results.user.id !== interaction.user.id) return results.reply({ content: `This isn't your prompt!`, ephemeral: true });
                    if(results.customId === 'grantaccess') {
                        if(status === 'Yes') return results.reply({
                            content: `This user already has access to this ticket!`
                        });
                        else {
                            await ticketchannel.AllUsers.push(member.id);
                            await ticketchannel.Contributors.push(member.id);
                            ticketchannel.save();

                            channel.permissionOverwrites.edit(member.id, {
                                ViewChannel: true,
                                SendMessages: true,
                                AttachFiles: true,
                                EmbedLinks: true,
                                ReadMessageHistory: true,
                                UseApplicationCommands: true
                            });

                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Changed Access for ${member.user.tag}`)
                                    .setDescription(`Edited Access As ${interaction.user}\n${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}`)
                                    .setColor('Blue')
                                    .addFields(
                                        { name: 'Access', value: `${member.user.tag} now has access to this ticket.` }
                                    )
                                    .setThumbnail(member.displayAvatarURL({ size: 1024 }))
                                    .setFooter({ text: `https://github.com/StylarBot` })
                                ], components: []
                            });
                        }
                    } else if (results.customId === 'revokeaccess') {
                        if(status === 'No') return results.reply({
                            content: `This user already doesn't have access to this ticket!`
                        });
                        else {
                            const indexofAllUsers = ticketchannel.AllUsers.indexOf(member.id);
                            const indexofContributors = ticketchannel.Contributors.indexOf(member.id);
                            await ticketchannel.AllUsers.splice(indexofAllUsers, 1);
                            await ticketchannel.Contributors.splice(indexofContributors, 1);
                            ticketchannel.save();

                            channel.permissionOverwrites.edit(member.id, {
                                ViewChannel: false,
                                SendMessages: false,
                                AttachFiles: false,
                                EmbedLinks: false,
                                ReadMessageHistory: false,
                                UseApplicationCommands: false
                            });

                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Changed Access for ${member.user.tag}`)
                                    .setDescription(`Edited Access As ${interaction.user}\n${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}${b}`)
                                    .setColor('Blue')
                                    .addFields(
                                        { name: 'Access', value: `${member.user.tag} no longer has access to this ticket.` }
                                    )
                                    .setThumbnail(member.displayAvatarURL({ size: 1024 }))
                                    .setFooter({ text: `https://github.com/StylarBot` })
                                ], components: []
                            });
                        }
                    } else return;
                });
            }
            break;
        }
    }
}