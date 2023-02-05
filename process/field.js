//MongoDB
const ObjectId = require('mongodb').ObjectId;


const DB=require('../database/db.js');
const randToken=require('rand-token');

module.exports={
    show:Show,
    add:Add,
    update:Update,
    delete:Delete
}


async function Show(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    let search=req.query.search;
    let user_id=req.user._id;

    const search_userData=await db.collection('user_data').findOne({_id:user_id});  
    let search_field=search_userData.field;   

    if(search===undefined){  
        //分頁
        const perPage=12;
        const total=await db.collection('field_area').countDocuments({_id:{$in:search_field}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_result=await db.collection('field_area').find({_id:{$in:search_field}}).skip(startForm).limit(perPage).toArray();   
        
        await client.close();

        return res.render('field_area.ejs',{user:req.user.username,data:page_result,pages:pages,pageNumber:pageNumber,page_show:'d-block'});
    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }
        const search_result=await db.collection('field_area').find({_id:{$in:search_field},$or:[{fieldName:{$regex:search,$options:"$si"}}]}).toArray();

        await client.close();

        return res.render('field_area.ejs',{user:req.user.username,data:search_result,pages:0,pageNumber:0,page_show:'d-none'});
    }       
}

async function Add(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let field_name=req.body.field_name;
    let latitude=Number(req.body.latitude);
    let longitude=Number(req.body.longitude);
    let user_id=req.user._id;
    let apikey_notRepeat=true;
    let apikey='';

    while(apikey_notRepeat==true){
        apikey=randToken.generate(20);
        const find_sameData=await db.collection('field_area').find({apikey:apikey}).toArray(); 
        if(find_sameData.length>0){
            apikey_notRepeat=true
        }else{
            apikey_notRepeat=false
        }
    }
        
    const add_field=await db.collection('field_area').insertOne({fieldName:field_name,apikey:apikey,latitude:latitude,longitude:longitude});
    if(add_field.acknowledged==true){
        let add_objId=add_field.insertedId;
        const add_IntoUserdata=await db.collection('user_data').updateOne({_id:user_id},{$push:{field:add_objId}},{upsert:true});
        await client.close();
        if(add_IntoUserdata.acknowledged==true){
            return res.json({success:true});
        }else{
            return res.json({success:false});
        }
    }else{
        await client.close();
        return res.json({success:false});
    }
    
}

async function Update(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let obj_id=req.body.obj_id;
    const field={};
    field.fieldName=req.body.field_name;
    field.latitude=Number(req.body.latitude);
    field.longitude=Number(req.body.longitude);

    const search=await db.collection('field_area').findOne({_id:ObjectId(obj_id)})

    const result=await db.collection('field_area').updateOne({_id:ObjectId(obj_id)},{$set:field});            
    if(result.acknowledged==true){
        const update_result=await db.collection('sensor_data').updateMany({fieldID:ObjectId(obj_id)},{$set:field});
        const updField_with_plant=await db.collection('field_with_plant').updateMany({fieldID:ObjectId(obj_id)},{$set:field});
        const updCrops_data=await db.collection('crops_data').updateMany({fieldID:ObjectId(obj_id),fieldName:search.fieldName},{$set:{'fieldName.$':field.fieldName}});

        await client.close();

        return res.json({success:true});
    }else{

        await client.close();

        return res.json({success:false});
    }
}

async function Delete(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let user_id=req.user._id;
    let field_objId=req.body._id;

    const findField=await db.collection('field_area').findOne({_id:ObjectId(field_objId)});
    const result=await db.collection('field_area').findOneAndDelete({_id:ObjectId(field_objId)});
    if(result.ok==true){
        const search_sensor=await db.collection('sensor_data').find({fieldID:ObjectId(field_objId)});
        let sensorArr=[];
        search_sensor.forEach((item)=>{
            sensorArr.push(item._id);
        })

        const del_sensor_maintain=await db.collection('sensor_maintain_record').deleteMany({sensor_ObjID:{$in:sensorArr}});
        const del_crops=await db.collection('crops_data').deleteMany({fieldID:ObjectId(field_objId)})
        const del_sensor=await db.collection('sensor_data').deleteMany({fieldID:ObjectId(field_objId)});
        const del_sensorDataRecord=await db.collection('sensor_data_record').updateMany({API_KEY:findField.apikey},{$set:{isDelete:true}});
        const del_withPlant=await db.collection('field_with_plant').deleteMany({fieldID:ObjectId(field_objId)});
        const del_userField=await db.collection('user_data').updateOne({_id:user_id},{$pull:{field:ObjectId(field_objId)}});
        
        await client.close();

        if(del_userField.acknowledged==true){
            return res.json({success:true});
        }else{
            return res.json({success:false});
        }   
    }else{
        await client.close();
        return res.json({success:false});
    }
}

