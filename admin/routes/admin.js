const express = require('express');
const router = express.Router();
const tables = require('../model/baseTable');
const utility = require('../utility/utility');
const moment = require('moment');
const constants = require('../utility/constants');
const csv = require('fast-csv');


const fs = require('fs');
const path = require('path');
const apis = require('../utility/apis');


const bodyParser = require("body-parser");
const multer = require('multer');
const app = express();
const ejs = require('ejs');
const axios = require('axios');
const notifications = require("../utility/notifications");


router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express'
    });
});



//profile section
router.get('/profile', checkUserSession, async function (req, res) {
    let userId = req.session.user_details.user_id;
    const [err, userDetails] = await tables.usersTable.getUsersDetails({
        'user_id': userId
    });
   // console.log(userDetails, "userDetails");
    res.render('pages/admin/profile', {
        'loginUser': req.session.user_details,
        'userDetails': userDetails,

    });

}).post('/profile', checkUserSession, async function (req, res) {
    let profileDetails = {};
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;
    let password = req.body.password;

    let encPassword = utility.encrypt(password);
    let userId = req.session.user_details.user_id;

    if (req.body.upload_file != "undefined") {
       // console.log("files", req.body.upload_file);
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
      //  console.log("file", file, req.body.upload_file.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
       // console.log(fileName);
        profileDetails.image_path = fileName;
    }

    profileDetails.name = name;
    profileDetails.email = email;
    profileDetails.mobile = mobile;

    let [err, submitResponse] = await tables.usersTable.updateUser(profileDetails, {
        'user_id': userId
    });
    return res.send({
        'success': true,
        'message': 'Updated Successfully'
    })
});

router.get('/user-list', checkUserSession, async function (req, res, next) {
    let accountId = req.session.user_details.account_id;
    let [err, userList] = await tables.usersTable.getUserDetailsAdmin();

    axios.get('http://www.pandasapi.com/panda_chat/api/get_profile?reg_em=pali.vamseekalyan@gmail.com')
        .then(resp => {
           // console.log(resp.data);
        })
        .catch(err => {
            // Handle Error Here
           // console.error(err);
        });

    res.render('pages/admin/user-list', {
        constants,
        'loginUser': req.session.user_details,
        userList,
        moment
    });
});






//---------------------------------district---- page-- start  --------------------------------//

router.get('/districts', checkUserSession, async function (req, res) {

     let [err1, districtList] = await tables.districtTable.getDistrictListAdmin();
 
     res.render('pages/admin/districts', {
         'loginUser': req.session.user_details,
         districtList,
     });
 });

 //add-zone

 router.get('/add-district', checkUserSession, async function (req, res) {
 
    let [err, districtList]= await tables.districtTable.getDistrictListAdmin();
   // console.log(districtList);
    res.render('pages/admin/add-district', {
    'loginUser': req.session.user_details,
    districtList,
   
    });
});

router.post('/add-district', checkUserSession, async function (req, res) {

    
    let district = req.body.district;
    if (district == "" || district == null || district == undefined) {
            messageDisplay("Please select district ");
            return false;
    }

    let districtDetails = [];
    districtDetails.push(district);
    districtDetails.push(1);

    let [checkSiteExistsErr, checkExists] = await tables.districtTable.checkDistrict({
    'district': district,
    'status': 1
    });
    if (checkExists && checkExists.length) {
        return res.send({
            'success': false,
            'message': "zone name already exists"
        });
    }
    let [err, submitResponse] = await tables.districtTable.insertdistrict(districtDetails);
    return res.send({
        'success': true,
        'message': 'Added Successfully'
    })

});


router.get('/edit-district/:id', checkUserSession, async function (req, res) {
    let districtId = Buffer.from(req.params.id, 'base64').toString();
    districtId = districtId.split('=');
    
    
    const [err, districtDetails] = await tables.districtTable.getDistrictDetails({
        'district_id': districtId[1]
    });
    //console.log(districtDetails);
    
    res.render('pages/admin/edit-district', {
        'loginUser': req.session.user_details,
        districtDetails  
    });

  }).post('/edit-district/:id', checkUserSession, async function (req, res) {

    let districtDetails = {};

    let districtId = Buffer.from(req.params.id, 'base64').toString();
    districtId = districtId.split('=');
    districtId = districtId[1];
    
    
    let district = req.body.district;
    
   
        if (district == "" || district == null || district == undefined) {
            messageDisplay("Please Enter zone name");
            return false;
        }

        let nameExpr = /^[a-zA-Z ]+$/.test(district);
        if (!nameExpr) {
                messageDisplay("Please enter valid zone name", 1500,
                        "error");
                
                return false;
        }

        if (!district.match('^[a-zA-Z ]{0,1000}$')) {
            messageDisplay("Please enter valid zone name");
          
            return false;
        }


        districtDetails.district = district;
        
    
    let [checkSiteExistsErr, checkExists] = await tables.districtTable.checkDistrict({
        'district': district,
        'status': 1
    });

    if (checkExists && checkExists.length ) {
        return res.send({
            'success': false,
            'message': "zone name is already exist"
        })
    }
    let [err, submitResponse] = await tables.districtTable.updateDistrict(districtDetails, {
        'district_id': districtId
    });
    return res.send({
        'success': true,
        'message': 'Updated Successfully'
    })
});

router.post('/delete-district', checkUserSession, async function (req, res) {
    let districtId = req.body.district_id;


    const [err, updateQuery] = await tables.districtTable.updateDistrict({
        'status': 0
    }, {
        'district_id': districtId
    });
    return res.send({
        'success': true,
        'message': "Deleted Successfully"
    });
}); 

