var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkCommission: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from commission where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        //console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        getCommissionDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from commission where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        //console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        
       

            


        

        





           

            

           


        insertCommission: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into commission (district_id,district,status,created_at,updated_at) values (?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                       // console.log(err, "insert Errr");
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updateCommission: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update commission set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                      //  console.log(err, "errrr");
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },
        


       


        



        getAgentCommissionListApi: function (agentId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT a.agent_id, p.payment_id, p.created_at, p.amount FROM agent AS a LEFT JOIN payment AS p ON a.agent_id = p.agent_id WHERE a.agent_id  ="+agentId+" order by a.agent_id desc", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },


        


       






       



}



