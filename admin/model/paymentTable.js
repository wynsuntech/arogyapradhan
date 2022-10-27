var db = require('../database');
var tableName = 'users';
var utility = require("../utility/utility");
module.exports = {
        checkPayment: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        return resolve([err, null]);
                                }
                                connection.query("select * from payment where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        connection.release();
                                        //console.log(err, "erererererererer", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        getPaymentDetails: function (condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
                                if (err) {
                                        resolve([err, null]);
                                }
                                connection.query("select * from payment where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition), function (err, response) {
                                        console.log(err, "err", this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getPaymentListAdminJoin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.*, d.district, db.distributor_name, a.agent_name, c.card_number, h.hospital_name FROM payment AS p LEFT JOIN district AS d ON p.district_id = d.district_id LEFT JOIN distributor AS db ON p.district_id = db.district LEFT JOIN agent AS a ON p.agent_id = a.agent_id LEFT JOIN card_data AS c ON p.users_id = c.user_id LEFT JOIN hospital as h ON p.district_id = h.district WHERE p.status != 0 ORDER BY p.id DESC", function (err, response) {
                                        connection.release();
                                        //console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        insertPayment: function (values) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                                                                                                
                                                                                              
                                values.push(new Date());
                                values.push(new Date());
                                connection.query("insert into payment (district_id,distributor_id,users_id,agent_id,amount,payment_id,commission_gen_id,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?)", values, function (err, response) {
                                        connection.release();
                                        console.log(err, "insert Errr", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },
        updatePayment: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update payment set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

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
        getDistrictDetailsApi: function (distributorId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.*,a.agent_name FROM payment as p LEFT JOIN agent as a on p.agent_id = a.agent_id WHERE p.distributor_id =" + distributorId + " ", function (err, response) {
                                        connection.release();
                                        console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getAgentPaymentListApi: function (agentId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.*, u.user_id, u.first_name, u.last_name, u.mobile_no FROM payment as p LEFT JOIN users as u ON p.users_id = u.user_id WHERE p.agent_id  =" + agentId + " and p.status !=0 order by p.id desc", function (err, response) {
                                        connection.release();
                                        console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getUserPaymentListApi: function (userId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.*,c.card_number,c.end_date,u.first_name,u.last_name from payment p JOIN card_data c ON p.users_id = c.user_id JOIN users u ON p.users_id = u.user_id WHERE p.users_id =" + userId + " and p.status !=0 order by p.id desc", function (err, response) {
                                        connection.release();
                                        console.log(err, "sql:", this.sql);
                                        resolve([err, response]);
                                });

                        });
                })
        },


        getCommissionListAdmin: function () {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.*, d.district_id, d.district, db.distributor_id, db.distributor_name, a.agent_id, a.agent_name, c.card_number, h.hospital_name FROM payment AS p left join district AS d ON p.district_id = d.district_id left join distributor AS db ON p.district_id = db.district left join agent AS a ON p.agent_id = a.agent_id left join card_data AS c ON p.users_id = c.user_id left join hospital AS h ON p.district_id = h.district WHERE p.status != 0 ORDER BY p.id DESC", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                        //console.log(err,"err",this.sql);
                                });

                        });
                })
        },


        updateDistributorCommission: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update payment set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                       console.log(err, "errrr" ,this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },


        updateHospitalCommission: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update payment set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                       console.log(err, "errrr" ,this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },



        updateAgentCommissionRefId: function (updateQueryValue, condition) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let update = 'update payment set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                                let updateKeyValues = Object.values(updateQueryValue);
                                let conditonKeyValue = Object.values(condition);

                                let updateValues = [...updateKeyValues, ...conditonKeyValue];



                                connection.query(update, updateValues, function (err, response) {
                                       console.log(err, "errrr" ,this.sql);
                                        connection.release();
                                        resolve([err, response]);
                                });

                        });
                })
        },

        getDistributorCommissionDetailsApi: function (distributorId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.distributor_commission, p.distributor_ref, p.distributor_commi_status, p.amount, p.id AS payment_id, p.commission_gen_id, p.created_at, d.distributor_name FROM payment AS p LEFT JOIN distributor as d ON p.distributor_id = d.distributor_id WHERE p.distributor_id = '"+distributorId+"' AND p.distributor_commi_status != 0 ORDER BY p.id DESC", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        getDistributorUserPaymentApi: function (disributorId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.amount,p.payment_id,p.created_at,a.agent_name FROM payment as p LEFT JOIN agent as a ON p.agent_id = a.agent_id WHERE p.distributor_id  ="+disributorId+"  and p.status !=0 order by p.id desc", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },


        getHospitalCommissionDetails: function (district) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {

                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];

                                connection.query("SELECT p.created_at, p.hospital_commission, p.hospital_ref, p.hospital_commi_status, p.commission_gen_id, c.card_number FROM payment as p LEFT JOIN card_data as c ON p.users_id = c.user_id WHERE p.district_id= "+district+" and p.hospital_commi_status !=0 order by p.id desc", function (err, response) {
                                        connection.release();
                                        resolve([err, response]);
                                        console.log(err,"err",this.sql);
                                });

                        });
                })
        },

        getAgentCommission: function (commissionIIId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.amount,p.users_id, a.agent_name FROM payment as p LEFT JOIN agent as a  ON p.agent_id = a.agent_id WHERE p.users_id ="+commissionIIId+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        getHospitalCommission: function (commissionId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.amount,p.users_id, h.hospital_name FROM payment as p LEFT JOIN hospital as h ON p.district_id = h.district WHERE p.users_id ="+commissionId+" ", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        getDistributorCommission: function (commissionId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.amount,p.users_id, db.distributor_name FROM payment as p LEFT JOIN distributor AS db ON p.distributor_id = db.distributor_id WHERE p.users_id ="+commissionId+" ", function (err, response) {
                                        connection.release();
                                       // console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },



        getViewCommissions: function (condition) {
                return new Promise((resolve) => {
                    db.connection.getConnection(function (err, connection) {
                        if (err) {
                            return resolve([err, null]);
                        }
                       
                        connection.query("SELECT * from payment where " + Object.keys(condition).join(' =? and ') + " =? ", Object.values(condition),  function (err, response) {
                            connection.release();
                            console.log(err, "err", this.sql);
                            resolve([err, response]);
                        });
        
                    });
                })
            },

            getAgentCommissionDetailsApi: function (agentId) {
                return new Promise((resolve) => {
                        db.connection.getConnection(function (err, connection) {
        
                                if (err) {
                                        resolve([err, null]);
                                }
                                let select = '';
                                let where = [];
        
                                connection.query("SELECT p.agent_commission, p.agent_ref, p.agent_commi_status, p.amount,p.id as payment_id, p.commission_gen_id, p.created_at, a.agent_name FROM payment AS p LEFT JOIN agent as a ON p.agent_id = a.agent_id WHERE p.agent_id ="+agentId+" AND p.agent_commi_status !=0 ORDER BY p.id DESC", function (err, response) {
                                        connection.release();
                                        console.log(err,"sql:",this.sql);
                                        resolve([err, response]);
                                });
        
                        });
                })
        },

        
};