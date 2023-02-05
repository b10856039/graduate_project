//MongoDB

const ObjectId = require('mongodb').ObjectId;
const nodemailer=require('nodemailer');
const DB=require('../database/db.js');
const axios=require('axios');
const mail=require('../mail/mail.js');
const Line=require('../mail/lineNotify.js');
require('dotenv').config({path:"./mail/.env"})

module.exports={
    show:Show,
    isAuthenticated:isAuthenticated,
    Personal:PersonalUpdate,
    Upd_Password:PasswordUpdate,
    Upd_LineToken:Upd_LineToken,
    Del_LineToken:Del_LineToken,
    Activate_EmailNotify:Activate_EmailNotify,
    Deactivate_EmailNotify:Deactivate_EmailNotify
}



async function Show(req,res){    

    //用來顯示url上的名稱
    let username=req.params.username;


    let showLineInsert=false;
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    if(req.user.lineToken){
        showLineInsert=true;
    }

    const result=await db.collection('user_data').find({username:req.user.username}).toArray();

    await client.close();
    return res.render('pages-profile.ejs',{user:req.user.username,personal_data:result,showLineInsert:showLineInsert});
}

async function isAuthenticated(req,res){
    let personal_password=req.body.password;

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const result=await db.collection('user_data').find({username:req.user.username}).toArray();
    await client.close();
    if(result[0].password===personal_password){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
}

async function PersonalUpdate(req,res){

    let obj_id=req.user._id
    const userData={};
    userData.name=req.body.name;
    userData.email=req.body.email;
    userData.phone=req.body.phone;
    userData.address=req.body.address;
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const have_sameEmail=await db.collection('user_data').countDocuments({_id:{$ne:ObjectId(obj_id)},email:req.body.email});
    const have_samePhone=await db.collection('user_data').countDocuments({_id:{$ne:ObjectId(obj_id)},phone:req.body.phone});
    if(have_sameEmail<1){
        if(have_samePhone<1){
            const result=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$set:userData},{upsert:true});
            await client.close();
            if(result.acknowledged==true){
                return res.json({success:true,msg:'使用者資料已修改'});                
            }else{
                return res.json({success:false,msg:'使用者資料修改失敗'});
            }
        }else{
            await client.close();
            return res.json({success:false,msg:'手機號碼已被其他使用者使用'});
        }        
    }else{
        await client.close();
        return res.json({success:false,msg:'電子郵件已被其他使用者使用'});
    }
}

async function PasswordUpdate(req,res){

    let obj_id=req.user._id;
    let oldPassword=req.body.oldPassword;
    let newPassword=req.body.newPassword;

    const client=await DB.loadClient();
    const db=await DB.loadDB(client); 

    const result=await db.collection('user_data').find({username:req.user.username}).toArray();
    if(oldPassword===result[0].password){
        const password_change=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$set:{password:newPassword}});
        if(password_change.acknowledged==true){      
            const delete_token=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$unset:{token:""}});
            await client.close();   
            return res.json({success:true,update_msg:'密碼修改成功，請重新登入'});
        }else{
            await client.close();
            return res.json({success:false,update_msg:'密碼修改失敗'});
        }

    }else{
        await client.close();
        return res.json({success:false,update_msg:'舊密碼輸入錯誤'});
    }
}


async function Upd_LineToken(req,res){

    let obj_id=req.user._id;
    let Token=req.body.LineToken;   

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const search_user=await db.collection('user_data').find({lineToken:req.body.LineToken}).toArray();

    if(search_user.length<=0){
    
        let message='訊息測試成功'
        let sendCheck=await Line.LineNotifyAccessCheck(Token,message);      

        if(sendCheck==true){
            const update_LineToken=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$set:{lineToken:Token}},{upsert:true});
            await client.close();
            if(update_LineToken.acknowledged==true){
                return res.json({success:true,Lineprocess_msg:'測試訊息傳送成功'})
            }else{
                return res.json({success:false,Lineprocess_msg:'測試訊息傳送失敗,請再嘗試一次'});
            }            
        }else{
            await client.close();
            return res.json({success:false,Lineprocess_msg:'測試訊息傳送失敗,請檢查TOKEN是否正確'})
        }

    }else{
        return res.json({success:false,Lineprocess_msg:'已有其他使用者使用此TOKEN'});
    }
    
}

async function Del_LineToken(req,res){
    let obj_id=req.user._id;
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const del_LineToken=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$unset:{lineToken:""}});
    await client.close();
    if(del_LineToken.acknowledged==true){
        return res.json({success:true,Lineprocess_msg:'解除連接成功'})
    }else{
        return res.json({success:false,Lineprocess_msg:'解除連結失敗'})
    }
}

async function Activate_EmailNotify(req,res){
    try{
        let obj_id=req.user._id;
        const client=await DB.loadClient();
        const db=await DB.loadDB(client);

        const search_user=await db.collection('user_data').findOne({_id:ObjectId(obj_id)});

        let Sendmessage='<p>您好，已啟用環境異常通知功能，若收到此信件，通知功能已確認開啟。</p>'
        let title='環境感測通知功能啟用';
        let email=search_user.email;

        let sendCheckEmail=await mail.EmailNotifyCheck(email,title,Sendmessage)

       
        if(sendCheckEmail==true){
            const Activate_Email=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$set:{ActivateEmailNotify:true}});
            await client.close();
            if(Activate_Email.acknowledged==true){
                return res.json({success:true,Emailprocess_msg:'測試訊息傳送成功'})
            }else{
                return res.json({success:false,Emailprocess_msg:'測試訊息傳送失敗，請檢查信箱'})
            }
        }else{
            await client.close();
            return res.json({success:false,Emailprocess_msg:'測試訊息傳送失敗，請檢查信箱'});
        }
    }catch(error){
        return res.json({success:false,Emailprocess_msg:'伺服器出現錯誤，測試訊息傳送失敗'})
    }    
}

async function Deactivate_EmailNotify(req,res){
    let obj_id=req.user._id;
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const del_LineToken=await db.collection('user_data').updateOne({_id:ObjectId(obj_id)},{$set:{ActivateEmailNotify:false}});

    await client.close();

    if(del_LineToken.acknowledged==true){
        return res.json({success:true,Emailprocess_msg:'解除連接成功'})
    }else{
        return res.json({success:false,Emailprocess_msg:'解除連結失敗'})
    }
}