//---------------------------------district-- page-- End--------------------------------//



//---------------------------------hospital-- page-- start  --------------------------------//

router.get('/hospital', checkUserSession, async function (req, res) {

   // let [err, hospitalList] = await tables.hospitalTable.getHospitauserListlListAdmin();

    let [err1, hospitalList] = await tables.hospitalTable.getHospitalListAdminJoin();

    res.render('pages/admin/hospital', {
        'loginUser': req.session.user_details,
        hospitalList,
    });
});

router.get('/add-hospital', checkUserSession, async function (req, res) {
 
    let [err, districtList]= await tables.districtTable.getDistrictListAdmin();
   
    res.render('pages/admin/add-hospital', {
    'loginUser': req.session.user_details,
    districtList,
   
    });
});

router.post('/add-hospital-submit', checkUserSession, async function (req, res) {

   

    if (req.body.hospital_logo == "undefined") {
        return res.send({
            'success': false,
            'message': "upload file required"
        });
    }

    let filePath = "";
    if (req.body.hospital_logo) {
       // console.log("files", req.body.hospital_logo);
        let temPath = req.body.hospital_logo.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
        //console.log("file", file, req.body.hospital_logo.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.hospital_logo.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.hospital_logo.name);
        filePath = fileName;
    }

    let hospital = req.body.hospital;

    //console.log(hospital);
    let district = req.body.district;
    let address = req.body.address;
    let billerName = req.body.billerName;
    let emailId = req.body.emailId;
    let contactNumber = req.body.contactNumber;
    let password="123456";
    let encPassword = utility.encrypt(password);
   // console.log(encPassword);
   
    if (hospital == "" || hospital == null || hospital == undefined) {
            messageDisplay("Please Enter hospital name");
            return false;
    }
    let nameExpr = /^[a-zA-Z ]+$/.test(hospital);
    if (!nameExpr) {
            messageDisplay("Please enter valid hospital name", 1500,
                    "error");
           return false;
    }

    if (!hospital.match('^[a-zA-Z ]{0,1000}$')) {
            messageDisplay("Please enter valid name");
             return false;
    }

    if (hospital.length < 3 || hospital.length > 15) {
            messageDisplay(
                    "name should contain 3 to 15 characters"
            );
             return false;
    }

    if (district == "" || district == null || district == undefined) {
            messageDisplay("Please select district ");
            return false;
    }

    if (address == "" || address == null || address == undefined) {
        messageDisplay("Please Enter address ");
        return false;
    }
           

    if (billerName == "" || billerName == null || billerName ==
                        undefined) {
                        messageDisplay("plese enter biller name");
                        return false;
                }

                let nameExprr = /^[a-zA-Z ]+$/.test(billerName);
                if (!nameExprr) {
                        messageDisplay("Please enter valid biller name", 1500,
                                "error");
                        
                        return false;
                }

                if (!billerName.match('^[a-zA-Z ]{0,1000}$')) {
                        messageDisplay("Please enter valid name");
                        
                        return false;
                }

                if (billerName.length < 3 || billerName.length > 15) {
                        messageDisplay(
                                "name should contain 3 to 15 characters"
                        );
                        
                        return false;
                }

                if (emailId == "" || emailId == null || emailId ==
                undefined) {
                messageDisplay("plese enter email id");                               
                return false;
        } 
     
    let hospitalDetails = [];
    hospitalDetails.push(district);
    hospitalDetails.push(hospital);
    hospitalDetails.push(filePath);
    hospitalDetails.push(address);
    hospitalDetails.push(billerName);
    hospitalDetails.push(emailId);
    hospitalDetails.push(encPassword.password);
    hospitalDetails.push(encPassword.hash);
    
    hospitalDetails.push(contactNumber);
    hospitalDetails.push(3);
    hospitalDetails.push(1);
   
    let [checkSiteExistsErr, checkExists] = await tables.hospitalTable.checkHospital({
        'biller_email_id':emailId,
        'status': 1
    });
    
    if (checkExists && checkExists.length ) {
        return res.send({
            'success': false,
            'message': "Biller emailId already exists"
        });
    }
    let [checkSiteExistsErr1, checkExists1] = await tables.hospitalTable.checkHospital({
        
        'contact_number':contactNumber,
        'status': 1
    });
   
    if (checkExists1 && checkExists1.length) {
        return res.send({
            'success': false,
            'message': "Biller contact number already exists"
        });
    }

    let [checkSiteExistsErr2, checkExists2] = await tables.hospitalTable.checkHospital({
        'hospital_name': hospital,
        'status': 1
    });
  ;
    if (checkExists2 && checkExists2.length) {
        return res.send({
            'success': false,
            'message': "hospital name already exists"
        });
    }

    let [err, submitResponse] = await tables.hospitalTable.insertHosptial(hospitalDetails);
    return res.send({
        'success': true,
        'message': 'Added Successfully'
    })

});


