

const DB=require('../database/db.js');

module.exports={
    signUp:signUp
}


async function signUp(req,res,insertData){

    const client=await DB.loadClient();
    const db=await DB.loadDB(client);
    const have_sameUsername=await db.collection('user_data').countDocuments({username:insertData.username});
    const have_sameEmail=await db.collection('user_data').countDocuments({email:insertData.email});
    const have_samePhone=await db.collection('user_data').countDocuments({phone:insertData.phone});
    
    if(have_sameUsername==0){
        if(have_sameEmail==0){
            if(have_samePhone==0){
                const result_insert=await db.collection('user_data').insertOne(insertData);
                if(result_insert.acknowledged==true){
                    res.json({success:true,msg:'成功註冊'});
                }else{
                    res.json({success:false,msg:'註冊失敗'});
                }
            }else{
                res.json({success:false,msg:'手機號碼已被使用，請重新輸入'});
            }
            
        }else{
            res.json({success:false,msg:'電子郵件已被使用，請重新輸入'});
        }

    }else{
        res.json({success:false,msg:'用戶名已被使用，請重新輸入'});
    }
    await client.close()
}