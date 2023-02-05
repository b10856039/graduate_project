
//檔案上傳函式庫 
const multer = require('multer');

const fs = require("fs");
const moment=require('moment');
require('dotenv').config({path:"./mail/.env"})

//異步子程序函式庫 可連接多個檔案
const {spawn}=require('child_process');

//編碼轉換函式庫
const iconvLite=require('iconv-lite');

//驗證輸入格式
const { check, validationResult } = require('express-validator');


//database
const DB=require('../database/db.js');
const MongoClient=require('mongodb').MongoClient;

//使用者各項處理
const index_sensorData=require('../process/index.js');
const profile_process=require('../process/profile.js');
const forget_password_process=require('../process/forget_password.js');
const reset_password_process=require('../process/reset_password.js');
const signUp_process=require('../process/sign_up.js')
const sensor_process=require('../process/sensor.js');
const sensor_maintain_process=require('../process/sensor_maintain.js');
const field_process=require('../process/field.js');
const grow_record_process=require('../process/grow_record.js');
const crops_record_process=require('../process/crops_record.js');
const plant_management_process=require('../process/plant_management.js');
const identify_process = require('../process/disease.js');
const quality_process = require('../process/quality_identify.js');
const prescriptionsCustomer = require('../process/prescriptionsCustomer.js');

//植物醫生各項處理
const plantDoctor_userCall=require('../process/plantDoctor_userCall.js');
const plantDoctor_prescriptions=require('../process/plantDoctor_prescriptions.js');

//MongoDB
const ObjectId = require('mongodb').ObjectId;

//設定儲存路徑與重新命名
var storage=multer.diskStorage({
    destination:function(req,file,cb){
          cb(null,'public/img/save_disease_Image');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'_'+file.originalname);
    }
  })
  
var upload=multer({storage:storage});


//req.isUserCheck 為passport中功能 為檢驗是否有session存在 可驗證是否已登入
function isUserCheck(req,res,next){ 
    if(req.isAuthenticated() && req.user.isDoctor==false){ 
        return next(); 
    }else if(req.isAuthenticated()){
        res.redirect('/login?error='+encodeURIComponent('Incorrect_Permission'));
    }else{
        res.redirect('/login?error='+encodeURIComponent('Incorrect_Credential'));
    }    
}

function isDoctorCheck(req,res,next){
    if(req.isAuthenticated() && req.user.isDoctor==true){
        return next();
    }else if(req.isAuthenticated()){
        res.redirect('/login-plantDoctor?error='+encodeURIComponent('Incorrect_Permission'));
    }else{
        res.redirect('/login-plantDoctor?error='+encodeURIComponent('Incorrect_Permission'));
    }
}


