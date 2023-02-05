

const DB=require('../database/db.js');

module.exports={
    resetPassProcess:resetPassProcess
}


async function resetPassProcess(req,res){
    let token=req.body.token;
    let new_password=req.body.new_password;
    let check_password=req.body.check_password;
    if(!token){
        req.flash('reset_password_msg','你沒有修改密碼的權限');
        req.flash('reset_password_access','alert alert-danger');
        return res.redirect('/reset_password');
    }
    if(new_password===check_password){
        try{
            const client=await DB.loadClient();
            const db=await DB.loadDB(client);

            const password_change=await db.collection('user_data').updateOne({token:token},{$set:{password:new_password}},{upsert:true});
            if(password_change.acknowledged==true){
                const result=await db.collection('user_data').find({token:token}).toArray();
                const delete_token=await db.collection('user_data').updateOne({_id:result[0]._id},{$unset:{token:""}});
                if(delete_token.acknowledged==true){
                    req.flash('loginMessage','密碼修改成功');
                    req.flash('loginMessage_access','alert alert-success');
                    await client.close();
                    return res.redirect('/login');
                }
            }else{
                req.flash('reset_password_msg','密碼修改失敗，請稍後重試');
                req.flash('reset_password_access','alert alert-danger');
                await client.close();
                return res.redirect('/reset_password?token='+req.body.token);
            }
        }catch(error){
            console.log(error);
        }
    }else{
        req.flash('reset_password_msg','新密碼與確認密碼不同，請重新輸入');
        req.flash('reset_password_access','alert alert-danger');
        return res.redirect('/reset_password?token='+req.body.token);
    }
}