//MongoDB
const ObjectId = require('mongodb').ObjectId;

const DB=require('../database/db.js');

const moment=require('moment');

module.exports={
    show:Show,
    add:Add,
    update:Update,
    delete:Delete
}



async function Show(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    let data_result=[];
    let fieldArr=[];
    let user_id=req.user._id;
    let search=req.query.search;


    const search_userData=await db.collection('user_data').findOne({_id:user_id});
    let search_field=search_userData.field;

    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();            
         
    total_field.forEach((item)=>{
        fieldArr.push(item._id)
    })
    
    if(search===undefined){
        //分頁
        const perPage=12;
        let total=await db.collection('field_with_plant').countDocuments({fieldID:{$in:fieldArr}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_limit_result=await db.collection('field_with_plant').find({fieldID:{$in:fieldArr}}).sort({time:-1}).skip(startForm).limit(perPage).toArray();



        for(let item of page_limit_result){
            data_result.push({relationID:item._id,fieldName:item.fieldName,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),growMessage:item.growMessage})
        }    

        await client.close();

        return res.render('grow_record.ejs',{user:req.user.username,data:data_result,field:total_field,pages:pages,pageNumber:pageNumber,page_show:'d-block'}); 

    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }
        const search_result=await db.collection('field_with_plant').find({fieldID:{$in:fieldArr},$or:[{fieldName:{$regex:search,$options:"$si"}},{time:{$regex:search,$options:"$si"}},{growMessage:{$regex:search,$options:"$si"}}]}).toArray();
        for(let item of search_result){
            data_result.push({relationID:item._id,fieldName:item.fieldName,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),growMessage:item.growMessage})
        }

        await client.close();

        return res.render('grow_record.ejs',{user:req.user.username,data:data_result,field:total_field,pages:0,pageNumber:0,page_show:'d-none'});
    }
}


async function Add(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const add_grow=await db.collection('field_with_plant').insertOne({fieldID:ObjectId(req.body.fieldID),fieldName:req.body.fieldName,time:req.body.time,growMessage:req.body.msg});
    await client.close();
    if(add_grow.acknowledged===true){
        return res.json({success:true});
    }else{
        return res.json({success:false})
    }
}

async function Update(req,res){
const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    const result=await db.collection('field_with_plant').updateOne({_id:ObjectId(req.body._id)},{$set:{time:req.body.time,growMessage:req.body.msg}},{upsert:true}); 
    
    await client.close();
    
    if(result.acknowledged==true){               
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}

async function Delete(req,res){
    let grow_id=req.body._id
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    
    const result=await db.collection('field_with_plant').findOneAndDelete({_id:ObjectId(grow_id)});

    await client.close();

    if(result.ok==true){
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}