const express = require('express');
const router = express.Router();
const tables = require('../model/baseTable');
const utility = require('../utility/utility');
const moment = require('moment');
const constants = require('../utility/constants');
const csv = require('fast-csv');
const useragent = require('useragent');

const path = require("path");


const fs = require('fs');

const apis = require('../utility/apis');


const bodyParser = require("body-parser");
// const multer = require('multer');
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


router.post('/verfiy-agent-login', async function (req, res) {
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
    const [err, checkUser] = await tables.agentTable.checkAgentLogin(email, password);
    if (err || checkUser.length === 0) {
        return res.send({
            'success': false,
            'message': err || 'Invalid Login Details'
        });
    }

    req.session.user_details = checkUser;
    return res.send({
        'success': true,
        'message': 'success',
        'details': checkUser
    });
});

router.post('/agent-forgot-password', async function (req, res) {
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

    const [err, checkUser] = await tables.agentTable.checkAgent({
        'email_id': email
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


        const [updateErr, updateUser] = await tables.agentTable.updateAgent({
            'otp': otp
        }, {
            agent_id: agent.agent_id
        });

        const baseUrl = req.protocol + '://' + req.get('host');


        //sendMail.sendMail({ 'emailTemplate': 'reset-password', 'name': user.name, 'email': user.email, 'subject': 'reset Password', 'baseUrl': baseUrl, 'otp': otp });
        return res.send({
            'success': true,
            'message': 'please verify otp and continue',
            'agent': agent.agent_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid Email ID'
        });
    }
});


//
router.post('/agent-verfiy-otp', async function (req, res) {

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
    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please Enter agentId"
        });
    }


    if (otp == "" || otp == null || otp == undefined) {
        return res.send({
            'success': false,
            'message': "Please Enter Otp"
        });
    }
    const [err, checkUser] = await tables.agentTable.checkAgent({
        'otp': otp,
        agent_id: agentId
    });
    // console.log();return


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
            'agentId': checkUser[0].agent_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid OTP'
        });
    }
});


router.post('/agent-reset-password', async function (req, res) {

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
    let agentId = req.body.agent_id;


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

    if (agentId == "" || agentId == undefined || agentId == null) {
        return res.send({
            'success': false,
            'message': "agent id required"
        })
    }

    if (password == confirm_password) {
        let encPassword = btoa(password);

        const [err, checkUser] = await tables.agentTable.updateAgent({
            'password': encPassword,
        }, {
            agent_id: agentId
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

/// working fine

router.post('/insert-user-details-with-card', async function (req, res) {

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

    let filePath = "";
    
    if (req.body.upload_file) {

        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();

        // console.log(__dirname); return false;

        let file = path.join(__dirname, '..', 'static/images', randomDirectory);

        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
    }

    //user imagee
    


    let imagePath = "";
    if (req.body.upload_image) {

        let temPath = req.body.upload_image.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);

        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_image.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_image.name);
        imagePath = fileName;
    }



    let userFirstName = req.body.firstName;
    let userLastName = req.body.lastName;
    let dateOfBirth = req.body.date_of_birth;
    let emailId = req.body.emailId;
    let contactNumber = req.body.contactNumber;
    let district = req.body.district;
    let aadharNo = req.body.aadhar_no
    let agentId = req.body.agent_id;
    let distributorId = req.body.distributor_id;




    if (userFirstName == "" || userFirstName == null || userFirstName == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  User First Name"
        });
    }

    if (userLastName == "" || userLastName == null || userLastName == undefined) {
        return res.send({
            'success': false,
            'message': "Please send last Name"
        });
    }

    if (dateOfBirth == "" || dateOfBirth == null || dateOfBirth == undefined) {
        return res.send({
            'success': false,
            'message': "Please send Date of Birth"
        });
    }
    if (emailId == "" || emailId == null || emailId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send email id"
        });
    }
    if (contactNumber == "" || contactNumber == null || contactNumber == undefined) {
        return res.send({
            'success': false,
            'message': "Please send contact number"
        });
    }
    if (district == "" || district == null || district == undefined) {
        return res.send({
            'success': false,
            'message': "Please send District"
        });
    }
    if (req.body.upload_image == undefined || req.body.upload_image == null || req.body.upload_image == "") {
        return res.send({
            'success': false,
            'message': "user image  required"
        });
    }
    if (aadharNo == "" || aadharNo == null || aadharNo == undefined) {
        return res.send({
            'success': false,
            'message': "Please send aadhar number"
        });
    }
    if (req.body.upload_file == undefined || req.body.upload_file == null || req.body.upload_file == "") {
        return res.send({
            'success': false,
            'message': "user adharaImage required"
        });
    }
    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }
    if (distributorId == "" || distributorId == null || distributorId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  distributorId"
        });
    }

    let password = "123456";
    let encPassword = btoa(password);
    
    let userDetails = [];
    userDetails.push(2);
    userDetails.push(encPassword);
    
    userDetails.push(district);
    userDetails.push(agentId);
    userDetails.push(distributorId);
    userDetails.push(userFirstName);
    userDetails.push(userLastName);
    userDetails.push(dateOfBirth);
    userDetails.push(contactNumber);
    userDetails.push(emailId);
    userDetails.push(imagePath);
    userDetails.push(aadharNo);
    userDetails.push(filePath);
    userDetails.push(1);
    

    let [checkSiteExistsErr, checkExists] = await tables.usersTable.checkUser({
        'mobile_no': contactNumber,
        'status': 1
    });
    if (checkExists && checkExists.length) {
        return res.send({
            'success': false,
            'message': "Mobile Number already exists"
        });
    }
    let [checkSiteExistsErr1, checkExists1] = await tables.usersTable.checkUser({
        'user_email_id': emailId,
        'status': 1
    });
    if (checkExists1 && checkExists1.length) {
        return res.send({
            'success': false,
            'message': "Email Id already exists"
        });
    }

    let [err, submitResponse] = await tables.usersTable.userInsertApi(userDetails);
   

    if (submitResponse) {


        let cardImage = 'img/qr.jpg';
        let cardNumber = Math.floor(Math.random() * 1000000000);
        let startDate = new Date();
        let endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        let cardData = [];
        cardData.push(submitResponse.insertId);
        cardData.push(cardNumber);
        cardData.push(startDate);
        cardData.push(endDate);
        cardData.push(cardImage);
        cardData.push(0);
        cardData.push(1)

        if (cardData.length) {
            const [err5, submitData] = await tables.cardDataTable.insertCardDataApi(cardData);
        }

        return res.send({
            'success': true,
            'message': 'Added Successfully',
            'insertedNo': submitResponse.insertId,
            'userDetails': userDetails,

        })
    } else {
        return res.send({
            'success': false,
            'message': 'Something went to wrong please try again'
        })
    }
});

