module.exports = async function GetPresence(member) {
    const { presence } = member;
    let status;

    if(!presence.status) status = ':grey_question:'

    switch(presence.status) {
        case 'online': { status = ':green_circle:' } break;
        case 'offline': { status = ':red_circle:' } break;
        case 'idle': { status = ':crescent_moon:' } break;
        case 'dnd': { status = ':red_circle:' } break;
    }

    return status;
}