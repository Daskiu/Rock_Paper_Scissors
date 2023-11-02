const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let rooms = {};

app.use(express.static(path.join(__dirname, 'public/')));

app.get('/test', (req, res) => {
    let id = createId(7);
    res.send(`<h1>User ${id}</h1>`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log("User connected");
    socket.on('disconnect', () => {
        console.log("User disconected");
    });

    socket.on('createGame', () => {
        const roomId = createId(7);
        rooms[roomId] = {};
        socket.join(roomId)
        socket.emit("newGame", { roomId: roomId });
    });

    socket.on('joinGame', (data) => {
        if (rooms[data.roomId] != null) {
            socket.join(data.roomId);
            socket.to(data.roomId).emit("playerConnected", {});
            socket.emit("playerConnected");
        }
    });

    socket.on("p1Choice", (data) => {
        let response = data.response;
        rooms[data.roomId].p1Choice = response;
        socket.to(data.roomId).emit("p1Choice", { response: data.response });
        if (rooms[data.roomId].p2Choice != null) {
            checkWinner(data.roomId);
        }
    });

    socket.on("p2Choice", (data) => {
        let response = data.response;
        rooms[data.roomId].p2Choice = response;
        socket.to(data.roomId).emit("p2Choice", { response: data.response });
        if (rooms[data.roomId].p1Choice != null) {
            checkWinner(data.roomId);
        }
    });
});

server.listen(3000, () => {
    console.log('listening port:3000');
});

function createId(idLenght) {
    let id = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < idLenght; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

function checkWinner(roomId) {
    let p1Choice = rooms[roomId].p1Choice; console.log(p1Choice)
    let p2Choice = rooms[roomId].p2Choice; console.log(p2Choice)
    let winner = null; 

    console.log(winner)

    if (p1Choice === p2Choice) {
        winner = "Draw";
    } else if (p1Choice == "paper") {
        if (p2Choice == "scissor") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "rock") {
        if (p2Choice == "paper") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "scissor") {
        if (p2Choice == "rock") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    }

    io.sockets.to(roomId).emit("result", { winner: winner });
    rooms[roomId].p1Choice = null;
    rooms[roomId].p2Choice = null;
}