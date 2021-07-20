let plugin;
let web3;
let contract;
const networks = { 3: "Ropsten", 56: "Binance Smart Chain", 97: "Test Bsc" };
const chainID = 97;
const contractAddress = { 97: "0xD95c839946506CA1D9D71c1d14a3257Dea20F91b", 56: "" };
const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "playerID", "type": "string" }], "name": "bet", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "changeAdmin", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "a", "type": "string" }, { "internalType": "string", "name": "b", "type": "string" }], "name": "compareStrings", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "players", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "number", "type": "uint256" }, { "internalType": "uint256", "name": "betAmount", "type": "uint256" }, { "internalType": "address", "name": "winner", "type": "address" }], "name": "prize", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "newRate", "type": "uint256" }], "name": "updateWinnerRate", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "winnerRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

let accountInfo = {};
// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;

function initWeb3() {
    $(window).on('load', async function () {
        if (!toPay)
            return;
        init();
        onConnect();
    });
}

/**
 * Setup the orchestra
 */
function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                // Mikko's test key - don't copy as your mileage may vary
                infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
            }
        }
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}
async function onConnect() {
    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
        web3 = new Web3(provider);
        contract = new web3.eth.Contract(abi, contractAddress[chainID]);
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });
    fetchAccountData();
}
async function fetchAccountData() {
    const accounts = await web3.eth.getAccounts();
    accountInfo['address'] = accounts[0];
    accountInfo['chainId'] = await web3.eth.getChainId();
}
function web3Valid()
{
    return !toPay || (accountInfo['address'] && accountInfo['chainId'] == chainID);
}
async function ready(number, player, playerID, amount) {
    let account = await web3.eth.getAccounts();
    let curChainId = await web3.eth.getChainId();
    if (curChainId != chainID) {
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