class Room{
    constructor(number)
    {
        this.number = number;

        this.playerA = "";
        this.playerB = "";

        this.playerIDA = "";
        this.playerIDB = "";

        this.readyA = false;
        this.readyB = false;

        this.betA = 0;
        this.betB = 0;

        this.sideA = 0;
        this.sideB = 0;

        this.scoreA = 0;//0:initial, 1:lose, 2:win
        this.scoreB = 0;//0:initial, 1:lose, 2:win

        this.winner = "";//A: playerA, B: playerB

        this.nowPlaying = false;
    }
    isAvailable()
    {
        return this.playerA == "" || this.playerB == "";
    }
    playerABet(bet,side)
    {
        this.betA = bet;
        this.sideA = side;
    }
    playerBBet(bet,side)
    {
        this.betB = bet;
        this.sideB = side;
    }
    playerAReady()
    {
        this.readyA = true;
    }
    playerBReady()
    {
        this.readyB = true;
    }
    exitPlayerA()
    {
        this.playerA = "";
        this.playerIDA = "";
        this.readyA = false;
        this.betA = 0;
        this.sideA = 0;
        this.scoreA = 0;
        this.winner = "";
        this.nowPlaying = false;
    }
    exitPlayerB()
    {
        this.playerB = "";
        this.playerIDB = "";
        this.readyB = false;
        this.betB = 0;
        this.sideB = 0;
        this.scoreB = 0;
        this.winner = "";
        this.nowPlaying = false;
    }
}

module.exports = Room;