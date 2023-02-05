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

    const data_result=[];

    let user_id=req.user._id;    
    let search=req.query.search;    
    let speciesArr=[];


    const search_userData=await db.collection('user_data').findOne({_id:user_id});
    let search_field=search_userData.field;
    let search_species=search_userData.species;    

    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();
    const total_species=await db.collection('plant_data').find({_id:{$in:search_species}}).toArray();
    
    total_species.forEach((item)=>{
        speciesArr.push(item._id);
    })
    if(search===undefined){
        let perPage=12;
        let total=await db.collection('crops_data').countDocuments({plantID:{$in:speciesArr}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_limit_result=await db.collection('crops_data').find({plantID:{$in:speciesArr}}).skip(startForm).limit(perPage).toArray();

        for(let item of page_limit_result){
            
            data_result.push({cropsID:item._id,species:item.plantName,fieldName:item.fieldName,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),quantily:item.quantily,quality:item.quality});
        }
        await client.close();
        return res.render('crops_record.ejs',{user:req.user.username,data:data_result,field:total_field,species:total_species,pages:pages,pageNumber:pageNumber,page_show:'d-block'}); 

    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }
        const search_result=await db.collection('crops_data').find({plantID:{$in:speciesArr},$or:[{fieldName:{$regex:search,$options:"$si"}},{plantName:{$regex:search,$options:"$si"}},{quality:{$regex:search,$options:"$si"}},{quantily:{$regex:search,$options:"$si"}}]}).toArray();
        for(let item of search_result){
            data_result.push({cropsID:item._id,species:item.plantName,fieldName:item.fieldName,time:moment(item.time).utc().local().format('YYYY-MM-DD HH:mm'),quantily:item.quantily,quality:item.quality});
        }
        
        await client.close();

        return res.render('crops_record.ejs',{user:req.user.username,data:data_result,field:total_field,species:total_species,pages:0,pageNumber:0,page_show:'d-none'});
    }
}

async function Add(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    const fieldArr=JSON.parse(req.body.field);
    const fieldID=[];
    const fieldName=[];

    fieldArr.forEach((item)=>{
        fieldID.push(ObjectId(item.fieldID));
        fieldName.push(item.fieldName.toString());
    })

    const add_crops=await db.collection('crops_data').insertOne({plantID:ObjectId(req.body.plantID),plantName:req.body.plantName,fieldID:fieldID,fieldName:fieldName,time:req.body.time,quality:req.body.quality,quantily:req.body.quantily});
    
    await client.close();
    
    if(add_crops.acknowledged===true){
        return res.json({success:true});
    }else{
        return res.json({success:false})
    }
}

async function Update(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    const result=await db.collection('crops_data').updateOne({_id:ObjectId(req.body._id)},{$set:{time:req.body.time,quality:req.body.quality,quantily:req.body.quantily}},{upsert:true});  
    
    await client.close();
    
    if(result.acknowledged==true){               
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}

async function Delete(req,res){
    let crops_id=req.body._id;

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const result=await db.collection('crops_data').findOneAndDelete({_id:ObjectId(crops_id)});

    await client.close();

    if(result.ok==true){
        return res.json({success:true});
    }else{
        return res.json({success:false});
    }
}