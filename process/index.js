//MongoDB
const ObjectId = require('mongodb').ObjectId;

const DB=require('../database/db.js');
const moment=require('moment');
const MongoClient=require('mongodb').MongoClient;

module.exports={
    show:Show,
    TimeChangeShow:TimeChangeShow
}


async function Show(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let user_id=req.user._id;


    let date1FineData=[];
    let date1monthFineData=[];

    const search_userData=await db.collection('user_data').findOne({_id:ObjectId(user_id)});
    let search_field=search_userData.field;
    const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();  
    
    for(let i=0;i<total_field.length;i++){
        let API_KEY=total_field[i].apikey;
        let fieldID=total_field[i]._id;
        const search_sensor=await db.collection('sensor_data').find({fieldID:fieldID}).toArray();
               
        for(let j=0;j<search_sensor.length;j++){                    
            let sensorID=search_sensor[j].sensorID;
            let fieldName=search_sensor[j].fieldName;
            let sensorType=search_sensor[j].type;
            let sensorTypeKey=[];

            for(let k=0;k<sensorType.length;k++){
                let TypeKey=Object.keys(sensorType[k])
                sensorTypeKey.push(TypeKey[0])
            }



            const get_record_data_1=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:new Date(moment().subtract(1, 'days'))}}).sort({"time": -1}).limit(100).toArray();
            const get_record_data_1month=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:new Date(moment().subtract(1, 'months'))}}).sort({"time": -1}).limit(100).toArray();
            
            let record_time=[];  
            get_record_data_1month.forEach((item)=>{                        
                // record_time.push(moment(item.time).utc().local().format('YYYY-MM-DD'));
                record_time.push(new Date(item.time).getTime())
            })
            record_time=record_time.reverse()


            let record_data_1=await dataProcess(get_record_data_1,false)
            let record_data_1month=await dataProcess(get_record_data_1month,true,record_time)
            date1FineData.push({API_KEY:API_KEY,sensorID:sensorID,fieldName:fieldName,data:record_data_1,position:i+'-'+j})
            date1monthFineData.push({API_KEY:API_KEY,sensorID:sensorID,sensorType:sensorTypeKey,fieldName:fieldName,data:record_data_1month,position:i+'-'+j})
        }       
    }    
    await client.close();
    return res.render('index.ejs',{user:req.user.username,sensor:date1FineData,dateFindData:date1monthFineData}); 
}

async function dataProcess(get_record_data,check,record_time){
    let key=[]
    let record_data=[];
    let arr=[];
    
    get_record_data.forEach((item)=>{
        if(item.length!=0){
            key=Object.keys(get_record_data[0].data)
        }
    })
    if(check==true){
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

        }
    }else{
        for(let n in key){            
            let ans = get_record_data.map(function(o) {
                return o.data[key[n]]
            });
            arr.push(ans.reverse())
        }   
    }         
    
    for(let i=0;i<arr.length;i++){
        record_data.push({name:key[i],data:arr[i]});  
    }  

    return record_data;
}



async function TimeChangeShow(req,res){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    let userID=req.user._id;
    let timeChange=req.body.timeChange;
    let API_KEY=req.body.API_KEY;
    let sensorID=req.body.sensorID
    let dateFindData=[];
    let arr=[];
    let record_data=[];
    let record_time=[];
    let dict_key=[];  

    const findField=await db.collection('field_area').findOne({apikey:API_KEY});

    const findSensor=await db.collection('sensor_data').findOne({sensorID:sensorID,fieldID:findField._id,userID:userID});

    let sensorType=findSensor.type;
    let sensorTypeKey=[];

    for(let k=0;k<sensorType.length;k++){
        let TypeKey=Object.keys(sensorType[k])
        sensorTypeKey.push(TypeKey[0])
    }

    const get_record_data=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:new Date(moment().subtract(timeChange, 'months'))}}).sort({"time": -1}).toArray();

    await client.close();

    get_record_data.forEach((item)=>{
        if(item.length!=0){
            dict_key=Object.keys(get_record_data[0].data)
        }
        // record_time.push(moment(item.time).utc().local().format('YYYY-MM'));
        record_time.push(new Date(item.time).getTime())
    })

    record_time=record_time.reverse();

    for(let i=0;i<dict_key.length;i++){
        let ans = get_record_data.map(function(o) {
            return o.data[dict_key[i]]
        });
        ans=ans.reverse();
        let t=[]
        for(let j=0;j<ans.length;j++){
            t.push([record_time[j],ans[j]]);
        }
        arr.push(t)
        // arr.push(res.reverse());
    }

    for(let i=0;i<arr.length;i++){
        record_data.push({name:dict_key[i],data:arr[i]});  
    } 
    dateFindData.push({data:record_data,sensorType:sensorTypeKey});       

    
    res.json({success:true,dateFindData:dateFindData}); 
}