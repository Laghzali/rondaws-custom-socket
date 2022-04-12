
const http = require('http').createServer();
const Ronda = require('./Game').Ronda
const OnlineGames = []
const OnlineSessions = []
let onlineClients = new Map()

function generate_token(length) {
    //edit the token allowed characters
    var a = "ABCDEFGHJKLMNOPQRSTUVWXYZ".split("");
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

    socket.on('SAVE_MY_NAME_KURWA', name => {
        onlineClients.set(socket.id, name)
        console.log(onlineClients)
    })
    //join client to rooom
    socket.join(room)
    //return room id to client
    io.in(room).emit('room', { id: room })
    //update players
    io.to(room).emit('UPDATE_PLAYERS', 1)
    OnlineSessions.push({ id: room, players: [socket.id], admin: socket.id })


    //listen for room joins
    socket.on('JOIN_ROOM', data => {
        //leave all rooms
        var rooms = io.sockets.adapter.sids[socket.id]; for (var room in rooms) { socket.leave(room); }

        if (!socket.rooms.has(data.room)) {
            //join the wanted room
            socket.join(data.room)

            let mySession = OnlineSessions.filter(session => session.id === data.room)[0]
            mySession.players.push(socket.id)
            //room lentgth?
            let roomLength = mySession.players.length
            //update room players list
            io.to(data.room).emit('UPDATE_PLAYERS', roomLength)
            io.to(socket.id).emit(data.room, true)
        }
    })

    socket.on('GAME_INIT', msg => {
        if (msg.status == 'start') {
            if (msg.maxplayers > 1) {
                const game = new Ronda(msg.maxplayers)
                const CurrentTable = game.CurrentTable;
                const CurrentPlayers = game.CurrentPlayers

                const CurrentScore = game.CurrentScore
                const CurrrentTurn = game.Turn
                game.init()
                //msg.id is room id

                const clients = Array.from(io.sockets.adapter.rooms.get(msg.id))
                const players = []
                for (let x = 0; x < clients.length; x++) {
                    io.to(clients[x]).emit('GAME_RECEIVE_HAND', CurrentPlayers[x])
                    io.to(clients[x]).emit('PLAYER_ID', CurrentPlayers[x].PlayerID)

                    players.push({ cid: CurrentPlayers[x].PlayerID, cname: onlineClients.get(clients[x]) })
                }
                console.log(players)
                io.in(msg.id).emit('CURRENT_PLAYERS', players)
                io.in(msg.id).emit('GAME_CURRENT_TABLE', CurrentTable)
                io.in(msg.id).emit('GAME_RECEIVE_SCORE', CurrentScore)
                io.in(msg.id).emit('PLAYER_TURN', CurrrentTurn)
                io.in(msg.id).emit('GAME_START', true)
                OnlineGames.push({ id: msg.id, game: game })
            }

        }
    })

    socket.on('GAME_THROW', data => {

        OnlineGames.forEach(game => {
            //game.id is the game room id
            if (game.id == data.room) {
                //check if player turn
                console.log('player id :' + data.pid)
                console.log('turn  :' + game.game.Turn)
                if (game.game.Turn != data.pid)
                    return
                if (game.game.Finished) {
                    console.log('GAME FINISHED')
                    io.in(data.room).emit('GAME_FINISHED', true)
                    return
                }//data.pid is player id (thrower)
                game.game.Thrower = data.pid
                game.game.Throw = { number: data.number, type: data.type }
                const clients = Array.from(io.sockets.adapter.rooms.get(data.room))
                for (let x = 0; x < clients.length; x++) {
                    io.to(clients[x]).emit('GAME_RECEIVE_HAND', game.game.CurrentPlayers[x])
                    console.log(game.game.CurrentPlayers[x])
                }
                io.in(data.room).emit('GAME_RECEIVE_ROUND', game.game.Round)
                io.in(data.room).emit('GAME_RECEIVE_SCORE', game.game.CurrentScore)
                io.in(data.room).emit('GAME_RECEIVE_TEAMSCORE', game.game.teamScore)
                io.in(data.room).emit('GAME_CURRENT_TABLE', game.game.CurrentTable)
                io.in(data.room).emit('PLAYER_TURN', game.game.Turn)

            }
        })
    })
});

http.listen(80, () => console.log('listening on http://localhost:3000'));