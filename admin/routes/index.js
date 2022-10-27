var express = require('express');
var router = express.Router();
var tables = require('../model/baseTable');
const utility = require('../utility/utility');
const moment = require('moment');
const constants = require('../utility/constants');
const useragent = require('useragent');
// testing stripe keys

router.get('/', checkUserSession, function (req, res) {
    res.render('pages/login');
});
router.get('/login', checkUserSession, function (req, res) {
    res.render('pages/login');
});
router.get('/plans-list', async function (req, res) {
    const [err, plansList] = await tables.plansTable.getPlans();

    res.render('pages/plans-list', {
        plansList
    });

});
router.get('/signup', function (req, res) {
    res.render('pages/signup');
});
router.get('/forgot-password', function (req, res) {
    res.render('pages/forgot-password');
});
router.post('/signup', async function (req, res) {
    let customerName = req.body.customer_name;
    let mobile = req.body.mobile;
    let email = req.body.email;
    let countryName = req.body.country_name;
    let companyName = req.body.company_name;
    let durationType = req.body.duration_type;
    let plan = req.body.plan;
    let password = req.body.password;

    let save = [];
    let [checkErr, checkAccountResposne] = await tables.accountsTable.checkAccount({
        'company_name': companyName
    });
    if (checkAccountResposne && checkAccountResposne.length) {
        return res.send({
            'success': false,
            'message': "Company Already Exists"
        });
    }
    let [checkEmailErr, checkEmailAccountResposne] = await tables.usersTable.checkUseEmail(email);
    if (checkEmailAccountResposne && checkEmailAccountResposne.length) {
        return res.send({
            'success': false,
            'message': "Email Already Exists"
        });
    }
    if (checkEmailErr) {
        return res.send({
            'success': false,
            'message': "something went wrong "
        });
    }
    let [checkMobileErr, checkMobileAccountResposne] = await tables.usersTable.checkUserMobile(mobile);
    if (checkMobileAccountResposne && checkMobileAccountResposne.length) {
        return res.send({
            'success': false,
            'message': "Mobile Already Exists"
        });
    }
    if (checkMobileErr) {
        return res.send({
            'success': false,
            'message': "something went wrong "
        });
    }

    const accountToken = await utility.generateAccountId();

    save.push(companyName);
    save.push(countryName);
    save.push(plan);
    save.push('');
    save.push(0);
    save.push(accountToken);
    let [err, response] = await tables.accountsTable.saveAccount(save);
    let accountId = response.insertId;
    let encpassword = utility.encrypt(password);
    let userSave = [];
    userSave.push(customerName);
    userSave.push(email);
    userSave.push(mobile);
    userSave.push(1);
    userSave.push(accountId);
    userSave.push(encpassword.password);
    userSave.push(encpassword.hash);
    userSave.push(1);
    let [userErr, userSaveResponse] = await tables.usersTable.insertUser(userSave);

    let [planDetailsErr, planDetails] = await tables.plansTable.getPlanDetails({
        'plan_id': plan
    });

    let amount = 0;
    if (planDetails.length) {
        planDetails = planDetails[0];
        if (durationType == 1) {
            amount = planDetails.discount_price_month;
        } else if (durationType == 2) {
            amount = planDetails.discount_price_year;
        }
    }
    let maxiumSites = planDetails.maximum_sites;
    let maximumVisitors = planDetails.maximum_visitors;
    let noOfAgentsPerSite = planDetails.no_of_agents_per_site;
    let preferences = JSON.parse(planDetails.preferences) || '';
    let planCredits = {
        'preferences': preferences,
        'maximum_sites': maxiumSites,
        'no_of_agents_per_site': noOfAgentsPerSite,
        'maximum_visitors': maximumVisitors
    };
    planCredits = JSON.stringify(planCredits);
    let [paymentErr, paymentResponse] = await tables.paymentsTable.insertPayment({
        'plan_credits': planCredits,
        'account_id': accountId,
        'plan_id': plan,
        'status': 0,
        'total': amount,
        'term': durationType,
        'tenure': 1
    });
    return res.send({
        'success': true,
        'message': "Signup Successfully Completed Please Complete payment",
        'payment_link': '/payment/' + Buffer.from("paymentLink=" + paymentResponse.insertId).toString('base64')
    });
});
router.post('/plan-info', async function (req, res) {
    let planId = req.body.plan_id;
    const [err, planDetails] = await tables.plansTable.getPlanDetails({
        'plan_id': planId
    });

    return res.send({
        'success': true,
        'plan_info': planDetails[0]
    });

});
router.get('/chat-widget/:id', async function (req, res) {
    res.setHeader("Content-Type", "application/javascript");
    const baseUrl = req.protocol + '://' + req.get('host');
    let siteId = req.params.id;
    console.log(siteId, "siteIdssss");
    var cookie = req.cookies.sodlan_chat_widget;
    var chat_active = req.session.visitor_id || 0;
    const auth_token = req.session.auth_token || ""
    console.log(req.session.visitor_id, "auth_token:", auth_token);
    if (cookie === undefined) {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        res.cookie('sodlan_chat_widget', randomNumber, {
            maxAge: 315360000000,
            httpOnly: true
        });
        console.log('cookie created successfully');
    } else {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
    }
    let [err, siteDetails] = await tables.sitesTable.getSiteDetails({
        site_token: siteId
    });
    if (siteDetails && siteDetails.length) {
        siteDetails = siteDetails[0];
    }
    return res.render('pages/chatWidget/chat-widget', {
        'siteInfo': siteDetails,
        'baseUrl': baseUrl,
        "visitor_id": chat_active,
        "auth_token": auth_token,
        constants
    });
});
router.get('/chat-window/:id', async function (req, res) {
    let [err, planDetails] = await tables.sitesTable.checkSite({
        'site_token': req.params.id
    });
    if (planDetails && planDetails.length) {
        planDetails = planDetails[0];
    }
    console.log(planDetails);
    const baseUrl = req.protocol + '://' + req.get('host');
    if (planDetails.widget_fields) {
        planDetails.widget_fields = JSON.parse(planDetails.widget_fields);
    } else {
        planDetails.widget_fields = [];
    }
    if (planDetails.extra_fields) {
        planDetails.extra_fields = JSON.parse(planDetails.extra_fields);
    } else {
        planDetails.extra_fields = [];
    }
    var chat_active = req.session.visitor_id || 0;
    const auth_token = req.session.auth_token || ""
    var chatData = {};
    if (chat_active) {
        let [vError, details] = await tables.visitorsTable.getActiveVisitorDetailsById(chat_active);
        console.log(details, "details")
        if (details.length) {
            chatData = details[0]
        } else {
            chat_active = 0;
            req.session.visitor_id = 0;
        }
    }
    let [triggerErr, triggers] = await tables.triggersTable.triggersListBasedOnSite(planDetails.site_id)
    return res.render('pages/chatWidget/chat-window', {
        'triggers': triggers,
        planDetails: planDetails,
        "visitor_id": chat_active,
        "auth_token": auth_token,
        "chat_data": chatData,
        'baseUrl': baseUrl,
        'constants': constants
    });

})
router.get('/hospital-forgot-password', async function (req, res) {
   // console.log("hi");
    console.log(req.session.user_details, "----111");
    if (req.session.user_details) {
        console.log(req.session.user_details, "----");
        let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const agent = useragent.parse(req.headers['user-agent']);
        //const browser=agent.toAgent();
        const os = agent.os.toString();
        const activityTrack = {
            'log': 'Logout',
            'activity_type': 5,
            'user_type': req.session.user_details.role,
            'user_id': req.session.user_details.user_id,
            'account_id': req.session.user_details.account_id,
            'ip': ip,
            'device_os': os
        };
    }
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        return res.redirect(req.protocol + '://' + req.get('host') + '/admin-login/login');
    });
});