//網站get、post部分
module.exports=function(app,passport,sio,sessionMiddleware){


    //使用者部分

    sio.use(function(socket, next) {
        sessionMiddleware(socket.request,socket.request.res,next);
    });
    sio.on('connection',async function(socket) { 
        let repeat;
        const client=await DB.loadClient();
        const db=await DB.loadDB(client);
        
        if(socket.request.session.passport){  
                let user_id=socket.request.session.passport.user._id;
                let username=socket.request.session.passport.user.username
                socket.join(username);                
                
                const search_userData=await db.collection('user_data').findOne({_id:ObjectId(user_id)});

                let search_field=search_userData.field;
                const total_field=await db.collection('field_area').find({_id:{$in:search_field}}).toArray();

                showRecordData(db,total_field,username)
                repeat=setInterval(async ()=>{
                    showRecordData(db,total_field,username)  
                },5000)  
        }
         
        socket.on("disconnect",async () => {
            clearInterval(repeat)
            await client.close();
        });

    });

    async function showRecordData(db,total_field,username){ 
        for(let i=0;i<total_field.length;i++){
            let API_KEY=total_field[i].apikey;
            let fieldID=total_field[i]._id;
            const search_sensor=await db.collection('sensor_data').find({fieldID:fieldID}).toArray()
            for(let j=0;j<search_sensor.length;j++){ 
                let arr=[];                    
                let sensorTypeKey=[];
                let record_data=[]; 
                let record_time=[];
                let key=[];       
                let sensorID=search_sensor[j].sensorID;
                let sensorType=search_sensor[j].type;

                const get_record_data=await db.collection('sensor_data_record').find({API_KEY:API_KEY,sensor_ID:sensorID,isDelete:false,time:{$gte:new Date(moment().subtract(1, 'days'))}}).sort({"time": -1}).limit(15).toArray();
               
                for(let k=0;k<sensorType.length;k++){
                    let TypeKey=Object.keys(sensorType[k])
                    sensorTypeKey.push(TypeKey[0])
                }

                get_record_data.forEach((item)=>{   
                    if(item.length!=0){
                        key=Object.keys(get_record_data[0].data);
                    }                     
                    record_time.push(moment(item.time).utc().local().format('HH:mm'));
                })                    
                record_time=record_time.reverse()


                for(let n in key){            
                    let ans = get_record_data.map(function(o) {
                        return o.data[key[n]]
                    });
                    arr.push(ans.reverse())
                }            
                
                for(let i=0;i<arr.length;i++){
                    record_data.push({name:key[i],data:arr[i]});  
                }                     

                sio.to(username).emit('data_'+i+"-"+j,{
                    series:record_data,
                    time:record_time,
                    type:sensorTypeKey
                });
            }                    
        }            
    } 




    //感測器數值上傳資料庫
    app.post('/js',async function(req,res){   // JSON資料的處理程式
        try{
            const client=await DB.loadClient();
            const db=await DB.loadDB(client);

            var json=req.body;   // 取出POST資料本體
            var sensor_ID = json.sensor_ID;
            var data = json.data;    
            var API = json.APIkey;
            let nowTime=moment().utc().local();   
            console.log(json)
            const getFieldData=await db.collection('field_area').findOne({apikey:API},{latitude:1,longitude:1,_id:0});            
            var mongoArray = {'sensor_ID':sensor_ID,'API_KEY' : API, data:data ,'time':nowTime.toDate(),latitude:getFieldData.latitude,longitude:getFieldData.longitude,isDelete:false};
            const insert_RecordData=await db.collection('sensor_data_record').insertOne(mongoArray);

            await client.close();

        }catch(error){
            console.log(error)
        } 
        res.send('data captured!');     // 傳回訊息（網頁）給用戶端
    });


    //首頁
    app.get('/',isUserCheck,async (req,res)=>{
        try{
            index_sensorData.show(req,res);  
        }catch(err){
            console.log(err);
        }
             
    });
    app.post('/',isUserCheck,async(req,res)=>{
        try{
            index_sensorData.TimeChangeShow(req,res);
        }catch(err){
            console.log(err);
        }
    })

    //登入
    app.get('/login',function(req, res) {    
		res.render('pages-sign-in.ejs', { message: req.flash('loginMessage'),success:req.flash('loginMessage_access')});
	});
    app.post('/login',function(req, res, next) {
        if(req.body.username && req.body.password){            
            let specialChar_check=false;            
            specialChar_check=checkSpecialChar(req.body.username,req.body.password);
            if(specialChar_check==true){
                passport.authenticate('local-login', {
                    successRedirect : '/',
                    failureRedirect : '/login',
                    failureFlash : true
                })(req,res,next);
            }else{
                res.render('pages-sign-in.ejs', { message:'請勿輸入特殊符號',success:'alert alert-danger'}); 
            }       
        }else{
            res.render('pages-sign-in.ejs', { message:'未輸入用戶名稱或密碼',success:'alert alert-danger'}); 
        }  

        function checkSpecialChar(username,password){
            let specialChars= "~·`!！@#$￥%^…&*()（）—-_=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
            for (let i=0;i<specialChars.length;i++){
                if (username.indexOf(specialChars.substring(i,i+1)) != -1 || password.indexOf(specialChars.substring(i,i+1)) != -1 ){
                    return false;
                }
            }
            return true;
        }

    });

    


    //忘記密碼(寄信)
    app.get('/forget_password',(req,res)=>{
        res.render('forget_password.ejs',{message: req.flash('forget_password_msg'),success:req.flash('forget_password_access')});
    })

    app.post('/forget_password',[check('email').isEmail().withMessage('信箱格式不正確')], async(req,res)=>{
        const error_val=validationResult(req);
        if(!error_val.isEmpty()){
            let error=error_val.errors;
            req.flash('forget_password_msg',error[0].msg)
            req.flash('forget_password_access','alert alert-danger');
            return res.redirect('/forget_password');
        }
        try{
            forget_password_process.forgetPassProcess(req,res);
        }catch(error){
            console.log(error);
        }
    })



    //忘記密碼(更改密碼)
    app.get('/reset_password',(req,res)=>{
        res.render('reset_password.ejs',{token:req.query.token,message:req.flash('reset_password_msg'),success:req.flash('reset_password_access')});
    })
    app.post('/reset_password',[check('new_password').trim().isLength({min:3,max:16}).withMessage('密碼格式不正確')],async (req,res)=>{
        const error_val=validationResult(req);
        if(!error_val.isEmpty()){
            let error=error_val.errors;
            req.flash('reset_password_msg',error[0].msg);
            req.flash('reset_password_access','alert alert-danger');
            return res.redirect('/reset_password?token='+req.body.token);
        }
        reset_password_process.resetPassProcess(req,res);
    })
    

    //註冊
    app.route('/signup')
    .get((req,res)=>{
        res.render('pages-sign-up');
    })
    .post([check('username').trim().isLength({min:5,max:16}).withMessage('用戶名長度不對').isAlphanumeric().withMessage('請不要使用非英文與數字'),  
            check('name').trim().isLength({min:3}).withMessage('名字長度不對'),
            check('email').trim().isEmail().withMessage('信箱輸入格式錯誤'),
            check('phone').trim().matches('^09\\d{8}$').withMessage('手機號碼輸入格式錯誤'),
            check('password').trim().isLength({min:3,max:16}).withMessage('密碼長度不對').isAlphanumeric().withMessage('請不要使用非英文與數字'),],async (req,res,next)=>{
        
        const error_val=validationResult(req);
        if(!error_val.isEmpty()){
            let error=error_val.errors;
            return res.json({code:200,success:false,msg:error});
        }
        let insertData=req.body;
        insertData['field']=[];
        insertData['species']=[];
        insertData['ActivateEmailNotify']=false;
        insertData['isDoctor']=false;
        insertData['isCall']=false;
        try{
            signUp_process.signUp(req,res,insertData);
        }catch(error){
            console.log(error);
        }        
    });

    //登出
    app.get('/logout',(req,res)=>{
        //為passport中的功能 將session移除 即登出
        req.logout((err)=>{
            if(err){return next(err);}
        }); 
        res.redirect('/login');
    })
    
    //個人頁面
    app.get('/profile/:username',isUserCheck,async(req,res)=>{        
        try{
            profile_process.show(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/profile_isAuthenticated',isUserCheck,async (req,res)=>{        
        try{
            profile_process.isAuthenticated(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/profile_update_personalData',[
        check('name').trim().isLength({min:3}).withMessage('名字長度不對'),
        check('email').trim().isEmail().withMessage('信箱輸入格式錯誤'),
        check('phone').trim().matches('^09\\d{8}$').withMessage('手機號碼輸入格式錯誤')],isUserCheck,async (req,res)=>{

        const error_val=validationResult(req);
        if(!error_val.isEmpty()){
            let error=error_val.errors;
            return res.json({success:false,msg:error});
        }
        try{
            profile_process.Personal(req,res);      
        }catch(error){
            console.log(error);
        }
    })

    app.post('/profile_update_password',[check('newPassword').trim().isLength({min:3,max:16}).withMessage('密碼格式不正確')],isUserCheck,async (req,res)=>{
        const error_val=validationResult(req);
        if(!error_val.isEmpty()){
            let error=error_val.errors;
            return res.json({success:false,update_msg:error[0].msg});
        }

        try{
            profile_process.Upd_Password(req,res);
        }catch(error){
            console.log(error);
        }               
    })

    app.post('/LineNotify_process',isUserCheck,async (req,res)=>{
        try{
            profile_process.Upd_LineToken(req,res);
        }catch(err){
            console.log(err);
        }
    })

    app.post('/LineNotify_del',isUserCheck,async(req,res)=>{
        try{
            profile_process.Del_LineToken(req,res);
        }catch(err){
            console.log(err);
        }
    })

    app.post('/EmailNotify_process',isUserCheck,async(req,res)=>{
        try{
            profile_process.Activate_EmailNotify(req,res);
        }catch(err){
            console.log(err);
        }
    })

    app.post('/EmailNotify_del',isUserCheck,async(req,res)=>{
        try{
            profile_process.Deactivate_EmailNotify(req,res);
        }catch(err){
            console.log(err);
        }
    })

    //設備管理
    app.get('/sensor',isUserCheck,async (req,res)=>{     
        try{            
            sensor_process.show(req,res); 
        }catch(error){
            console.log(error);
        }        
    })

    app.post('/sensor_add',isUserCheck,async(req,res)=>{
        try{            
            sensor_process.add(req,res)            
        }catch(error){
            console.log(error);
        }
    })

    app.post('/sensor_update',isUserCheck,async(req,res)=>{
        try{
            sensor_process.update(req,res);            
        }catch(error){
            console.log(error);
        }
    })

    app.post('/sensor_threshold_update',isUserCheck,async(req,res)=>{
        try{
            sensor_process.threshold_update(req,res);            
        }catch(error){
            console.log(error);
        }
    })

    app.post('/sensor_delete',isUserCheck,async(req,res)=>{
        try{
            sensor_process.delete(req,res);
        }catch(error){
            console.log(error);
        }
    })

    //感測器維修管理
    app.get('/sensor_maintain',isUserCheck,async(req,res)=>{
        try{
            sensor_maintain_process.show(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/sensor_maintain_add',isUserCheck,async(req,res)=>{
        try{
            sensor_maintain_process.add(req,res);
        }catch(error){
            console.log(error);
        }       

    })

    app.post('/sensor_maintain_update',isUserCheck,async(req,res)=>{
        try{
            sensor_maintain_process.update(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/sensor_maintain_delete',isUserCheck,async(req,res)=>{
        try{
            sensor_maintain_process.delete(req,res);
        }catch(error){
            console.log(error);
        }
    })
    

    //田區管理
    app.get('/field',isUserCheck,async (req,res)=>{  
        try{
            field_process.show(req,res);     
        }catch(error){
            console.log(error);
        }
    })   

    app.post('/field_add',isUserCheck,async (req,res)=>{
        try{
            field_process.add(req,res);
        }catch(error){
            console.log(error);
        };
    })

    app.post('/field_update',isUserCheck,async (req,res)=>{
        try{
            field_process.update(req,res);
        }catch(error){
            console.log(error);
        }
    })
    app.post('/field_delete',isUserCheck,async (req,res)=>{
        try{
            field_process.delete(req,res);
        }catch(error){
            console.log(error);
        }       
    })


    //種植管理
    app.get('/grow_record',isUserCheck,async(req,res)=>{
        try{
            grow_record_process.show(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/grow_add',isUserCheck,async(req,res)=>{
        try{            
            grow_record_process.add(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/grow_update',isUserCheck,async(req,res)=>{
        try{
            grow_record_process.update(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/grow_delete',isUserCheck,async(req,res)=>{
        try{
            grow_record_process.delete(req,res);
        }catch(error){
            console.log(error);
        }
    })


    //收成管理
    app.route('/crops_record')
    .get(isUserCheck,async(req,res)=>{
        try{
            crops_record_process.show(req,res);

        }catch(error){
            console.log(error);
        }
    })

    app.post('/crops_add',isUserCheck,async(req,res)=>{
        try{
            crops_record_process.add(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/crops_update',isUserCheck,async(req,res)=>{
        try{
            crops_record_process.update(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/crops_delete',isUserCheck,async(req,res)=>{
        try{
            crops_record_process.delete(req,res);
        }catch(error){
            console.log(error);
        }
    })


    //作物種類管理
    app.get('/plant_management',isUserCheck,async(req,res)=>{
        try{
            plant_management_process.show(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/plant_add',isUserCheck,async(req,res)=>{
        try{
            plant_management_process.add(req,res);
        }catch(error){
            console.log(error);
        };
    })

    app.post('/plant_update',isUserCheck,async(req,res)=>{
        try{
            plant_management_process.update(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/plant_delete',isUserCheck,async(req,res)=>{
        try{
            plant_management_process.delete(req,res);
        }catch(error){
            console.log(error);
        }       
    })


    //使用者藥單顯示
    app.get('/prescriptionsCustomer', isUserCheck, async(req, res) => {
        try {
            prescriptionsCustomer.show(req, res);
        } catch (error) {
            console.log(error);
        }
    })

    app.post('/iscall', isUserCheck, async(req, res) => {
        try {
            prescriptionsCustomer.add(req, res);
        } catch (error) {
            console.log(error);
        };
    })

    app.post('/canceliscall', isUserCheck, async(req, res) => {
        try {
            prescriptionsCustomer.del(req, res);
        } catch (error) {
            console.log(error);
        };
    })


    //品質辨識
    app.route('/quality_identify')
    .get(isUserCheck,async (req,res)=>{
        try {
            quality_process.show(req, res);
        } catch (error) {
            console.log(error);
        }
    })
    .post(upload.single('file'),isUserCheck,(req,res,next)=>{
        //console.log(req.file);
        let file =req.file.filename;
        let std_res;
        let type=req.body.type;
        let python_file='';
        let userid=req.user._id;

        if(type==='mongo'){
            console.log('mongo品質')
            type='芒果果實';
            python_file='./py_folder/C1_Dev.py';
        }else{
            return false;
        }
        //對應虛擬環境的路徑(若為預設環境直接輸入python即可) 若不是請用絕對路徑 可用dotenv的process.env作保護
        const childPython=spawn(process.env.QUALITYIDENTIFY,[python_file,file]);

        childPython.stdout.on('data',(data)=>{
            // console.log(`stdout: ${iconvLite.decode(data,'big5')}`);
            std_res=iconvLite.decode(data,'big5').toString();

        })
        
        childPython.stderr.on('data',(error)=>{
            console.log(`stderr: ${error}`);
        })
        
        childPython.on('close',async(code)=>{
            // console.log(`child process exited with code:${code}`);
            let ans;
            if(std_res!==undefined){
                let arr=std_res.trim().split('\r\n');
                ans=arr[arr.length-1];
            }
            const client=await DB.loadClient();
            const db=await DB.loadDB(client);

            const add=await db.collection('quality').insertOne({userid:ObjectId(userid),type:type,identifyResult:ans,time:moment().utc().local().toDate()});

            await client.close();

            res.json({
                code : 200,
                data :'/img/save_disease_Image/'+file,
                ans:ans
            })
        })
    })

    //病蟲害辨識
    app.route('/disease_identify')
    .get(isUserCheck,async (req,res)=>{
        try {
            identify_process.show(req, res);
        } catch (error) {
            console.log(error);
        }
    })
    .post(upload.single('file'),isUserCheck,(req,res,next)=>{
        let file =req.file.filename;
        let std_res;
        let type=req.body.type;
        let python_file='';
        let userid=req.user._id;
        if(type==='lemon'){
            console.log('lemon啟用')
            type='檸檬果實';
            python_file='./py_folder/Resnet_lemon_pred.py';
        }else if(type==='mongo'){
            console.log('mongo啟用')
            type='芒果果實';
            python_file='./py_folder/C1vsC2_Dev.py';
        }else if(type==='banana'){
            console.log('banana啟用')
            type='香蕉樹葉';
            python_file='./py_folder/banana_pred.py';
        }else{
            return false;
        }
        //對應虛擬環境的路徑(若為預設環境直接輸入python即可) 若不是請用絕對路徑 可用dotenv的process.env作保護
        const childPython=spawn(process.env.DISEASEIDENTIFY,[python_file,file]);

        childPython.stdout.on('data',(data)=>{
            // console.log(`stdout: ${iconvLite.decode(data,'big5')}`);
            std_res=iconvLite.decode(data,'big5').toString();            
        })        
        childPython.stderr.on('data',(error)=>{
            console.log(`stderr: ${error}`);
        })        
        childPython.on('close',async (code)=>{
            // console.log(`child process exited with code:${code}`);
            let ans;
            if(std_res!==undefined){
                let arr=std_res.trim().split('\r\n');
                ans=arr[arr.length-1];
            }
            const client=await DB.loadClient();
            const db=await DB.loadDB(client);

            const add=await db.collection('identify').insertOne({userid:ObjectId(userid),type:type,identifyResult:ans,time:moment().utc().local().toDate()});
            
            await client.close();

            res.json({
                code : 200,
                data :'/img/save_disease_Image/'+file,
                ans:ans
            })
        })
    })


    //植物醫生部分


    //植物醫生登入
    app.get('/login-plantDoctor',(req,res)=>{
        res.render('pages-plantDoctor-sign-in.ejs', { message: req.flash('loginMessage'),success:req.flash('loginMessage_access')});
    })
    app.post('/login-plantDoctor',function(req, res, next) {
        if(req.body.username && req.body.password){            
            let specialChar_check=false;            
            specialChar_check=checkSpecialChar(req.body.username,req.body.password);
            if(specialChar_check==true){
                passport.authenticate('local-login', {
                    successRedirect : '/userCall',
                    failureRedirect : '/login-plantDoctor',
                    failureFlash : true
                })(req,res,next);
            }else{
                res.render('pages-sign-in.ejs', { message:'請勿輸入特殊符號',success:'alert alert-danger'}); 
            }       
        }else{
            res.render('pages-sign-in.ejs', { message:'未輸入用戶名稱或密碼',success:'alert alert-danger'}); 
        }  

        function checkSpecialChar(username,password){
            let specialChars= "~·`!！@#$￥%^…&*()（）—-_=+[]{}【】、|\\;:；：'\"“‘,./<>《》?？，。";
            for (let i=0;i<specialChars.length;i++){
                if (username.indexOf(specialChars.substring(i,i+1)) != -1 || password.indexOf(specialChars.substring(i,i+1)) != -1 ){
                    return false;
                }
            }
            return true;
        }

    });


    //使用者呼叫醫生介面
    app.get('/userCall',isDoctorCheck,async(req,res)=>{
        try{
            plantDoctor_userCall.show(req,res);
        }catch(error){
            console.log(error);
        }
    })

    app.post('/userCall_add',isDoctorCheck,async(req,res)=>{
        try{
            plantDoctor_userCall.add(req,res);
        }catch(error){
            console.log(error)
        }
    })


    app.get('/prescriptions',isDoctorCheck,async(req,res)=>{
        try{
            plantDoctor_prescriptions.show(req,res);
        }catch(error){
            console.log(error)
        }
    })

    app.post('/prescriptions_check',isDoctorCheck,async(req,res)=>{
        try{
            plantDoctor_prescriptions.check(req,res);
        }catch(error){
            console.log(error)
        }
    })


    //非系統網址轉址
    app.get('*',(req, res)=>{
        res.status(404);
        res.send('未有此頁面，請確認網址是否正確');
    });   
    

}


            // setTimeout(()=>{
            //     fs.unlink(`./public/img/${file}`,(err)=>{
            //         if(!err){
            //             console.log('刪除');
            //         }else{
            //             console.log('未刪除',err);
            //         }
            // })},10000);