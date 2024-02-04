const express = require('express');
const bodyParser = require('body-parser');
const config = require("./config.json");

const faceit_utils = require("./faceit_utils/faceit");
const toreSteamId = config.toreSteamId;
const steamLogOnOptions = config.steamLogOnOptions;
const partidas = config.partidas;

const app = express();
const port = 3000;

const SteamUser = require('steam-user');
const client = new SteamUser();


// Middleware to parse JSON requests
app.use(bodyParser.json());

// Inicio STEAM BOT y Config
client.logOn(steamLogOnOptions);
client.on('loggedOn', async() => {
    console.log('Logged into Steam with -> ' + steamLogOnOptions.accountName);
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed(730);
});

client.on('friendMessage', async function(steamID, message) {
    const [comando, argumento] = message.split(' ');
    if (comando === "!faceit") {
        let resultado;
        try {
            const elo = await faceit_utils.obtenerElo(argumento);
            const cs2 = elo.cs2;
            const csgo = elo.csgo;
            resultado = `CS2: ELO -> ${cs2[0]}, LVL -> ${cs2[1]} / CSGO: ELO -> ${csgo[0]}, LVL -> ${csgo[1]}`;
        } catch (error) {
            resultado = "User not found";
        }
		client.chat.sendFriendMessage(steamID, resultado);
    }

    console.log("Friend message from " + steamID.getSteam3RenderedID() + ": " + message);
});



// POST endpoint to receive webhooks
app.post('/webhook', (req, res) => {
    let tipoObtenido = req.body.event;
    switch(tipoObtenido) {
        case partidas.READY:
            partidaReady(req);
            break;
        case partidas.FINALIZADO:
            break;
        case partidas.CREADO:
            break;
    }
    res.status(200).send('Webhook received successfully');
});

async function partidaReady(req) {
    let ip = faceit_utils.obtenerIp(req);
    let matchId = faceit_utils.obtenerId(req);
    let info = await faceit_utils.obtenerInfo(matchId);  // Agrega await aquí
    let eloWin = await faceit_utils.calcularElo(matchId);
    let server = info[0];
    let map = info[1];
    let date = new Date();
    let formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}`;
    await client.chat.sendFriendMessage(toreSteamId,
    `Game ready: ${formattedDate}
    -> Lobby: https://www.faceit.com/en/cs2/room/${matchId}
    -> Server: ${server}
    -> Map: ${map}
    -> connect ${ip}
    -> ELO Win: +${eloWin}; ELO Lose: -${Math.abs(50 - eloWin)}`);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});