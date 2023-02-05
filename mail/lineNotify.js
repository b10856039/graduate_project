require('dotenv').config({path:"./mail/.env"})
const axios=require('axios');

module.exports={
    LineNotifyAccessCheck:LineNotifyAccessCheck,
    alertMsgLineSend:alertMsgLineSend
}




async function LineNotifyAccessCheck(lineToken,message){
    try{
        let returnVal=await sendLineNotify(lineToken,message);
        return returnVal;
    }catch(err){
        return false
    }
}


async function alertMsgLineSend(lineToken,message){
    try{
        let returnVal=await sendLineNotify(lineToken,message);
        return returnVal;
    }catch(err){
        return false
    }
}

async function sendLineNotify(lineToken,message){
    try{
        let SendStatus=false;
        const webhook_url = 'https://notify-api.line.me/api/notify'
        const oauthToken=lineToken
        const data = new URLSearchParams();
        data.append('message',message);                                    
        await axios.post(webhook_url,data, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Bearer ' + oauthToken
        }})
        .then(res => {                        
            if(res.status==200){
                SendStatus=true;
            }else{
                SendStatus=false;
            }
        })
        .catch(error => {
            return false;
        })
        return SendStatus;

    }catch(err){
        return false
    }
    
}