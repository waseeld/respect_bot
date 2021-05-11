const ranidb = require('ranidb');
const conf = require('../../conf.json');
const path = require('path');
const NETWORK = conf.setting.NETWORK;

// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
// const ABC_MAINNET = 'https://abc.fullstack.cash/v4/'
const TESTNET3 = 'https://testnet3.fullstack.cash/v4/'

// bch-js-examples require code from the main bch-js repo
const BCHJS = require('@psf/bch-js')

// Instantiate bch-js based on the network.
// let bchjs = (NETWORK == "mainnet") ? new BCHJS({ restURL: BCHN_MAINNET }) : new BCHJS({ restURL: TESTNET3 })

var db = new ranidb(path.dirname(require.main.filename) + "/../../db/users.json")

const Create_wallet = async () => {
    let bchjs = (NETWORK == "mainnet") ? new BCHJS({ restURL: BCHN_MAINNET }) : new BCHJS({ restURL: TESTNET3 })

    let lang = "english"
    let outStr = ''
    const outObj = {}

    // create 128 bit BIP39 mnemonic
    const mnemonic = bchjs.Mnemonic.generate(
        128,
        bchjs.Mnemonic.wordLists()[lang]
    )
    // console.log('BIP44 $BCH Wallet')
    outStr += 'BIP44 $BCH Wallet\n'
    // console.log(`128 bit ${lang} BIP39 Mnemonic: `, mnemonic)
    outStr += `\n128 bit ${lang} BIP32 Mnemonic:\n${mnemonic}\n\n`
    outObj.mnemonic = mnemonic

    // root seed buffer
    const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)

    // master HDNode
    let masterHDNode
    if (NETWORK === 'mainnet') masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
    else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

    // HDNode of BIP44 account
    const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")
    // console.log('BIP44 Account: "m/44\'/245\'/0\'"')
    outStr += 'BIP44 Account: "m/44\'/245\'/0\'"\n'

    for (let i = 0; i < 10; i++) {
        const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${i}`)
        // console.log(
        //     `m/44'/245'/0'/0/${i}: ${bchjs.HDNode.toCashAddress(childNode)}`
        // )
        outStr += `m/44'/245'/0'/0/${i}: ${bchjs.HDNode.toCashAddress(childNode)}\n`

        if (i === 0) {
            outObj.cashAddress = bchjs.HDNode.toCashAddress(childNode)
            outObj.slpAddress = bchjs.SLP.Address.toSLPAddress(outObj.cashAddress)
            outObj.legacyAddress = bchjs.Address.toLegacyAddress(outObj.cashAddress)
        }
    }

    // derive the first external change address HDNode which is going to spend utxo
    const change = bchjs.HDNode.derivePath(account, '0/0')

    // get the cash address
    bchjs.HDNode.toCashAddress(change)

    // Get the legacy address.

    outStr += '\n\n\n'

    return outObj;
}

const getBalance = async (id) => {
    try {
        let bchjs = (NETWORK == "mainnet") ? new BCHJS({ restURL: BCHN_MAINNET }) : new BCHJS({ restURL: TESTNET3 })

        const user = db.find({ id: id })

        const walletInfo = user.data.wallet

        const mnemonic = walletInfo.mnemonic

        // root seed buffer
        const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)

        // master HDNode
        let masterHDNode
        if (NETWORK === 'mainnet') masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
        else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

        // HDNode of BIP44 account
        const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")

        const change = bchjs.HDNode.derivePath(account, '0/0')

        // get the cash address
        const cashAddress = bchjs.HDNode.toCashAddress(change)
        const slpAddress = bchjs.SLP.Address.toSLPAddress(cashAddress)

        // first get BCH balance
        const balance = await bchjs.Electrumx.balance(cashAddress)

        // console.log(`BCH Balance information for ${slpAddress}:`)
        // console.log(`${JSON.stringify(balance.balance, null, 2)}`)
        // console.log('SLP Token information:')

        // get token balances
        try {
            const tokens = await bchjs.SLP.Utils.balancesForAddress(slpAddress)

            // console.log(JSON.stringify(tokens, null, 2))
            return {
                state: 200,
                blance_bch: balance.balance,
                tokens: tokens
            }
        } catch (error) {
            if (error.message === 'Address not found') console.log('No tokens found.')
            else console.log('Error: ', error)
            return {
                state: 202,
                blance_bch: balance.balance,
                tokens: []
            }
        }
    } catch (err) {
        console.error('Error in getBalance: ', err)
        console.log(`Error message: ${err.message}`)
        return {
            state: 300,
            error: err
        }
        // throw err
    }
}

const send = async (id, amount) => {

}

module.exports = { Create_wallet, getBalance, send }