router.post('/add-user-district', async function (req, res) {
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
    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }


    let [err, usersDistrictDetails] = await tables.agentTable.getDistrictDetailsApi(agentId);

    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'usersDistrictDetails': usersDistrictDetails,

    })
});


///user-status
router.post('/users-card-status-list', async function (req, res) {
    // console.log("hiii"); return

    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }

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

    let [err, usersWithCardDetails] = await tables.usersTable.getUsersCardDetailsListApi(agentId);


    return res.send({
        'success': true,
        'message': 'Added {agent users list} Successfully',
        'usersWithCardDetails': usersWithCardDetails,

    })


});

router.post('/users-card-status', async function (req, res) {
    

    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }

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

    let [err, usersWithCardDetails] = await tables.usersTable.getUsersCardDetailsApi(agentId);


    return res.send({
        'success': true,
        'message': 'Added {agent users list} Successfully',
        'usersWithCardDetails': usersWithCardDetails,

    })


});




router.post('/update-card-status', async function (req, res) {
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
    let cardId = req.body.card_id;
    let cardStatus = req.body.card_status;

    if (cardId == "" || cardId == null || cardId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  cardId"
        });
    }
    
    if (cardStatus == "" || cardStatus == null || cardStatus == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  card_status"
        });
    }

    const [err, updateQuery] = await tables.cardDataTable.updateCard({
        'card_status': cardStatus
    }, {
        'card_id': cardId
    });
    return res.send({
        'success': true,
        'message': "Card status updated successfully"
    });
});


