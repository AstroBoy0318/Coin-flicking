let plugin;
let web3;
let contract;
const networks = { 3: "Ropsten",56:"Binance Smart Chain", 97: "Test Bsc" };
const chainID = 97;
const contractAddress = {97:"0x0c3DADefe94e8e6D2512D1cF4c542402D837bD4e",56:""};
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"playerID","type":"string"}],"name":"bet","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"changeAdmin","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"a","type":"string"},{"internalType":"string","name":"b","type":"string"}],"name":"compareStrings","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"players","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"},{"internalType":"uint256","name":"betAmount","type":"uint256"},{"internalType":"address","name":"winner","type":"address"}],"name":"prize","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newRate","type":"uint256"}],"name":"updateWinnerRate","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winnerRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

function initWeb3()
{
    $(window).on('load',async function(){
        if(!toPay)
            return;
        plugin = window.ethereum;
        if(typeof plugin == "undefined")
        {
            showReloadModal("Please install metamask");
            return;
        }
        let curChainId = await plugin.request({ method: 'eth_chainId' });
        if(curChainId != chainID)
        {
            showReloadModal("Select " + networks[chainID] + " network");
            return;
        }
        web3 = new Web3(plugin);
        contract = new web3.eth.Contract(abi, contractAddress[chainID]);
    });
}

async function ready(number,player,playerID,amount)
{
    let account = await plugin.request({ method: 'eth_requestAccounts' });
    let curChainId = await plugin.request({ method: 'eth_chainId' });
    if(curChainId != chainID)
    {
        alert("Select correct network");
        return;
    }
    amount = Web3.utils.toWei(amount.toString(), 'ether');
    let result = await contract.methods.bet(playerID).send({
        from: account[0],
        value: amount
    });
    return result;
}