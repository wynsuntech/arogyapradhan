var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkBill: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from billing where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        //console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        getBillDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from billing where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getBillListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT b.*,d.district,h.hospital_name,u.arogya_pradhan_id, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.user_district, u.aadhar_no, b.bill_no, b.amount_paid FROM billing b JOIN users u ON b.user_id = u.user_id JOIN hospital h ON b.hospital_id = h.hospital_id JOIN district d ON b.district_id = d.district_id WHERE b.status !=0 ORDER BY b.billing_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getUserdetailsListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT b.*,d.district,h.hospital_name,u.arogya_pradhan_id, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.user_district, u.aadhar_no, b.bill_no, b.amount_paid FROM billing b JOIN users u ON b.user_id = u.user_id JOIN hospital h ON b.hospital_id = h.hospital_id JOIN district d ON b.district_id = d.district_id WHERE b.status !=0 ORDER BY b.billing_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        


        getBillListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select * from billing where status !=0 order by payment_id desc", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        


        insertBilling: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into billing (district,hospital_name,logo,address,biller_name,biller_email_id,contact_number,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                        console.log(err, "insert Errr");
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updateBill: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update billing set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                        console.log(err, "errrr");
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

};