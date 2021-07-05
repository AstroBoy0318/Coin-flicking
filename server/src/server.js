let http = require('http');
let bodyParser = require('body-parser');
let express = require('express');
let Web3 = require('web3');
let Tx = require('ethereumjs-tx');
var ethers = require('ethers');
let Room = require('./room.js');

let rooms = [];
let nextRoomNumber = 1;
let players = {};
let playersRoom = {};
let app = express();
const port = 8080;

const adminWallet = "0xE5F60C04a06ef06933B13D902A4c76580e1478Fa";
const pvKey = "0x15914feeb00cf4be8022a0dd1558511bb0caac12ded8ce1331b534a2e1e52440";
const chainID = 97;
const rpcUrl = { 97: "https://data-seed-prebsc-1-s1.binance.org:8545", 56: "https://bsc-dataseed1.defibit.io" }
const contractAddress = { 97: "0x2657B26E08d9964645576AB1E18858eF85cc1fdf", 56: "" };
const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "number", "type": "uint256" }, { "internalType": "string", "name": "player", "type": "string" }, { "internalType": "string", "name": "playerID", "type": "string" }], "name": "bet", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "changeAdmin", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "a", "type": "string" }, { "internalType": "string", "name": "b", "type": "string" }], "name": "compareStrings", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "number", "type": "uint256" }, { "internalType": "string", "name": "winner", "type": "string" }], "name": "prize", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "rooms", "outputs": [{ "internalType": "string", "name": "playerIDA", "type": "string" }, { "internalType": "address", "name": "playerA", "type": "address" }, { "internalType": "uint256", "name": "betA", "type": "uint256" }, { "internalType": "string", "name": "playerIDB", "type": "string" }, { "internalType": "address", "name": "playerB", "type": "address" }, { "internalType": "uint256", "name": "betB", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "newRate", "type": "uint256" }], "name": "updateWinnerRate", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "winnerRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl[chainID]));

const provider = new ethers.providers.Web3Provider(web3.currentProvider);
const wallet = new ethers.Wallet(pvKey, provider);

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
        let room = rooms[playersRoom[sessionId] - 1];
        if (typeof room !== "undefined") {
            if (room.playerIDA == sessionId)
                room.exitPlayerA();
            else if (room.playerIDB == sessionId)
                room.exitPlayerB();

            let resp = {};
            let availableRooms = getAvailableRooms();
            resp['rooms'] = availableRooms;
            resp['activeRoom'] = room;
            io.emit('updateRooms', resp);
        }
        delete players[sessionId];
        delete playersRoom[sessionId];
    });

    socket.on('roomAction', function (message) {
        let resp = {};
        if (message.action == 'create') {
            let room = new Room(nextRoomNumber);
            rooms.push(room);
            nextRoomNumber++;
            resp['action'] = 'create';
        }
        else if (message.action == 'join') {
            resp = joinRoom(message);
        }
        else if (message.action == "bet") {
            resp['action'] = "update";
            let room = rooms[message.number - 1];
            if (room.playerIDA == sessionId) {
                room.playerABet(message.bet, message.side);
            }
            else if (room.playerIDB == sessionId) {
                room.playerBBet(message.bet, message.side);
            }
            resp['activeRoom'] = room;
        }
        else if (message.action == "ready") {
            resp['action'] = "update";
            let room = rooms[message.number - 1];
            if (room.playerIDA == sessionId) {
                room.playerAReady();
            }
            else if (room.playerIDB == sessionId) {
                room.playerBReady();
            }
            if (room.readyA && room.readyB) {
                resp['action'] = 'started';
                let playersLabel = ['A', 'B'];
                let winnerIndex = getRandomInt(0, 2);
                room.winner = playersLabel[winnerIndex];

                //send reward
                provider.getTransactionCount(wallet.address).then((transactionCountPromise) => {
                    let overrides = {
                        gasPrice: ethers.utils.parseUnits('50.0', 'gwei'),
                        gasLimit: 120000,
                        nonce: transactionCountPromise
                    }                    
                    let contract = new ethers.Contract(contractAddress[chainID], abi, wallet);
                    let contractWithSigner = contract.connect(wallet);
                    contractWithSigner.prize(room.number, room.winner, overrides).catch(function (e) { console.log(e); return null }).then((tx) => {
                        console.log(tx);
                    });
                });
                //end sending
            }
            resp['activeRoom'] = room;
        }
        let availableRooms = getAvailableRooms();
        resp['rooms'] = availableRooms;
        io.emit('updateRooms', resp);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    function joinRoom(message) {
        players[sessionId] = message.playerName;
        let roomNumber = message.roomNumber;
        let room = rooms[roomNumber - 1];
        if (room.isAvailable()) {
            if (room.playerA == "") {
                room.playerA = message.playerName;
                room.playerIDA = sessionId;
            }
            else if (room.playerB == "") {
                room.playerB = message.playerName;
                room.playerIDB = sessionId;
            }
            playersRoom[sessionId] = roomNumber;
            let resp = { action: 'join', player: sessionId, activeRoom: room };
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
function getAvailableRooms() {
    let availableRooms = rooms.filter((el) => {
        return el.isAvailable();
    });
    return availableRooms;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}