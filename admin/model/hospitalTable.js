var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {

        checkHospital: function (condition) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            return resolve([err, null]);
                        }
                       
                        connection.query("select * from hospital where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                            connection.release();
                            console.log(err, "err", this.sql);
                            resolve([err, response]);
                        });
        
                    });
                })
            },

        checkHospitalUser: function (condition) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            return resolve([err, null]);
                        }
                       
                        connection.query("select * from hospital where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                            connection.release();
                          //  console.log(err, "err", this.sql);
                            resolve([err, response]);
                        });
        
                    });
                })
            },
        getHospitalDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from hospital where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                      //  console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        checkLogin: function (email, password) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            return resolve([err, null]);
                        }
                        let select = '';
                        let where = [];
                        connection.query("select * from hospital where biller_email_id=?", email, function (err, response) {
                            
                            connection.release();
        
                           
                            if (response && response.length) {
                                if (response[0].status == 2) {
                                    return resolve(["Your account is not active please contact admin", null]);
                                }
                                if (response[0].status == 3) {
                                    return resolve(["Your account is blocked please contact admin", null]);
                                }
                                if (response[0].status == 0) {
                                    return resolve(["Your account is not active", null]);
                                }
                                let decryptPassword = utility.decrypt(response[0].password, response[0].hash);
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


        getHospitalListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT  h.hospital_id,h.hospital_name,h.logo,h.address,h.biller_name,h.biller_email_id,h.contact_number,h.status,h.created_at,h.updated_at,d.district from hospital h JOIN district d on h.district=d.district_id  WHERE h.status !=0 ORDER by h.hospital_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        

        getHospitalNameByDistrictId: function (districtId) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            resolve([err, null]);
                        }
                        connection.query("SELECT hospital_name,hospital_id FROM hospital WHERE district = "+districtId+"  and status !=0", function (err, response) {
                            console.log(err, "err", this.sql);
                            connection.release();
                            resolve([err, response]);
                        });
        
                    });
                })
            },



      
        getHospitalList: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select hospital_id,hospital_name from hospital where status !=0 order by hospital_id DESC", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        insertHosptial: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into hospital (district,hospital_name,logo,address,biller_name,biller_email_id,password,hash,contact_number,role,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                        //console.log(err, "insert Errr",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updateHospital: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update hospital set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                        //console.log(err, "errrr");
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getHospitalUsersListJoin: function (district) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT u.*, d.district, c.card_number FROM users AS u LEFT JOIN district AS d ON d.district_id = u.district_id LEFT JOIN card_data as c ON u.user_id = c.user_id WHERE u.district_id = "+ district+" AND u.status != 0 ORDER BY u.user_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
       



};