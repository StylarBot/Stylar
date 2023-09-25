module.exports = async function CheckHasRole(member, role) {
    if(member.roles.has(role.id)) return true;
    else return false;
}