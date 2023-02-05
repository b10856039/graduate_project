const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({path:"./mail/.env"});
const url=process.env.DATABASE;

module.exports={
    loadDB:loadDB,
    loadClient:loadClient,    
}

//DB
// async function loadDB(){
//     let db;
//     try{
//         const client=await MongoClient.connect(url);
//         db=client.db('iot_database');
//     }catch(error){
//         console.log(error);
//     }
//     return db;
// }

//DB
async function loadClient(){
    try{
        const client=await MongoClient.connect(url);      
        return client;  
    }catch(error){
        console.log(error);
    }
}

async function loadDB(client){    
    try{
        const db= client.db('iot_database');

        return db;
    }catch(error){
        console.log(error);
    }    
}