router.get('/edit-hospital/:id', checkUserSession, async function (req, res) {
    let hospitalId = Buffer.from(req.params.id, 'base64').toString();
    hospitalId = hospitalId.split('=');
   // console.log(hospitalId, "hospitalId");
    
    const [err, hospitalDetails] = await tables.hospitalTable.getHospitalDetails({
        'hospital_id': hospitalId[1]
    });
   
   // console.log(hospitalDetails, "hospitalDetails");
    let [serr, districtList] = await tables.districtTable.getDistrictListAdmin();
    res.render('pages/admin/edit-hospital', {
        'loginUser': req.session.user_details,
        'hospitalDetails': hospitalDetails[0],
        districtList,
        constants,
       
    });

  }).post('/edit-hospital/:id', checkUserSession, async function (req, res) {
    let hospitalDetails = {};
    let hospital = req.body.hospital;
    let district = req.body.district;
    let address = req.body.address;
    let billerName = req.body.billerName;
    let emailId = req.body.emailId;
    let contactNumber = req.body.contactNumber;
   // let hospital_logo = req.body.hospital_logo;
    
        if (hospital == "" || hospital == null || hospital == undefined) {
            messageDisplay("Please Enter hospital name");
            return false;
        }

        let nameExpr = /^[a-zA-Z ]+$/.test(hospital);
        if (!nameExpr) {
                messageDisplay("Please enter valid hospital name", 1500,
                        "error");
                
                return false;
        }

        if (!hospital.match('^[a-zA-Z ]{0,1000}$')) {
            messageDisplay("Please enter valid name");
          
            return false;
        }

        if (hospital.length < 3 || hospital.length > 15) {
            messageDisplay(
                    "name should contain 3 to 15 characters"
            );
            
            return false;
        }

        if (district == "" || district == null || district == undefined) {
         messageDisplay("Please select district name");
         return false;
        }

        if (address == "" || address == null || address == undefined) {
         messageDisplay("Please Enter address name");
         return false;
        }


        if (billerName == "" || billerName == null || billerName == undefined) {
            messageDisplay("Please Enter biller name");
            return false;
        }

        let nameExprr = /^[a-zA-Z ]+$/.test(billerName);
        if (!nameExprr) {
                messageDisplay("Please enter valid biller name", 1500,
                        "error");
                
                return false;
        }

        if (!billerName.match('^[a-zA-Z ]{0,1000}$')) {
                messageDisplay("Please enter valid name");
            
                return false;
        }

        if (billerName.length < 3 || billerName.length > 15) {
                messageDisplay(
                        "name should contain 3 to 15 characters"
                );
            
                return false;
        }

            if (emailId == "" || emailId == null || emailId == undefined) {
                messageDisplay("Please Enter emailId ");
                return false;
        }

        if (contactNumber == "" || contactNumber == null || contactNumber == undefined) {
                messageDisplay("Please Enter contact Number ");
                return false;
        }

    if (req.body.upload_file != "undefined") {
        //console.log("files", req.body.upload_file);
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
       // console.log("file", file, req.body.hospital_logo.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
        if (filePath) {
            hospitalDetails.logo = filePath;
        }
        
    }

    let hospitalId = Buffer.from(req.params.id, 'base64').toString();
    hospitalId = hospitalId.split('=');
    hospitalId = hospitalId[1];
   

    hospitalDetails.district = district;
    hospitalDetails.hospital_name = hospital;

    hospitalDetails.address=address;
    hospitalDetails.biller_name=billerName;
    hospitalDetails.biller_email_id=emailId;
    hospitalDetails.contact_number=contactNumber;
   
    let [checkSiteExistsErr, checkExists] = await tables.hospitalTable.checkHospital({
        'district_id': district,
        'hospital_name': hospital,
        'status': 1
    });

    if (checkExists && checkExists.length && checkExists[0].hospital_id != hospitalId) {
        return res.send({
            'success': false,
            'message': "hospital name is already exist"
        })
    }
    let [err, submitResponse] = await tables.hospitalTable.updateHospital(hospitalDetails, {
        'hospital_id': hospitalId
    });
    return res.send({
        'success': true,
        'message': 'Updated Successfully'
    })
});


router.post('/delete-hospital', checkUserSession, async function (req, res) {
    let hospitalId = req.body.hospital_id;


    const [err, updateQuery] = await tables.hospitalTable.updateHospital({
        'status': 0
    }, {
        'hospital_id': hospitalId
    });
    return res.send({
        'success': true,
        'message': "Deleted Successfully"
    });
});

//---------------------------------hospital-- page --end-- --------------------------------//



//---------------------------------agent-- page-- start  --------------------------------//

router.get('/agent', checkUserSession, async function (req, res) {

    let [err1, agentList] = await tables.agentTable.getAgentListAdminJoin();

    res.render('pages/admin/agent', {
        'loginUser': req.session.user_details,
        agentList,
        
    });
    //console.log(agentList);
});


router.get('/add-agent', checkUserSession, async function (req, res) {
 
    let [err, districtList]= await tables.districtTable.getDistrictListAdmin();
    // let [err1, hospitalList]= await tables.hospitalTable.getHospitalListAdmin();
    
    res.render('pages/admin/add-agent', {
    'loginUser': req.session.user_details,
    districtList,
   // hospitalList
   
    });
});


router.post('/add-hospital-agent', checkUserSession, async function (req, res) {

    let district = req.body.district;
   
    let districtId = district.split(",");

    if (districtId === "") {
        return res.send({
            'success': false,
            'message': "please send district"
        });
    }
    let [err, hospitalName] = await tables.hospitalTable.getHospitalNameByDistrictId(districtId);
// console.log(hospitalName);
    return res.send({
        "success": true,
        'hospitalName': hospitalName
    });
});

router.get('/add-agent-hospital',checkUserSession,async function ( req,res ){
    let district = req.body.district;
    
    let [err1, hospitalList]= await tables.hospitalTable.getHospitalListAdmin(district);
    res.render('pages/admin/add-agent', {
        'loginUser': req.session.user_details,
        
        hospitalList
       
        })
})


