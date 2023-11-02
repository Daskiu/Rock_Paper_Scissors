const socket = io();

let roomId = null;
let player1 = false;

//-----------------------------------------------------------------------------------------------

socket.on("newGame", (data) => {
    roomId = data.roomId;
    
    document.getElementById('initial').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';

    let copyButton = document.createElement('button');
    copyButton.style.display = 'block';
    copyButton.innerText = "Copy Code";
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(roomId).then(function () {
            console.log("Copied to Clipboard! :D");
        }, function (err) {
            console.error("Could't copy :(", err);
        });
    });

    const waitingArea = document.getElementById('waitingArea');
    waitingArea.innerHTML = `Waiting for Player 2, Room Code is ${roomId}!`;
    waitingArea.appendChild(copyButton);
});

socket.on("playerConnected", () => {
    document.getElementById('initial').style.display = 'none';
    document.getElementById('waitingArea').style.display = 'none';
    document.getElementById('gameArea').style.display = 'flex';
});

socket.on("p1Choice", (data) => {
    if(!player1) {
        createPlayer2Button(data);
    }
});

socket.on("p2Choice", (data) => {
    if(player1) {
        createPlayer2Button(data);
    }
});

socket.on("result", (data) => {
    let winnerText = "Draw";

    if (data.winner != "d") {
        if (data.winner == "p1" && player1) {
            winnerText = "You Win";
        } else if (data.winner == "p1"){
            winnerText = "You Loose";
        } else if (data.winner == "p2" && !player1) {
            winnerText = "You Win";
        } else if (data.winner == "p2") {
            winnerText = "You Lose";
        }
    }

    document.getElementById('opponentState').style.display = 'none';
    document.getElementById('opponentButton').style.display = 'block';
    document.getElementById('winnerArea').innerHTML = winnerText;
});

//-----------------------------------------------------------------------------------------------

function createGame() {
    player1 = true;
    socket.emit('createGame');
}

function joinGame() {
    roomId = document.getElementById('roomId').value;
    socket.emit('joinGame', {roomId: roomId});
}

function sendChoice(response) {
    const choiceEvent = player1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent, {
        response: response,
        roomId: roomId
    });

    let playerChoiceButton = document.createElement('button');
    playerChoiceButton.classList.add(response.toString().toLowerCase());
    playerChoiceButton.innerText = response;

    const player1Choice = document.getElementById('player1Choice');
    player1Choice.innerHTML = "";
    player1Choice.appendChild(playerChoiceButton)
}

function createPlayer2Button(data) {
    document.getElementById('opponentState').innerHTML = "Player 2 made a choice";
    
    let opponentButton = document.createElement('button');
    opponentButton.id = 'opponentButton';
    opponentButton.classList.add(data.response.toString().toLowerCase());
    opponentButton.style.display = 'none';
    opponentButton.innerText = data.response;

    document.getElementById('player2Choice').appendChild(opponentButton);
}