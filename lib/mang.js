const ranidb = require('ranidb');
let db = new ranidb("./db/users.json");

let create_Acount = (id) => {
    let data = db.find({id: id});
    if (data == undefined) {
        db.push({
            id: id,
            data: {
                balance: 0
            }
        })
        return {state: 200}
    } else {
        return {state: 300}
    }
}

let balance = async(id) => {
    let data = await db.find({id: id});
    if (data != undefined) {
        return {state: 200, data: data.data.balance}
    } else {
        create_Acount(id);
        let data = await db.find({id: id});
        return {state: 200, data: data.data.balance}
    }
}

let send = async(from_id, to_id, amount) => {
    let from = await balance(from_id);
    let to = await balance(to_id);
    // console.log(from.data - amount);
    if (from.state == 200) {
        if (from.data > amount) {
            db.updata(from_id, {id: from_id, data: {balance: from.data - amount}});
            db.updata(to_id, {id: to_id, data: {balance: to.data + amount}});
            return {state: 200}
        } else {
            return {state: 300}
        }

    } else {
        create_Acount(from_id);
        return {state: 300};
    }
}
module.exports = {create_Acount, balance, send}