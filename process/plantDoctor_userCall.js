//MongoDB
const ObjectId = require('mongodb').ObjectId;


const DB=require('../database/db.js');
const moment=require('moment');

module.exports={
    show:Show,
    add:Add
}


async function Show(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let search=req.query.search;

    if(search===undefined){  
        //分頁
        const perPage=12;
        const total=await db.collection('user_data').countDocuments({isDoctor:{$ne:true},isCall:{$ne:false}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_result=await db.collection('user_data').find({isDoctor:{$ne:true},isCall:{$ne:false}}).skip(startForm).limit(perPage).toArray();  
        await client.close(); 
        return res.render('plantDoctor-userCall.ejs',{user:req.user.username,data:page_result,pages:pages,pageNumber:pageNumber,page_show:'d-block'});
    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }
        const search_result=await db.collection('user_data').find({isDoctor:{$ne:true},isCall:{$ne:false},$or:[{username:{$regex:search,$options:"$si"}},{name:{$regex:search,$options:"$si"}},{email:{$regex:search,$options:"$si"}},{phone:{$regex:search,$options:"$si"}},{address:{$regex:search,$options:"$si"}}]}).toArray();
        await client.close();

        return res.render('plantDoctor-userCall.ejs',{user:req.user.username,data:search_result,pages:0,pageNumber:0,page_show:'d-none'});
    }       
}

async function Add(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let doctorID=req.user._id;
    let user_id=req.body.user_id;
    let username=req.body.username;
    let dateline=req.body.dateline;
    let solution=req.body.solution;
    let recommendation=req.body.recommendation;
    let due=parseInt(req.body.due);
    let record_date=moment().utc().local();

    let validPeriod=moment().add(dateline, 'months').utc().local();

    const add_prescriptions=await db.collection('prescriptions').insertOne({doctorID:doctorID,user_id:ObjectId(user_id),username:username,dateline:validPeriod.toDate(),solution:solution,recommendation:recommendation,due:due,date:record_date.toDate(),check:false});
    if(add_prescriptions.acknowledged==true){
        const false_isCall=await db.collection('user_data').updateOne({_id:ObjectId(user_id)},{$set:{isCall:false}});
        
        await client.close();        
        return res.json({success:true});
    }else{

        await client.close();
        return res.json({success:false})
    }
}