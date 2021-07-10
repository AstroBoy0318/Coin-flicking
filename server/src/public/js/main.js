let socket;
let myName = "";
let rooms = [];
let myRoom;
let myAvatar=0, myAmount, otherAvatar=0;
$(function () {
    $(".btn-back").hide();
    screens.forEach((el, idx) => {
        if (idx > 0)
            $("#" + el).hide();
    });
    $(".container").removeClass("d-none");
    $("#my-side .bet-amount").on('change',function(){
        myAmount = parseInt($(this).val());
    });
    initWeb3();
});
function joinGame() {
    myName = $("#join-game input").val();
    if (myName.length == 0) {
        showAlertModal("Please input your name");
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
            if (messages.action == 'started') {
                alert("Game started");
                setTimeout(function () {
                    let winnerName = myRoom.winner;
                    let winnerID;
                    if (winnerName == 'A') {
                        winnerName = myRoom.playerA;
                        winnerID = myRoom.playerIDA;
                    }
                    else if (winnerName == 'B') {
                        winnerName = myRoom.playerB;
                        winnerID = myRoom.playerIDB;
                    };
                    let msg = " the winner. The winner will get " + (parseFloat(myRoom.betA) + parseFloat(myRoom.betB)) * 0.95 + "BNB as reward soon.";
                    if (winnerID == socket.id) {
                        msg = "You are" + msg;
                    }
                    else {
                        msg = winnerName + " is" + msg;
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
    $("#join-game").hide("drop", { direction: "up" }, () => {
        $(".logo").hide();
        $("#join-room").show("drop", { direction: "up" }, ()=>{
            $(".btn-back").show();
            $(".btn-back").off('click');
            $(".btn-back").on('click',()=>{
                location.reload();
            });
        });
        getAvailableRooms();
    });
    return;
}

function goToGame() {
    $("#join-room").hide("drop", { direction: "up" }, () => {
        $("#game-play").show("drop", { direction: "up" }, ()=>{
            $(".btn-back").off('click');
            $(".btn-back").on('click',()=>{
                backToJoinRoom();
            });
        });
    });
}

function backToJoinRoom() {
    exitRoom();
    $("#game-play").hide("drop", { direction: "up" }, () => {
        $(".logo").hide();
        $("#join-room").show("drop", { direction: "up" }, ()=>{
            $(".btn-back").show();
            $(".btn-back").off('click');
            $(".btn-back").on('click',()=>{
                location.reload();
            });
        });
        getAvailableRooms();
    });
    return;
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
            roomsHtml += '<a href="javascript:joinRoom(' + room.number + ')" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Click to Join" class="list-group-item list-group-item-action list-group-item-primary room-item"><div class="room-user ' + (playerCount == 0 ? 'nouser"' : 'user" data-bs-toggle="tooltip" data-bs-placement="right" title="'+(room.playerA?room.playerA:room.playerB)+'"') + '"></div> Room ' + room.number + '</a>';
        });
    }
    $("#join-room .list-group").html(roomsHtml);

    initTooltip();
}

function createRoom() {
    socket.emit("roomAction", { action: 'create', name: myName });
}

function joinRoom(number) {
    socket.emit("roomAction", { action: 'join', roomNumber: number, playerName: myName });
}

function exitRoom()
{
    socket.emit("roomAction", { action: 'exit' });
}

function setPlayerStatus(room) {
    myRoom = room;
    $("#play-side .card-title").html("Room " + room.number);
    if (room.playerIDA == socket.id) {
        setMyStatus(playerSelect, room.readyA, room.playerB);
        setOtherStatus(room.playerB, room.sideB, room.betB, room.readyB);
    }
    else if (room.playerIDB == socket.id) {
        setMyStatus(playerSelect, room.readyB, room.playerA);
        setOtherStatus(room.playerA, room.sideA, room.betA, room.readyA);
    }
}

function setMyStatus(select, ready, otherPlayer) {
    let pan = $("#my-side");
    // $("input", pan).val(bet);
    if (ready || otherPlayer == "")
        $("button", pan).prop("disabled", true);
    else
        $("button", pan).prop("disabled", false);
    
    // $("#my-side .bet-amount").val(myAmount);
    $("#my-side .avatar-div *").remove();
    $("#my-side .avatar-div").append(getAvatar(myAvatar)).on('click',function(){
        showAvatarModal();
    });
}

function setOtherStatus(player, side, bet, ready) {
    let pan = $("#other-side");
    $(".card-title", pan).html(player == ""?"?":player);
    alert(side);
    otherAvatar = side == null?0:side;
    $("input", pan).val(bet);
    if (ready)
        $("button", pan).html("Ready");
    else
        $("button", pan).html("Not ready");
    $("#other-side .avatar-div *").remove();
    $("#other-side .avatar-div").append(getAvatar(otherAvatar, true));
}

function bet() {
    let pan = $("#my-side");
    let side = myAvatar;
    let bet = $("input", pan).val();
    socket.emit("roomAction", { action: "bet", number: myRoom.number, side: side, bet: bet });
}

function getReady() {
    //$("#ready-button").prop("disabled",true);
    $("button").prop("disabled", true);
    let player, amount;
    if (myRoom.playerIDA == socket.id) {
        player = 'A';
        amount = myRoom.betA;
    }
    else if (myRoom.playerIDB == socket.id) {
        player = 'B';
        amount = myRoom.betB;
    }
    if (toPay) {
        ready(myRoom.number, player, socket.id, amount).then((re) => {
            console.log(re);
            if (re && re.status) {
                socket.emit("roomAction", { action: "ready", number: myRoom.number });
            }
            else {
                $("button").prop("disabled", false);
            }
        }).catch(function (err) {
            $("button").prop("disabled", false);
        });;
    }
    else {
        socket.emit("roomAction", { action: "ready", number: myRoom.number });
    }
}

function initTooltip() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function getAvatar(number, disabled)
{
    return "<div number="+number+" class='avatar avatar-"+number+"' "+(disabled?"disabled":"")+"></div>";
}