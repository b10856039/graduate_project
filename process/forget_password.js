

const DB=require('../database/db.js');
const mail=require('../mail/mail.js');

const randToken=require('rand-token');

module.exports={
    forgetPassProcess:forgetPassProcess
}

async function forgetPassProcess(req,res){
    let email=req.body.email;
    const client=await DB.loadClient();
    const db=await DB.loadDB(client);

    const result=await db.collection('user_data').findOne({email:email});
    if(result){
        let token=randToken.generate(20);
        let sent=await mail.sendForgetPassword(email,token);
        if(sent==true){
            const token_change=await db.collection('user_data').updateOne({email:email},{$set:{token:token}},{upsert:true});
            if(token_change.acknowledged==true){
                req.flash('forget_password_msg','已寄出郵件至信箱，請前往進行驗證');
                req.flash('forget_password_access','alert alert-success');
                await client.close();
                return res.redirect('/forget_password');
            }else{
                req.flash('forget_password_msg','郵件已送出，但伺服器發生錯誤，請稍後重試');
                req.flash('forget_password_access','alert alert-danger');
                await client.close();
                return res.redirect('/forget_password');
            }
        }else{
            req.flash('forget_password_msg','郵件傳送失敗，請確認輸入格式');
            req.flash('forget_password_access','alert alert-danger');
            await client.close();
            return res.redirect('/forget_password');
        }
    }else{
        req.flash('forget_password_msg','未有符合該郵件的使用者');
        req.flash('forget_password_access','alert alert-danger');
        await client.close();
        return res.redirect('/forget_password');
    }
}