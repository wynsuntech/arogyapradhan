let usersByRooms={};
var crypto = require('crypto');
const fs=require('fs');
function formatDateTime(date)
{
    return ('{0}-{1}-{3} {4}:{5}:{6}').replace('{0}', date.getFullYear()).replace('{1}', date.getMonth() + 1).replace('{3}', date.getDate()).replace('{4}', date.getHours()).replace('{5}', date.getMinutes()).replace('{6}', date.getSeconds())
}
function generateHash()
{
        let hashLength = 16;
        let characters = '1234567890123456';
        let hash = '';
        for (var i = 0; i < characters.length; i++) {
            hash = hash + characters.charAt(Math.random() * (hashLength - 0) + 0);

        }
        return hash;
}
const generateOTP = function(otpLength=4) {
    return  1234;
    let baseNumber = Math.pow(10, otpLength -1 );
    let number = Math.floor(Math.random()*baseNumber);
    /*
    Check if number have 0 as first digit
    */
    if (number < baseNumber) {
        number += baseNumber;
    }
    return number;
};
function makeid(length=8) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function encrypt(string)
{
    let iv = '1234567890123456';
    let hash=generateHash();
    let cipher = crypto.createCipheriv('aes-128-cbc', hash, iv);

    let encrypted = cipher.update(string, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    let hexVal = new Buffer.from(encrypted, 'binary');
    let newEncrypted = hexVal.toString('hex');
    return {'password':newEncrypted,'hash':hash};
}
function decrypt(password, hash)
{
    console.log(hash,password,"passwordddd");
    let iv = '1234567890123456';

    let decipher = crypto.createDecipheriv('aes-128-cbc', hash, iv);

    let decrypted = decipher.update(password, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted;

    /*   let mykey = crypto.createDecipher('aes-128-cbc', hash);
     let mystr = mykey.update(password, 'hex', 'utf8');
     mystr += mykey.final('utf8');
     return mystr;*/
}
function removeLastComma(str) {
    return str.replace(/,(\s+)?$/, '');
}
function removeLastAnd(str) {
    return str.replace(/and(\s+)?$/, '');
}
function createDirRecursively(fileDestination) {
    const dirPath = fileDestination.split('/');
    dirPath.forEach((element, index) => {
        if(!fs.existsSync(dirPath.slice(0, index + 1).join('/'))){
            fs.mkdirSync(dirPath.slice(0, index + 1).join('/'));
            fs.chmodSync(dirPath.slice(0, index + 1).join('/'), '755');
        }
    });
}
const acronym=function (str) {
    str=str.split("@");
    str=str[0];
    let words = (str || "").replace(/[\(\),\|\.\+\-&]/g, " ").split(/[\s\.]/);
    let acronym =
        words.length > 1
            ? words.reduce((response, word) => (response += word.slice(0, 1)), "")
            : words[0].slice(0, 2);
    return acronym.toUpperCase();
}
const characters ='abcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length=24){
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result=result.trim();
    return result;
}
function generateRandomToken(byteLength = 24){

    return new Promise((resolve, reject) => {


             return resolve(randomString(byteLength));


    });
}
function generateAccountId(){
    const tables=require('../model/baseTable');

    return new Promise(async (resolve)=>{
        let accountId=makeid();
        let [err,checkAccountId]=await tables.accountsTable.checkAccount({'account_token':accountId});

            console.log(checkAccountId,"checkAccountId");
        if(checkAccountId && checkAccountId.length){
            generateAccountId();
        }else{
            return resolve(accountId);

        }
    })
}
const stripe = require('stripe')('sk_test_51G9CncEZqOND0HXnhZ1AksgUVmlLnFtXZTAtpQjk3iQUn8avfEUtQhicHYmgTeOWZMSDHYpeZLC8z6rsNGIQXGkY00a8P8KLBq'); // Add your Secret Key Here

module.exports = {
        formatDateTime:formatDateTime,
        usersByRooms:usersByRooms,
    encrypt,decrypt,
    removeLastComma,
    removeLastAnd,
    createDirRecursively,
    generateRandomToken,
    makeid,generateAccountId,
    generateOTP,
    stripe,
    acronym
    };
