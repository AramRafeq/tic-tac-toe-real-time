const app = require('express')();
const _ = require('lodash');
const http = require('http').createServer(app);
const cors = require('cors');

app.options('*', cors());
app.use(cors());
const clients = [];
const statstics = {
  clientCount: 0,
  playersInMatch: 0,
};
const io = require('socket.io').listen(http);

io.set('transports', ['websocket']);
app.get('/', (req, res) => {
  res.json({ msg: 'hahah' });
});

//  general functions and operations (game logic)
function getPlayersInMatch() {
  const inMatchPlayers = _.filter(clients, o => o.inMatch);
  return inMatchPlayers;
}
function makePlayerIdle(id) {
  const playerIndex = _.findIndex(clients, o => o.id === id);
  if (playerIndex > -1) {
    clients[playerIndex].inMatch = false;
    clients[playerIndex].connectedTo = '';
    return playerIndex;
  }
  return null;
}

function getOponent(id) {
  const playerIndex = _.findIndex(clients, o => o.id === id);
  if (playerIndex > -1) {
    const oponentIndex = _.findIndex(clients, o => o.id === clients[playerIndex].connectedTo);
    return clients[oponentIndex];
  }
  return null;
}

function assignOponentFor(id) {
  const playerIndex = _.findIndex(clients, o => o.id === id);
  if (!clients[playerIndex].inMatch) {
    clients[playerIndex].inMatch = true;
    const avilablePlayers = _.filter(clients, o => !o.inMatch && o.id !== id);
    if (avilablePlayers.length === 0) {
      clients[playerIndex].socket.emit('newGameResponse', { id: -1, write: null });
      clients[playerIndex].inMatch = false;
    } else {
      clients[playerIndex].socket.emit('newGameResponse', { id: avilablePlayers[0].id, write: 'x' });
      clients[playerIndex].inMatch = true;
      clients[playerIndex].connectedTo = avilablePlayers[0].id;
      avilablePlayers[0].inMatch = true;
      avilablePlayers[0].connectedTo = id;
      avilablePlayers[0].socket.emit('newGameResponse', { id, write: 'o' });
      statstics.playersInMatch = getPlayersInMatch().length;
      io.emit('playersInMatchCount', statstics.playersInMatch);
    }
  }
}

io.on('connection', (socket) => {
  statstics.clientCount += 1;
  statstics.playersInMatch = getPlayersInMatch().length;
  clients.push({
    socket,
    inMatch: false,
    id: socket.id,
    connectedTo: '',
  });
  // console.log(clients.length);
  io.emit('clientCount', statstics.clientCount);
  io.emit('playersInMatchCount', statstics.playersInMatch);

  // player lost connection
  socket.on('disconnect', () => {
    statstics.clientCount -= 1;
    statstics.playersInMatch = getPlayersInMatch().length;
    io.emit('clientCount', statstics.clientCount);
    io.emit('playersInMatchCount', statstics.playersInMatch);
    const oponent = getOponent(socket.id);
    _.remove(clients, o => o.id === socket.id);
    if (oponent) {
      oponent.socket.emit('oponentLeft', socket.id);
      makePlayerIdle(oponent.id);
    }
  });


  // New Game Pressed
  socket.on('newGame', (id) => {
    assignOponentFor(id);
  });

  // Leave Game Pressed
  socket.on('leaveGame', (id) => {
    try {
      const oponent = getOponent(id);
      makePlayerIdle(id);
      makePlayerIdle(oponent.id);
      oponent.socket.emit('oponentLeft', id);
      statstics.playersInMatch = getPlayersInMatch().length;
      io.emit('playersInMatchCount', statstics.playersInMatch);
    } catch (e) {
      // some errpr handling goes here
    }
  });


  socket.on('gameBoardUpdate', (updatedData) => {
    const oponent = getOponent(socket.id);
    oponent.socket.emit('gameBoardUpdate', updatedData);
  });
  socket.on('gameWon', (gameState) => {
    const oponent = getOponent(socket.id);
    oponent.socket.emit('gameWon', gameState);
  });
  socket.on('rematchGame', (gameState) => {
    const oponent = getOponent(socket.id);
    oponent.socket.emit('rematchGame', gameState);
  });
});


/* Start listening to ports */
http.listen(3000);
