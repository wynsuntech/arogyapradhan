var admin = require('firebase-admin');
var serviceAccount = require("./duvimchat-3458b-firebase-adminsdk-xzsb9-fce4089abe.json");
const tables = require('../model/baseTable');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
module.exports = {

    sendPushNotifications: async function (messageData, userId) {
        const [err, tokens] = await tables.fcmTable.getDeviceIds(userId);
        if (err) {
            console.log(err);
        }
        //console.log(err);
        if (tokens.length !== 0) {
            let android = [];
            let ios = [];
            let token = [];
            console.log(tokens);
            for (const data of tokens) {
                console.log(data);
                if (data.device_type == 1) {
                    android.push(data.token);
                }
                if (data.device_type == 2) {
                    ios.push(data.token);
                }
            }
            var payload = messageData;
            token = android;
            if (ios.length) {
                token = ios;
                payload.notification = { "title": payload.data.title, 'sound': 'default', 'badge': '1', "body": payload.data.message };
            }
            var devicetoken = token;
            console.log(devicetoken);
            admin.messaging().sendToDevice(devicetoken, payload).then((response) => {
                console.log('Sent successfully.\n');
                let hello = response.results
                let i = 0;
                hello.forEach(async element => {
                    //console.log(element.error.code);
                    if (element.error) {
                        if (element.error.code === "messaging/registration-token-not-registered") {
                            //removeDeviceToken(pool, devicetoken[i]);
                            const [errr, token] = await tables.fcmTable.removeDeviceToken(devicetoken[i]);
                        }
                    }
                    i++;
                });
            }).catch(function (error) {
                console.log('Error sending message:', error);
            });
        }
    }
};