const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PresenceUpdateStatus, ChannelType } = require('discord.js');
const GetBadges = require('../../utils/GetBadges');
const SortRoles = require('../../utils/SortRoles');
const GetAllPermissions = require('../../utils/GetAllPermissions');
const GetKeyPermissions = require('../../utils/GetKeyPermissions');
const GetPresence = require('../../utils/GetPresence');
const Reply = require('../../utils/Reply');
const CheckHasRole = require('../../utils/CheckHasRole');
const GetGuildInfo = require('../../utils/GetGuildInfo');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get info about various things in the server!')
    .addSubcommand((sub) =>
        sub.setName('user')
        .setDescription('Get information on a user!')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription(`The user you want to get info on!`)
        )
        .addStringOption((opt) =>
            opt.setName('info')
            .setDescription('Is there something specific you want to know about the user?')
            .addChoices(
                { name: 'ID', value: 'id' },
                { name: 'Full username + discriminator', value: 'fullusername' },
                { name: 'Username', value: 'username' },
                { name: 'Creation Date', value: 'created' },
                { name: 'Nickname', value: 'nickname' },
                { name: 'Discriminator', value: 'discriminator' },
                { name: 'Moderation Protection Status', value: 'mps'},
                { name: 'Avatar', value: 'avatar' },
                { name: 'All Badges', value: 'allbadges' },
                { name: 'Joined Date', value: 'joined' },
                { name: 'Key Permissions', value: 'keypermissions' },
                { name: 'All Permissions', value: 'allpermissions' },
                { name: 'All Roles', value: 'allroles' },
                { name: 'Voice Status', value: 'voicestatus' }
            )
        )
    )
    .addSubcommand((sub) =>
        sub.setName('server')
        .setDescription('Get info about the server!')
        .addStringOption((opt) =>
            opt.setName('info')
            .setDescription('Do you want to know any specific information?')
            .addChoices(
                { name: 'ID', value: 'id' },
                { name: 'Channel Count', value: 'channelcount' },
                { name: 'Creation Date', value: 'creationdate' },
                { name: 'Description', value: 'description' },
                { name: 'Emoji Count', value: 'emojicount' },
                { name: 'Icon', value: 'icon' },
                { name: 'Server Boost Status', value: 'sbs' },
                { name: 'Maximum Bitrate', value: 'maximumbitrate' },
                { name: 'Maximum Members', value: 'maximummembers' },
                { name: 'Member Count', value: 'membercount' },
                { name: 'NSFW Level', value: 'nsfwlevel' },
                { name: 'Owner Info', value: 'ownerinfo' },
                { name: 'All Roles', value: 'allroles' },
                { name: 'Sticker Count', value: 'stickercount' },
                { name: 'Vanity Info', value: 'vanityinfo' },
                { name: 'Verification Level', value: 'verificationlevel' }
            )
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;

        const sub = options.getSubcommand();

        switch(sub) {
            case 'user': {
                const user = options.getUser('user') || interaction.user;
                const info = options.getString('info');

                if(!info) {
                    const member = guild.members.cache.get(user.id);
                    if(member) {
                        const badges = await GetBadges(user);
                        const roles = await SortRoles(member);
                        const { id, tag, username, createdTimestamp, discriminator, displayAvatarURL } = user;
                        const { bannable, kickable, moderatable, joinedTimestamp, voice, permissions } = member;
                        await member.fetch();
                        let voiceStatus;

                        if(!voice.channel) voiceStatus = 'Not connected to voice.'
                        if(voice.channel) voiceStatus = `Speaking in <#${voice.channel.id}>`

                        const keyPermissions = await GetKeyPermissions(member);
                        const presence = await GetPresence(member);

                        const discordms = Math.round(createdTimestamp / 1000);
                        const discordms2 = Math.round(joinedTimestamp / 1000);

                        let customtext;
                        const developers = [
                            '983163377243271291',
                            '1117933631512518716'
                        ]
                        if(developers.includes(member.id)) customtext === "**Verified Stylar Developer**";
                        else customtext === "";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`* User Info: ${presence} ${user.tag}`)
                                .setDescription(`${badges}\n${roles}\n${customtext}`)
                                .addFields(
                                    { name: 'ID', value: `${id}`, inline: true },
                                    { name: `Full Username + Discriminator`, value: `${tag}`, inline: true },
                                    { name: `Account Created`, value: `<t:${discordms}> (<t:${discordms}:R>)`, inline: true },
                                    { name: `Moderation Protection Status`, value: `Bannable: **${bannable}**\nKickable: **${kickable}**\nModeratable: **${moderatable}**`, inline: true },
                                    { name: 'Joined Date', value: `<t:${discordms2}> (<t:${discordms2}:R>)`, inline: true },
                                    { name: `Voice Status`, value: `${voiceStatus}`, inline: true },
                                    { name: `Key Permissions`, value: `${keyPermissions.join(', ') || "No key permissions."}` }
                                )
                                .setFooter({ text: `* ℹ️ To see all permissions that this user has, do /info user allpermissions` })
                                .setThumbnail(user.displayAvatarURL({ size: 1024 }))
                                .setColor('Blue')
                            ]
                        });
                    } else {
                        const badges = await GetBadges(user);
                        const { id, tag, username, createdTimestamp, discriminator, displayAvatarURL } = user;

                        const discordms = Math.round(createdTimestamp / 1000);

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`:warning: User Info: ${user.tag}`)
                                .addFields(
                                    { name: 'ID', value: `${id}`, inline: true },
                                    { name: `Full Username + Discriminator`, value: `${tag}`, inline: true },
                                    { name: `Username`, value: `${username}`, inline: true },
                                    { name: `Account Created`, value: `<t:${discordms}> (<t:${discordms}:R>)`, inline: true },
                                    { name: `Discriminator`, value: `${discriminator}`, inline: true },
                                )
                                .setFooter({ text: `⚠️ This command is running in Limited Mode, since the user mentioned is not in this server.` })
                                .setThumbnail(user.displayAvatarURL({ size: 1024 }))
                                .setColor('Blue')
                            ]
                        });
                    }
                } else {
                    switch(info) {
                        case 'id': {
                            return Reply(interaction, `<@${user.id}>'s ID is ${user.id}.`, '🆔');
                        }
                        break;

                        case 'fullusername': {
                            return Reply(interaction, `<@${user.id}>'s Full Username + Discriminator is ${user.tag}.`, '❓');
                        }
                        break;

                        case 'username': {
                            return Reply(interaction, `<@${user.id}>'s Username is ${user.username}.`, '❓');
                        }
                        break;

                        case 'created': {
                            const discordms = Math.round(user.createdTimestamp / 1000);

                            return Reply(interaction, `<@${user.id}>'s account was created on <t:${discordms}> (<t:${discordms}:R>)`,  '👋');
                        }
                        break;

                        case 'nickname': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                if(!member.nickname) return Reply(interaction, `That user does not have a nickname.`,  '🚫', true);
                                else return Reply(interaction, `<@${user.id}>'s nickname is \`${member.nickname}\`.`,  '✅', true);
                            };
                        }
                        break;

                        case 'discriminator': {
                            if(!user.discriminator || user.discriminator === 0) return Reply(interaction, `<@${user.id}> does not have a discriminator, they are using the new Discord username system.`);
                            else return Reply(interaction, `<@${user.id}>'s discriminator is ${user.discriminator}.`);
                        }
                        break;

                        case 'mps': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                return interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`Moderation Protection Status - ${user.tag}`)
                                        .addFields(
                                            { name: 'Bannable', value: `${member.bannable}`, inline: true },
                                            { name: 'Kickable', value: `${member.kickable}`, inline: true },
                                            { name: 'Moderatable', value: `${member.moderatable}`, inline: true }
                                        )
                                        .setColor('Blue')
                                        .setThumbnail(member.displayAvatarURL({ size: 1024 }))
                                    ]
                                });
                            };
                        }
                        break;

                        case 'avatar': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setAuthor({ name: `${user.tag} - Avatar` })
                                    .setImage(user.displayAvatarURL({ size: 2048 }))
                                    .setColor('Blue')
                                ]
                            });
                        }
                        break;

                        case 'allbadges': {
                            const badges = await GetBadges(user);
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`* ${user.tag} - Badges`)
                                    .setThumbnail(user.displayAvatarURL({ size: 2048 }))
                                    .setDescription(`${badges}`)
                                    .setFooter({ text: `* ℹ️ Some badges may not show, such as the "Known As" badge and the "Supports Commands" badge.` })
                                    .setColor('Blue')
                                ]
                            });
                        }
                        break;

                        case 'joined': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                const discordms = Math.round(member.joinedTimestamp / 1000);
                                return Reply(interaction, `<@${member.id}> joined this server on <t:${discordms}> (<t:${discordms}:R>)`)
                            };
                        }
                        break;

                        case 'keypermissions': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                const keyPerms = await GetKeyPermissions(member);

                                return interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`${user.tag} - Key Permissions`)
                                        .setDescription(`${keyPerms.join(', ')}`)
                                        .setColor('Blue')
                                        .setThumbnail(user.displayAvatarURL({ size: 2048 }))
                                    ]
                                });
                            };
                        }
                        break;

                        case 'allpermissions': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                const allPerms = await GetAllPermissions(member);

                                if(allPerms.join(', ').length > 2048) throw "This user has too many permissions, I cannot display them.";

                                return interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`${user.tag} - All Permissions`)
                                        .setDescription(`${allPerms.join(', ')}`)
                                        .setColor('Blue')
                                        .setThumbnail(user.displayAvatarURL({ size: 2048 }))
                                    ]
                                });
                            };
                        }
                        break;

                        case 'allroles': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                const allroles = await SortRoles(member);

                                return interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setTitle(`${user.tag} - All Roles`)
                                        .setDescription(`${allroles}`)
                                        .setColor('Blue')
                                        .setThumbnail(user.displayAvatarURL({ size: 2048 }))
                                    ]
                                });
                            };
                        }
                        break;

                        case 'voicestatus': {
                            const member = guild.members.cache.get(user.id);
                            if(!member) {
                                return Reply(interaction, `That info cannot be obtained because the user mentioned is not in this server.`, 'Red', '⚠️', false)
                            } else {
                                await member.fetch();
                                const { voice } = member;
                                let voiceStatus;
        
                                if(!voice.channel) voiceStatus = 'Not connected to voice.'
                                if(voice.channel) voiceStatus = `Speaking in <#${voice.channel.id}> with ${voice.channel.members.size - 1} other people.`

                                return Reply(interaction, `<@${user.id}>'s voice status is: ${voiceStatus}`,  '🔉', true);
                            };
                        }
                        break;
                    }
                }
            }
            break;

            case 'server': {
                const guildproperties = await GetGuildInfo(guild);

                const info = options.getString('info');
                if(!info) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`* Guild Info - ${guild.name}`)
                            .addFields(
                                { name: 'ID', value: `${guildproperties.id}`, inline: true },
                                { name: 'Channel Count', value: `${guildproperties.channelCount}`, inline: true },
                                { name: 'Creation Date', value: `<t:${Math.round(guild.createdTimestamp / 1000)}> (<t:${guild.createdTimestamp / 1000}:R>)` },
                                { name: 'Description', value: `${guildproperties.description}`, inline: true },
                                { name: 'Emoji Count', value: `${guildproperties.emojiCount}`, inline: true },
                                { name: 'Server Boost Status', value: `${guildproperties.boostStatus}`, inline: true },
                                { name: 'Maximum Bitrate', value: `${guildproperties.maximumBitrate}`, inline: true },
                                { name: 'Maximum Members', value: `${guildproperties.maximumMembers}`, inline: true },
                                { name: 'Member Count', value: `${guildproperties.memberCount}`, inline: true },
                                { name: 'NSFW Level', value: `${guildproperties.nsfwLevel}`, inline: true },
                                { name: 'Owner Info', value: `🆔 **Owner ID**: ${guildproperties.ownerID}\n👑 **Owner**: <@${guildproperties.ownerID}>`, inline: true },
                                { name: 'Role Count', value: `${guildproperties.roleCount}`, inline: true },
                                { name: 'Sticker Count', value: `${guildproperties.stickerCount}`, inline: true },
                                { name: 'Vanity Info', value: `${guildproperties.vanityInfo}`, inline: true },
                                { name: 'Verification Level', value: `${guildproperties.verificationLevel}`, inline: true },
                            )
                            .setThumbnail(guildproperties.icon)
                            .setColor('Blue')
                            .setFooter({ text: `* ℹ️ To view all roles, run /info server allroles` })
                        ]
                    });
                } else {
                    switch(info) {
                        case 'id': {
                            return Reply(interaction, `The ID of this server is ${guildproperties.id}`,  '👥', true);
                        }
                        break;

                        case 'channelcount': {
                            return Reply(interaction, `There are currently ${guildproperties.channelCount} channels in the server:\n🔉 **Voice**: ${guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildVoice).size}\n#️⃣ **Text**: ${guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText).size}\n📣 **Announcement**: ${guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildAnnouncement).size}`,  '👥', true);
                        }
                        break;

                        case 'creationdate': {
                            return Reply(interaction, `This guild was created on <t:${Math.round(guild.createdTimestamp / 1000)}> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)`,  '👥', true)
                        }
                        break;

                        case 'description': {
                            return Reply(interaction, `This guild's description is \`${guild.description}\``,  '👥', true);
                        }
                        break;

                        case 'emojicount': {
                            return Reply(interaction, `There are currently ${guildproperties.emojiCount} emojis in this server:\n**Animated**: ${guild.emojis.cache.filter((emoji) => emoji.animated).size}\n**Static**: ${guild.emojis.cache.filter((emoji) => !emoji.animated).size}`,  '😂', true);
                        }
                        break;

                        case 'icon': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${guild.name} - Icon`)
                                    .setThumbnail(guildproperties.icon)
                                    .setColor('Blue')
                                ]
                            });
                        }
                        break;

                        case 'sbs': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${guild.name} - Server Boost Status`)
                                    .setDescription(`${guildproperties.boostStatus}`)
                                    .setColor('Blue')
                                    .setThumbnail(guildproperties.icon)
                                ]
                            });
                        }
                        break;

                        case 'maximumbitrate': {
                            return Reply(interaction, `The maximum bitrate in this server is ${guildproperties.maximumBitrate}.`,  '🔉', true);
                        }
                        break;

                        case 'maximummembers': {
                            return Reply(interaction, `The maximum amount of members that this server can hold is ${guildproperties.maximumMembers}.`,  '👥', true);
                        }
                        break;

                        case 'membercount': {
                            return Reply(interaction, `The member count of this server was ${guildproperties.memberCount}.`,  '', true);
                        }
                        break;

                        case 'nsfwlevel': {
                            return Reply(interaction, `The NSFW level of this server is ${guildproperties.nsfwLevel}`,  '🔞', true);
                        }
                        break;

                        case 'ownerinfo': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${guild.name} - Owner Info`)
                                    .setDescription(`This guild is owned by <@${guildproperties.ownerID}> (ID: ${guildproperties.ownerID})`)
                                    .setColor('Blue')
                                    .setThumbnail(guildproperties.icon)
                                ]
                            });
                        }
                        break;

                        case 'rolecount': {
                            return Reply(interaction, `This server has ${guildproperties.roleCount} roles.`,  '👥', true);
                        }
                        break;

                        case 'stickercount': {
                            return Reply(interaction, `This server has ${guildproperties.stickerCount} stickers.`,  '👥', true);
                        }
                        break;

                        case 'vanityinfo': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${guild.name} - Vanity Info`)
                                    .setDescription(`${guildproperties.vanityInfo}`)
                                    .setColor('Blue')
                                    .setThumbnail(guildproperties.icon)
                                ]
                            });
                        }
                        break;

                        case 'verificationlevel': {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`${guild.name} - Verification Level`)
                                    .setDescription(`This guild's verification level is ${guildproperties.verificationLevel}.`)
                                    .setColor('Blue')
                                    .setThumbnail(guildproperties.icon)
                                ]
                            })
                        }
                        break;
                    }
                }
            }
            break;
        }
    }
}