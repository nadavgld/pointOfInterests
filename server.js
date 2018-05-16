var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var jwt = require('jsonwebtoken');

app.use(cors());
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB Util import
var dbUtil = require('./DButils');

// Modules Import
var Points = require('./modules/PointOI');
var Category = require('./modules/Category');
var User = require('./modules/User');

app.use('/user', User);
app.use('/point', Points);
app.use('/category', Category);

app.listen(PORT, () => { console.log(`listening to ${PORT}`) })