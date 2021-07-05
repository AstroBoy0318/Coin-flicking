let plugin;
let web3;
let contract;
const chainID = 97;
const contractAddress = {97:"0x2657B26E08d9964645576AB1E18858eF85cc1fdf",56:""};
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"},{"internalType":"string","name":"player","type":"string"},{"internalType":"string","name":"playerID","type":"string"}],"name":"bet","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"changeAdmin","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"a","type":"string"},{"internalType":"string","name":"b","type":"string"}],"name":"compareStrings","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"},{"internalType":"string","name":"winner","type":"string"}],"name":"prize","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rooms","outputs":[{"internalType":"string","name":"playerIDA","type":"string"},{"internalType":"address","name":"playerA","type":"address"},{"internalType":"uint256","name":"betA","type":"uint256"},{"internalType":"string","name":"playerIDB","type":"string"},{"internalType":"address","name":"playerB","type":"address"},{"internalType":"uint256","name":"betB","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"newRate","type":"uint256"}],"name":"updateWinnerRate","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winnerRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

function initWeb3()
{
    $(window).on('load',async function(){
        plugin = window.ethereum;
        if(typeof plugin == "undefined")
        {
            alert("Please install metamask");
            return;
        }
        let curChainId = await plugin.request({ method: 'eth_chainId' });
        if(curChainId != chainID)
        {
            alert("Select correct network");
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
    let result = await contract.methods.bet(number,player,playerID).send({
        from: account[0],
        value: amount
    });
    return result;
}