const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const tempban = require('../../models/Tempban');
const moderation = require('../../models/Moderation');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('punishment')
    .setDescription('Punishment management for users in your server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
        sub.setName('remove')
        .setDescription('Remove a punishment from a user!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the punishment! (obtainable through /punishment viewall)')
            .setRequired(true)
            .setMaxLength(24)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('info')
        .setDescription('Get information on a punishment using its ID!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the punishment! (obtainable through /punishment viewall)')
            .setRequired(true)
            .setMaxLength(24)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('view')
        .setDescription('View selected punishments that a user has received!')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user whos punishments you want to check!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('type')
            .setDescription('The type of punishment you want to check!')
            .setRequired(true)
            .addChoices(
                { name: 'All', value: 'all' },
                { name: 'Bans', value: 'bans' },
                { name: 'Kicks', value: 'kicks' },
                { name: 'Mutes', value: 'mutes' },
                { name: 'Tempbans', value: 'tempbans' },
                { name: 'Warnings', value: 'warnings' }
            )
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const user = options.getUser('user') || interaction.user;
        const type = options.getString('type');
        const id = options.getString('id');
        const sub = options.getSubcommand();

        switch(sub) {
            case 'remove': {
                const punishment = await moderation.findById(id);
                if(!punishment) throw "That ID does not lead to a valid punishment.";
                if(punishment.Guild !== guild.id) throw "That ID does not lead to a valid punishment in this server.";

                await punishment.deleteOne();
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`✅ Punishment Removed`)
                        .setDescription(`The punishment issued to <@${punishment.User}> has been removed.`)
                        .addFields(
                            { name: 'User', value: `<@${punishment.User}>`, inline: true },
                            { name: 'Moderator', value: `<@${punishment.Moderator}>`, inline: true },
                            { name: 'Punishment', value: `${punishment.Punishment}`, inline: true },
                            { name: 'Guild ID', value: `${punishment.Guild}`, inline: true },
                            { name: 'Reason', value: `${punishment.Reason}`, inline: true },
                            { name: 'Date + Time Given', value: `<t:${Math.round(punishment.DateTimeMS / 1000)}> (<t:${Math.round(punishment.DateTimeMS / 1000)}:R>)`, inline: true },
                        )
                        .setColor('Blue')
                        .setFooter({ text: `https://github.com/StylarBot` })
                    ]
                });
            }
            break;

            case 'view': {
                switch(type) {
                    case 'all': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const bans = await punishments.filter((punish) => punish.Punishment === 'Ban');
                        const kicks = await punishments.filter((punish) => punish.Punishment === 'Kick');
                        const mutes = await punishments.filter((punish) => punish.Punishment === 'Mute');
                        const tempbans = await punishments.filter((punish) => punish.Punishment === 'Tempban');
                        const warnings = await punishments.filter((punish) => punish.Punishment === 'Warning');
                    }
                    break;

                    case 'bans': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const bans = await punishments.filter((punish) => punish.Punishment === 'Ban');
                        if(bans.length <= 0) throw "That user has had no bans!";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Punishment History - Bans`)
                                .setDescription(`<@${user.id}> has had ${bans.length} bans.`)
                                .setColor('Blue')
                                .setFooter({ text: `https://github.com/StylarBot` })
                            ]
                        });
                    }
                    break;

                    case 'kicks': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const kicks = await punishments.filter((punish) => punish.Punishment === 'Kick');
                        if(kicks.length <= 0) throw "That user has had no bans!";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Punishment History - Kicks`)
                                .setDescription(`<@${user.id}> has had ${kicks.length} kicks.`)
                                .setColor('Blue')
                                .setFooter({ text: `https://github.com/StylarBot` })
                            ]
                        });
                    }
                    break;

                    case 'mutes': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const mutes = await punishments.filter((punish) => punish.Punishment === 'Mute');
                        if(mutes.length <= 0) throw "That user has had no bans!";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Punishment History - Mutes`)
                                .setDescription(`<@${user.id}> has had ${mutes.length} mutes.`)
                                .setColor('Blue')
                                .setFooter({ text: `https://github.com/StylarBot` })
                            ]
                        });
                    }
                    break;

                    case 'tempbans': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const tempbans = await punishments.filter((punish) => punish.Punishment === 'Tempban');
                        if(tempbans.length <= 0) throw "That user has had no bans!";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Punishment History - Tempbans`)
                                .setDescription(`<@${user.id}> has had ${tempbans.length} tempbans.`)
                                .setColor('Blue')
                                .setFooter({ text: `https://github.com/StylarBot` })
                            ]
                        });
                    }
                    break;

                    case 'warnings': {
                        const punishments = await moderation.find({ Guild: guild.id, User: user.id });
                        if(!punishments || punishments.length <= 0) throw "That user has no punishments!";

                        const warnings = await punishments.filter((punish) => punish.Punishment === 'Warning');
                        if(warnings.length <= 0) throw "That user has had no bans!";

                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Punishment History - Warnings`)
                                .setDescription(`<@${user.id}> has had ${warnings.length} warnings.`)
                                .setColor('Blue')
                                .setFooter({ text: `https://github.com/StylarBot` })
                            ]
                        });
                    }
                    break;
                }
            }
            break;

            case 'info': {
                const punishment = await moderation.findById(id);
                if(!punishment) throw "That ID does not lead to a valid punishment.";
                if(punishment.Guild !== guild.id) throw "That ID does not lead to a valid punishment in this server.";

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Punishment Information - ${id}`)
                        .setDescription(`The punishment issued to <@${punishment.User}> has been removed.`)
                        .addFields(
                            { name: 'User', value: `<@${punishment.User}>`, inline: true },
                            { name: 'Moderator', value: `<@${punishment.Moderator}>`, inline: true },
                            { name: 'Punishment', value: `${punishment.Punishment}`, inline: true },
                            { name: 'Guild ID', value: `${punishment.Guild}`, inline: true },
                            { name: 'Reason', value: `${punishment.Reason}`, inline: true },
                            { name: 'Date + Time Given', value: `<t:${Math.round(punishment.DateTimeMS / 1000)}> (<t:${Math.round(punishment.DateTimeMS / 1000)}:R>)`, inline: true },
                        )
                        .setColor('Blue')
                        .setFooter({ text: `https://github.com/StylarBot` })
                    ]
                });
            }
            break;
        }
    }
}