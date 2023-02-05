const express=require('express');
const session=require('express-session');
const passport = require('passport');
const flash= require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http=require('http');
const path=require('path');
const moment=require('moment');
const axios=require('axios');
const DB=require('./database/db.js');
const ObjectId = require('mongodb').ObjectId;
const node_cron=require('node-cron');
const mail=require('./mail/mail.js');
const Line=require('./mail/lineNotify.js');

require('dotenv').config({path:"./mail/.env"})

const port=process.env.PORT || 8000; 

//匯入自定義modules 用作驗證
require('./config/passport')(passport);

const app=express()

const server=require('http').createServer(app)


const io=require('socket.io')(server);

app.use(cookieParser());

//解析request的json資料
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());

app.set('view engine','ejs'); //啟動ejs引擎


//靜態資料位址(可直接取用img、.js檔等)
app.use(express.static(path.join(__dirname+'/public'))); 

app.use('/node_modules',express.static(path.join(__dirname+'/node_modules')));

//驗證設定 serect:用來驗證該session的資料 resave:是否強制存入store即使未更動 saveUninitalized:是否強制將未初始化的Session儲存至 
//Store新產生的 Session）
var sessionMiddleware=session({
    secret:'secret',
    resave:false,
    saveUninitialized:true
})
app.use(sessionMiddleware);

//載入passport(驗證api)
app.use(passport.initialize());
app.use(passport.session());

//載入flash(顯示訊息api)
app.use(flash());

app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

//匯入自定義modules 用作route
require('./app/routes.js')(app,passport,io,sessionMiddleware);

server.listen(port,()=>{
    console.log(`伺服器開始運行..... localhost:${port}/login`);
})


//環境通知警告輪詢
var job =node_cron.schedule('* * * * * *', function() {    
    checkPrescriptionsStatus();
    environment_data_alert();
    
}, null, true,'Asia/Taipei');
job.start();

var t=node_cron.schedule('*/5 * * * * *',function(){
    //田區API值
    let API=['XLnZcx2UU12bIXFVJEWy','W028yDhOfiukWlbSuLSy','xtmZZaHOqJvQWgJctkuL','Fz9P9hl1x9MyOwEgudUe','uLehZwFIXZW7YgIgNDxu','RAZuU0WYjb7I6GAq0uVZ','AMs1YwpHdyKFdHia9DC5','twYxvXGpj4Lk1oCoHFoG','tcnIXx0x5yOLwetj2Ah2','tsylZ3ujodFAiRR2YYos','WVTU4gq28BwVK53DLl9r','3PYTSjHD877zVa30YwPB','yhKy5rhnYz3Qblp6nM1W'];
    //感測器預設ID
    let sensor_ID=['device_1','device_2','device_3','device_4','device_5','device_6','device_7','device_8','device_9','device_10','device_11','device_12','device_15'];
    //感測器類型
    let dataType=[['temp', 'humid'], ['temp', 'humid', 'light'], ['light', 'distance'], ['temp', 'humid', 'light'], ['temp', 'humid', 'light'], ['temp', 'humid', 'distance'], ['temp', 'humid', 'distance'], ['temp', 'humid', 'soil_humid'], ['temp', 'humid', 'soil_humid'], ['temp', 'humid', 'distance'], ['distance'], ['soil_humid'], ['temp', 'humid']]
    //感測器數值捕捉亂數
    let type=['temp','humid','soil_humid','light','distance']
    let ranges=[[2,26],[10,80],[4,30],[30,50],[10,100]]
    let sensorRange=[]
    for(let i=0;i<dataType.length;i++){
        let range=[]
        for(let j=0;j<dataType[i].length;j++){
            range.push(ranges[type.indexOf(dataType[i][j])])
        }
        sensorRange.push(range)
    }
    for(let i=0;i<API.length;i++){
        generatorData(API[i],sensor_ID[i], dataType[i], sensorRange[i]);
    }   

})
t.start();

async function generatorData(API,sensor_ID, sensor, range){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    let nowTime=moment().utc().local();  


    //let data={'temp':Number((Math.random()*(28-26+1)+26).toFixed(2)),'humid':Number((Math.random()*(90-80+1)+80).toFixed(2))};
    let data={};
    for(let i=0;i<sensor.length;i++){
        data[sensor[i]]=Number((Math.random()*(range[i][0]+1)+range[i][1]).toFixed(2))
    }
    
    const getFieldData=await db.collection('field_area').findOne({apikey:API},{latitude:1,longitude:1,_id:0});


    var mongoArray = {'sensor_ID':sensor_ID,'API_KEY' :API, data:data ,'time':nowTime.toDate(),latitude:getFieldData.latitude,longitude:getFieldData.longitude,isDelete:false};

    const insert_RecordData=await db.collection('sensor_data_record').insertOne(mongoArray);

    await client.close();
}

async function checkPrescriptionsStatus(){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    const prescriptions=await db.collection('prescriptions').find({check:false}).toArray();
    const nowTime=moment();
    const ExpiredArr=[]
    prescriptions.forEach((item)=>{
        Time=moment(item.dateline)
        compare=nowTime.diff(Time,'seconds')
        //超過即結單
        if(compare>0){
            ExpiredArr.push(ObjectId(item._id));
        }
    })
    if(ExpiredArr.length>0){
        const set_prescriptions=await db.collection('prescriptions').updateMany({_id:{$in:ExpiredArr}},{$set:{check:true}});
    }
    await client.close();
}

