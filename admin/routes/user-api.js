const express = require('express');
const router = express.Router();
const tables = require('../model/baseTable');
const utility = require('../utility/utility');
const moment = require('moment');
const constants = require('../utility/constants');
const csv = require('fast-csv');
const useragent = require('useragent');


const fs = require('fs');
const path = require('path');
const apis = require('../utility/apis');


const bodyParser = require("body-parser");
const multer = require('multer');
const app = express();
const ejs = require('ejs');
const axios = require('axios');
const notifications = require("../utility/notifications");
const {
        connectLogger
} = require('log4js');
const {
        Console
} = require('console');


router.post('/user-login', async function (req, res) {
        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }
        let email = req.body.email;
        let password = req.body.password;



        if (email == "" || email == null || email == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please send emailId"
                });
        }

        if (password == "" || password == null || password == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please Enter Password"
                });

        }
        const [err, checkUser] = await tables.usersTable.checkUserLogin(email, password);
        if (err || checkUser.length === 0) {
                return res.send({
                        'success': false,
                        'message': err || 'Invalid Login Details'
                });
        }

        //req.session.user_details = checkUser;
        return res.send({
                'success': true,
                'message': 'success',
                'user_details': checkUser
        });
});

router.post('/user-forgot-password', async function (req, res) {
        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }
        let email = req.body.email;
        // console.log(email); return

        if (email == "" || email == null || email == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please Enter Email"
                });
        }

        const [err, checkUser] = await tables.usersTable.checkUser({
                'user_email_id': email,
                'status': 1
        });

        if (err) {
                return res.send({
                        'success': false,
                        'message': 'Invalid Login Details'
                });
        }
        if (checkUser && checkUser.length) {
                let sendMail = require('../utility/sendMail');
                const otp = utility.generateOTP(4);
                const agent = checkUser[0];

                const [updateErr, updateUser] = await tables.usersTable.updateUser({
                        'otp': otp
                }, {
                        user_id: agent.user_id,
                });

                const baseUrl = req.protocol + '://' + req.get('host');


                //sendMail.sendMail({ 'emailTemplate': 'reset-password', 'name': user.name, 'email': user.email, 'subject': 'reset Password', 'baseUrl': baseUrl, 'otp': otp });
                return res.send({
                        'success': true,
                        'message': 'please verify otp and continue',
                        'user': agent.user_id
                });
        } else {
                return res.send({
                        'success': false,
                        'message': 'Invalid Email ID'
                });
        }
});


//
router.post('/user-verfiy-otp', async function (req, res) {

        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }

        let otp = req.body.otp;
        let userId = req.body.user_id;

        if (userId == "" || userId == null || userId == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please send user id"
                });
        }


        if (otp == "" || otp == null || otp == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please Enter Otp"
                });
        }
        const [err, checkUser] = await tables.usersTable.checkUser({
                'otp': otp,
                user_id: userId
        });
       
        if (err) {
                return res.send({
                        'success': false,
                        'message': 'Invalid Login Details'
                });
        }
        if (checkUser && checkUser.length) {
                req.session.is_otp = true;
                return res.send({
                        'success': true,
                        'message': 'otp verified successfully',
                        'user_id': checkUser[0]
                });
        } else {
                return res.send({
                        'success': false,
                        'message': 'Invalid OTP'
                });
        }
});


router.post('/user-reset-password', async function (req, res) {

        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }

        let password = req.body.password;
        let confirm_password = req.body.confirm_password;
        let userId = req.body.user_id;

        if (password == "" || password == undefined || password == null) {
                return res.send({
                        'success': false,
                        'message': "Please Enter password"
                });
        }

        if (confirm_password == "" || confirm_password == undefined || confirm_password == null) {
                return res.send({
                        'success': false,
                        'message': "Please Enter  confirm password"
                });
        }

        if (userId == "" || userId == undefined || userId == null) {
                return res.send({
                        'success': false,
                        'message': "user id required"
                })
        }

        if (password == confirm_password) {
                let encPassword = btoa(password);

                const [err, checkUser] = await tables.usersTable.updateUser({
                        'password': encPassword,
                }, {
                        user_id: userId
                });
                if (err) {
                        return res.send({
                                'success': false,
                                'message': 'Invalid Login Details'
                        });
                }
                return res.send({
                        'success': true,
                        'message': 'Reset password updated successfully'
                });

        } else {
                return res.send({
                        'success': false,
                        'message': 'Invalid confirm password'
                });
        }

});