function checkUserSession(req, res, next) {
    if (req.session.user_details) {
        if (req.session.user_details.role == 0) {
            return res.redirect(req.protocol + '://' + req.get('host') + '/super-admin/customers');
        } else if (req.session.user_details.role == 1) {
            return res.redirect(req.protocol + '://' + req.get('host') + '/admin-login/login');
        } else {
            return res.redirect(req.protocol + '://' + req.get('host') + '/agent/chat-window');
        }
    } else {
        next();
    }
}
router.post('/verfiy-login', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    //const browser=agent.toAgent();
    const os = agent.os.toString();
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
    const [err, checkUser] = await tables.usersTable.checkAdminUserLogin(email, password);
    console.log(checkUser, "checkUser");
    console.log(err, "err")
    if (err || checkUser.length === 0) {
        return res.send({
            'success': false,
            'message': err || 'Invalid Login Details'
        });
    }
    

    const activityTrack = {
        'log': 'Login',
        'activity_type': 4,
        'user_type': checkUser['role'],
        'user_id': checkUser['user_id'],
        'account_id': checkUser['account_id'],
        'ip': ip,
        'device_os': os
    };

    req.session.user_details = checkUser;
    return res.send({
        'success': true,
        'message': 'success',
        'details': checkUser
    });
});

