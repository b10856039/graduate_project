//MongoDB
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');

const DB = require('../database/db.js');
const randToken = require('rand-token');

module.exports = {
    show: Show,
    add: add,
    del: del
}

async function textProcess(array) {
    for (let i = 0; i < array.length; i++) {
        array[i].date = moment(array[i].date).utc().local().format('YYYY-MM-DD')
        array[i].dateline = moment(array[i].dateline).utc().local().format('YYYY-MM-DD')
        if (array[i].check) {
            array[i].check = '完成';
            array[i].due = '無';
        } else {
            array[i].check = '未完成';
            const nowTime = moment();
            var nextCheck;
            array[i].compare = nowTime.diff(array[i].date, 'days');
            nextCheck = array[i].compare % array[i].due;
            array[i].due = (nextCheck == 0) ? "今天" : array[i].due - nextCheck;            
        }
    }
    array.sort(function(a, b) {
        return a.check < b.check ? 1 : -1;
    });
    return array
}

async function Show(req, res) {
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);


    let user_id = req.user._id;
    let identifys;
    const personal_data = await db.collection('user_data').findOne({ _id: ObjectId(user_id) })
    //分頁
    const perPage = 12; //一頁幾筆資料
    const total = await db.collection('prescriptions').countDocuments({ user_id: ObjectId(user_id) }); //算幾筆資料
    let pages = Math.ceil(total / perPage);
    let pageNumber = (req.query.page == null || req.query.page <= 0) ? 1 : req.query.page; // 第幾頁
    let startForm = (pageNumber - 1) * perPage; // 前一頁
    const identify = await db.collection('prescriptions').find({ user_id: ObjectId(user_id) }).skip(startForm).limit(perPage).toArray(); //傳當頁資料
    identifys = await textProcess(identify);
    //console.log(identifys)

    await client.close();

    return res.render('prescriptionsCustomer.ejs', { user: req.user.username, data: identifys, personal_data: personal_data.isCall, pages: pages, pageNumber: pageNumber, page_show: 'd-block' });
    
}

async function add(req, res) {
    try {
        let obj_id = req.user._id;
        const client=await DB.loadClient();
        const db=await DB.loadDB(client);

        //console.log(obj_id)
        const isCall = await db.collection('user_data').updateOne({ _id: ObjectId(obj_id) }, { $set: { isCall: true } });
        await client.close();
        return res.json({ success: true, text: '已通知醫生' })
    } catch (error) {
        return res.json({ success: false, text: '通知失敗' })
    }
}

async function del(req, res) {
    try {
        let obj_id = req.user._id;
        const client=await DB.loadClient();
        const db=await DB.loadDB(client);

        const isCall = await db.collection('user_data').updateOne({ _id: ObjectId(obj_id) }, { $set: { isCall: false } });
        await client.close();
        return res.json({ success: true, text: '已取消' })
    } catch (error) {
        return res.json({ success: false, text: '取消失敗' })
    }
}