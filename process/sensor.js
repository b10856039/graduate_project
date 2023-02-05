
//MongoDB

const ObjectId = require('mongodb').ObjectId;

const DB=require('../database/db.js');


module.exports={
    show:Show,
    add:Add,
    update:Update,
    threshold_update:threshold_update,
    delete:Delete
}





//頁面顯示
async function Show(req,res){
    
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);    

    let user_id=req.user._id;
    let search=req.query.search;  
    let search_sensor=[];

    const search_userData=await db.collection('user_data').findOne({_id:user_id});
    let search_field=search_userData.field;

    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();    
    total_field.forEach((item)=>{
        search_sensor.push(item._id);
    })

    //判斷查詢
    if(search===undefined){
        const perPage=12;
        const total=await db.collection('sensor_data').countDocuments({fieldID:{$in:search_sensor}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;

        const page_result=await db.collection('sensor_data').find({fieldID:{$in:search_sensor}}).skip(startForm).limit(perPage).toArray();
        await client.close();
        return res.render('sensor_management.ejs',{user:req.user.username,field:total_field,data:page_result,pages:pages,pageNumber:pageNumber,page_show:'d-block'});
        
    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }                
        const sensor_result=await db.collection('sensor_data').find({fieldID:{$in:search_sensor},$or:[{sensorID:{$regex:search,$options:"$si"}},{fieldName:{$regex:search,$options:"si"}},{status:{$regex:search,$options:"$si"}}]}).toArray();
        await client.close();
        return res.render('sensor_management.ejs',{user:req.user.username,field:total_field,data:sensor_result,pages:0,pageNumber:0,page_show:'d-none'});
    }    
}


//新增
async function Add(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    const sensorType=JSON.parse(req.body.sensorType);
    const OuputSensorType=[];
    sensorType.forEach((item)=>{
        let Threshold_small=0;
        let Threshold_big=0;

        switch(item){
            case "temp":
                Threshold_small=0;
                Threshold_big=100;
                break
            case "humid":
                Threshold_small=0;
                Threshold_big=500;
                break
            case "light":
                Threshold_small=0;
                Threshold_big=1000;
                break
            case "distance":
                Threshold_small=0;
                Threshold_big=1000;
                break
        }
        OuputSensorType.push({[item]:{small:Threshold_small,big:Threshold_big}})
    })
    const have_sameName=await db.collection('sensor_data').countDocuments({userID:req.user._id,sensorID:req.body.sensorID});
    if(have_sameName<1){
        const search_field=await db.collection('field_area').findOne({_id:ObjectId(req.body.fieldID)});

    
        const add_sensor=await db.collection('sensor_data').insertOne({sensorID:req.body.sensorID,userID:req.user._id,fieldID:ObjectId(req.body.fieldID),fieldName:search_field.fieldName,type:OuputSensorType});
        await client.close();
        if(add_sensor.acknowledged==true){
            return res.json({success:true,message:'新增成功'});
        }else{
            return res.json({success:false,message:'新增失敗'});
        }
    }else{
        await client.close();
        return res.json({success:false,message:'有重複的感測器ID,請重新輸入'});
    }    
}


//修改
async function Update(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    const sensorType=JSON.parse(req.body.sensorType);
    const OuputSensorType=[];
    sensorType.forEach((item)=>{
        
        let Threshold_small=0;
        let Threshold_big=0;
        switch(item){
            case "temp":
                Threshold_small=0;
                Threshold_big=100;
                break
            case "humid":
                Threshold_small=0;
                Threshold_big=500;
                break
            case "light":
                Threshold_small=0;
                Threshold_big=1000;
                break
            case "distance":
                Threshold_small=0;
                Threshold_big=1000;
                break
        }
        OuputSensorType.push({[item]:{small:Threshold_small,big:Threshold_big}})
    })

    const have_sameName=await db.collection('sensor_data').countDocuments({_id:{$ne:ObjectId(req.body._id)},userID:req.user._id,sensorID:req.body.sensorID});
    if(have_sameName<1){
        const result=await db.collection('sensor_data').updateOne({_id:ObjectId(req.body._id)},{$set:{sensorID:req.body.sensorID,type:OuputSensorType}});
        if(result.acknowledged==true){
            const updSensor_maintain=await db.collection('sensor_maintain_record').updateMany({sensor_ObjID:ObjectId(req.body._id)},{$set:{sensorID:req.body.sensorID}});
            await client.close();
            return res.json({success:true,message:'修改成功'});
        }else{
            await client.close();
            return res.json({success:false,message:'修改失敗'});
        }
    }else{
        await client.close();
        return res.json({success:false,message:'有重複的感測器ID,請重新輸入'});
    }

}

async function threshold_update(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const sensorType=JSON.parse(req.body.sensorType); 

    const result=await db.collection('sensor_data').updateOne({_id:ObjectId(req.body._id)},{$set:{type:sensorType}});
    await client.close();
    if(result.acknowledged==true){
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}

//刪除
async function Delete(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const findSensor=await db.collection('sensor_data').findOne({_id:ObjectId(req.body._id)});    

    const findAPI_KEY=await db.collection('field_area').findOne({_id:findSensor.fieldID});

    const result=await db.collection('sensor_data').findOneAndDelete({_id:ObjectId(req.body._id)});
    if(result.ok==true){
        const del_sensor_maintain=await db.collection('sensor_maintain_record').deleteMany({sensor_ObjID:ObjectId(req.body._id)});
        const del_sensorDataRecord=await db.collection('sensor_data_record').updateMany({sensorID:findSensor.sensorID,API_KEY:findAPI_KEY.apikey},{$set:{isDelete:true}});
        await client.close();
        return res.json({success:true});                
    }else{
        await client.close();
        return res.json({success:false});
    }
}