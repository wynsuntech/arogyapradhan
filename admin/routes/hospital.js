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
var pdf = require("pdf-creator-node");
const commissionTable = require('../model/commissionTable');







router.get('/login', async function (req, res) {
    res.render('pages/hospital/login');
});

router.post('/verfiy-login', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if (email == "") {
        return res.send({
            'success': false,
            'message': "Please Enter Email"
        });
    }

    if (password == "") {
        return res.send({
            'success': false,
            'message': "Please Enter Password"
        });

    }
    const [err, checkUser] = await tables.hospitalTable.getHospitalDetails({
        "biller_email_id": email
    });

    if (err || checkUser.length === 0) {
        return res.send({
            'success': false,
            'message': err || 'Invalid Login Details'
        });
    }

    if (checkUser && checkUser.length) {
        if (checkUser[0].status == 2) {
            return res.send({
                "message": "Your account is not active please contact admin",
                "responce": false
            });
        }
        if (checkUser[0].status == 3) {
            return res.send({
                "message": "Your account is blocked please contact admin",
                "responce": false
            });
        }
        if (checkUser[0].status == 0) {
            return res.send({
                "message": "Your account is not active",
                "responce": false
            });
        }
        let decryptPassword = utility.decrypt(checkUser[0].password, checkUser[0].hash);
        // console.log(decryptPassword);
        if (password === decryptPassword) {
            return res.send({
                "message": "User detail",
                "user_detail": checkUser[0],
                "responce": true
            });
        } else {
            return res.send({
                "message": "Invalid Password",
                "responce": false
            });
        }
    }



})


router.get('/hospital-forgot-password', function (req, res) {
    res.render('pages/hospital-forgot-password');
});

router.post('/hospital-forgot-password', async function (req, res) {

    let email = req.body.email;

    if (email == "") {
        return res.send({
            'success': false,
            'message': "Please Enter Email"
        });
    }

    const [err, checkUser] = await tables.hospitalTable.checkHospital({
        'biller_email_id': email
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
        const hospital = checkUser[0];


        const [updateErr, updateUser] = await tables.hospitalTable.updateHospital({
            'otp': otp
        }, {
            hospital_id: hospital.hospital_id
        });

        const baseUrl = req.protocol + '://' + req.get('host');



        return res.send({
            'success': true,
            'message': 'success',
            'hospital': hospital.hospital_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid Email ID'
        });
    }
});


router.post('/hospital-verfiy-otp', async function (req, res) {
    let otp = req.body.otp;
    let hospitalId = req.body.hospital;
    if (otp == "") {
        return res.send({
            'success': false,
            'message': "Please Enter Otp"
        });
    }
    const [err, checkUser] = await tables.hospitalTable.checkHospital({
        'otp': otp,
        hospital_id: hospitalId
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
            'message': 'success'
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid OTP'
        });
    }
});


router.post('/hospital-reset-password', async function (req, res) {
    let password = req.body.password;
    let hospitalId = req.body.hospital;

    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    //const browser=agent.toAgent();
    const os = agent.os.toString();
    if (!req.session.is_otp) {
        return res.send({
            'success': false,
            'message': "invalid request"
        });
    }
    if (password == "") {
        return res.send({
            'success': false,
            'message': "Please Enter password"
        });
    }
    let encPassword = utility.encrypt(password);

    const [err, checkUser] = await tables.hospitalTable.updateHospital({
        'password': encPassword.password,
        hash: encPassword.hash
    }, {
        hospital_id: hospitalId
    });
    if (err) {
        return res.send({
            'success': false,
            'message': 'Invalid Login Details'
        });
    }
    if (checkUser && checkUser.length) {
        const activityTrack = {
            'log': 'Login',
            'activity_type': 4,
            'user_type': checkUser['role'],
            'user_id': checkUser['hospital_id'],
            'account_id': checkUser['account_id'],
            'ip': ip,
            'device_os': os
        };
        let [activityErr, insertActivity] = await tables.activityTable.saveActivity(activityTrack);
        return res.send({
            'success': true,
            'message': 'success'
        });
    } else {
        return res.send({
            'success': true,
            'message': 'Invalid User'
        });
    }
});

