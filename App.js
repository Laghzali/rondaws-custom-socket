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

const isPlayerInSession = (pid) => {
    let occurance = 0
    OnlineSessions.forEach(session => {
        session.players.forEach(player => {
            if (player == pid) {
                occurance += 1
                console.log(player)
                console.log(pid)
            }
        })
    })
    if (occurance > 0) {
        return true
    }
    return false
}

const JoinSession = (pid, sid) => {
    let joined = false
    if (sid != null && pid.length > 0) {
        OnlineSessions.forEach(session => {
            if (session.id == sid) {
                if (session.players.length < 4) {
                    if (!isPlayerInSession(pid)) {
                        session.players.push(pid)
                        joined = true
                        io.in(session.id).emit('message', 'your room id is : ' + session.id)
                    }

                } else {
                    io.emit('message', 'Maximum players reached')
                }
            }
        })
    }
    return joined

}
io.on('connection', (socket) => {
    io.emit('message', 'you joined')
    io.emit('message', 'you joined')
    io.emit('message', 'zz')


    socket.on('Join', msg => {
        console.log('msg : ' + msg)
        let join = JoinSession(msg.pid, msg.sid)
        OnlineSessions.forEach(session => {
            if (session.id == msg.sid) {
                io.emit('players', session)
            }
        })
        io.emit('message', join ? "Joined sessions" : "Couldnt join session")
    })
    socket.on('message', (message) => {
        if (message.session === 'new') {
            console.log('generating new session')
            let newSession = { players: [message.cid], id: generate_token(20), admin: message.cid, game: '' }
            OnlineSessions.push(newSession)
            io.to(socket.id).emit('players', { ...newSession })
            io.to(socket.id).emit('session', newSession)
            socket.join("room1");
            io.in('room1').emit('message', 'your room id is : ' + newSession.id)
            console.log(io.sockets.adapter.rooms)

        }
    });
});


http.listen(3000, () => console.log('listening on http://localhost:3000'));