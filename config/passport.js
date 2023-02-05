
//預設會從 req.body、req.query 中取得 username、password。也可以另外設定參數
const LocalStrategy=require('passport-local').Strategy; 

//MongoDB
const ObjectId = require('mongodb').ObjectId;
const DB=require('../database/db.js');
require('dotenv').config({path:"./mail/.env"})

const url=process.env.DATABASE;

//const bcrypt=require('bcrypt-nodejs'); //為hash加密api 暫不使用


module.exports=function(passport){

    //將session序列化 決定哪些資料要存入到session中
    passport.serializeUser(function(user, done) { 

        done(null,{_id:user._id,username:user.username,line_token:user.line_token,isDoctor:user.isDoctor});
    });

    //為反序列化，獲得存取在 session 當中的用戶資訊後，透過該資訊至資料庫找到完整的用戶資料物件，並將該物件存取到req.user
    passport.deserializeUser(async(user, done)=>{ 
        try{
            const client=await DB.loadClient();
            const db=await DB.loadDB(client);

            const result=await db.collection('user_data').findOne({_id:ObjectId(user._id)});

            await client.close();

            if(result.lineToken){
                done(null,{_id:result._id,username:result.username,lineToken:result.lineToken,isDoctor:result.isDoctor}); 
            }else{
                done(null,{_id:result._id,username:result.username,isDoctor:result.isDoctor}); 
            }  
        }catch(error){
            console.log(error);
        }
    });



    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        async function(req, username, password, done) {
            try{
                const client=await DB.loadClient();
                const db=await DB.loadDB(client);

                const result=await db.collection('user_data').find({username:username}).toArray();

                await client.close();

                if(result.length==0){
                    return done(null, false, req.flash('loginMessage', '未有該使用者'),req.flash('loginMessage_access','alert alert-danger'));
                }
                if(password!=result[0].password){
                    return done(null, false, req.flash('loginMessage', '密碼錯誤'),req.flash('loginMessage_access','alert alert-danger'));
                }
                return done(null, result[0]);
            }catch(error){
                console.log(error);
            }            
        })
    );
};