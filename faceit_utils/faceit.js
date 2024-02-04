const axios = require("axios");
const FACEIT_KEY = require("../config.json").FACEIT_KEY;
const toreSteamId = require("../config.json").toreSteamId;

// Game INFO
async function obtenerInfo(matchId) {
    const url = `https://open.faceit.com/data/v4/matches/${matchId}`;
    const headers = {
        'accept': 'application/json',
        'Authorization': FACEIT_KEY
    };
    try {
        const response = await axios.get(url, { headers });
        let server = await response.data.voting.location.pick[0];
        let map = await response.data.voting.map.pick[0];
        let info = [server, map];
        return info;
    } catch (error) {
        console.error(error);
    }
}

function obtenerId(req) {
    let matchId = req.body.payload.id;
    return matchId;
}

function obtenerIp(req) {
    let serverIp = req.body.payload.client_custom.server_ip;
    let serverPort = req.body.payload.client_custom.server_port;
    let ip = `${serverIp}:${serverPort}`
    return ip;
}

// ELO
async function obtenerProbabilidad(matchId) {
    const url = `https://open.faceit.com/data/v4/matches/${matchId}`;
    const headers = {
        'accept': 'application/json',
        'Authorization': FACEIT_KEY
    };
    try {
        const response = await axios.get(url, { headers });
        let winProbability;
        for (let i = 0; i < response.data.teams.length; ++i) {
            for (let j = 0; j < response.data.teams[i].roster.length; ++j) {
                let playerId = response.data.teams[i].roster[j].game_player_id;
                if (playerId === toreSteamId) {
                    winProbability = response.data.teams[i].stats.winProbability;
                    // Break out of the loop once the player is found
                    break;
                }
            }
            // Break out of the outer loop if the player is found
            if (winProbability !== undefined) {
                break;
            }
        }
        return winProbability;
    } catch (error) {
        console.error(error);
    }
}



async function calcularElo(matchId) {
    let winProbability = await obtenerProbabilidad(matchId);
    winProbability = Math.max(0, Math.min(1, winProbability));
    let puntuacion = Math.floor((winProbability - 0.5) / 0.02) + 25;
    return puntuacion;
}

// Obtener player info

async function obtenerElo(user) {
    const url = `https://open.faceit.com/data/v4/players?nickname=${user}&game=cs2`;
    const headers = {
        'accept': 'application/json',
        'Authorization': FACEIT_KEY
    };
    try {
        const response = await axios.get(url, { headers });

        let cs2 = [];
        cs2[0] = response.data.games.cs2.faceit_elo;
        cs2[1] = response.data.games.cs2.skill_level;

        let csgo = [];
        csgo[0] = response.data.games.csgo.faceit_elo;
        csgo[1] = response.data.games.csgo.skill_level;

        const ELO = {
            cs2: cs2,
            csgo: csgo
        }
        return ELO;
    } catch (error) {
        console.error(error);
    }
}




module.exports = {
    obtenerInfo: obtenerInfo,
    obtenerId: obtenerId,
    obtenerIp: obtenerIp,
    calcularElo: calcularElo,
    obtenerElo: obtenerElo
};