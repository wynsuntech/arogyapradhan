var db = require('../database');
var tableName = 'arogya_pradhan';
var utility = require("../utility/utility");
module.exports =
{
    checkAccount: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    return resolve([err, null]);
                }
                let select = '';
                let where = [];
                for (const field in condition) {
                    select = select + '  ' + field + ' = ? and';
                    where.push(condition[field]);
                }
                console.log(select, "select Befire")
                select = utility.removeLastAnd(select);
                console.log("select After", select);
                connection.query("select * from accounts where " + select, where, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getPlanDetails: function (condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                if (condition.visitor_jid) {
                    select = ' visitor_jid = ?'
                    where.push(condition.visitor_jid);
                }

                connection.query("select name,extra_details,email,created_at as visited_time from visitors where " + select, where, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getAccountDetails: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                //let select = '';
                let where = [];
                //select = ' '
                where.push(accountId);
                connection.query("select a.*,p.*,p.preferences as plan_preferences,u.*,pa.term,pa.price,pa.plan_credits,pa.start_date,pa.end_date,max(pa.end_date) as renewDate from accounts as a inner join users as u on u.account_id=a.account_id and u.role=1 join plans as p on p.plan_id = a.plan_id left join payments as pa on pa.account_id=a.account_id and pa.plan_id=a.plan_id where a.account_id = ? order by pa.id desc", where, function (err, response) {
                    console.log(err, "error");
                    connection.release();
                    console.log("response", response)
                    resolve([err, response]);
                });

            });
        })
    },
    getAccounts: function () {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("select p.preferences,p.maximum_visitors,p.no_of_agents_per_site,p.maximum_sites,u.user_id,u.name,u.created_at,u.mobile,u.email,a.account_id,a.company_name,a.country_name,a.plan_id from users as u inner join accounts as a on a.account_id=u.account_id left join plans as p on p.plan_id =a.plan_id where u.role=1 and u.status=1  order by u.created_at desc", function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    resolve([err, response]);
                });

            });
        })
    },
    getPlans: function () {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];

                connection.query("select * from plans ", function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });
            });
        })
    },
    saveAccount: function (values) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                console.log(err);
                if (err) {
                    resolve([err, null]);
                }
                values.push(new Date());
                values.push(new Date());
                connection.query("insert into accounts (company_name,country_name,plan_id,preference,status,account_token,created_at,updated_at) values (?,?,?,?,?,?,?,?)", values, function (err, response) {
                    connection.release();
                    console.log(err, "insert Errr");
                    resolve([err, response]);
                });

            });
        })
    },
    updateAccount: function (updateQueryValue, condition) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let update = 'update accounts set ' + Object.keys(updateQueryValue).join(' =? ,') + ' = ? where ' + Object.keys(condition).join(' = ? and ') + ' = ?';

                let updateKeyValues = Object.values(updateQueryValue);
                let conditonKeyValue = Object.values(condition);

                let updateValues = [...updateKeyValues, ...conditonKeyValue];


                connection.query(update, updateValues, function (err, response) {
                    connection.release();
                    resolve([err, response]);
                });

            });
        })
    },
    getPlanPreference: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("select p.preferences from accounts as a left join plans as p on p.plan_id = a.plan_id where a.account_id = ?", [accountId], function (err, response) {
                    connection.release();
                    //console.log(err, "account Table")
                    // console.log(response[0].preferences, "response[0].preferences");
                    let data = [];
                    if (response.length && response[0].preferences) {
                        data = JSON.parse(response[0].preferences);
                    }
                    console.log(data, "=====");
                    //palnPrefList = data.replace('[', '').replace(']', '').replace(/"/g, '').split(',').map(x => x.trim());
                    //console.log(palnPrefList, "=====");
                    resolve([err, data]);
                });
            });
        })
    },
    getPlanMaxsites: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("select p.maximum_sites from accounts as a left join plans as p on p.plan_id =a.plan_id where a.account_id = ?", [accountId], function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    //let data = JSON.parse(response.preference);
                    let data = 0
                    if (response.length) {
                        data = response[0].maximum_sites;
                    }
                    resolve([err, data]);
                });
            });
        })
    },
    getPlanMaxAgentsPerSite: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("select p.no_of_agents_per_site from accounts as a left join plans as p on p.plan_id =a.plan_id where a.account_id = ?", [accountId], function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    //let data = JSON.parse(response.preference);
                    let data = 0
                    if (response.length) {
                        data = response[0].no_of_agents_per_site;
                    }
                    resolve([err, data]);
                });
            });
        })
    },
    getPlanMaxVisitors: function (accountId) {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {
                if (err) {
                    resolve([err, null]);
                }
                connection.query("select p.maximum_visitors, pa.start_date, pa.end_date from accounts as a left join plans as p on p.plan_id = a.plan_id left join payments as pa on pa.account_id=a.account_id and pa.plan_id=a.plan_id where a.account_id = ? and pa.status=1 order by pa.id desc", [accountId], function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    //let data = JSON.parse(response.preference);
                    let data = []
                    if (response !== null && response.length) {
                        data = response[0];
                    }
                    resolve([err, data]);
                });
            });
        })
    },
    getPaidAccounts: function () {
        return new Promise((resolve) => {
            db.connection.getConnection(function (err, connection) {

                if (err) {
                    resolve([err, null]);
                }
                let select = '';
                let where = [];
                connection.query("select p.preferences,p.maximum_visitors,p.no_of_agents_per_site,p.maximum_sites,u.user_id,u.name,u.created_at,u.mobile,u.email,a.account_id,a.company_name,a.country_name,a.plan_id from users as u inner join accounts as a on a.account_id=u.account_id left join plans as p on p.plan_id =a.plan_id where u.role=1 and u.status=1 and a.status=1 order by u.created_at desc", function (err, response) {
                    connection.release();
                    console.log(err, "account Table")
                    resolve([err, response]);
                });

            });
        })
    },

};


