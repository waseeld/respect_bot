const path = require('path');
const wallet = require('../lib/payBch/wallet_user');
console.log(path.dirname(require.main.filename));

async function main(){
    console.log("Wallet : ", await wallet.Create_wallet());
}

main()