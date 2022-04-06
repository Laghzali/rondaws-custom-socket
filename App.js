const { on } = require('events');
const req = require('express/lib/request');
const { copyFileSync } = require('fs');

const http = require('http').createServer();
const Ronda = require('./Game').Ronda
const OnlineGames = []
const OnlineSessions = []

function generate_token(length) {
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    let room = generate_token(4)
    console.log('Connected')
    //join client to rooom
    socket.join(room)
    //return room id to client
    io.in(room).emit('room', { id: room })
    //update players
    io.to(room).emit('UPDATE_PLAYERS', 1)
    OnlineSessions.push({ id: room, players: [socket.id], admin: socket.id })

    //listen for room joins
    socket.on('JOIN_ROOM', room => {

        if (!socket.rooms.has(room)) {
            var rooms = io.sockets.adapter.sids[socket.id]; for (var room in rooms) { socket.leave(room); }
            //join the wanted room
            socket.join(room)
            //room lentgth?
            let roomLength = 0
            ///stupid way to return players length
            OnlineSessions.forEach(session => {
                if (room == session.id) {
                    session.players.push(socket.id)
                    roomLength = session.players.length
                    console.log('len : ' + roomLength)
                }
            })
            //update room players list
            io.to(room).emit('UPDATE_PLAYERS', roomLength)
            io.to(socket.id).emit(room, true)
        }
    })

    socket.on('GAME_INIT', msg => {
        if (msg.status == 'start') {
            console.log('players : ' + msg.maxplayers)
            if (msg.maxplayers > 1) {
                const game = new Ronda(msg.maxplayers)
                const CurrentTable = game.CurrentTable;
                const CurrentPlayers = game.CurrentPlayers

                const CurrentScore = game.CurrentScore
                const CurrrentTurn = game.Turn
                game.init()
                //msg.id = room id
                const clients = Array.from(io.sockets.adapter.rooms.get(msg.id))
                for (let x = 0; x < clients.length; x++) {
                    console.log(CurrentPlayers[x].PlayerID)
                    io.to(clients[x]).emit('GAME_RECEIVE_HAND', CurrentPlayers[x])
                    io.to(clients[x]).emit('PLAYER_ID', CurrentPlayers[x].PlayerID)
                }
                io.in(msg.id).emit('GAME_CURRENT_TABLE', CurrentTable)
                io.in(msg.id).emit('GAME_START', true)
                OnlineGames.push({ id: msg.id, game: game })
            }

        }
    })

    socket.on('GAME_THROW', data => {
        OnlineGames.forEach(game => {
            if (game.id == data.room) {
                if (game.game.Finished) {
                    io.to(game.id).emit('GAME_FINISHED', game.game.CurrentScore)
                    return
                }
                game.game.LastThrower = data.pid
                game.game.Throw = { number: data.number, type: data.type }

                const clients = Array.from(io.sockets.adapter.rooms.get(data.room))
                for (let x = 0; x < clients.length; x++) {

                    io.to(clients[x]).emit('GAME_RECEIVE_HAND', game.game.CurrentPlayers[x])
                }
                io.in(data.room).emit('GAME_CURRENT_TABLE', game.game.CurrentTable)
            }
        })
    })
});


http.listen(3000, () => console.log('listening on http://localhost:3000'));