router.post('/edit-user', async function (req, res) {

    let userId = req.body.user_id;
    if (userId == undefined || userId == null || userId == "") {
        return res.send({
            'success': false,
            'message': "please send user id"
        });
    }

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

    let userDetails = {};
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let contactNumber = req.body.contact_number;
    let emailId = req.body.email_id;
    let dateOfBirth = req.body.date_of_birth;
    let aadharNo = req.body.aadhar_no;
    let district = req.body.district;


    // if (req.body.upload_image == "" || req.body.upload_image == null || req.body.upload_image == undefined) {
    //     return res.send({
    //         'success': false,
    //         'message': "upload your user Image"
    //     });
    // }

    if (firstName == "" || firstName == null || firstName == undefined) {
        return res.send({
            'success': false,
            'message': "enter your first Name"
        });
    }
    if (lastName == "" || lastName == null || lastName == undefined) {
        return res.send({
            'success': false,
            'message': "enter your last name"
        });
    }
    if (contactNumber == "" || contactNumber == null || contactNumber == undefined) {
        return res.send({
            'success': false,
            'message': "enter mobile Number"
        });
    }

    if (emailId == "" || emailId == null || emailId == undefined) {
        return res.send({
            'success': false,
            'message': "enter your EmailId"
        });
    }

    if (dateOfBirth == "" || dateOfBirth == null || dateOfBirth == undefined) {
        return res.send({
            'success': false,
            'message': "enter your date of Birth"
        });
    }


    if (aadharNo == "" || aadharNo == null || aadharNo == undefined) {
        return res.send({
            'success': false,
            'message': "enter your Aadhar number"
        });
    }

    // if (req.body.upload_file == "" || req.body.upload_file == null || req.body.upload_file == undefined) {
    //     return res.send({
    //         'success': false,
    //         'message': "choose you aadhar file"
    //     });
    // }



    if (district == "" || district == null || district == undefined) {
        return res.send({
            'success': false,
            'message': "enter district"
        });
    }



    // console.log(req.body.upload_file)
    // return;


    if (req.body.upload_file != undefined){

        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);

        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
        if (filePath) {
            userDetails.aadhar_image = filePath;
        }
    }


    if ( req.body.upload_image != undefined) {

        let temPath = req.body.upload_image.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);

        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_image.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_image.name);
        filePath = fileName;
        if (filePath) {
            userDetails.user_image = filePath;
        }
    }

    userDetails.first_name = firstName;
    userDetails.last_name = lastName;
    userDetails.mobile_no = contactNumber;
    userDetails.user_email_id = emailId;
    userDetails.date_of_birth = dateOfBirth;
    userDetails.aadhar_no = aadharNo;
    userDetails.district_id = district;

    let [checkSiteExistsErr, checkExists] = await tables.usersTable.checkUser({
        'user_id': userId,
        'mobile_no': contactNumber,
        'status': 1
    });

    if (checkExists && checkExists.length && checkExists[0].user_id != userId) {
        return res.send({
            'success': false,
            'message': "mobile number is already exist"
        })
    }

    let [checkSiteExistsErr1, checkExists1] = await tables.usersTable.checkUser({
        'user_id': userId,
        'user_email_id': emailId,
        'status': 1
    });

    if (checkExists1 && checkExists1.length && checkExists1[0].user_id != userId) {
        return res.send({
            'success': false,
            'message': "Email Id is already exist"
        })
    }
    let [err, submitResponse] = await tables.usersTable.updateUser(userDetails, {
        'user_id': userId
    });

    let districtId = parseInt(userDetails.district_id)
    return res.send({
        'success': true,
        'message': 'Updated Successfully',
        'districtId':districtId
    })
});


router.post('/user-payment-submit', async function (req, res) {


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

    if (distributorId == undefined || distributorId == null || distributorId == "") {
        return res.send({
            'success': false,
            'message': "please send distributor id"
        });
    }

    let commissionGeneratedId = Math.floor(100000 + Math.random() * 900000)

    let userPaymentDetails = [];
    userPaymentDetails.push(districtId);
    userPaymentDetails.push(distributorId);
    userPaymentDetails.push(userId);
    userPaymentDetails.push(agentId);
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
   
    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'submitResponse': userPaymentDetails
    })

});


//users --after payment - api
router.post('/payment-users-details', async function (req, res) {
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

    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }


    let [err, usersPaidDetails] = await tables.paymentTable.getAgentPaymentListApi(agentId);


    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'usersPaidDetails': usersPaidDetails,

    })
});


//agent commission

router.post('/agent-commission-details', async function (req, res) {
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

    let agentId = req.body.agent_id;

    if (agentId == "" || agentId == null || agentId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  agentId"
        });
    }


    let [err, usersPaidDetails] = await tables.paymentTable.getAgentCommissionDetailsApi(agentId);


    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'usersPaidDetails': usersPaidDetails,

    })
});


//-----------------------------------------------------------------------------------------------



function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    return timestamp + random;
}




module.exports = router;
