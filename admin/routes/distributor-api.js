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
const {connectLogger} = require('log4js');
const {Console} = require('console');



//distributor login
router.post('/verfiy-distributor-login', async function (req, res) {
    let token = "werfgyjthnASDFG";

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

    const [err, checkUser] = await tables.distributorTable.checkDistributorLogin(email, password);
   // console.log(checkUser);

    if (err || checkUser.length === 0) {
        return res.send({
            'success': false,
            'message': err || 'Invalid Login Details'
        });
    }


    return res.send({
        'success': true,
        'message': 'success',
        'details': checkUser,
        
    });
});


//distributor-forgot-password

router.post('/distributor-forgot-password', async function (req, res) {
    let token = "werfgyjthnASDFG";

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


    if (email == "" || email == null || email == undefined) {
        return res.send({
            'success': false,
            'message': "Please Enter Email"
        });
    }

    const [err, checkUser] = await tables.distributorTable.checkDistributor({
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
        const distributor = checkUser[0];


        const [updateErr, updateUser] = await tables.distributorTable.updateDistributor({
            'otp': otp
        }, {
            distributor_id: distributor.distributor_id
        });

        const baseUrl = req.protocol + '://' + req.get('host');



        return res.send({
            'success': true,
            'message': 'please verify otp and continue',
            'distributorId': distributor.distributor_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid Email ID'
        });
    }
});


//distributor-verify-otp

router.post('/distributor-verfiy-otp', async function (req, res) {

    let token = "werfgyjthnASDFG";

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

    if (otp == "" || otp == null || otp == undefined) {
        return res.send({
            'success': false,
            'message': "Please Enter Otp"
        });
    }


    let distributorId = req.body.distributor_id;


    if (distributorId == "" || distributorId == null || distributorId == undefined) {
        return res.send({
            'success': false,
            'message': "Please Enter distributor Id"
        });
    }


    const [err, checkUser] = await tables.distributorTable.checkDistributor({
        'otp': otp,
        distributor_id: distributorId
    });

    if (err) {
        return res.send({
            'success': false,
            'message': 'Invalid Login Details',

        });
    }
    if (checkUser && checkUser.length) {
        req.session.is_otp = true;
        return res.send({
            'success': true,
            'message': 'success',
            "otp": req.session.is_otp,
            'distributor': checkUser[0].distributor_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid OTP'
        });
    }
});

/////////
router.post('/distributor-reset-password', async function (req, res) {

    let token = "werfgyjthnASDFG";

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
    let disributorId = req.body.distributor_id;


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

    if (disributorId == "" || disributorId == undefined || disributorId == null) {
        return res.send({
            'success': false,
            'message': "disributor id required"
        })
    }

    if (password == confirm_password) {
        let encPassword = btoa(password);

        const [err, checkUser] = await tables.distributorTable.updateDistributor({
            'password': encPassword,
        }, {
            distributor_id: disributorId
        });
        if (err) {
            return res.send({
                'success': false,
                'message': 'Invalid Login Details'
            });
        }
        return res.send({
            'success': true,
            'message': 'Reset password updated successfully',
            


        });

    } else {
        return res.send({
            'success': false,
            'message': 'Invalid confirm password'
        });
    }

});

//add-agent by distributor:-
router.post('/add-agent-by-distributor', async function (req, res) {

    let token = "werfgyjthnASDFG";

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

    let fullName = req.body.fullName;
    let contactNumber = req.body.contactNumber;
    let emailId = req.body.emailId;
    let district = req.body.district;
    let distributorId = req.body.distributor_id;

    if (distributorId == "" || distributorId == null || distributorId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send distributor Id"
        });
    }


    if (fullName == "" || fullName == null || fullName == undefined) {
        return res.send({
            'success': false,
            'message': "Please send agent full name"
        });
    }
    if (contactNumber == "" || contactNumber == null || contactNumber == undefined) {
        return res.send({
            'success': false,
            'message': "Please send contact number"
        });
    }

    if (emailId == "" || emailId == null || emailId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send email id"
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
            'message': "user image required"
        });
    }


    let agentDetails = [];
    let password = "123456";
    let encPassword = btoa(password);
    agentDetails.push(district);
    agentDetails.push(distributorId);
    agentDetails.push(imagePath);
    agentDetails.push(fullName);
    agentDetails.push(contactNumber);
    agentDetails.push(emailId);
    agentDetails.push(encPassword);
    agentDetails.push(1);    


    let [checkSiteExistsErr, checkExists] = await tables.agentTable.checkAgent({
        'contact_number': contactNumber,
        'status': 1
    });
    if (checkExists && checkExists.length && checkExists.contact_number != contactNumber) {
        return res.send({
            'success': false,
            'message': "Agent contact number  already exists"
        });
    }

    let [checkSiteExistsErr1, checkExists1] = await tables.agentTable.checkAgent({
        'email_id': emailId,
        'status': 1
    });
    if (checkExists1 && checkExists1.length ) {
        return res.send({
            'success': false,
            'message': "Agent emailId  already exists"
        });
    }
    let [err, AgentDetails] = await tables.agentTable.agentInsertApi(agentDetails);


    if (AgentDetails) {
        return res.send({
            'success': true,
            'message': 'Added Successfully',
           
        })
    } else {
        return res.send({
            'success': false,
            'message': 'Something went to wrong please try again'
        })
    }
});


