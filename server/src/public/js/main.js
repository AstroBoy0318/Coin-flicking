let socket;
let myName = "";
let screens = ["join-game", "join-room","game-play"];
let rooms = [];
let myRoom;
let playerASelect = '<option value=1>1</option><option value=2>2</option><option value=3>3</option>';
let playerBSelect = '<option value=4>4</option><option value=5>5</option><option value=6>6</option>';
$(function () {
    screens.forEach((el, idx) => {
        if (idx > 0)
            $("#" + el).hide();
    });
    $(".container").removeClass("d-none");
    initWeb3();
});
function joinGame() {
    myName = $("#join-game input").val();
    if (myName.length == 0) {
        alert("Please input your name");
        return;
    }
    socket = io();
    socket.on('updateRooms', (messages) => {
        if (messages.action == 'join' && messages.player == socket.id) {
            setPlayerStatus(messages.activeRoom);
            goToGame();
        }
        else if (messages.activeRoom && myRoom && messages.activeRoom.number == myRoom.number) {
            setPlayerStatus(messages.activeRoom);
            if(messages.action == 'started')
            {
                alert("Game started");
                setTimeout(function(){
                    let winnerName = myRoom.winner;
                    let winnerID;
                    if(winnerName == 'A')
                    {
                        winnerName = myRoom.playerA;
                        winnerID = myRoom.playerIDA;
                    }
                    else if(winnerName == 'B')
                    {
                        winnerName = myRoom.playerB;
                        winnerID = myRoom.playerIDB;
                    };
                    let msg = " the winner. The winner will get "+(parseFloat(myRoom.betA)+parseFloat(myRoom.betB))*0.95+"BNB as reward soon.";
                    if(winnerID == socket.id)
                    {
                        msg = "You are"+msg;
                    }
                    else
                    {
                        msg = winnerName+" is"+msg;
                    }
                    alert(msg);
                }, 1000);
            }
        }
        else {
            rooms = messages.rooms;
            drawRoomList();
        }
    });
    goToJoinRoom();
}

function goToJoinRoom() {
    $("#join-game").fadeOut(() => {
        $("#join-room").fadeIn();
        getAvailableRooms();
    });
}

function goToGame() {
    $("#join-room").fadeOut(() => {
        $("#game-play").fadeIn();
    });
}

function getAvailableRooms() {
    $.ajax({
        url: 'getAvailableRooms',
        dataType: 'json',
        success: function (resp) {
            rooms = resp;
            drawRoomList();
        }
    });
}

function drawRoomList() {
    let roomsHtml = '';
    if (rooms.length == 0) {
        roomsHtml = '<div class="list-group-item">No room</div>';
    }
    else {
        rooms.forEach((room) => {
            let playerCount = 0;
            if (room.playerA != "" || room.playerB != "")
                playerCount = 1;
            roomsHtml += '<a href="javascript:joinRoom(' + room.number + ')" class="list-group-item list-group-item-action list-group-item-primary">Room ' + room.number + (playerCount == 0 ? ' No player' : ' One player') + '</a>';
        });
    }
    $("#join-room .list-group").html(roomsHtml);
}

function createRoom() {
    socket.emit("roomAction", { action: 'create', name: myName });
}

function joinRoom(number) {
    socket.emit("roomAction", { action: 'join', roomNumber: number, playerName: myName });
}

function setPlayerStatus(room) {
    myRoom = room;
    $("#play-side .card-title").html("Room "+room.number);
    if (room.playerIDA == socket.id) {
        setMyStatus(playerASelect, room.sideA, room.betA, room.readyA, room.playerB);
        setOtherStatus(room.playerB, playerBSelect, room.sideB, room.betB, room.readyB);
    }
    else if (room.playerIDB == socket.id) {
        setMyStatus(playerBSelect, room.sideB, room.betB, room.readyB, room.playerA);
        setOtherStatus(room.playerA, playerASelect, room.sideA, room.betA, room.readyA);
    }
}

function setMyStatus(select, side, bet, ready, otherPlayer) {
    let pan = $("#my-side");
    $("select", pan).html(select);
    $("select", pan).val(side);
    $("input", pan).val(bet);
    if (ready || otherPlayer == "")
        $("button", pan).prop("disabled",true);
    else
        $("button", pan).prop("disabled",false);
}

function setOtherStatus(player, select, side, bet, ready) {
    let pan = $("#other-side");
    $(".card-title", pan).html("Other player : " + player);
    $("select", pan).html(select);
    $("select", pan).val(side);
    $("input", pan).val(bet);
    if (ready)
        $("button",pan).html("Ready");
    else
        $("button",pan).html("Not ready");
}

function bet() {
    let pan = $("#my-side");
    let side = $("select", pan).val();
    let bet = $("input", pan).val();
    socket.emit("roomAction", { action: "bet", number: myRoom.number, side: side, bet: bet });
}

function getReady() {
    //$("#ready-button").prop("disabled",true);
    $("button").prop("disabled",true);
    let player, amount;
    if(myRoom.playerIDA == socket.id)
    {
        player = 'A';
        amount = myRoom.betA;
    }
    else if(myRoom.playerIDB == socket.id)
    {
        player = 'B';
        amount = myRoom.betB;
    }
    ready(myRoom.number, player,socket.id, amount).then((re)=>{
        if(re && re.status)
        {
            socket.emit("roomAction", { action: "ready", number: myRoom.number });
        }
        else
        {
            $("button").prop("disabled",false);
        }
    }).catch(function (err) {
        $("button").prop("disabled",false);
    });;
}