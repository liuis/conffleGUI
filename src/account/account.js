const mnemonicInfo = require("conffle-utils/mnemonic.js");
let HDWalletAccounts = require("hdwallet-accounts");
var fs = require('fs');
var sd = require('silly-datetime');
var path = require('path');

const ConfluxWeb = require('conflux-web');
const BN = require('bn.js');
const confluxWeb = new ConfluxWeb('http://0.0.0.0:12537');
const cfxNum = new BN('30000000000000000000');
var jayson = require('jayson');
var client = jayson.client.http('http://localhost:12537');

const GENESIS_PRI_KEY = "0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f";
const GENESIS_ADDRESS = "0xfbe45681ac6c53d5a40475f7526bac1fe7590fb8";

var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
var data = {}
data.wallet = []

/**
 * mkdirs
 *
 * @name mkdirs async
 * @function
 * @access public
 * @param {string} dirname dir path
 * @param {function} callback callback fun
 */
function mkdirs(dirname, callback) {
    fs.exists(dirname, function(exists) {
        if (exists) {
            callback();
        } else {
            //console.log(path.dirname(dirname));
            mkdirs(path.dirname(dirname), function() {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

/**
 * mkdir sync
 *
 * @name mkdirsSync
 * @function
 * @access public
 * @param {string} dirname dir path
 */
function mkdirsSync(dirname) {

    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}


/**
 * write generate privatekey && address to json file
 *
 * @name writeJson
 * @function
 * @access public
 * @param {string} mnemonicValue mnemonic for account
 * @param {array} accountsValue list include address pubkey priKey
 * @param {string} dir dir path
 */
function writeJson(mnemonicValue, accountsValue, dir) {
    var obj = {
        time: time,
        mnemonic: mnemonicValue,
        accounts: accountsValue,
    }
    data.wallet.push(obj);

    fs.appendFile(dir + "/" + "wallet-" + time + ".json", JSON.stringify(data, null, 4), function(err) {
        if (err) throw err;
        console.log('write complete, pls check json file in keyAccounts directory');
    })
};

async function run() {

    try {
        await generatePK();

    } catch (e) {
        printError(e.message)
        console.error(e);
    }
}

/**
 * generate address pubkey privatekey && time
 *
 * @name generatePK
 * @function
 * @access public
 * @param {string} dir="KeyAccounts" dir path
 */
async function generatePK(dir = "KeyAccounts") {

    let walletAccounts = HDWalletAccounts(10);
    //console.log('Mnemonic:', walletAccounts.mnemonic);
    console.log('Accounts:', walletAccounts.accounts);
    mkdirsSync(dir);
    writeJson(walletAccounts.mnemonic, walletAccounts.accounts, dir);
    for (let account of walletAccounts.accounts) {
        await sendcfx(account.address);
        await confluxWeb.cfx.accounts.wallet.add({
            privateKey: account.privateKey,
            address: account.address
        });
        //await confluxWeb.cfx.getBalance(account.address).then(console.log)
        //await confluxWeb.cfx.accounts.wallet.then(console.log)
        //console.log(confluxWeb.cfx.accounts.wallet.accounts)
    };

    //const {
    //    mnemonic,
    //    accounts,
    //    privateKeys
    //} = mnemonicInfo.getAccountsInfo(
    //    10
    //);

    //console.log("----------------------mnemonic--------------------------")
    //console.log("mnemonic:");
    //console.log(mnemonic);



    //console.log("----------------------accounts--------------------------")
    //console.log("accounts:")
    //console.log(accounts)

    //console.log("----------------------privateKeys--------------------------")
    //console.log("privateKeys:")
    //console.log(privateKeys)


}

async function sendcfx(address) {

    await confluxWeb.cfx.accounts.wallet.add({
        privateKey: GENESIS_PRI_KEY,
        address: GENESIS_ADDRESS
    })
    var TO_ACCOUNT = address;
    return confluxWeb.cfx.getTransactionCount(GENESIS_ADDRESS).then(async(nonceValue) => {
        let gasPrice = await confluxWeb.cfx.getGasPrice();
        let txParms = {
            from: GENESIS_ADDRESS,
            nonce: nonceValue,
            gasPrice: 100,
            data: "0x00",
            value: cfxNum,
            to: TO_ACCOUNT
        };
        let gas = await confluxWeb.cfx.estimateGas(txParms);
        txParms.gas = gas;
        txParms.from = 0;
        await confluxWeb.cfx.signTransaction(txParms)
            .then(async(encodedTransaction) => {
                const {
                    rawTransaction
                } = encodedTransaction;
                console.log('raw transaction: ', rawTransaction);
                await confluxWeb.cfx.sendSignedTransaction(rawTransaction).then(async(transactionHash) => {
                    await waitBlock(transactionHash, TO_ACCOUNT)
                })
            }).catch(console.error);
    });
}



function package() {
    array = [];
    for (var i = 0, len = 25; i < len; i++) {
        array.push(
            new Promise((resolve, reject) =>
                client.request('generateoneblock', [1, 300000], function(err, error, result) {
                    if (err) reject(err);
                    resolve("generateoneblock : " + result);
                })
            )
        )

    }
    return Promise.all(array);
}


async function waitBlock(txHash, TO_ACCOUNT) {
    await package();
    await confluxWeb.cfx.getTransactionReceipt(txHash).then(
        async(receipt) => {
            if (receipt !== null) {
                //console.log("Your account has been receiver some cfx coin");
                await confluxWeb.cfx.accounts.wallet.remove(GENESIS_ADDRESS)
                return Promise.resolve("done");
            } else {
                //return waitBlock(txHash, TO_ACCOUNT)
                return Promise.reject("generateBlock err, 15 blocks");
            }
        })
}
module.exports = {
    run,
    generatePK
}