router.post('/delete-agent', async function (req, res) {

    let token = "werfgyjthnASDFG";

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
    if (agentId == "" || agentId == undefined || agentId == null) {
        return res.send({
            'success': false,
            'message': "agent Id required"
        });
    }

    const [err, updateQuery] = await tables.agentTable.updateAgent({
        'status': 0
    }, {
        'agent_id': agentId
    });
    return res.send({
        'success': true,
        'message': "Deleted Successfully"
    });
});

//edit -agent
router.post('/edit-agent', async function (req, res) {

    let agentId = req.body.agent_id;
    if (agentId == undefined || agentId == null || agentId == "") {
        return res.send({
            'success': false,
            'message': "please send agent id"
        });
    }

    let token = "werfgyjthnASDFG";

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

    let agentDetails = {};
    let fullName = req.body.fullName;
    let contactNumber = req.body.contact_number;
    let emailId = req.body.email_id;
    let district = req.body.district;


    // if (req.body.upload_image == "" || req.body.upload_image == null || req.body.upload_image == undefined) {
    //     return res.send({
    //         'success': false,
    //         'message': "upload your agent Image"
    //     });
    // }

    if (fullName == "" || fullName == null || fullName == undefined) {
        return res.send({
            'success': false,
            'message': "enter your Agent full Name"
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


    if (district == "" || district == null || district == undefined) {
        return res.send({
            'success': false,
            'message': "enter district"
        });
    }

// let path='';


// console.log(req.body.upload_image );
// return


    if (req.body.upload_image != "") {

        let temPath = req.body.upload_image.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);

        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_image.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_image.name);
        filePath = fileName;
        if (filePath) {
            agentDetails.agent_image = filePath;
        }
    }

    agentDetails.agent_name = fullName;
    agentDetails.contact_number = contactNumber;
    agentDetails.email_id = emailId;
    agentDetails.district = district;

    let [checkSiteExistsErr, checkExists] = await tables.agentTable.checkAgent({
        'agent_id': agentId,
        'contact_number': contactNumber,
        'status': 1
    });

    if (checkExists && checkExists.length && checkExists[0].agent_id != agentId) {
        return res.send({
            'success': false,
            'message': "mobile number is already exist"
        })
    }

    let [checkSiteExistsErr1, checkExists1] = await tables.agentTable.checkAgent({
        'agent_id': agentId,
        'email_id': emailId,
        'status': 1
    });

    if (checkExists1 && checkExists1.length && checkExists1[0].agent_id != agentId) {
        return res.send({
            'success': false,
            'message': "Email Id is already exist"
        })
    }
    let [err, submitResponse] = await tables.agentTable.updateAgent(agentDetails, {
        'agent_id': agentId
    });
    return res.send({
        'success': true,
        'message': 'Updated Successfully'
    })
});



router.post('/agent-list', async function (req, res) {
    let token = "werfgyjthnASDFG";
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
    let districtId = req.body.district;
    if (districtId == "" || districtId == undefined || districtId == null) {
        return res.send({
            'success': false,
            'message': "district Id  required"
        })
    }
    let [err, agentList] = await tables.agentTable.getAgentListApi(districtId);
    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'agent_list': agentList
    })
});


