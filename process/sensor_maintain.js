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
    let user_id=req.user._id;
    let search=req.query.search;
    let fieldArr=[];
    let sensorArr=[];
    let sensor=[];
    let data_result=[];

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);   

    const search_userData=await db.collection('user_data').findOne({_id:user_id});
    let search_field=search_userData.field;

    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();
    total_field.forEach((item)=>{
        fieldArr.push(item._id)
    })

    const search_sensor=await db.collection('sensor_data').find({fieldID:{$in:fieldArr}}).toArray();
    search_sensor.forEach((item)=>{
        sensor.push(item._id);
        sensorArr.push({sensor_objId:item._id,sensorID:item.sensorID});
    })

    if(search===undefined){
        const perPage=12;
        let total=await db.collection('sensor_maintain_record').countDocuments({sensor_ObjID:{$in:sensor}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_limit_result=await db.collection('sensor_maintain_record').find({sensor_ObjID:{$in:sensor}}).skip(startForm).limit(perPage).toArray();

        for(let item of page_limit_result){               
            data_result.push({_id:item._id,sensor_ObjID:item.sensor_ObjID,sensorID:item.sensorID,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),message:item.message,count:item.count});
        }
        await client.close();
        return res.render('sensor_maintain.ejs',{user:req.user.username,sensor:sensorArr,data:data_result,pages:pages,pageNumber:pageNumber,page_show:'d-block'});

    }else{

        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }      
        const search_result=await db.collection('sensor_maintain_record').find({sensor_ObjID:{$in:sensor},$or:[{sensorID:{$regex:search,$options:'si'}},{time:{$regex:search,$options:'si'}},{message:{$regex:search,$options:'si'}},{count:{$regex:search,$options:'si'}}]}).toArray();
        for(let item of search_result){    
                      
            data_result.push({_id:item._id,sensor_ObjID:item.sensor_ObjID,sensorID:item.sensorID,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),message:item.message,count:item.count});
        }
        await client.close();
        return res.render('sensor_maintain.ejs',{user:req.user.username,sensor:sensorArr,data:data_result,pages:0,pageNumber:0,page_show:'d-none'});

    }

}

async function Add(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);  

    const search_maintain_count=await db.collection('sensor_maintain_record').countDocuments({sensor_ObjID:ObjectId(req.body.sensor_ObjID)});  

    const search_sensor=await db.collection('sensor_data').findOne({_id:ObjectId(req.body.sensor_ObjID)});

    const add_maintain=await db.collection('sensor_maintain_record').insertOne({sensor_ObjID:ObjectId(req.body.sensor_ObjID),sensorID:search_sensor.sensorID,time:req.body.time,message:req.body.message,count:search_maintain_count+1});
    await client.close();
    if(add_maintain.acknowledged==true){        
        return res.json({success:true});
    }else{        
        return res.json({success:false})
    }    
}


async function Update(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const result=await db.collection('sensor_maintain_record').updateOne({_id:ObjectId(req.body._id)},{$set:{time:req.body.time,message:req.body.message}});
    await client.close();
    if(result.acknowledged===true){        
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}

async function Delete(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const search=await db.collection('sensor_maintain_record').countDocuments({sensor_ObjID:ObjectId(req.body.sensor_ObjID)});   
    if(search<=0){
        await client.close();
        return res.json({success:false});
    }
    if(search===req.body.count){
        const del_result=await db.collection('sensor_maintain_record').findOneAndDelete({_id:ObjectId(req.body._id)});
        await client.close();
        if(del_result.ok==true){
            return res.json({success:true});
        }else{
            return res.json({success:false});
        }
    }else{
        const search_gt=await db.collection('sensor_maintain_record').find({sensor_ObjID:ObjectId(req.body.sensor_ObjID),count:{$gt:parseInt(req.body.count)}}).toArray();
        for(let item of search_gt){
            let count_val=item.count;
            const update_gt=await db.collection('sensor_maintain_record').updateOne({_id:item._id},{$set:{count:count_val-1}},{upsert:true});
            if(update_gt.acknowledged==false){
                await client.close();
                return res.json({success:false});
            }
        }
        const del_result=await db.collection('sensor_maintain_record').findOneAndDelete({_id:ObjectId(req.body._id)});
        await client.close();
        if(del_result.ok==true){
            return res.json({success:true});
        }else{
            return res.json({success:false});
        }
    }
}

