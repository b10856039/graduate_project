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
    const quality = await db.collection('quality').find({ userid: ObjectId(user_id) }).toArray();
    quality.sort(function(a, b) {
        return a.time < b.time ? 1 : -1;
    });
    quality.forEach((item) => {
            item.time = moment(item.time).utc().local().format('YYYY-MM-DD')
        })
        //console.log(quality)
    await client.close();
    return res.render('quality_identify.ejs', { user: req.user.username, data: quality });
}