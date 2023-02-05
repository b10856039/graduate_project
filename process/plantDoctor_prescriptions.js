//MongoDB
const ObjectId = require('mongodb').ObjectId;


const DB=require('../database/db.js');
const moment=require('moment');

module.exports={
    show:Show,
    check:check
}


async function Show(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    let search=req.query.search;
    let AlluserSensordataRecord=[];
    let AlluserIdentifyData=[];

    if(search===undefined){  
        //分頁
        const perPage=12;
        const total=await db.collection('prescriptions').countDocuments({check:false});
        let pages=Math.ceil(total/perPage);
        let pageNumber=(req.query.page==null||req.query.page<=0)?1:req.query.page;
        let startForm=(pageNumber-1)*perPage;
        const page_result=await db.collection('prescriptions').find({check:false}).skip(startForm).limit(perPage).toArray();
                      
        
        for(let i=0;i<page_result.length;i++){
            const search_user=await db.collection('user_data').findOne({_id:page_result[i].user_id})
            page_result[i]['name']=search_user.name;
            let search_field=search_user.field;           

            let sensorRecordData=await GetsensorData(db,search_field,page_result[i]);
            let identifyData=await GetIdentifyData(db,page_result[i]);
            
            AlluserSensordataRecord.push(sensorRecordData);
            AlluserIdentifyData.push(identifyData);

            page_result[i]['dateline']=moment(page_result[i].dateline).utc().local().format('YYYY-MM-DD HH:mm');
            page_result[i]['date']=moment(page_result[i].date).utc().local().format('YYYY-MM-DD HH:mm');
        }
        await client.close();
        return res.render('plantDoctor-prescriptions.ejs',{user:req.user.username,data:page_result,AlluserSensordataRecord:AlluserSensordataRecord,AlluserIdentifyData:AlluserIdentifyData,pages:pages,pageNumber:pageNumber,page_show:'d-block'});
    }else{
        if(search.indexOf(' ')!==-1){
            search=search.replace(/[ ]/g,'*');
        }

        const search_result=await db.collection('prescriptions').find({check:false,$or:[{username:{$regex:search,$options:"$si"}}]}).toArray();

        for(let i=0;i<search_result.length;i++){
            const search_user=await db.collection('user_data').findOne({_id:search_result[i].user_id});
            search_result[i]['name']=search_user.name;
            let search_field=search_user.field;           

            let sensorRecordData=await GetsensorData(db,search_field,search_result[i]);
            let identifyData=await GetIdentifyData(db,search_result[i]);
            
            AlluserSensordataRecord.push(sensorRecordData);
            AlluserIdentifyData.push(identifyData);

            search_result[i]['dateline']=moment(search_result[i].dateline).utc().local().format('YYYY-MM-DD HH:mm');
            search_result[i]['date']=moment(search_result[i].date).utc().local().format('YYYY-MM-DD HH:mm');
        }
        await client.close();
        return res.render('plantDoctor-prescriptions.ejs',{user:req.user.username,data:search_result,AlluserSensordataRecord:AlluserSensordataRecord,AlluserIdentifyData:AlluserIdentifyData,pages:0,pageNumber:0,page_show:'d-none'});
    }
         
}


async function GetsensorData(db,search_field,page_result){
    let dateFineData=[];
    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();

    for(let i=0;i<total_field.length;i++){
        let API_KEY=total_field[i].apikey;
        let fieldID=total_field[i]._id;
        const search_sensor=await db.collection('sensor_data').find({fieldID:fieldID}).toArray();

        for(let j=0;j<search_sensor.length;j++){                    
            let sensorID=search_sensor[j].sensorID;
            let fieldName=search_sensor[j].fieldName;
            let type=search_sensor[j].type;
            let sensorType=[]

            for(let k=0;k<type.length;k++){
                let TypeKey=Object.keys(type[k])
                sensorType.push(TypeKey[0])
            }

            const get_record_data=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:page_result.date,$lt:page_result.dateline}}).sort({"time": -1}).limit(100).toArray();
                
            let record_time=[];  
            get_record_data.forEach((item)=>{                        
                // record_time.push(moment(item.time).utc().local().format('YYYY-MM-DD'));
                record_time.push(new Date(item.time).getTime())
            })
            record_time=record_time.reverse()
            
            let record_data=await dataProcess(get_record_data,record_time)
            dateFineData.push({API_KEY:API_KEY,sensorID:sensorID,fieldName:fieldName,data:record_data,sensorType:sensorType})
        }
    }
    return dateFineData
}

async function GetIdentifyData(db,page_result){
    const identifyData=await db.collection('identify').find({userid:page_result.user_id,time:{$gte:page_result.date,$lt:page_result.dateline}}).toArray();

    for(let i=0;i<identifyData.length;i++){
        identifyData[i]['time']=moment(identifyData[i].time).utc().local().format('YYYY-MM-DD');
    }

    return identifyData;
}


async function dataProcess(get_record_data,record_time){
    let key=[]
    let record_data=[];
    let arr=[];
    
    get_record_data.forEach((item)=>{
        if(item.length!=0){
            key=Object.keys(get_record_data[0].data)
        }
    })
    
    for(let n in key){            
        let ans = get_record_data.map(function(o) {
            return o.data[key[n]]
        });
        ans=ans.reverse();
        let t=[]
        for(let j=0;j<ans.length;j++){
            t.push([record_time[j],ans[j]]);
        }
        arr.push(t)
        // let ans = get_record_data.map(function(o) {
        //     return o.data[key[n]]
        // });
        // arr.push(ans.reverse())
    }            
    
    for(let i=0;i<arr.length;i++){
        record_data.push({name:key[i],data:arr[i]});  
    }  

    return record_data;
}




async function check(req,res){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let obj_id=req.body._id;
    const add_prescriptions=await db.collection('prescriptions').updateOne({_id:ObjectId(obj_id)},{$set:{check:true}});
    await client.close();
    if(add_prescriptions.acknowledged==true){     
        return res.json({success:true});
    }else{
        return res.json({success:false})
    }
}