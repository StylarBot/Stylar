const axios = require('axios').default;

const developers = [
    '983163377243271291',
    '1117933631512518716'
]

module.exports = async function GetUserBadges(user) {
    const data = await axios.get(`https://stylar-dev.discordand.repl.co/api/user-badges/${user.id}`);

    return data.data.badges;
}