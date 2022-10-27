const fs=require('fs');
const AWS=require('aws-sdk');

const BUCKET_NAME = "duvim";
const IAM_USER_KEY = "AKIAZ3AXMMACLYKFCUXW";
const IAM_USER_SECRET = "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";

const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
});

const uploadToS3=function(fileName,file){
    return new Promise((resolve,reject)=> {
    const readStream = fs.createReadStream(file.path);
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: readStream,
        ContentType: file.type,
        ACL: 'public-read'
    };

        s3bucket.upload(params, function(err, data) {
            readStream.destroy();
            if (err) {
                console.log(err,"ererererer upload Errrr");
                return reject(err);
            }
            return resolve(data['Key']);
        });

})
}
module.exports=uploadToS3