module.exports = async function GetPresence(member) {
    const { presence } = member;
    let status;

    if (!presence) {
        // Handle the case where presence is null or undefined
        status = ':grey_question:';
    } else {
        switch (presence.status) {
            case 'online':
                status = '<:online:1156062892932743208>';
                break;
            case 'offline':
                status = '<:offline:1156058510333857804>';
                break;
            case 'idle':
                status = '<:idle:1156062959399874620>';
                break;
            case 'dnd':
                status = '<:dnd:1156063004375392276>';
                break;
            default:
                status = ':grey_question:';
                break;
        }
    }

    return status;
}

// module.exports = async function GetPresence(member) {
//    const { presence } = member;
 //   let status;

//   return console.log(presence);

 //   if(!presence.status) status = ':grey_question:'

 //   switch(presence.status) {
 //       case 'online': { status = ':green_circle:' } break;
 //       case 'offline': { status = ':red_circle:' } break;
  //      case 'idle': { status = ':crescent_moon:' } break;
  //      case 'dnd': { status = ':red_circle:' } break;
  //  }

 //   return status;
//}