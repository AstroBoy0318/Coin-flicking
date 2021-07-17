let socket;
let myName = "";
let rooms = [];
let myRoom;
let myAvatar = 0, myAmount = 0, otherAvatar = 0;
$(function () {
    $(".btn-back").hide();
    screens.forEach((el, idx) => {
        if (idx > 0)
            $("#" + el).hide();
    });
    $("#go-text").hide();
    $("#high-score").hide();
    $("#go-text").removeClass("d-none");
    //add listeners
    $(".btn-list").on('click',()=>{
        showTopListModal();
    });
    $("#my-side .bet-amount").on('change', function () {
        myAmount = parseFloat($(this).val());
    });
    $("#winner-show").on('click',()=>{
        goToGameResult();
    });
    //firework effect
    $('#fireworks').hide();
    $('#fireworks').fireworks({
        sound: true,
        opacity: 0.8,
        width: '100%',
        height: '100%'
    });
    $(".container").removeClass("d-none");    
    initWeb3();
});

function createSocket()
{    
    socket = io();
    socket.on('highscore', (messages) => {
        updateTopList(messages.type, messages.data);
    });
    socket.on('updateRooms', (messages) => {
        if ((messages.action == 'join' || messages.action == 'create') && messages.player == socket.id) {
            setPlayerStatus(messages.activeRoom);
            goToGame();
        }
        else if (messages.activeRoom && myRoom && messages.activeRoom.number == myRoom.number) {
            setPlayerStatus(messages.activeRoom);
            if (messages.action == 'started') {
                showGoText(3000, () => {
                    let winnerName = myRoom.winner;
                    let winnerID, winSide;
                    if (winnerName == 'A') {
                        winnerName = myRoom.playerA;
                        winnerID = myRoom.playerIDA;
                        winSide = 0;
                    }
                    else if (winnerName == 'B') {
                        winnerName = myRoom.playerB;
                        winnerID = myRoom.playerIDB;
                        winSide = 1;
                    };
                    $(".coin .front-side").attr("class", "front-side avatar-" + myRoom.sideA);
                    $(".coin .back-side").attr("class", "back-side avatar-" + myRoom.sideB);
                    $(".coin-area").show();
                    let speed = messages.speed;
                    let time = coinFlip(winSide,speed);

                    setTimeout(()=>{
                        if(winSide == 0)
                        {
                            $("#winner-show .dog .avatar").css("background-image",$(".coin .front-side").css("background-image"));
                        }
                        else
                        {
                            $("#winner-show .dog .avatar").css("background-image",$(".coin .back-side").css("background-image"));
                        }
                        $("#winner-show .winner-name").html(winnerName);
                        $("#winner-show").removeClass("d-none");
                        $("#winner-show").show();
                        $("#winner-show .dog").hide();
                        $("#winner-show .dog .avatar").hide();
                        $("#winner-show .dog").show("scale",()=>{
                            $("#winner-show .dog").effect("shake");
                        });
                        $("#winner-show .dog .avatar").show("scale");
                    }, time+500);
                    
                    let reward = ((parseFloat(myRoom.betA) + parseFloat(myRoom.betB)) * 0.95).toFixed(4);
                    if (winnerID == socket.id) {
                        $("#game-result .card").removeClass("failed");
                    }
                    else
                    {
                        $("#game-result .card").addClass("failed");
                    }
                    $("#game-result .card p").eq(1).html(reward+" BNB");
                });
            }
        }
        else {
            rooms = messages.rooms;
            drawRoomList();
        }
    });
}

function joinGame() {
    if(!web3Valid())
    {
        showReloadModal("Please connect your wallet.");
        return;
    }

    myName = $("#join-game input").val();
    if (myName.length == 0) {
        showAlertModal("Please input your name");
        return;
    }

    createSocket();

    goToJoinRoom();
}

function goToJoinRoom() {
    $("#join-game").hide("drop", { direction: "up" }, () => {
        $(".logo").parent('div').eq(0).hide();
        $("#join-room").show("drop", { direction: "up" }, () => {
            $(".coin-area").hide();
            $(".btn-back").show();
            $(".btn-back").off('click');
            $(".btn-back").on('click', () => {
                location.reload();
            });
        });
        getAvailableRooms();
    });
    return;
}

