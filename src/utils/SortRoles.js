module.exports = async function SortRoles(member) {
    await member.fetch();

    const allroles = [];

    member.roles.cache.forEach((role) => {
        allroles.push(`${role}`);
    });

    return allroles.join(', ');
}