router.post('/add-agent-submit', checkUserSession, async function (req, res) {

    if (req.body.upload_file == "undefined") {
        return res.send({
            'success': false,
            'message': "agent image required"
        });
    }

    let filePath = "";
    if (req.body.upload_file) {
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
        
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
    }

    let hospital = req.body.hospital;
    
    let district = req.body.district;
    
    let agentName = req.body.agentName;

    let emailId = req.body.emailId;

    let password="123456";
    let encPassword = btoa(password);

    let contactNumber = req.body.contactNumber;
   
    let created_by = req.session.user_details.user_id;

    if (district == "" || district == null || district == undefined) {
            messageDisplay("Please select district ");
            return false;
    }

    if (hospital == "" || hospital == null || hospital == undefined) {
        messageDisplay("Please select hospital name");
        return false;
    }

    if (agentName == "" || agentName == null || agentName ==
        undefined) {
        messageDisplay("plese enter agentName");
        return false;
    }

    let nameExpr = /^[a-zA-Z ]+$/.test(agentName);
    if (!nameExpr) {
            messageDisplay("Please enter valid agent name", 1500,
                    "error");
            
            return false;
    }

    if (!agentName.match('^[a-zA-Z ]{0,1000}$')) {
            messageDisplay("Please enter valid name");
           
            return false;
    }

    if (agentName.length < 3 || agentName.length > 15) {
            messageDisplay(
                    "name should contain 3 to 15 characters"
            );
           
            return false;
    }

    if (contactNumber == "" || contactNumber == null || contactNumber ==
    undefined) {
    messageDisplay("plese enter contact number");                               
    return false;
    }

    if (emailId == "" || emailId == null || emailId ==
        undefined) {
        messageDisplay("plese enter email id");                               
        return false;
    }

    let agentDetails = [];
    
    agentDetails.push(created_by);
    agentDetails.push(district);
    agentDetails.push(hospital);
    agentDetails.push(filePath);
    agentDetails.push(agentName);
    agentDetails.push(contactNumber);
    agentDetails.push(emailId);
    agentDetails.push(encPassword);
    // agentDetails.push(encPassword.hash);
    agentDetails.push(1);

    
    let [checkSiteExistsErr, checkExists] = await tables.agentTable.checkAgent({
        'contact_number': contactNumber,
        'status': 1
    });
    if (checkExists && checkExists.length) {
        return res.send({
            'success': false,
            'message': "agent contact Number  already exists"
        });
    }
     
    let [checkSiteExistsErr1, checkExists1] = await tables.agentTable.checkAgent({
        'email_id': emailId,
        'status': 1
    });
    if (checkExists1 && checkExists1.length) {
        return res.send({
            'success': false,
            'message': "agent email Id  already exists"
        });
    }
    
    let [err, submitResponse] = await tables.agentTable.insertAgent(agentDetails);

    if(submitResponse.insertId) {
        return res.send({
            'success': true,
            'message': 'Added Successfully'
        })
    } else {
        return res.send({
            'success': false,
            'message': 'Something went to wrong please try again'
        })
    }

});



router.post('/edit-hospital-agent', checkUserSession, async function (req, res) {

    let district = req.body.district;
   
    let districtId = district.split(",");

    if (districtId === "") {
        return res.send({
            'success': false,
            'message': "please send district"
        });
    }
    let [err, hospitalName] = await tables.hospitalTable.getHospitalNameByDistrictId(districtId);
// console.log(hospitalName);
    return res.send({
        "success": true,
        'hospitalName': hospitalName
    });
});