router.post('/hospital-reset-password-two', async function (req, res) {
    let password = req.body.password;
    let hospitalId = req.body.hospital;
    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    const os = agent.os.toString();

    if (password == "") {
        return res.send({
            'success': false,
            'message': "Please Enter password"
        });
    }
    let encPassword = utility.encrypt(password);

    const [err, checkUser] = await tables.hospitalTable.updateHospital({
        'password': encPassword.password,
        hash: encPassword.hash
    }, {
        hospital_id: hospitalId
    });
    if (err) {
        return res.send({
            'success': false,
            'message': 'Invalid Login Details'
        });
    }
    if (checkUser && checkUser.length) {
        const activityTrack = {
            'log': 'Login',
            'activity_type': 4,
            'user_type': checkUser['role'],
            'user_id': checkUser['hospital_id'],
            'account_id': checkUser['account_id'],
            'ip': ip,
            'device_os': os
        };
        let [activityErr, insertActivity] = await tables.activityTable.saveActivity(activityTrack);
        return res.send({
            'success': true,
            'message': 'password updated successfully'
        });
    } else {
        return res.send({
            'success': true,
            'message': 'password updated successfully'
        });
    }
});
//'-------------------------------------  Hospital-Users-list start----------------------------// '


router.get('/users', checkUserSession, async function (req, res) {
    let district = req.session.user_details.district;

    let [err, usersList] = await tables.hospitalTable.getHospitalUsersListJoin(district);
   
    let date = [];
    let newdate = [];

    for (let i = 0; i < usersList.length; i++) {
        date[i] = usersList[i].created_at;

        newdate[i] = date[i].toLocaleDateString();
    }
    res.render('pages/hospital/users', {
        'loginUser': req.session.user_details,
        usersList,
         newdate,
    });
});

//'-------------------------------------  Hospital-Users-list end----------------------------// ' 


//'-------------------------------------  Hospital-billing-list start----------------------------// '


router.get('/billing', checkUserSession, async function (req, res) {
    let district = req.session.user_details.district;
    let [err, UsersBillList] = await tables.usersTable.UserDetailsWithBill(district);
 
    let date = [];
    let newdate = [];
    for (let i = 0; i < UsersBillList.length; i++) {
        if (UsersBillList[i].created_at != null && UsersBillList[i].created_at != 'null') {
            date[i] = UsersBillList[i].created_at;
            newdate[i] = date[i].toLocaleDateString();
        }
    }

    res.render('pages/hospital/billing', {
        'loginUser': req.session.user_details,
        UsersBillList,
       newdate,

    });

});

router.get('/add-bill', checkUserSession, async function (req, res) {

  //  let [err, usersList] = await tables.hospitalTable.getHospitalUsersBillIdListJoin();
  //  console.log(usersList);
    
    res.render('pages/hospital/add-bill', {
        'loginUser': req.session.user_details,
       // usersList,
    });
    
});

router.get('/card-scan/:id', checkUserSession, async function (req, res) {
    let arogyaId = req.params.id;
   
    let [checkSiteExistsErr, usersList] = await tables.cardDataTable.checkUserForBill(arogyaId);

    let date =[];
    let newdate = [];

   for(let i = 0 ;i < usersList.length;i++){
   date[i] = usersList[i].end_date;

    newdate[i]=date[i].toLocaleDateString();
   }
    res.render('pages/hospital/card-scan', {
        'loginUser': req.session.user_details,
        usersList,
        newdate
    });
    console.log(usersList);
     
});

