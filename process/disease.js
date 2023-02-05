//MongoDB
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');

const DB = require('../database/db.js');
const randToken = require('rand-token');

module.exports = {
    show: Show
}


async function Show(req, res) {
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let user_id = req.user._id;
    const identify = await db.collection('identify').find({ userid: ObjectId(user_id) }).toArray();
    identify.sort(function(a, b) {
        return a.time < b.time ? 1 : -1;
    });
    identify.forEach((item) => {
        item.time = moment(item.time).utc().local().format('YYYY-MM-DD')
    })

    await client.close();

    return res.render('disease_identify.ejs', { user: req.user.username, data: identify });
}