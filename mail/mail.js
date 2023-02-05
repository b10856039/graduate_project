const nodemailer=require('nodemailer');
require('dotenv').config({path:"./mail/.env"})

module.exports={
    sendForgetPassword:sendForgetPassword,
    EmailNotifyCheck:EmailNotifyCheck,
    EmailNotifySend:EmailNotifySend
}


async function sendForgetPassword(email, token){
    try{
        let message='<p>您已要求更改密碼,若發送請求的為本人，請點選此連結<a href="http://localhost:8000/reset_password?token=' + token + '">link</a>進行密碼的更改。</p><p>若並未執行此動作，請無須理會此文件，並確認帳號之安全性。</p>'
        let title='更改密碼請求-農務物聯網智慧系統';
        let returnVal=await sendEmail(email,title,message);
        return returnVal
    }catch(err){
        return false
    }
    
}

async function EmailNotifyCheck(email,title,message){
    try{
        let returnVal=await sendEmail(email,title,message);

        return returnVal
    }catch(err){
        return false
    }
}

async function EmailNotifySend(email,title,message){
    try{
        let returnVal=await sendEmail(email,title,message);        
        return returnVal
    }catch(err){
        return false
    }
}

//寄信
async function sendEmail(email,title,message) {
    try{

        const transporter =  nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type:"OAuth2",
                user:process.env.ACCOUNT,
                clientId:process.env.CLIENTID,
                clientSecret:process.env.CLIENTSERECT,
                refreshToken:process.env.REFRESHTOKEN,
                accessToken:process.env.ACCESSTOKEN,
            }
        });
        
        const mailOptions = {
            from:`農務物聯網智慧系統 <${process.env.ACCOUNT}>`,
            to: email,
            subject: title,
            html: message             
        };
    
        let info=await transporter.sendMail(mailOptions);

        if(info.accepted.length>0){
            return true
        }else{
            return false
        }        
    }catch(error){
        return false
    }
   

}
