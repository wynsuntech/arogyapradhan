var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
    checkUser: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }

                connection.query("select * from users where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                    connection.release();
                    console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },


    checkSingleUserLoginApi: function (email, password) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                let select = '';
                let where = [];
                connection.query("select * from users where user_email_id=?", email, function (err, response) {

                    connection.release();


                    if (response && response.length) {

                        let decryptPassword = utility.decrypt(response[0].password, response[0].hash);

                        if (password === decryptPassword) {
                            resolve([err, response[0]]);
                        } else {
                            resolve(["Invalid Password", null]);
                        }
                    } else {
                        resolve([err, response]);
                    }

                });

            });
        })
    },

    


    UserDetailsWithBill: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }

                connection.query("SELECT u.*, d.district, bd.* FROM users u JOIN district d ON u.district_id = d.district_id JOIN bill_details bd ON u.user_id = bd.user_id WHERE u.status != 0 ORDER BY u.user_id DESC", function (err, response) {
                    connection.release();
                    //console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },


    UserViewDetailsWithBill: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }

                connection.query("SELECT * from users join bill_details  on users.user_id = bill_details.user_id where users.user_id = '" + condition.user_id + "' ", function (err, response) {
                    connection.release();
                    //console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    getUserDetailsList: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }

                connection.query("SELECT u.*, d.district FROM users u JOIN district d ON u.district_id = d.district_id  WHERE u.status != 0 ORDER BY u.user_id DESC", function (err, response) {
                    connection.release();
                    //console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    UserDetailsWithBill: function (district) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.date_of_birth, u.user_email_id, u.aadhar_no, d.district, c.card_number FROM bill_details as bd LEFT JOIN users as u ON bd.user_id = u.user_id LEFT JOIN district as d ON bd.district_id = d.district_id LEFT JOIN card_data as c ON bd.user_id = c.user_id WHERE u.district_id= " + district + " AND bd.status != 0 ORDER BY bd.bill_id DESC", function (err, response) {
                    connection.release();
                    console.log(err, "sql:", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },






    singleUserDetails: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("SELECT u.user_id, u.first_name, u.last_name, u.aadhar_no, u.mobile_no, u.date_of_birth, u.user_email_id, u.created_at, d.district, a.agent_name,a.agent_name,a.agent_id,a.contact_number, h.hospital_name, c.card_number,c.start_date,c.end_date,c.offer_utilize FROM users AS u LEFT JOIN district AS d ON u.district_id = d.district_id LEFT JOIN agent AS a ON u.agent_id = a.agent_id LEFT JOIN hospital AS h ON d.district_id = h.district LEFT JOIN card_data as c ON u.user_id = c.user_id WHERE u.user_id= '" + condition.user_id + "'", function (err, response) {
                    console.log(err, "err", this.sql);
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },




    UserDetailBillPayment: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }

                connection.query("SELECT u.*, d.district, bd.* FROM users u JOIN district d ON u.district_id = d.district_id JOIN bill_details bd ON u.user_id = bd.bill_id  where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                    connection.release();
                    console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },



    insertRegistrationUserData: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }

                values.push(new Date());
                values.push(new Date());
                connection.query("insert into users (mobile,role,otp,status,created_at,updated_at) values (?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    agentListForSite: function (siteId, userId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                connection.query("select * from users where site_id= ? and user_id != ?", [siteId, userId], function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });
            });
        })
    },
    agentDataById: function (userId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                connection.query("select * from users where user_id = ?", [userId], function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });
            });
        })
    },

    checkAdminUserLogin: function (email, password) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                let select = '';
                let where = [];
                connection.query("select * from users where email=?", email, function (err, response) {

                    connection.release();


                    if (response && response.length) {

                        let decryptPassword = utility.decrypt(response[0].password,response[0].hash);

                        if (password === decryptPassword) {
                            resolve([err, response[0]]);
                        } else {
                            resolve(["Invalid Password", null]);
                        }
                    } else {
                        resolve([err, response]);
                    }

                });

            });
        })
    },




    checkUserLogin: function (email, password) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                let select = '';
                let where = [];
                connection.query("select * from users where user_email_id=?", email, function (err, response) {

                    connection.release();


                    if (response && response.length) {

                        let decryptPassword = atob(response[0].password);

                        if (password === decryptPassword) {
                            resolve([err, response[0]]);
                        } else {
                            resolve(["Invalid Password", null]);
                        }
                    } else {
                        resolve([err, response]);
                    }

                });

            });
        })
    },
    checkUseEmail: function (email) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                connection.query("select Updated Successfully* from users where email=? and status != 2", email, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    checkUserMobile: function (mobile) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                connection.query("select * from users where mobile=? and status!=2", mobile, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getCustomers: function () {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("select p.start_date,p.end_date,u.user_id,u.name,u.created_at,u.mobile,u.email,a.account_id,a.company_name,a.country_name,a.plan_id,u.status from users as u inner join accounts as a on a.account_id=u.account_id left join payments as p on p.account_id =a.account_id and p.status=1 where u.role=1 and (u.status=1 or u.status=3) group by u.user_id order by u.created_at desc", function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    resolve([err, response]);
                });

            });
        })
    },

    getUsersListAdminJoin: function () {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("SELECT u.*, d.district, a.agent_name, h.hospital_name, c.card_number FROM users AS u LEFT JOIN district AS d ON u.district_id = d.district_id LEFT JOIN agent AS a ON u.agent_id = a.agent_id LEFT JOIN hospital AS h ON u.district_id = h.district LEFT JOIN card_data AS c ON u.user_id = c.user_id WHERE u.role = 2 AND u.status != 0 ORDER BY u.user_id DESC", function (err, response) {
                    connection.release();
                    console.log(err, "account Table" ,this.sql);
                    resolve([err, response]);
                });

            });
        })
    },
    getEmployeesList: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("select u.user_id,u.name,u.created_at,u.mobile,u.email,u.preferences,s.site_name,a.account_id,a.company_name,a.country_name,a.plan_id from users as u inner join accounts as a on a.account_id=u.account_id left join sites as s on s.site_id=u.site_id where u.role=2 and u.status=1 and a.account_id = ? order by u.created_at desc", accountId, function (err, response) {
                    connection.release();
                    //console.log(err, "employesss Table")
                    resolve([err, response]);
                });

            });
        })
    },
    getUserDetails: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                if (condition.user_id) {
                    select = ' user_id = ?'
                    where.push(condition.user_id);
                }
                if (condition.mobile) {
                    select = ' mobile = ?'
                    where.push(condition.mobile);
                }
                connection.query("select * from users where " + select, where, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },


    getUserDetailsInfo: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                if (condition.user_id) {
                    select = ' user_id = ?'
                    where.push(condition.user_id);
                }
                if (condition.mobile) {
                    select = ' mobile = ?'
                    where.push(condition.mobile);
                }
                connection.query("select name,mobile from users where " + select, where, function (err, response) {
                    connection.release();
                    console.log(err, "sql", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    getUserDetailsAdmin: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                connection.query("select * from users where status != 0 and role = 2 order by user_id desc", function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getAgentDetailsAdmin: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                connection.query("select * from users where status != 0 order by user_id desc", function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getCustomerDetails: function (userId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                connection.query("select u.user_id,u.name,u.created_at,u.mobile,u.email,a.account_id,a.company_name,a.country_name,a.plan_id from users as u inner join accounts as a on a.account_id=u.account_id where u.role=1 and u.status=1 and u.user_id = ? order by u.created_at desc", userId, function (err, response) {
                    console.log(err, userId);
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getEmployeeDetails: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                if (condition.user_id) {
                    select = ' user_id = ?'
                    where.push(condition.user_id);
                }
                if (condition.mobile) {
                    select = ' mobile = ?'
                    where.push(condition.mobile);
                }
                connection.query("select user_id,name,email,mobile,site_id from users where " + select, where, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    insertUser: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                values.push(0);
                values.push(new Date());
                values.push(new Date());
                connection.query("insert into users (name,email,mobile,role,account_id,password,hash,status,site_id,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "insert Errr");
                    resolve([err, response]);
                });

            });
        })
    },


    userInsertApi: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }


                // values.push(0);
                values.push(new Date());
                values.push(new Date());
                connection.query("insert into users (role,password,district_id,agent_id,distributor_id,first_name,last_name,date_of_birth,mobile_no,user_email_id,user_image,aadhar_no,aadhar_image,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "insert Errr");
                    console.log('query', this.sql);
                    resolve([err, response]);
                });

            }); 
        })
    },

    insertRegistration: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }

                values.push(new Date());
                values.push(new Date());
                connection.query("insert into users (mobile,otp,role,status,created_at,updated_at) values (?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "err", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    insertEmployee: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                values.push('');
                values.push(new Date());
                values.push(new Date());
                connection.query("insert into users (name,email,mobile,role,account_id,password,hash,status,site_id,otp,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "insert Errr");
                    resolve([err, response]);
                });

            });
        })
    },
    updateUser: function (updateQueryValue, condition) {

        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                let update = 'update users set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ?  and ') + ' = ?';
                let updateKeyValues = Object.values(updateQueryValue);
                let conditonKeyValue = Object.values(condition);
                let updateValues = [...updateKeyValues, ...conditonKeyValue];
                console.log(update, "update");
                console.log(updateValues, "update");
                connection.query(update, updateValues, function (err, response) {
                    connection.release();
                    console.log(err, this.sql);
                    resolve([err, response]);
                });
            });
        })
    },
    getAgentCountBySite: function (siteId, accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("select count(*) as count from users as u where u.role=2 and u.status=1 and u.account_id = ? and u.site_id=?", [accountId, siteId], function (err, response) {
                    connection.release();
                    console.log(err, "employesss Table")
                    resolve([err, response[0].count]);
                });

            });
        })
    },

    getUsersDetails: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                if (condition.user_id) {
                    select = ' user_id = ?'
                    where.push(condition.user_id);
                }
                if (condition.mobile) {
                    select = ' mobile = ?'
                    where.push(condition.mobile);
                }
                connection.query("select * from users where " + select, where, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getUsersCardDetails: function (agentId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                connection.query("select c.*,u.hospital_id,u.arogya_pradhan_id,u.first_name,u.last_name,u.date_of_birth,u.mobile_no,u.user_email_id,u.user_district,u.user_image,u.aadhar_no,u.aadhar_image from card_data AS c LEFT JOIN users as u ON c.user_id = u.user_id WHERE c.user_id =" + agentId + " and c.status =1 ORDER BY card_id DESC", function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },

    getUsersCardDetailsListApi: function (agentId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("SELECT u.*, d.district_id, d.district, c.* FROM users as u LEFT JOIN district d ON u.district_id = d.district_id LEFT JOIN card_data as c ON u.user_id = c.user_id WHERE u.agent_id=" + agentId + " AND u.status != 0 ORDER BY u.user_id DESC", function (err, response) {
                    connection.release();
                    console.log(err, "sql:", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },
    getUsersCardDetailsApi: function (agentId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("SELECT u.*,c.* FROM users as u LEFT JOIN card_data as c on u.user_id = c.user_id WHERE u.agent_id =" + agentId + " and u.status !=0 ORDER by u.user_id DESC", function (err, response) {
                    connection.release();
                    console.log(err, "sql:", this.sql);
                    resolve([err, response]);
                });

            });
        })
    },

    getDistributorUsersListApi: function (districtId) {
        return new Promise((resolve) => {
                db.connection.getConnection(function (err, connection) {

                        if (err) {
                                resolve([err, null]);
                        }
                        let select = '';
                        let where = [];

                        connection.query("SELECT u.*, a.agent_name, h.hospital_name, d.district, c.* FROM users AS u LEFT JOIN agent AS a ON u.agent_id = a.agent_id LEFT JOIN hospital AS h ON u.district_id = h.district LEFT JOIN district AS d ON u.district_id = d.district_id LEFT JOIN card_data as c ON u.user_id = c.user_id WHERE u.district_id ="+districtId+" and u.status !=0 order by u.user_id desc", function (err, response) {
                                connection.release();
                                console.log(err,"sql:",this.sql);
                                resolve([err, response]);
                        });

                });
        })
},


};