const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Client, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const reply = require('../../utils/Reply');

module.exports = {
    clientPermissions: ['BanMembers', 'KickMembers', 'ModerateMembers', 'ManageMessages'],
    data: new SlashCommandBuilder()
    .setName('member')
    .setDescription('Stylar\'s advanced member management commands!')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand((sub) =>
        sub.setName('ban')
        .setDescription('Ban a member from the server.')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user you want to ban from the server.')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('deletemessages')
            .setDescription('Specify an amount of time you want the messages from this user to be deleted from! (e.g. 2h, 2d)')
        )
        .addStringOption((opt) =>
            opt.setName('reason')
            .setDescription('The reason for banning the user.')
            .setMaxLength(1024)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('kick')
        .setDescription('Kick a member from the server.')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user you want to kick from the server.')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('reason')
            .setDescription('The reason for banning the user.')
            .setMaxLength(1024)
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const clientMember = guild.members.me;
        const user = options.getUser('user');
        const deletemessages = options.getString('deletemessages');
        const reason = options.getString('reason') || "No reason.";

        const sub = options.getSubcommand();
        
        switch(sub) {
            case 'ban': {
                const member = await guild.members.cache.get(user.id);
                if(!member) throw "That member is not in this server.";

                if(member.id === interaction.user.id) throw "You can\'t ban yourself.";

                if(member.roles.highest.position >= clientMember.roles.highest.position) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`🚫 Stylar Error - Role Position`)
                            .setDescription(`The member selected has a higher role position than me.\n<@${member.id}>'s highest position: <@&${member.roles.highest.id}>\nMy highest position: <@&${clientMember.roles.highest.id}>`)
                            .setColor('Red')
                        ], ephemeral: true
                    });
                }

                if(member.roles.highest.position >= interaction.member.roles.highest.position)
                throw "That member has a higher role position than you, I cannot ban them.";

                if(!member.bannable) throw "That member is not bannable by me. This may be because they are the server owner.";

                if(deletemessages) {
                    const deletemessagems = await ms(deletemessages);
                    if(isNaN(deletemessagems)) throw "The delete messages property is not valid. Try something like \"2 days\" or \"2 hours\"!";

                    const deletemessageseconds = deletemessagems * 60;

                    await member.ban({
                        deleteMessageSeconds: deletemessageseconds,
                        reason: reason,
                    });

                    return reply(interaction, `${member.user.tag} has successfully been banned.\nBanned by: ${interaction.user.tag}`, `✅`);
                } else {
                    await member.ban({
                        reason: reason,
                    });

                    return reply(interaction, `${member.user.tag} has successfully been banned.\nBanned by: ${interaction.user.tag}`, `✅`);
                }
            }
            break;

            case 'kick': {
                const member = await guild.members.cache.get(user.id);
                if(!member) throw "That member is not in this server.";

                if(member.id === interaction.user.id) throw "You can\'t ban yourself.";

                if(member.roles.highest.position >= clientMember.roles.highest.position) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`🚫 Stylar Error - Role Position`)
                            .setDescription(`The member selected has a higher role position than me.\n<@${member.id}>'s highest position: <@&${member.roles.highest.id}>\nMy highest position: <@&${clientMember.roles.highest.id}>`)
                            .setColor('Red')
                        ], ephemeral: true
                    });
                }

                if(member.roles.highest.position >= interaction.member.roles.highest.position)
                throw "That member has a higher role position than you, I cannot kick them.";

                if(!member.kickable) throw "That member is not kickable by me. This may be because they are the server owner.";
                await member.kick({
                    reason: reason,
                });

                return reply(interaction, `${member.user.tag} has successfully been kicked.\nKicked by: ${interaction.user.tag}`, `✅`);
            }
            break;
        }
    }
}