router.get('/edit-agent/:id', checkUserSession, async function (req, res) {
    let agentId = Buffer.from(req.params.id, 'base64').toString();
    agentId = agentId.split('=');
   
    const [err, agentDetails] = await tables.agentTable.getAgentDetails({
        'agent_id': agentId[1]
    });
   
    let [serr, districtList] = await tables.districtTable.getDistrictListAdmin();
    let districtId = agentDetails[0].district;
    let hospitalDetails = await tables.hospitalTable.getHospitalDetails({"district":districtId});

    hospitalDetails =  hospitalDetails[1]
   // console.log(hospitalDetails);

    res.render('pages/admin/edit-agent', {
        'loginUser': req.session.user_details,
        'agentDetails': agentDetails,
        hospitalDetails,
        districtList,
      // hospitalList,
        constants,   
    });
  }).post('/edit-agent/:id', checkUserSession, async function (req, res) {
    
    let hospital = req.body.hospital;
    let district = req.body.district;
    let agentName = req.body.agentName;
    let emailId = req.body.emailId;
    let contactNumber = req.body.contactNumber;
    
    if (district == "" || district == null || district == undefined) {
            messageDisplay("Please select district name");
            return false;
    }

    if (hospital == "" || hospital == null || hospital == undefined) {
        messageDisplay("Please select hospital name");
        return false;
    }
 
    if (agentName == "" || agentName == null || agentName == undefined) {
            messageDisplay("Please Enter agent name");
            return false;
    }
    let nameExpr = /^[a-zA-Z ]+$/.test(agentName);
    if (!nameExpr) {
            messageDisplay("Please enter valid agent name", 1500,
                    "error");
            
            return false;
    }

    if (!agentName.match('^[a-zA-Z ]{0,1000}$')) {
        messageDisplay("Please enter valid name");
        
         return false;
   }

    if (agentName.length < 3 || agentName.length > 15) {
        messageDisplay(
                "name should contain 3 to 15 characters"
        );
        
         return false;
    }

    if (emailId == "" || emailId == null || emailId == undefined) {
        messageDisplay("Please Enter emailId ");
        return false;
    }



    if (contactNumber == "" || contactNumber == null || contactNumber == undefined) {
            messageDisplay("Please Enter contact Number ");
            return false;
    }
                                

    if (req.body.upload_file != "undefined") {
      //  console.log("files", req.body.upload_file);
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
       // console.log("file", file, req.body.hospital_logo.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
        if (filePath) {
            agentDetails.agent_image = filePath;
        }
    }

    let agentId = Buffer.from(req.params.id, 'base64').toString();
    agentId = agentId.split('=');
    agentId = agentId[1];
   
    let agentDetails = {};
    agentDetails.district = district;
    agentDetails.hospital_id = hospital;
    agentDetails.agent_name=agentName;
    
    agentDetails.email_id=emailId;
    agentDetails.contact_number=contactNumber;
    let [checkSiteExistsErr, checkExists] = await tables.agentTable.checkAgent({
    'district_id': district,
    'agent_name': agentName,
    'status': 1
    });

    if (checkExists && checkExists.length && checkExists[0].agent_id != agentId) {
        return res.send({
            'success': false,
            'message': "agent name is already exist"
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

router.post('/delete-agent', checkUserSession, async function (req, res) {
    let agentId = req.body.agent_id;
    //console.log(agentId);

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


//-----------------------------------  agent- ---page-- end  --------------------------------//

//-----------------------------------  distributor- ---page-- start --------------------------------//


router.get('/distributor', checkUserSession, async function (req, res) {

     let [err, distributorList] = await tables.distributorTable.getDistributorListAdminJoin();
 
     res.render('pages/admin/distributor', {
         'loginUser': req.session.user_details,
         distributorList,
     });
 });

 router.get('/add-distributor', checkUserSession, async function (req, res) {
 
    let [err, districtList]= await tables.districtTable.getDistrictListAdmin();
    //let [err1, hospitalList]= await tables.hospitalTable.getHospitalListAdmin();
  
    res.render('pages/admin/add-distributor', {
    'loginUser': req.session.user_details,
    districtList,
    //hospitalList
   
    });
});

router.post('/add-distributor-hospital', checkUserSession, async function (req, res) {

    let district = req.body.district;
    let districtId = district.split(",");
    if (districtId === "") {
        return res.send({
            'success': false,
            'message': "please send district"
        });
    }
    let [err, hospitalName] = await tables.hospitalTable.getHospitalNameByDistrictId(districtId);
 console.log(hospitalName);
    return res.send({
        "success": true,
        'hospitalName': hospitalName
    });
});


router.post('/add-distributor-submit', checkUserSession, async function (req, res) {

    if (req.body.upload_file == undefined || req.body.upload_file =="" || req.body.upload_file == null ) {
        return res.send({
            'success': false,
            'message': "distributor image required"
        });
    }

    let filePath = "";
    if (req.body.upload_file) {
       
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
        
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
    }

    let hospital = req.body.hospital;
    
    let district = req.body.district;
    
    let distributorName = req.body.distributorName;

    let emailId = req.body.emailId;

    let password="123456";
    let encPassword = btoa(password);

    let contactNumber = req.body.contactNumber;

    let distributorDetails = [];
    distributorDetails.push(district);
    distributorDetails.push(hospital);
    distributorDetails.push(filePath);
    distributorDetails.push(distributorName);
    distributorDetails.push(contactNumber);
    distributorDetails.push(emailId);
    distributorDetails.push(encPassword);
    distributorDetails.push(1);
   
    let [checkSiteExistsErr, checkExists] = await tables.distributorTable.checkDistributor({
        'distributor_name': distributorName,
        'status': 1
    });
    if (checkExists && checkExists.length) {
        return res.send({
            'success': false,
            'message': "distributor Name already exists"
        });
    }
    let [err, submitResponse] = await tables.distributorTable.insertDistributor(distributorDetails);
    return res.send({
        'success': true,
        'message': 'Added Successfully'
    })


});


router.post('/edit-distributor-hospital', checkUserSession, async function (req, res) {

    let district = req.body.district;
    let districtId = district.split(",");
    if (districtId === "") {
        return res.send({
            'success': false,
            'message': "please send district"
        });
    }
    let [err, hospitalName] = await tables.hospitalTable.getHospitalNameByDistrictId(districtId);
 console.log(hospitalName);
    return res.send({
        "success": true,
        'hospitalName': hospitalName
    });
});

router.get('/edit-distributor/:id', checkUserSession, async function (req, res) {

    let distributorId = Buffer.from(req.params.id, 'base64').toString();
    
    distributorId = distributorId.split('=');
    
    const [err, distributorDetails] = await tables.distributorTable.getDistributorDetails({
        'distributor_id': distributorId[1]        
    });

    let [serr, districtList] = await tables.districtTable.getDistrictListAdmin();

    let districtId = distributorDetails[0].district;
    let hospitalDetails = await tables.hospitalTable.getHospitalDetails({"district":districtId});

    hospitalDetails =  hospitalDetails[1]
   
  //  let [err1, hospitalList]= await tables.hospitalTable.getHospitalList();


    res.render('pages/admin/edit-distributor', {
        'loginUser': req.session.user_details,
        'distributorDetails': distributorDetails[0],
        hospitalDetails,
        districtList,
       // hospitalList,
        constants,
       
    });

  }).post('/edit-distributor/:id', checkUserSession, async function (req, res) {
    let distributorDetails = {};
    let hospital = req.body.hospital;
    let district = req.body.district;
    let distributorName = req.body.distributorName;
    let emailId = req.body.emailId;
    let contactNumber = req.body.contactNumber;

    if (req.body.upload_file != "undefined") {
       // console.log("files", req.body.upload_file);
        let temPath = req.body.upload_file.path;
        let randomDirectory = getRandomFileName();
        let file = path.join(__dirname, '..', 'static/images', randomDirectory);
       // console.log("file", file, req.body.hospital_logo.name);
        fs.mkdirSync(file);
        var newpath = path.join(file, req.body.upload_file.name);
        fs.rename(temPath, newpath, (err) => console.log(err));
        let fileName = path.join("images", randomDirectory, req.body.upload_file.name);
        filePath = fileName;
        if (filePath) {
            distributorDetails.distributor_image = filePath;
        }
    }

    let distributorId = Buffer.from(req.params.id, 'base64').toString();
    distributorId = distributorId.split('=');
    distributorId = distributorId[1];
   

    distributorDetails.district = district;
    distributorDetails.hospital_name = hospital;
    distributorDetails.distributor_name=distributorName;
    
    distributorDetails.email_id=emailId;
    distributorDetails.contact_number=contactNumber;
  
    let [checkSiteExistsErr, checkExists] = await tables.distributorTable.checkDistributor({
        'district_id': district,
        'distributor_name': distributorName,
        'status': 1
    });

    if (checkExists && checkExists.length && checkExists[0].distributor_id != distributorId) {
        return res.send({
            'success': false,
            'message': "agent name is already exist"
        })
    }
    let [err, submitResponse] = await tables.distributorTable.updateDistributor(distributorDetails, {
        'distributor_id': distributorId
    });
    return res.send({
        'success': true,
        'message': 'Updated Successfully'
    })
});


router.post('/delete-distributor', checkUserSession, async function (req, res) {
    let distributor_id = req.body.distributor_id;
   

    const [err, updateQuery] = await tables.distributorTable.updateDistributor({
        'status': 0
    }, {
        'distributor_id': distributor_id
    });
    return res.send({
        'success': true,
        'message': "Deleted Successfully"
    });
});

 //-----------------------------------  distributor ---page-- end  --------------------------------//

//-----------------------------------  receipt---page-- start  --------------------------------//

 router.get('/receipts', checkUserSession, async function (req, res) {

    let [err, billList] = await tables.billDetailsTable.getUserReciptsAdmin();
    let date =[];
    let newdate = [];

   for(let i = 0 ;i < billList.length;i++){
   date[i] = billList[i].created_at;

    newdate[i]=date[i].toLocaleDateString();
   }

    res.render('pages/admin/receipts', {
        'loginUser': req.session.user_details,
        billList,
        newdate,
    });
    //console.log(billList);
});


router.get('/receipt-bill-view/:id', checkUserSession, async function (req, res) {
    let billId = Buffer.from(req.params.id, 'base64').toString();
    billId = billId.split('=');
    // console.log(billId, "billId");
   
    const [err, userWithBillDetails] = await tables.billDetailsTable.getBillUsersDetails({
        'bill_id': billId[1]
    });
  
    res.render('pages/admin/receipt-bill-view', {
        'loginUser': req.session.user_details,
        userWithBillDetails,

    });
    
  })

//-----------------------------------  receipts ---page-- end  --------------------------------//

 //-----------------------------------  usersss ---page-- start  --------------------------------//


 router.get('/usersss', checkUserSession, async function (req, res) {

    let [err, usersssList] = await tables.usersTable.getUsersListAdminJoin();
    let date =[];
    let newdate = [];
   for(let i = 0 ;i < usersssList.length;i++){
   date[i] = usersssList[i].created_at;

    newdate[i] = date[i].toLocaleDateString();
   }
    
    res.render('pages/admin/usersss', {
        'loginUser': req.session.user_details,
        usersssList,
        newdate,
       
    }); 
    console.log(usersssList);
});


//single-user-view-page
router.get('/user-page-view/:id', checkUserSession, async function (req, res) {
    let userId = Buffer.from(req.params.id, 'base64').toString();
    userId = userId.split('=');
   
    const [err, singleUserDetails] = await tables.usersTable.singleUserDetails({
        'user_id': userId[1]
    });
    let date =[];
    let newdate = [];
   for(let i = 0 ;i < singleUserDetails.length;i++){
   date[i] = singleUserDetails[i].end_date;

    newdate[i] = date[i].toLocaleDateString();
   }
   


    res.render('pages/admin/user-view', {
        'loginUser': req.session.user_details,
        singleUserDetails,
        newdate

    });
   

  })


  router.get('/bill-view/:id', checkUserSession, async function (req, res) {
    let billId = Buffer.from(req.params.id, 'base64').toString();
    billId = billId.split('=');
    // console.log(billId, "billId");
   
    const [err, userWithBillDetails] = await tables.billDetailsTable.getBillUsersDetails({
        'bill_id': billId[1]
    });
  
    res.render('pages/admin/bill-view', {
        'loginUser': req.session.user_details,
        userWithBillDetails,

    });
    
  })

 //-----------------------------------  usersss---page-- end  --------------------------------//


 //-----------------------------------  billing---page-- start --------------------------------//

 router.get('/billing', checkUserSession, async function (req, res) {

    let [err, billsList] = await tables.billDetailsTable.getBillsListAdminJoin();
    let date =[];
    let newdate = [];

   for(let i = 0 ;i < billsList.length;i++){
   date[i] = billsList[i].created_at;

    newdate[i]=date[i].toLocaleDateString();
   }
    res.render('pages/admin/billing', {
        'loginUser': req.session.user_details,
        billsList,
        newdate
    });
  
});


router.get('/edit-view/:id', checkUserSession, async function (req, res) {
    let viewId = Buffer.from(req.params.id, 'base64').toString();
    
    viewId = viewId.split('=');
  // console.log(viewId, "viewId");
 
    let [serr, billList] = await tables.billingTable.getUserdetailsListAdmin();
    res.render('pages/admin/user-details', {
        'loginUser': req.session.user_details,
         billList,
       });
     //  console.log(billList);

  })

 //-----------------------------------  billing---page-- end  --------------------------------//

 router.get('/receipt-view-list/:id', checkUserSession, async function (req, res) {
    let receiptId = Buffer.from(req.params.id, 'base64').toString();
    receiptId = receiptId.split('=');
  //console.log(receiptId, "receiptId");
    const [err, userWithReceiptDetails] = await tables.billDetailsTable.getReceiptUsersDetailsAdmin({
        'bill_id': receiptId[1]
    });

    res.render('pages/admin/receipt-view', {
        'loginUser': req.session.user_details,
        userWithReceiptDetails,
    });

})

  //-----------------------------------  PAYMENT---page-- start--------------------------------//

  router.get('/payment', checkUserSession, async function (req, res) {

    let [err, paymentList] = await tables.paymentTable.getPaymentListAdminJoin();

    let date =[];
    let newdate = [];

   for(let i = 0 ;i < paymentList.length;i++){
   date[i] = paymentList[i].created_at;

    newdate[i]=date[i].toLocaleDateString();
   }

    res.render('pages/admin/payment', {
        'loginUser': req.session.user_details,
        paymentList,
        newdate
    });
   // console.log(paymentList);

});
   //-----------------------------------  payment---page-- end  --------------------------------//


   //-----------------------------------  commission--page-- start--------------------------------//

   router.get('/commission', checkUserSession, async function (req, res) {

    let [err, commissionList] = await tables.paymentTable.getCommissionListAdmin();
    let date =[];
    let newdate = [];

   for(let i = 0 ;i < commissionList.length;i++){
   date[i] = commissionList[i].created_at;
    newdate[i]=date[i].toLocaleDateString();
   }

    res.render('pages/admin/commission', {
        'loginUser': req.session.user_details,
        commissionList,
        newdate,
    });    
   // console.log(commissionList);
});

//--------------------------------------distributor commission start ----------------------------//
router.post('/distributor-commission', checkUserSession, async function (req, res) {
    
    let commissionId = req.body.commissionId;
   
    let [err, distributorCommission] = await tables.paymentTable.getDistributorCommission(commissionId);

    if(distributorCommission.length > 0){
            
        let distributorCommission_data = `
            <div class="mb-2 mt-4 d-flex dist-name">
             <p class="text-center distributername">Distributor Name <span class="dot-dot">:</span></p>
            <P class="text-center subname-dist">`+ distributorCommission[0].distributor_name + `</P>
            </div>

            <div class="mb-2 d-flex dist-name">
               <P class="distributername text-center">Commission Amt<span class="dot-dot">:</span></P>
               <P class="text-center subname-dist">` + distributorCommission[0].amount*10/100 + `</P>
            </div>

            <input type ="hidden" id="commission_id55" value=` + distributorCommission[0].users_id +`>`;

            return res.send({ "message": "Data Found", "response": true, "distributor_commission_details":  distributorCommission_data });    


    } else {
            return res.send({ "message": "invalid for commission", "response": false, "distributor_commission_details":  null });
        }
  
});


router.post('/distributor-ref-number', checkUserSession, async function (req, res) {
   
    let distributorRefId = req.body.distributorRefId;
   let commissionIdComm = req.body.commissionIdForRef;
   // console.log(distributorRefId);
   
    
    const [err, updateQuery] = await tables.paymentTable.updateDistributorCommission({
        'distributor_commission':200,
        'distributor_ref':distributorRefId,
        'distributor_commi_status':2
        
    }, {
        'users_id':commissionIdComm
    });
    return res.send({
        'success': true,
        'message': "updated distributor commission Successfully"
    });
});

//--------------------------------------distributor commission End ----------------------------//

//--------------------------------------hospital commission ----------------------------//
router.post('/hospital-commission', checkUserSession, async function (req, res) {
   
    let commissionId = req.body.commissionId;
   
    let [err, hospitalCommission] = await tables.paymentTable.getHospitalCommission(commissionId);
  
    if(hospitalCommission.length > 0){
            
        let hospitalCommission_data = `
            <div class="mb-2 mt-4 d-flex dist-name">
             <p class="text-center distributername">Hospital Name<span class="dot-dot">:</span></p>
            <P class="text-center subname-dist">`+ hospitalCommission[0].hospital_name + `</P>
            </div>

            <div class="mb-2 d-flex dist-name">
               <P class="distributername text-center">Commission Amt<span class="dot-dot">:</span></P>
               <P class="text-center subname-dist">` + hospitalCommission[0].amount*40/100 + `</P>
            </div>

            <input type ="hidden" id="commissionIdd5" value=` + hospitalCommission[0].users_id + `>`;

            return res.send({ "message": "Data Found", "response": true, "hospitalCommission_data":  hospitalCommission_data });    


    } else {
            return res.send({ "message": "invalid for commission", "response": false, "hospitalCommission_data":  null });
        }
  
});

router.post('/hospital-ref-number', checkUserSession, async function (req, res) {
   
    let hospitalRefNO = req.body.hospitalRefNO;
    let commissionIdComm = req.body.commissionIdForRef;
   
    const [err, updateQuery] = await tables.paymentTable.updateHospitalCommission({
        'hospital_commission':800,
        'hospital_ref':hospitalRefNO,
        'hospital_commi_status':2
    }, {
        'users_id':commissionIdComm
    });
    return res.send({
        'success': true,
        'message': "updated Hospital commission Successfully"
    });
});

//--------------------------------Agent commission-----------------------------------------//

router.post('/agent-commission', checkUserSession, async function (req, res) {
    
    let commissionIIId = req.body.commissionIIId;
   
    let [err, agentCommission] = await tables.paymentTable.getAgentCommission(commissionIIId);
    
    if(agentCommission.length > 0){
            
        let agentCommission_data = `
            <div class="mb-2 mt-4 d-flex dist-name">
             <p class="text-center distributername">Agent Name<span class="dot-dot">:</span></p>
            <P class="text-center subname-dist">`+ agentCommission[0].agent_name + `</P>
            </div>

            <div class="mb-2 d-flex dist-name">
               <P class="distributername text-center">Commission Amt<span class="dot-dot">:</span></P>
               <P class="text-center subname-dist">` + agentCommission[0].amount*40/100 + `</P>
            </div>

            <input type ="hidden" id="commissionIdd51" value=` + agentCommission[0].users_id + `>`;

            return res.send({ "message": "Data Found", "response": true, "agentCommission_Details":  agentCommission_data });    


    } else {
            return res.send({ "message": "invalid for commission", "response": false, "agentCommission_Details":  null });
        }
  
});
router.post('/agent-ref-number', checkUserSession, async function (req, res) {
   
    let agentRefNO = req.body.agentRefNO;
    let commissionIdComm = req.body.commissionIdForRef;
    //console.log(commissionIdRef);
   
    
    const [err, updateQuery] = await tables.paymentTable.updateAgentCommissionRefId({
        'agent_commission':800,
        'agent_ref':agentRefNO,
        'agent_commi_status':2
    }, {
        'users_id':commissionIdComm
    });
    return res.send({
        'success': true,
        'message': "updated Hospital commission Successfully"
    });
});


//------------------------------------------------view commission--------------------------//
router.post('/view-commission', checkUserSession, async function (req, res) {
    
    let commissionViewId = req.body.commissionView;
    const [err, viewCommissions] = await tables.paymentTable.getViewCommissions({
        'users_id': commissionViewId
    });
   
    if(viewCommissions.length > 0){
            
        let viewCommission_data = `
            <div class="mb-4">`;
            if(viewCommissions[0].agent_commi_status == 2){
                viewCommission_data = viewCommission_data +`<p>Agent : &nbsp; &nbsp; &nbsp;`+ viewCommissions[0].agent_commission + `  &nbsp; &nbsp; `+ viewCommissions[0].agent_ref + `  </p>` ;
            }else{
                viewCommission_data = viewCommission_data +`<p>Agent : &nbsp; Pending </p>`;
            }
            viewCommission_data = viewCommission_data + `</div>`+
            `<div class="mb-4">`;
            if(viewCommissions[0].hospital_commi_status == 2){
                viewCommission_data = viewCommission_data + `<p>Hospital: &nbsp; &nbsp;`+ viewCommissions[0].hospital_commission + `  &nbsp; &nbsp;`+ viewCommissions[0].hospital_ref + ` </p>`;
            }else{
                viewCommission_data = viewCommission_data +`<p>Hospital : &nbsp; Pending </p>`;
            }
            viewCommission_data = viewCommission_data + `</div>`+
            `<div class="mb-4">`;
            if(viewCommissions[0].distributor_commi_status == 2){
                viewCommission_data = viewCommission_data +`<p>Distributor: &nbsp; &nbsp;`+ viewCommissions[0].distributor_commission + `  &nbsp; &nbsp;`+ viewCommissions[0].distributor_ref + ` </p>`;
            }else{
                viewCommission_data = viewCommission_data +`<p>Distributor : &nbsp; Pending </p>`;
            }
            viewCommission_data = viewCommission_data + `</div>`;
            return res.send({ "message": "Data Found", "response": true, "viewCommission_Details":  viewCommission_data });    


    } else {
            return res.send({ "message": "invalid for commission", "response": false, "viewCommission_Details":  null });
        }
  
});

   //-----------------------------------  commission---page-- end  --------------------------------//

async function UploadCsvDataToMySQL(filePath, property) {

    let stream = fs.createReadStream(filePath);

    let csvData = [];
    let csvStream = csv
        .parse()
        .on("data", async function (data) {

            csvData.push(data);
        })
        .on("end", async function () {
            // Remove Header ROW
            csvData.shift();
            // Open the MySQL connection

            for (let i = 0; i < csvData.length; i++) {
                csvData[i].push(property);
                csvData[i].push(1);
                const [errs, submitResponse] = await tables.tipsTable.insertTipTwo(csvData[i]);

            }
            fs.unlinkSync(filePath)
        });
    stream.pipe(csvStream);
}


function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    return timestamp + random;
}

function checkUserSession(req, res, next) {
    if (req.session.user_details) {
    
        if (req.session.user_details.role == 0) {
            return res.redirect(req.protocol + '://' + req.get('host') + '/super-admin/customers');
        } else if (req.session.user_details.role == 1) {
            next();
        } else {
            return res.redirect(req.protocol + '://' + req.get('host') + '/agent/chat-window');
        }
    } else {
        return res.redirect(req.protocol + '://' + req.get('host') + '/admin-login/login');
        //next();
    }
}

module.exports = router;