//checking Aarogya pradhan Id is present or not
router.post('/generating-bill', checkUserSession, async function (req, res) {

    let arogyaIdNo = req.body.arogyaId;
    if (arogyaIdNo == "" || arogyaIdNo == null || arogyaIdNo == undefined) {
        messageDisplay("Please Enter arogyaId ");
        return false;
    }

    let [checkSiteExistsErr, usersList] = await tables.cardDataTable.checkUserForBill(arogyaIdNo);
   
    let date =[];
    let newdate = [];

   for(let i = 0 ;i < usersList.length;i++){
   date[i] = usersList[i].created_at;

    newdate[i]=date[i].toLocaleDateString();
   }

    if (usersList.length > 0) {

        //console.log(usersList);

        let user_data = `
                            <div class="row">
                            <div class="col-xxl-7 col-xl-8 col-lg-8 col-md-8">
                            <div class="shadow-none mb-5 bg-white rounded box-padd p-5">
                            <h1 class="use-detail">User Details</h1>
                            <div class="row">
                            <div class="col-xl-4">
                            <h1 class="bill-head mt-4">First Name:</h1>
                            <h2 class="hide-bor">` + usersList[0].first_name + `</h2>
                            <h1 class="bill-head mt-5">Mobile Number:</h1>
                            <h2 class="hide-bor">` + usersList[0].mobile_no + `</h2>
                            </div>
                            <div class="col-xl-4">
                            <h1 class="bill-head mt-4">Last Name:</h1>
                            <h2 class="hide-bor">` + usersList[0].last_name + `</h2>
                            <h1 class="bill-head">Adhar card number</h1>
                            <h2 class="hide-bor">` + usersList[0].aadhar_no + `</h2>
                            </div>
                            <div class="col-xl-4">
                            <h1 class="bill-head mt-4">Email ID:</h1>
                            <h2 class="hide-bor">` + usersList[0].user_email_id + `</h2>
                            <h1 class="bill-head mt-5">District</h1>
                            <h2 class="hide-bor">` + usersList[0].district + `</h2>
                            </div>
                            </div>
                            </div>
                            </div>
                            <div class="col-xxl-5 col-xl-4  col-lg-4 col-md-4">
                            <div  class="shadow-none  mb-5 bg-white rounded box-padd1" >
                            <h1 class="use-detail1">Arogya Pradhan Card Details</h1>
                            <div class="row">
                            <div class="col-lg-12">
                            <h6 class="bill-head mt-4">Arogya Pradhan Id:</h6>
                            <h2 class="hide-bor">` + usersList[0].card_number + `</h2>
                            <h6 class="bill-head mt-4">Created Date:</h6>
                            <h2 class="hide-bor1">` + newdate[0]+ `</h2>
                            </div>
                            </div>
                            </div>
                            </div>
                            </div>
                        `;

        return res.send({
            "message": "Data Found",
            "response": true,
            "user_detail": user_data
        });


    } else {
        return res.send({
            "message": "invalid arogya pradhan id",
            "response": false,
            "user_detail": null
        });
    }


});

router.post('/bill-details', checkUserSession, async function (req, res) {

    if (req.body.upload_file == "undefined") {
        return res.send({
            'success': false,
            'message': "upload file required"
        });
    }

    let filePath = "";
    if (req.body.upload_file) {
        
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
        //console.log("file", file, req.body.hospital_logo.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
    }


    let userId = req.body.userId
    let districtId = req.body.districtId
    let billNumber = req.body.billNumber;
    let billAmount = req.body.billAmount;

    let billDetails = [];
    billDetails.push(userId);
    billDetails.push(districtId);
    billDetails.push(billNumber);
    billDetails.push(billAmount);
    billDetails.push(filePath);
    billDetails.push(billAmount - (billAmount / 100) * 40);
    billDetails.push(1);
   
    let [checkSiteExistsErr, checkExists] = await tables.billDetailsTable.checkBillDetails({
        'bill_number': billNumber,
        'status': 1
    });
    if (checkExists && checkExists.length) {
        return res.send({
            'success': false,
            'message': "bill Number already exists"
        });
    }
    let [err, submitResponse] = await tables.billDetailsTable.insertBillDetails(billDetails);

    let billId = submitResponse.insertId;
    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'last_bill_id': billId
    })

});

router.get('/bill_payment/:id', checkUserSession, async function (req, res) {

    let billId = req.params.id;

    const [err, billUsersDetails] = await tables.billDetailsTable.getBillUsersDetails({
        "status": 1,
        "bill_id": billId
    });

    res.render('pages/hospital/bill_payment', {
        'loginUser': req.session.user_details,

        billUsersDetails,

    });

});

