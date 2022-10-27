var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkBillDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from bill_details where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
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
                                connection.query("select * from bill_details where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                    //    console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },




        getBillUsersDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.created_at, u.aadhar_no, u.aadhar_image,u.date_of_birth, d.district, h.hospital_name, h.logo, c.card_number FROM bill_details bd JOIN users u ON bd.user_id = u.user_id JOIN district d ON u.district_id = d.district_id JOIN hospital h ON u.district_id = h.district LEFT JOIN card_data AS c ON bd.user_id = c.user_id WHERE bd.bill_id= '" + condition.bill_id + "'", function (err, response) {
                                       // console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getReceiptUsersDetailsAdmin: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.created_at, u.aadhar_no, u.aadhar_image, d.district, h.hospital_name, h.logo, c.card_number FROM bill_details AS bd LEFT JOIN users AS u ON bd.user_id = u.user_id LEFT JOIN district AS d ON bd.district_id = d.district_id LEFT JOIN hospital AS h ON bd.district_id = h.district LEFT JOIN card_data as c ON bd.user_id = c.user_id WHERE bd.bill_id = '" + condition.bill_id + "'", function (err, response) {
                                      //  console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },




        getBillsListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.date_of_birth, u.user_email_id, u.aadhar_no, d.district, c.card_number, h.hospital_name FROM bill_details AS bd LEFT JOIN users AS u ON bd.user_id = u.user_id LEFT JOIN district AS d ON bd.district_id = d.district_id LEFT JOIN card_data AS c ON bd.user_id = c.user_id LEFT JOIN hospital as h ON bd.district_id = h.district WHERE bd.status != 0 ORDER BY bd.bill_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getUsersBillListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT bd.*, u.*,h.*,d.* FROM bill_details bd left JOIN users u ON bd.user_id = u.user_id left JOIN hospital h ON u.hospital_id= h.hospital_id left JOIN district d ON u.district_id=d.district_id  ORDER BY bd.bill_id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getUserBillDetails: function () {
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


        getUserReciptsDetails: function (district) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.date_of_birth, u.user_email_id, u.aadhar_no, d.district, c.card_number FROM bill_details as bd LEFT JOIN users as u ON bd.user_id = u.user_id LEFT JOIN district as d ON bd.district_id = d.district_id LEFT JOIN card_data as c ON bd.user_id = c.user_id WHERE u.district_id= " + district + "  AND bd.payment_status = 1 ORDER BY bd.bill_id DESC", function (err, response) {
                                        connection.release();
                                       // console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },



        getUserReciptsAdmin: function (district) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.date_of_birth, u.user_image, u.aadhar_no, u.aadhar_image, d.district, c.card_number, h.hospital_name FROM bill_details AS bd LEFT JOIN users AS u ON bd.user_id = u.user_id LEFT JOIN district AS d ON bd.district_id = d.district_id LEFT JOIN card_data as c ON bd.user_id = c.user_id LEFT JOIN hospital as h ON bd.district_id = h.district WHERE bd.payment_status != 0 ORDER BY bd.bill_id DESC", function (err, response) {
                                        connection.release();
                                       // console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },





        getUserReciptsDownload: function (id) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT bd.*, u.first_name, u.last_name, u.mobile_no, u.user_email_id, u.card_number, u.date_of_birth, u.user_image, u.aadhar_no, u.aadhar_image, d.district FROM bill_details AS bd LEFT JOIN users AS u ON bd.user_id = u.user_id LEFT JOIN district AS d ON bd.district_id = d.district_id WHERE bd.bill_id= " + id + "  AND bd.payment_status = 1 ORDER BY bd.bill_id DESC", function (err, response) {
                                        connection.release();
                                      //  console.log(err, "sql:", this.sql);
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

                                connection.query("select * from bill_details where status !=0 order by bill_id desc", function (err, response) {
                                        connection.release();
                                      //  console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        insertBillDetails: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }

                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into bill_details (user_id,district_id,bill_number,bill_amount,bill_image,payable_amount,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                       // console.log(err, "insert Errr",this.sql);
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
                                let update = 'update bill_details set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                       // console.log(err, "errrr");
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getUserReceiptsListApi: function (userId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select bd.*, d.district, h.hospital_name, h.biller_name from bill_details as bd LEFT JOIN district as d ON bd.district_id = d.district_id LEFT JOIN hospital as h ON bd.district_id = h.district where user_id  =" + userId + " and payment_status !=0 order by bill_id desc", function (err, response) {
                                        connection.release();
                                      //  console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


};