let plugin;
let web3;
let contract;
let chainID = 97
let contractAddress = {97:"",56:""};

function initWeb3()
{
    plugin = window.ethereum;
    if(typeof plugin == "undefined")
    {
        alert("Please install metamask");
        return;
    }
    web3 = new Web3(plugin);
}