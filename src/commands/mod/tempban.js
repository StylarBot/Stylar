const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');
const tempban = require('../../models/Tempban');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user from the server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
        opt.setName('user')
        .setDescription('The user you want to tempban!')
        .setRequired(true)
    )
    .addStringOption((opt) =>
        opt.setName('duration')
        .setDescription('The duration of the tempban! (e.g. 2 days, 2 hours)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
        opt.setName("reason")
        .setDescription('The reason for temporarily banning the user!')
        .setMaxLength(1024)
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const duration = options.getString('duration');
        const reason = options.getString('reason') || "No reason.";

        const member = await guild.members.cache.get(user.id);
        if(!member) throw "That member is not in this server.";

        if(member.id === interaction.user.id) throw "You can\'t ban yourself.";

        const msduration = ms(duration);
        if(!msduration || isNaN(msduration)) throw "That is not a valid duration format. Try something like \"2 days\" or \"2d\"."

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
            const date = new Date();
            const datetimems = date.getTime();

            await punishment.create({
                Guild: guild.id,
                DateTimeMS: datetimems,
                Moderator: interaction.user.id,
                Punishment: 'Tempban',
                Reason: reason,
                User: member.id
            });

            const dateexpiresms = datetimems + msduration;

            await tempban.create({
                Guild: guild.id,
                DateExpiresMS: dateexpiresms,
                DateGivenMS: datetimems,
                Moderator: interaction.user.id,
                Reason: reason,
                User: member.id
            });

            await member.ban({
                reason: reason,
            });

            return reply(
                interaction,
                `${member.user.tag} has successfully been banned.\nBanned by: ${interaction.user.tag}`,
                `✅`
            );
    }
}