router.post('/user-card-details', async function (req, res) {
        let token = "AFWBynuDbABxANYm";
        let tokenValue = req.body.token;
        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }
        let userId = req.body.user_id;

        if (userId == undefined || userId == null || userId == "") {
                res.send({
                        'success': false,
                        'message': "please send user id"
                })
        }
        let [err, cardDetails] = await tables.cardDataTable.getCardDetails({
                "user_id": userId
        });

       
        let userDetails = await tables.usersTable.getUserDetails({
                "user_id": userId
        });

        let districtId = userDetails[1][0].district_id;
        let hospitalDetails = await tables.hospitalTable.getHospitalDetails({
                "district": districtId
        })

        let districtIdd = userDetails[1][0].district_id;
        let districtDetails = await tables.districtTable.getDistrictDetails({
                "district_id": districtIdd
        })



        let hospitalName = hospitalDetails[1][0].hospital_name;
        let hospitalAddress = hospitalDetails[1][0].address;
        let districtName = districtDetails[1][0].district;

        if (hospitalName != "") {
                cardDetails[0].hospital_name = hospitalName;
        }

        if(districtName!=""){
                cardDetails[0].district = districtName;
        }

        if (hospitalAddress != "") {
                cardDetails[0].hospital_address = hospitalAddress;
        }



        return res.send({
                'success': true,
                'card_details': cardDetails,
                
        })
});



router.post('/user-payment-list', async function (req, res) {
        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }

        let userId = req.body.user_id;

        if (userId == "" || userId == null || userId == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please send  userId"
                });
        }


        let [err, usersPaidDetails] = await tables.paymentTable.getUserPaymentListApi(userId);
        return res.send({
                'success': true,
                'payment_list': usersPaidDetails,

        })
});



router.post('/user-receipt-list', async function (req, res) {
        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }

        let userId = req.body.user_id;

        if (userId == "" || userId == null || userId == undefined) {
                return res.send({
                        'success': false,
                        'message': "Please send  userId"
                });
        }


        let [err, usersPaidDetails] = await tables.billDetailsTable.getUserReceiptsListApi(userId);
        return res.send({
                'success': true,
                'receipts_list': usersPaidDetails,

        })
});


router.post('/user-payment-insert', async function (req, res) {


        let token = "AFWBynuDbABxANYm";

        let tokenValue = req.body.token;

        if (tokenValue === "") {
                return res.send({
                        'success': false,
                        'message': "please send token"
                });
        }
        if (token !== tokenValue) {
                return res.send({
                        'success': false,
                        'message': "your token incorrect"
                });
        }

        let amount = req.body.amount;
        let paymentId = req.body.payment_id;
        let userId = req.body.user_id;
        let agentId = req.body.agent_id;
        let districtId = req.body.district_id;
      //  let cardId = req.body.card_id;
        let distributorId = req.body.distributor_id;


        if (userId == undefined || userId == null || userId == "") {
                return res.send({
                        'success': false,
                        'message': "please send user id"
                });
        }

        if (amount == "" || amount == null || amount == undefined) {
                return res.send({
                        'success': false,
                        'message': "send Your amount"
                });
        }
        if (paymentId == "" || paymentId == null || paymentId == undefined) {
                return res.send({
                        'success': false,
                        'message': "send Your Payment Id"
                });
        }
        if (distributorId == "" || distributorId == null || distributorId == undefined) {
                return res.send({
                        'success': false,
                        'message': "send Your distributor Id"
                });
        }



        if (agentId == "" || agentId == null || agentId == undefined) {
                return res.send({
                        'success': false,
                        'message': "send Your agent Id"
                });
        }

        if (districtId == "" || districtId == null || districtId == undefined) {
                return res.send({
                        'success': false,
                        'message': "send Your district id"
                });
        }


        let commissionGeneratedId = Math.floor(100000 + Math.random() * 900000)

        let userPaymentDetails = [];
        userPaymentDetails.push(districtId);
        userPaymentDetails.push(distributorId);
        userPaymentDetails.push(userId);
        userPaymentDetails.push(agentId);
       // userPaymentDetails.push(cardId);  
        userPaymentDetails.push(amount);
        userPaymentDetails.push(paymentId);
        userPaymentDetails.push(commissionGeneratedId);
        userPaymentDetails.push(1);

        let [checkSiteExistsErr, checkExists] = await tables.paymentTable.checkPayment({
                'commission_gen_id': commissionGeneratedId,
                'status': 1
        });
        if (checkExists && checkExists.length) {
                return res.send({
                        'success': false,
                        'message': " ignore"
                });
        }
        let [err, submitResponse] = await tables.paymentTable.insertPayment(userPaymentDetails);

        const [err1, updateQuery] = await tables.cardDataTable.updateCard({
                'card_status': 0,
                'offer_utilize':0
                
        }, {
                'user_id': userId
        });

        return res.send({
                'success': true,
                'message': 'payment Successfully',
                'paymentDetails':userPaymentDetails
        })

});

function getRandomFileName() {
        var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        var random = ("" + Math.random()).substring(2, 8);
        return timestamp + random;
}

module.exports = router;