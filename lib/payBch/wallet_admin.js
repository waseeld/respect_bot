const ranidb = require('ranidb');
const conf = require('../../conf.json');
const NETWORK = conf.setting.NETWORK;

// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
// const ABC_MAINNET = 'https://abc.fullstack.cash/v4/'
const TESTNET3 = 'https://testnet3.fullstack.cash/v4/'

// bch-js-examples require code from the main bch-js repo
const BCHJS = require('@psf/bch-js')

// Instantiate bch-js based on the network.
let bchjs = (NETWORK == "mainnet") ? new BCHJS({ restURL: BCHN_MAINNET }) : new BCHJS({ restURL: TESTNET3 })

const getBalance_bch = async () => {

    const cashAddress = conf.admin.main_address;

    // first get BCH balance
    const balance = await bchjs.Electrumx.balance(cashAddress)

    // console.log(`BCH Balance information for ${slpAddress}:`)
    // console.log(`${JSON.stringify(balance.balance, null, 2)}`)

    return {
        state: 200,
        blance_bch: balance.balance
    }

}

const getBalance_token = async () => {
    try {
        const cashAddress = conf.admin.main_address;
        const slpAddress = bchjs.SLP.Address.toSLPAddress(cashAddress)

        // get token balances
        const tokens = await bchjs.SLP.Utils.balancesForAddress(slpAddress)

        // console.log(JSON.stringify(tokens, null, 2))
        return {
            state: 200,
            tokens: tokens
        }
    } catch (error) {
        if (error.message === 'Address not found') console.log('No tokens found.')
        else console.log('Error: ', error)
        return {
            state: 202,
            tokens: []
        }
    }
}

const send = (id_user, amount) => {

}