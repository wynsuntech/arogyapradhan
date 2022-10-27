var express = require('express');
var path = require('path');
var app = express();
const cors = require('cors')
var crypto = require('crypto');
var uuid = require('node-uuid');
const db = require('./database.js');
var MultiParser = require('./multiparser');
var timeout = require('connect-timeout'); //express v4
var session = require('express-session');
var cookieParser = require('cookie-parser')
var MySQLStore = require('express-mysql-session')(session);


var sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, db.connection);

app.set('view engine', 'ejs');

app.use(session({
    secret: 'moon_eats',
    resave: true,
    store: sessionStore,
    genid: function (req) {
        return crypto.createHash('sha256').update(uuid.v1()).update(crypto.randomBytes(256)).digest("hex");
    },
    saveUninitialized: true,
}))

app.use(cookieParser());
app.use('/static', express.static('static'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});
app.use(express.static(path.join(__dirname, 'build')));

app.use(MultiParser());

app.use('/admin', require('./routes/admin'));
app.use('/admin-login', require('./routes/index'));
app.use('/user-api', require('./routes/user-api'));
app.use("/", require('./routes/client'));
app.use("/hospital", require('./routes/hospital'));
app.use("/apis", require('./routes/apis'));
app.use("/distributor-api", require('./routes/distributor-api'));
app.use(express.json());
app.use(function (req, res, next) {
    next();
});

// error handlers
app.use(function (err, req, res, next) {
    console.log(err);
});

module.exports = app;