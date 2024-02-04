
async function obtenerPlayerElo(steamID, player) {
    try {
        const elo = await faceit_utils.obtenerElo(player);
        const cs2 = elo.cs2;
        const csgo = elo.csgo;
        let resultado = `CS2: ELO -> ${cs2[0]}, LVL -> ${cs2[1]} / CSGO: ELO -> ${csgo[0]}, LVL -> ${csgo[1]}`;
        client.chat.sendFriendMessage(steamID, resultado);
    } catch (error) {
        client.chat.sendFriendMessage(steamID, "User not found");
    }
}


module.exports = {
    obtenerPlayerElo: obtenerPlayerElo
}
