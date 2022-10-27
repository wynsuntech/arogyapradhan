var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkDistributor: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from distributor where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
      



   
        checkDistributorLogin: function (email, password) {
                return new Promise((resolve) => {
                db.connection.getConnection(function (err, connection) {
                        if (err) {
                        return resolve([err, null]);
                        }
                        let select = '';
                        let where = [];
                        connection.query("select * from distributor where email_id=?", email, function (err, response) {
                        
                        connection.release();

                        // console.log(response);
                        if (response && response.length) {
                        
                                let decryptPassword = atob(response[0].password);
                                
                                //console.log(decryptPassword);
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
    


        getDistributorDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from distributor where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getDistributorListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT d.district, db.distributor_id, h.hospital_name, db.distributor_image, db.distributor_name, db.contact_number, db.email_id, db.status, db.created_at, db.updated_at FROM distributor db JOIN hospital h ON db.hospital_name = h.hospital_id JOIN district d ON db.district = d.district_id WHERE db.status != 0 ORDER BY db.distributor_id DESC", function (err, response) {
                                        connection.release();
                                       // console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getDistributorListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select * from distributor where status !=0 order by distributor_id desc", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        insertDistributor: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into distributor (district,hospital_name,distributor_image,distributor_name,contact_number,email_id,password,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                       // console.log(err, "insert Errr");
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updateDistributor: function (updateQueryValue, condition) {

                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            resolve([err, null]);
                        }
                        let update = 'update distributor set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ?  and ') + ' = ?';
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

            getDistrictDetailsApi: function (disributorId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT d.district_id,d.district from distributor db JOIN district d on db.district = d.district_id WHERE db.distributor_id ="+disributorId+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },

};