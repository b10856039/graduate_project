//MongoDB

const ObjectId = require('mongodb').ObjectId;
const DB=require('../database/db.js');


module.exports={
    show:Show,
    add:Add,
    update:Update,
    delete:Delete
}

async function Show(req,res){

    let user_id=req.user._id;
    let search=req.query.search;

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const search_userData=await db.collection('user_data').findOne({_id:user_id});  
    let search_species=search_userData.species;
    if(search===undefined){
        //分頁
        const perPage=12;
        const total=await db.collection('plant_data').countDocuments({_id:{$in:search_species}});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_result=await db.collection('plant_data').find({_id:{$in:search_species}}).skip(startForm).limit(perPage).toArray();   
        await client.close();
        return res.render('plant_management.ejs',{user:req.user.username,data:page_result,pages:pages,pageNumber:pageNumber,page_show:'d-block'}); 

    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }
        const search_result=await db.collection('plant_data').find({_id:{$in:search_species},$or:[{species:{$regex:search,$options:"$si"}}]}).toArray();
        await client.close();
        return res.render('plant_management.ejs',{user:req.user.username,data:search_result,pages:0,pageNumber:0,page_show:'d-none'});
    }
}

async function Add(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    let is_repeat=false;

    const search_user=await db.collection('user_data').findOne({_id:req.user._id});    
    if(search_user.species.length!==0){
        const search_plant=await db.collection('plant_data').find({_id:{$in:search_user.species}}).toArray();
          
        search_plant.forEach((item)=>{
            if(item.species===req.body.plantSpecies){                        
                return is_repeat=true;
            }
        })
        if(is_repeat==true){
            await client.close();
            return res.json({success:false,msg:'有重複的植物名稱'});  
        }
    }

    const add_plant=await db.collection('plant_data').insertOne({species:req.body.plantSpecies});
    if(add_plant.acknowledged==true){
        let add_objId=add_plant.insertedId;
        const add_IntoUserdata=await db.collection('user_data').updateOne({_id:req.user._id},{$push:{species:add_objId}},{upsert:true});
        if(add_IntoUserdata.acknowledged==true){
            await client.close();
            return res.json({success:true,msg:'新增成功'});
        }else{
            await db.collection('plant_data').deleteOne({_id:add_plant.insertedId});
            await client.close();
            return res.json({success:false,msg:'新增失敗'})
        }
    }else{
        await client.close();
        return res.json({success:false,msg:'新增失敗'});
    }
            
}

async function Update(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    let is_repeat=false;

    const search_user=await db.collection('user_data').findOne({_id:req.user._id});    
    if(search_user.species.length!==0){
        const search_plant=await db.collection('plant_data').find({_id:{$in:search_user.species},_id:{$ne:ObjectId(req.body._id)}}).toArray();                
        search_plant.forEach((item)=>{
            if(item.species===req.body.species){                        
                return is_repeat=true;
            }
        })
        if(is_repeat==true){
            await client.close();
            return res.json({success:false,msg:'有重複的植物名稱'});  
        }
    }
    const result=await db.collection('plant_data').updateOne({_id:ObjectId(req.body._id)},{$set:{species:req.body.species}},{upsert:true});            
    if(result.acknowledged==true){
        const updCrops_data=await db.collection('crops_data').updateMany({plantID:ObjectId(req.body._id)},{$set:{'plantName':req.body.species}});
        const updField_with_plant=await db.collection('field_with_plant').updateMany({plantID:ObjectId(req.body._id)},{$set:{'plantName':req.body.species}});
        
        await client.close();
        return res.json({success:true,msg:'更改成功'});
    }else{
        await client.close();
        return res.json({success:false,msg:'更改失敗'});
    }
}

async function Delete(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let user_id=req.user._id;
    let plant_Id=req.body._id;
    const result=await db.collection('plant_data').findOneAndDelete({_id:ObjectId(plant_Id)});
    if(result.ok==true){
        await db.collection('crops_data').deleteMany({plantID:ObjectId(plant_Id)});
        await db.collection('field_with_plant').deleteMany({plantID:ObjectId(plant_Id)});
        await db.collection('user_data').updateOne({_id:user_id},{$pull:{species:ObjectId(plant_Id)}});

        await client.close();

        return res.json({success:true});

    }else{

        await client.close();

        return res.json({success:false});
    }
}