router.get('/view/:id', checkUserSession, async function (req, res) {
    let billId = Buffer.from(req.params.id, 'base64').toString();
    billId = billId.split('=');
   // console.log(billId, 'billId');


    const [err, userWithBillDetails] = await tables.billDetailsTable.getBillUsersDetails({
        'bill_id': billId[1]
    });
   
    res.render('pages/hospital/view', {
        'loginUser': req.session.user_details,
        userWithBillDetails,

    });


})

//'-------------------------------------  Hospital-billing-list- end----------------------------// '


//'-------------------------------------  Hospital-commission-list- start----------------------------// '



router.get('/commission', checkUserSession, async function (req, res) {
    let district = req.session.user_details.district;
    let [err, hospitalCommission] = await tables.paymentTable.getHospitalCommissionDetails(district);
   
    let date = [];
    let newdate = [];
    for (let i = 0; i < hospitalCommission.length; i++) {
        if (hospitalCommission[i].created_at != null && hospitalCommission[i].created_at != 'null') {
            date[i] = hospitalCommission[i].created_at;
            newdate[i] = date[i].toLocaleDateString();
        }
    }
    res.render('pages/hospital/commission', {
        'loginUser': req.session.user_details,
        hospitalCommission,
        newdate,
    });
   //  console.log(hospitalCommission);

});


//'-------------------------------------  Hospital-commission list- end----------------------------// '




//'-------------------------------------  Hospital-Receipts-list- start----------------------------// '

router.get('/receipts', checkUserSession, async function (req, res) {
    let district = req.session.user_details.district;
    let [err, userReceiptDetails] = await tables.billDetailsTable.getUserReciptsDetails(district);

    res.render('pages/hospital/receipts', {
        'loginUser': req.session.user_details,
        userReceiptDetails,

    });
});
router.get('/receipt-view/:id', checkUserSession, async function (req, res) {

    let billId = req.params.id;
    const [err, billUsersDetails] = await tables.billDetailsTable.getBillUsersDetails({
        "status": 1,
        "bill_id": billId
    });
    res.render('pages/hospital/receipt-view', {
        'loginUser': req.session.user_details,
        billUsersDetails
    });
    

});



router.post('/update-bill-status', checkUserSession, async function (req, res) {
    let billId = req.body.bill_id;
    let userId = req.body.user_id;
    
    const [err, updateQuery] = await tables.billDetailsTable.updateBill({
        'payment_status': 1
    }, {
        'bill_id': billId
    });
    const [err1, updateQuery1] = await tables.cardDataTable.updateCard({
        'offer_utilize': 1
    }, {
        'user_id': userId
    });
  
    return res.send({
        'success': true,
        'message': "Payment has been done succeessfully",
        "last_bill_id": billId
    });
});


router.get('/receipt-view-list/:id', checkUserSession, async function (req, res) {
    let receiptId = Buffer.from(req.params.id, 'base64').toString();
    receiptId = receiptId.split('=');
  //  console.log(receiptId, "receiptId");



    const [err, userWithReceiptDetails] = await tables.billDetailsTable.getBillUsersDetails({
        'bill_id': receiptId[1]
    });

    console.log(userWithReceiptDetails);
    res.render('pages/hospital/generated-receipt', {
        'loginUser': req.session.user_details,
        userWithReceiptDetails,

    });


})


//'-------------------------------------  Hospital-Receipts list- end----------------------------// '


function checkUserSession(req, res, next) {
    if (req.session.user_details) {
        if (req.session.user_details.status == 0) {
            return res.redirect(req.protocol + '://' + req.get('host') + '/super-admin/customers');
        } else if (req.session.user_details.status == 1) {
            next();
        } else {
            return res.redirect(req.protocol + '://' + req.get('host') + '/agent/chat-window');
        }
    } else {
        return res.redirect(req.protocol + '://' + req.get('host') + '/hospital/login');
        //next();
    }
}


function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    return timestamp + random;
}




module.exports = router;