//'------------------------------ hospital Module- start------------------------'//

router.post('/verfiy-hospital-login', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    //const browser=agent.toAgent();
    const os = agent.os.toString();
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
    const [err, checkUser] = await tables.hospitalTable.checkLogin(email, password);
    console.log(checkUser, "checkUser");
    console.log(err, "err")
    if (err || checkUser.length === 0) {
        return res.send({
            'success': false,
            'message': err || 'Invalid Login Details'
        });
    }
    

    const activityTrack = {
        'log': 'Login',
        'activity_type': 4,
        'user_type': checkUser['role'],
        'user_id': checkUser['hospital_id'],
        'account_id': checkUser['account_id'],
        'ip': ip,
        'device_os': os
    };

    req.session.user_details = checkUser;
    return res.send({
        'success': true,
        'message': 'success',
        'details': checkUser
    });
});


router.get('/logout', async function (req, res) {
    console.log("hi");
    console.log(req.session.user_details, "----111");
    if (req.session.user_details) {
        console.log(req.session.user_details, "----");
        let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const agent = useragent.parse(req.headers['user-agent']);
        //const browser=agent.toAgent();
        const os = agent.os.toString();
        const activityTrack = {
            'log': 'Logout',
            'activity_type': 5,
            'user_type': req.session.user_details.role,
            'user_id': req.session.user_details.user_id,
            'account_id': req.session.user_details.account_id,
            'ip': ip,
            'device_os': os
        };
    }
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        return res.redirect(req.protocol + '://' + req.get('host') + '/admin-login/login');
    });
});



router.get('/hospital-logout', async function (req, res) {
    console.log("hi");
    console.log(req.session.user_details, "----111");
    if (req.session.user_details) {
        console.log(req.session.user_details, "----");
        let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const agent = useragent.parse(req.headers['user-agent']);
        //const browser=agent.toAgent();
        const os = agent.os.toString();
        const activityTrack = {
            'log': 'Logout',
            'activity_type': 5,
            'user_type': req.session.user_details.role,
            'user_id': req.session.user_details.hospital_id,
            'account_id': req.session.user_details.account_id,
            'ip': ip,
            'device_os': os
        };
    }
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        return res.redirect(req.protocol + '://' + req.get('host') + '/hospital/login');
    });
});





//'------------------------------ hospital Module end-------------------------'//