async function environment_data_alert(){
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const all_userData=await db.collection('user_data').find({isDoctor:false}).toArray();

    if(all_userData.length>0){
        for(let x=0;x<all_userData.length;x++){  
            if(all_userData[x].isDoctor==false){
                let search_field=all_userData[x].field;         
                const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();
                for(let i=0;i<total_field.length;i++){    
                    let API_KEY=total_field[i].apikey;
                    let fieldID=total_field[i]._id;
                    let fieldName=total_field[i].fieldName;
                    const search_sensor=await db.collection('sensor_data').find({fieldID:fieldID}).toArray()
                    for(let j=0;j<search_sensor.length;j++){ 
                        
                        let sensorID=search_sensor[j].sensorID;
                        let sensorDataType=search_sensor[j].type;
                        //取得感測資料
                        const get_record_data=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:new Date(moment().subtract(10, 'minutes'))}}).sort({"time": -1}).limit(1).toArray();

                        let key=[];  
                        if(get_record_data.length>0){
                            let sensor_data=get_record_data[0].data;
                            key=Object.keys(get_record_data[0].data);
                            let Data_record_time=moment(get_record_data[0].time).utc().local().format('YYYY-MM-DD HH:mm')
                            let alert_msg='';
                            
                            //確認是否已送過通知
                            const get_msgCount=await db.collection('message').countDocuments({API_KEY:API_KEY,sensorID:sensorID,alert_time:{$gte:new Date(moment().subtract(5, 'minutes'))}}); //畢業展上改10分鐘一次
                            if(get_msgCount==0){
                                for(let k=0;k<sensorDataType.length;k++){
                                    let getProcess=alertMsgProcess(sensor_data,sensorDataType[k])                         
                                    alert_msg+=getProcess;
    
                                }
                            }

                            if(alert_msg.length!==0){
                                alert_msg=alert_msg.substring(1);
                                let nowTime=moment().utc().local();
    
                                const add_message=await db.collection('message').insertOne({sensorID:sensorID,API_KEY:API_KEY,alert_time:nowTime.toDate(),Data_record_time:Data_record_time,msg:alert_msg});

                                const add_grow=await db.collection('field_with_plant').insertOne({fieldID:fieldID,fieldName:fieldName,time:nowTime.format('YYYY-MM-DDTHH:mm'),growMessage:alert_msg});
                                if(add_message.acknowledged===true){                                                          
                                    if(all_userData[x].lineToken){
                                        await LineNotify(alert_msg,fieldName,sensorID,Data_record_time,nowTime,all_userData[x].lineToken)                                
                                    }
                                    if(all_userData[x].ActivateEmailNotify==true){
                                        await EmailNotify(alert_msg,fieldName,sensorID,Data_record_time,nowTime,all_userData[x].email)
                                    }
                                }
                            }
                        }                
                    } 
                }
            }
        }
    }
    await client.close();
}

function alertMsgProcess(sensor_data,sensorDataType){

    let DataTypeKey=Object.keys(sensorDataType);
    let sensorDataKey=Object.keys(sensor_data);
    let small=sensorDataType[DataTypeKey[0]].small;
    let big=sensorDataType[DataTypeKey[0]].big;
    let alert_msg='';
    let check=false;
    for(let i=0;i<sensorDataKey.length;i++){
        if(sensorDataKey[i].includes(DataTypeKey[0])==true){
            check=true;
            DataTypeKey[0]=sensorDataKey[i]
            break;
        }
    }

    if(check==true){        
        if(sensor_data[DataTypeKey[0]]=='undefined' || sensor_data[DataTypeKey[0]]==null || Number.isNaN(Number(sensor_data[DataTypeKey[0]]))==true){
            alert_msg+="\n"+DataTypeKey[0]+"的數值出現缺失或錯誤";
        }else if(sensor_data[DataTypeKey[0]]<small){
            alert_msg+="\n"+DataTypeKey[0]+"數值過低,為 "+sensor_data[DataTypeKey[0]];
        }else if(sensor_data[DataTypeKey[0]]>big){
            alert_msg+="\n"+DataTypeKey[0]+"數值過高,為 "+sensor_data[DataTypeKey[0]];
        }                                
    }else{
        alert_msg+="\n"+DataTypeKey[0]+"並沒有設定閥值,請進行確認";
    }
    return alert_msg
}

async function LineNotify(alert_msg,fieldName,sensorID,Data_record_time,nowTime,userLineToken){
    try{
        alert_msg='\n\n環境異常通知\n\n田區名稱:'+fieldName+'\n\n感測器名稱:'+sensorID+'\n\n'+alert_msg+'\n\n資料紀錄時間:'+moment(Data_record_time).utc().local().format('YYYY-MM-DD HH:mm')+'\n\n警告時間:'+moment(nowTime.toDate()).utc().local().format('YYYY-MM-DD HH:mm');
        let NotifySend=await Line.alertMsgLineSend(userLineToken,alert_msg);
    }catch(err){
        console.log(err)
    }    
}

async function EmailNotify(alert_msg,fieldName,sensorID,Data_record_time,nowTime,userEmail){
    try{        
        alert_msg='<p><br>田區名稱:'+fieldName+'<br>感測器名稱:'+sensorID+'<br>'+alert_msg+'<br>資料紀錄時間:'+moment(Data_record_time).utc().local().format('YYYY-MM-DD HH:mm')+'<br>警告時間:'+moment(nowTime.toDate()).utc().local().format('YYYY-MM-DD HH:mm')+"</p>";
        let title='環境異常通知'
        let SendNotifyEmail=await mail.EmailNotifySend(userEmail,title,alert_msg);       
    }catch(error){
        console.log(error)
    }
}