function goToGame() {
    resetDog();
    $("#my-side .bet-amount").val(myAmount);

    $("#join-room").hide("drop", { direction: "up" }, () => {
        $("#high-score").show("drop", { direction: "up" });
        $("#game-play").show("drop", { direction: "up" }, () => {
            $(".btn-back").off('click');
            $(".btn-back").on('click', () => {
                backToJoinRoom();
            });
        });
    });
}

function backToJoinRoom() {
    exitRoom();
    $("#high-score").hide("drop", { direction: "up" });
    $("#game-play").hide("drop", { direction: "up" }, () => {
        $(".logo").parent('div').eq(0).hide();
        $("#join-room").show("drop", { direction: "up" }, () => {
            $(".coin-area").hide();
            $(".btn-back").show();
            $(".btn-back").off('click');
            $(".btn-back").on('click', () => {
                location.reload();
            });
        });
        getAvailableRooms();
    });
    return;
}

function goToGameResult()
{
    $("#winner-show").hide("drop", { direction: "up" });
    $("#high-score").hide("drop", { direction: "up" });
    $("#game-play").hide("drop", { direction: "up" }, () => {
        $(".btn-back").show();
        $(".btn-back").off('click');
        $(".btn-back").on('click', () => {
            backToJoinRoomFromResult();
        });
        $("#home-button").off('click');
        $("#home-button").on('click', () => {
            location.reload();
        });
        $("#game-result").show("drop",{ direction:"up" });
        
        if(!$("#game-result").find(".card").hasClass("failed"))
        {
            $('#fireworks').show();
        }
    });
}

function backToJoinRoomFromResult() {
    $("#game-result").hide("drop", { direction: "up" }, () => {
        $("#join-room").show("drop", { direction: "up" }, () => {
            $(".btn-back").show();
            $(".coin-area").hide();
            $(".btn-back").off('click');
            $(".btn-back").on('click', () => {
                location.reload();
            });
            myRoom = null;
            $("button", $("#my-side")).prop("disabled", false);
            $("#fireworks").hide();
        });
        getAvailableRooms();
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
            roomsHtml += '<a href="javascript:joinRoom(' + room.number + ')" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Click to Join" class="list-group-item list-group-item-action list-group-item-primary room-item"><div class="room-user ' + (playerCount == 0 ? 'nouser"' : 'user" data-bs-toggle="tooltip" data-bs-placement="right" title="' + (room.playerA ? room.playerA : room.playerB) + '"') + '"></div> <p>Room ' + room.number + '</p><p>' + room.name + '</p></a>';
        });
    }
    $("#join-room .list-group").html(roomsHtml);

    initTooltip();
}

function createRoom() {
    myAmount = 0;
    myAvatar = 0;
    showCreateRoomModal(() => {
        let roomName = $("#room-name-input").val();
        socket.emit("roomAction", { action: 'create', playerName: myName, roomName: roomName });
    });
}

function joinRoom(number) {
    myAmount = 0;
    myAvatar = 0;
    socket.emit("roomAction", { action: 'join', roomNumber: number, playerName: myName });
}

function exitRoom() {
    socket.emit("roomAction", { action: 'exit' });
}

function setPlayerStatus(room) {
    myRoom = room;
    $("#play-side .card-title").html("Room " + room.number + "<br>" + room.name);
    if (room.playerIDA == socket.id) {
        setMyStatus(room.readyA, room.playerB);
        setOtherStatus(room.playerB, room.sideB, room.betB, room.readyB);
    }
    else if (room.playerIDB == socket.id) {
        setMyStatus(room.readyB, room.playerA);
        setOtherStatus(room.playerA, room.sideA, room.betA, room.readyA);
    }
}

function setMyStatus(ready, otherPlayer) {
    let pan = $("#my-side");
    // $("input", pan).val(bet);
    if (ready || otherPlayer == "")
        $("#ready-button", pan).prop("disabled", true);
    else
        $("#ready-button", pan).prop("disabled", false);

    // $("#my-side .bet-amount").val(myAmount);
    $("#my-side .avatar-div *").remove();
    $("#my-side .avatar-div").append(getAvatar(myAvatar)).on('click', function () {
        showAvatarModal();
    });
}