router.post('/forgot-password', async function (req, res) {
    let email = req.body.email;

    if (email == "") {
        return res.send({
            'success': false,
            'message': "Please Enter Email"
        });
    }

    const [err, checkUser] = await tables.usersTable.checkUser({
        'email': email
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
        const user = checkUser[0];


        const [updateErr, updateUser] = await tables.usersTable.updateUser({
            'otp': otp
        }, {
            user_id: user.user_id
        });

        const baseUrl = req.protocol + '://' + req.get('host');


        //sendMail.sendMail({ 'emailTemplate': 'reset-password', 'name': user.name, 'email': user.email, 'subject': 'reset Password', 'baseUrl': baseUrl, 'otp': otp });
        return res.send({
            'success': true,
            'message': 'success',
            'user': user.user_id
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid Email ID'
        });
    }
});
router.post('/verfiy-otp', async function (req, res) {
    let otp = req.body.otp;
    let userId = req.body.user;
    if (otp == "") {
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
            'message': 'success'
        });
    } else {
        return res.send({
            'success': false,
            'message': 'Invalid OTP'
        });
    }
});
router.post('/reset-password', async function (req, res) {
    let password = req.body.password;
    let userId = req.body.user;
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

    const [err, checkUser] = await tables.usersTable.updateUser({
        'password': encPassword.password,
        hash: encPassword.hash
    }, {
        user_id: userId
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
            'user_id': checkUser['user_id'],
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

router.post('/reset-password-two', async function (req, res) {
    let password = req.body.password;
    let userId = req.body.user;
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

    const [err, checkUser] = await tables.usersTable.updateUser({
        'password': encPassword.password,
        hash: encPassword.hash
    }, {
        user_id: userId
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
            'user_id': checkUser['user_id'],
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
router.get('/payment/:id', async function (req, res) {
    let paymentId = Buffer.from(req.params.id, 'base64').toString();
    paymentId = paymentId.split('=');
    paymentId = paymentId[1];
    const [err, paymentResponse] = await tables.paymentsTable.getPaymentUserDetails({
        'payment_id': paymentId
    });
    if (paymentResponse && paymentResponse.length) {
        return res.render('pages/payment', {
            'paymentId': req.params.id,
            'paymentDetails': paymentResponse[0]
        });
    }

});
router.post("/charge", (req, res) => {
    try {
        const stripe = utility.stripe;
        stripe.customers
            .create({
                name: req.body.name,
                email: req.body.email,
                source: req.body.stripeToken,
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                }
            })
            .then(customer =>
                stripe.charges.create({
                    amount: parseInt(req.body.amount) * 100,
                    'description': 'Software development services',
                    currency: "usd",
                    customer: customer.id
                })
            )
            .then(async (response) => {
                let update = {
                    'payment_data': JSON.stringify(response),
                    'transaction_id': response.id,
                    'status': 1
                };
                let paymentId = Buffer.from(req.body.paymentId, 'base64').toString();
                paymentId = paymentId.split('=');
                paymentId = paymentId[1];
                const [paymenterr, paymentResponse] = await tables.paymentsTable.getPaymentUserDetails({
                    'payment_id': paymentId
                });
                if (paymentResponse && paymentResponse.length) {
                    update.start_date = moment().format('YYYY-MM-DD');
                    update.date_of_payment = moment().format('YYYY-MM-DD');
                    let type = '';
                    if (paymentResponse[0]['term'] == 2) {
                        type = 'year';
                    } else {
                        type = 'month'
                    }
                    update.end_date = moment().add(parseInt(paymentResponse[0]['tenure']), type).format('YYYY-MM-DD');
                }
                const [accountErr, accountUpdate] = await tables.accountsTable.updateAccount({
                    'status': 1
                }, {
                    'account_id': paymentResponse[0]['account_id']
                })
                const [err, paymentUpdate] = await tables.paymentsTable.updatePayment(update, {
                    'id': paymentId
                });
                return res.end('Payment Success');
            })
            .catch(err => console.log(err));
    } catch (err) {
        res.send(err);
    }
});
router.post("/file-upload", async function (req, res) {
    try {
        let filePath = "";
        if (req.body.upload_file) {
            let fileName = new Date().getTime().toString();
            let uploadFileName = req.body.upload_file.name;
            uploadFileName = uploadFileName.split(' ').join('-');
            fileName = fileName + '/' + uploadFileName;
            let s3Bucket = require('../utility/upload-file');
            s3Bucket(fileName, req.body.upload_file).then(response => {
                return res.send({
                    "success": true,
                    "path": response
                });
            }).catch(err => {
                return res.send({
                    "success": false,
                    "message": err.message
                });
            });usersList
        }
    } catch (error) {
        return res.send({
            "success": false,
            "message": error.message
        });
    }

})
module.exports = router;