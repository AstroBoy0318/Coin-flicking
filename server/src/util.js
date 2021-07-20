const betAmountRange = [
    { min:0.015, max: 0.5, winnerRate: 900 },
    { min:0.5, max: 1, winnerRate: 925 },
    { min:1, max: 99999, winnerRate: 950 },
];

function getWinnerRate(betAmount)
{
    let winnerRate = 0;
    for(let i = 0; i < betAmountRange.length; i++)
    {
        if(betAmount >= betAmountRange[0]['min'] && betAmount < betAmountRange[0]['max'])
        {
            winnerRate = betAmountRange[0]['winnerRate'];
            break;
        }
    }
    return winnerRate;
}

module.exports = {
    getWinnerRate
};