var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkDistrict: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from district where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        //console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        getDistrictDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from district where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        //console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getDistrictListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("select * from district where status !=0 order by district_id desc", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        
        
       


        insertdistrict: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into district (district,status,created_at,updated_at) values (?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                        console.log(err, "insert Errr");
                                        resolve([err, response]);
                                });

                        });
                })
        },
        
        updateDistrict: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update district set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

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