function setOtherStatus(player, side, bet, ready) {
    let pan = $("#other-side");
    $(".card-title", pan).html(player == "" ? "?" : player);
    otherAvatar = side == null ? 0 : side;
    $("input", pan).val(bet);
    if (ready)
        $("button", pan).html("Ready");
    else
        $("button", pan).html("Not ready");
    $("#other-side .avatar-div *").remove();
    $("#other-side .avatar-div").append(getAvatar(otherAvatar, true));

    let avatars = $("#avatar-modal .avatars .d-flex");
    $("*", avatars).remove();
    for (let i = 0; i <= playerSelect.length / avatarPerRow; i++) {
        let row = $("#avatar-modal .avatars .d-flex").eq(i);
        for (let j = 0; j < avatarPerRow; j++) {
            let currentNumber = i * avatarPerRow + j + 1;
            row.append(getAvatar(currentNumber, currentNumber == otherAvatar));
            let avatar = $(".avatar", row).eq(j);
            if (currentNumber != otherAvatar) {
                avatar.off('click');
                avatar.on('click', () => {
                    let number = $(avatar).attr("number");
                    $(".selected", $(avatar).parent()).removeClass("selected");
                    $(avatar).addClass("selected");
                    myAvatar = number;
                    doBet();
                });
            }
        }
    }
    $("#avatar-modal .avatar[number=" + myAvatar + "]").addClass("selected");
}

function doBet() {
    let side = myAvatar;
    if(side == 0)
    {
        showAlertModal("Please select your avatar.");
        return false;
    }
    socket.emit("roomAction", { action: "bet", number: myRoom.number, side: side, bet: myAmount });
    return true;
}

function getReady() {
    if(!doBet())
        return;
    //$("button").prop("disabled", true);
    let player, amount;
    if (myRoom.playerIDA == socket.id) {
        player = 'A';
        // amount = myRoom.betA;
    }
    else if (myRoom.playerIDB == socket.id) {
        player = 'B';
        // amount = myRoom.betB;
    }
    if (myAmount <= minAmount) {
        showAlertModal("Please input bigger than "+minAmount+".");
        return;
    }
    amount = myAmount;
    $("#ready-button").prop("disabled",true);
    $("#bet-button").prop("disabled",true);
    if (toPay) {
        ready(myRoom.number, player, socket.id, amount).then((re) => {
            if (re && re.status) {
                socket.emit("roomAction", { action: "ready", number: myRoom.number});
            }
            else {
                $("button").prop("disabled", false);
            }
        }).catch(function (err) {
            $("button").prop("disabled", false);
        });
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

function getAvatar(number, disabled) {
    return "<div number=" + number + " class='avatar avatar-" + number + "' " + (disabled ? "disabled" : "") + "></div>";
}

function showGoText(duration, callback) {
    let goText = $("#go-text");
    goText.show("scale", duration / 8);
    setTimeout(() => {
        $("div", goText).eq(0).hide("puff", { direction: "up", duration: duration * 3 / 8 }, () => {
            goText.hide();
            callback();
        });
    }, duration / 2);
}
function updateTopList(type,resp){  
    let html = '';
    let mark = {1:'gold-medal',2:'silver-medal',3:'bronze-medal'};
    for(let i = 0; i < resp.length; i++)
    {
        if(typeof mark[i+1] != "undefined")
            html += '<tr class="'+mark[i+1]+'-row">';
        else
            html += '<tr>';

        html += '<td>';
        if(typeof mark[i+1] != "undefined")
            html += '<div class="medal '+mark[i+1]+'"></div>';
        else
            html += '<div class="medal">'+(i+1)+'th</div>';
        html += '</td>';
        html += '<td>';
        html += '<div class="avatar avatar-'+resp[i]['avatar']+'"></div><div class="player-name">'+resp[i]['name']+'</div>';
        html += '</td>';
        html += '<td>';
        html += resp[i].reward;
        html += '</td>';

        html += '</tr>';
    }
    if(html == '')
        html = '<tr><td colspan=3>No data</td></tr>';
    $("tbody",$("#"+type+"-part")).html(html);
}