const express = require('express');
const router = express.Router();
const tables = require('../model/baseTable');
const utility = require('../utility/utility');
const moment = require('moment');
const constants = require('../utility/constants');

const fs = require('fs');
const path = require('path');
const apis = require('../utility/apis');


const bodyParser = require("body-parser");
const multer = require('multer');
const app = express();
const ejs = require('ejs');



router.get('/', async function (req, res) {
        res.render('../client/test', {
        });
    });

module.exports = router;