var mysql=require('mysql');
var Config=require('./config/config');
var pool = mysql.createPool({
    connectionLimit : 10,
    host: Config.database.host,
    user: Config.database.username,
    password: Config.database.password,
    port:Config.database.port,
    database: Config.database.database
});

module.exports ={
    connection:pool
};