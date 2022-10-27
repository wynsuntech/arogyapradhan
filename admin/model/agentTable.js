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
        getAgentDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from agent where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        //console.log(err, "err", this.sql);
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

                                connection.query("SELECT a.*, h.hospital_name, d.district, u.name, u.ROLE, dist_name.distributor_name FROM agent a join hospital h ON a.district = h.district join district d ON a.district = d.district_id left join users u ON a.added_by = u.user_id left join distributor dist_name ON a.distributor_id = dist_name.distributor_id WHERE a.status = 1 ORDER BY a.agent_id DESC", function (err, response) {
                                        // connection.query("SELECT a.*, h.hospital_name, d.district, u.name, u.role, Concat(u.name, '( ', IF(u.role <= 1, 'Admin', 'Distributor'), ' )') AS added_by FROM agent a JOIN hospital h ON a.district = h.district JOIN district d ON a.district = d.district_id LEFT JOIN users u ON a.added_by = u.user_id WHERE a.status = 1 ORDER BY a.agent_id DESC", function (err, response) {
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

                                connection.query("SELECT a.*,h.hospital_name,d.district from agent as a left JOIN hospital as h ON a.hospital_id = h.hospital_id LEFT JOIN district as d ON a.district = d.district_id WHERE a.status !=0 ORDER by a.agent_id DESC", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getAgentListApi: function (districtId) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
        
                        if (err) {
                            resolve([err, null]);
                        }
                        let select = '';
        
                        let where = [];
        
                        connection.query("SELECT a.*, d.district_id, d.district, h.hospital_id, h.hospital_name FROM agent AS a LEFT JOIN district AS d ON a.district = d.district_id LEFT JOIN hospital as h on a.district = h.district WHERE a.district =" + districtId + " AND a.status != 0 ORDER BY a.agent_id DESC", function (err, response) {
                            connection.release();
                            console.log(err, "sql:", this.sql);
                            resolve([err, response]);
                        });
        
                    });
                })
            },



        insertAgent: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }                     
                                           
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into agent (distributor_id,district,hospital_id,agent_image,agent_name,contact_number,email_id,password,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                        console.log(err, "insert Errr");
                                        resolve([err, response]);
                                });

                        });
                })
        },


        

        agentInsertApi: function (values) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            resolve([err, null]);
                        }
                        // values.push(0);              
                                                                                                                              
                        values.push(new Date());
                        values.push(new Date());
                        connection.query("insert into agent (district,distributor_id,agent_image,agent_name,contact_number,email_id,password,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                            connection.release();
                            console.log(err, "insert Errr");
                        //     console.log(this.sql);

                            resolve([err, response]);
                        });
        
                    });
                })
            },
            



        updateAgent: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update agent set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                        console.log(err, "errrr",this.sql);
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

            getDistrictDetailsApi: function (agentId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT a.agent_id,district_id,d.district from agent a JOIN district d on a.district = d.district_id WHERE a.agent_id ="+agentId+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        


};