router.post('/add-agent-district', async function (req, res) {
    let token = "werfgyjthnASDFG";

    let tokenValue = req.body.token;

    if (tokenValue === "") {
        return res.send({
            'success': false,
            'message': "please send token"
        });
    }
    let disributorId = req.body.distributor_id;
    if (disributorId == "" || disributorId == undefined || disributorId == null) {
        return res.send({
            'success': false,
            'message': "disributor id required"
        })
    }
    if (token !== tokenValue) {
        return res.send({
            'success': false,
            'message': "your token incorrect"
        });
    }
    
    let [err, agentDistrictDetails] = await tables.distributorTable.getDistrictDetailsApi(disributorId);

    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'usersDistrictDetails': agentDistrictDetails,

    })
});


///

router.post('/view-user-card-details', async function (req, res) {
    let token = "werfgyjthnASDFG";

    let tokenValue = req.body.token;

    if (tokenValue === "") {
        return res.send({
            'success': false,
            'message': "please send token"
        });
    }
    let userId = req.body.user_id;
    if (userId == "" || userId == undefined || userId == null) {
        return res.send({
            'success': false,
            'message': "user Id required"
        })
    }
    if (token !== tokenValue) {
        return res.send({
            'success': false,
            'message': "your token incorrect"
        });
    }
    
    let [err, agentDistrictDetails] = await tables.cardDataTable.getuserCardDetailsApi(userId);
let viewuserCardDetails = agentDistrictDetails[0]
    return res.send({
        'success': true,
        'message': 'Added Successfully',
        'usersDistrictDetails': viewuserCardDetails,

    })
});
///



router.post('/update-card-status', async function (req, res) {
    let token = "werfgyjthnASDFG";

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
    let cardStatus = req.body.card_status;

    if (userId == "" || userId == null || userId == undefined) {
        return res.send({
            'success': false,
            'message': "Please send  userId"
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
        'user_id': userId
    });
    return res.send({
        'success': true,
        'message': "Card status updated successfully"
    });
});




router.post('/distributor-payment', async function (req, res) {
    let token = "werfgyjthnASDFG";

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

    let disributorId = req.body.distributor_id;
    if (disributorId == "" || disributorId == undefined || disributorId == null) {
        return res.send({
            'success': false,
            'message': "disributor id required"
        })
    }
    
    let [err, distributorPaymentDetails] = await tables.paymentTable.getDistributorUserPaymentApi(disributorId);

    return res.send({
        'success': true,
        'message': 'payment details',
        'distributorPaymentDetails': distributorPaymentDetails,

    })
});

router.post('/distributor-commission', async function (req, res) {
    let token = "werfgyjthnASDFG";

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

    let disributorId = req.body.distributor_id;
    if (disributorId == "" || disributorId == undefined || disributorId == null) {
        return res.send({
            'success': false,
            'message': "disributor id required"
        })
    }
    
    let [err, distributorCommissionDetails] = await tables.paymentTable.getDistributorCommissionDetailsApi(disributorId);

    return res.send({
        'success': true,
        'message': 'success',
        'distributorCommissionDetails': distributorCommissionDetails,

    })
});

router.post('/distributor-users-list', async function (req, res) {
    let token = "werfgyjthnASDFG";

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

    let districtId = req.body.district_id;
    if (districtId == "" || districtId == undefined || districtId == null) {
        return res.send({
            'success': false,
            'message': "district Id required"
        })
    }
    
    let [err, distributorUserList] = await tables.usersTable.getDistributorUsersListApi(districtId);

    return res.send({
        'success': true,
        'message': 'success',
        'distributorUsersList': distributorUserList,

    })
});


///-------------------------------------------------------------------------------------

function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    return timestamp + random;
}




module.exports = router;