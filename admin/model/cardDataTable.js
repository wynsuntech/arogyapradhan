var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkAgent: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from agent where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        getCardDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select *  from card_data where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getAgentListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT a.agent_id, a.agent_name,a.agent_image,a.contact_number,a.email_id,a.created_at,a.updated_at, h.hospital_name, d.district, u.name, u.role, CONCAT(u.name, '( ' , if(u.role <= 1, 'Admin', 'Distributor' ) , ' )' ) as added_by FROM `agent` a JOIN hospital h ON a.hospital_id = h.hospital_id JOIN district d ON a.district = d.district_id LEFT JOIN users u ON a.added_by = u.user_id WHERE a.status = 1", function (err, response) {
                                        connection.release();
                                        // console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getAgentListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select * from agent where status !=0 order by agent_id desc", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        insertCardDataApi: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into card_data (user_id,card_number,start_date,end_date,qr_code,card_status,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                      //  console.log(err, "card_sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updateCard: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update card_data set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                      //  console.log(err, "errrr", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        checkAgentLogin: function (email, password) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
                                connection.query("select * from agent where email_id=?", email, function (err, response) {

                                        connection.release();

                                        // console.log(response);
                                        if (response && response.length) {

                                                let decryptPassword = atob(response[0].password);

                                                console.log(decryptPassword);
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

        checkUserForBill: function (arogyaIdNo) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query(" SELECT c.*,u.district_id, u.first_name, u.last_name, u.date_of_birth, u.mobile_no, u.user_email_id, u.user_image, u.aadhar_no, u.aadhar_image,d.district FROM card_data c JOIN users u ON c.user_id = u.user_id JOIN district d ON u.district_id = d.district_id WHERE c.card_number ="+arogyaIdNo+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },

        getuserCardDetailsApi: function (userId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT c.*,u.first_name,u.last_name,u.date_of_birth,u.user_image,h.hospital_name,d.district FROM card_data c JOIN users u ON c.user_id = u.user_id JOIN hospital h ON u.district_id = h.district JOIN district d ON u.district_id = d.district_id WHERE c.card_status = 3 AND c.user_id="+userId+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        








};