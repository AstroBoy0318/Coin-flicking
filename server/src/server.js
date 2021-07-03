let http = require('http');
let bodyParser = require('body-parser');
let express = require('express');
let Room = require('./room.js');

let rooms = [];
let nextRoomNumber = 1;
let players = {};
let playersRoom = {};
let app = express();
const port = 8080;

//socket
// configure for react client
/*
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
});
*/

let server = http.createServer(app);
let io = require('socket.io')(server);
io.on('connection', function (socket) {
    let sessionId = socket.id;
    socket.on('disconnect', function () {
        console.log('Got disconnect! Id: ' + socket.id);
        let room = rooms[playersRoom[sessionId]-1];
        if(typeof room !== "undefined")
        {
            if(room.playerIDA == sessionId)
                room.exitPlayerA();
            else if(room.playerIDB == sessionId)
                room.exitPlayerB();
            
            let resp = {};
            let availableRooms = getAvailableRooms();
            resp['rooms'] = availableRooms;
            resp['activeRoom'] = room;
            io.emit('updateRooms',resp);
        }
        delete players[sessionId];
        delete playersRoom[sessionId];
    });

    socket.on('roomAction', function (message) {
        let resp = {};
        if(message.action == 'create')
        {
            let room = new Room(nextRoomNumber);
            rooms.push(room);
            nextRoomNumber++;
            resp['action'] = 'create';
        }
        else if(message.action == 'join')
        {
            resp = joinRoom(message);
        }
        else if(message.action == "bet")
        {
            resp['action'] = "update";
            let room = rooms[message.number-1];
            if(room.playerIDA == sessionId)
            {
                room.playerABet(message.bet,message.side);
            }
            else if(room.playerIDB == sessionId)
            {
                room.playerBBet(message.bet,message.side);
            }
            resp['activeRoom'] = room;
        }
        else if(message.action == "ready")
        {
            resp['action'] = "update";
            let room = rooms[message.number-1];
            if(room.playerIDA == sessionId)
            {
                room.playerAReady();
            }
            else if(room.playerIDB == sessionId)
            {
                room.playerBReady();
            }
            resp['activeRoom'] = room;
        }
        let availableRooms = getAvailableRooms();
        resp['rooms'] = availableRooms;
        io.emit('updateRooms',resp);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    function joinRoom(message)
    {
        players[sessionId] = message.playerName;
        let roomNumber = message.roomNumber;
        let room = rooms[roomNumber-1];
        if(room.isAvailable())
        {
            if(room.playerA == "")
            {
                room.playerA = message.playerName;
                room.playerIDA = sessionId;
            }
            else if(room.playerB == "")
            {
                room.playerB = message.playerName;
                room.playerIDB = sessionId;
            }
            playersRoom[sessionId] = roomNumber;
            let resp = { action: 'join',player: sessionId,activeRoom:room };
            return resp;
        }
    }
});
server.listen(port, () => {
    console.log('API Running On Port ' + port);
});

//express
let publicPath = __dirname + '/public/';

app.get('/', (req, res) => {
    res.sendFile(publicPath + '/index.html');
});
app.get('/getAvailableRooms', (req, res) => {
    res.json(getAvailableRooms());
});

app.use(express.static(publicPath));

// functions
function getAvailableRooms(){
    let availableRooms = rooms.filter((el)=>{
        return el.isAvailable();
    });
    return availableRooms;
}
