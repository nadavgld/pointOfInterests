var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

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

//Points Of Interest
app.get('/getAllPointsOfInterests', (req, res) => {
    Points.getAllPointsOfInterests(req, res);
})

app.get('/getPointsByUserCategory/:id', (req, res) => {
    Points.getPointsByUserCategory(req, res);
})

app.get('/getRandomPointOI/:num', (req, res) => {

    Points.getRandomPointOI(req, res);
})

app.get('/getPointByName/:name', (req, res) => {
    Points.getPointByName(req, res);
})

app.post('/addReviewToPoint', (req, res) => {
    Points.addReviewToPoint(req, res);
})

app.put('/updateReviewToPoint', (req, res) => {
    Points.updateReviewToPoint(req, res);
})

app.put('/updatePointViews', (req, res) => {
    Points.updatePointViews(req, res);
})


//Categories
app.get('/getAllCategories', (req, res) => {

    Category.getAllCategories(req, res);
})

//Users
app.get('/getVerificationQuestion/:email', (req, res) => {
    User.getVerificationQuestion(req, res);
})

app.post('/passwordRetrieve', (req, res) => {
    User.passwordRetrieve(req, res);
})

app.post('/login', (req, res) => {
    User.login(req, res);
})

app.get('/getAllUserCategories/:id', (req, res) => {
    User.getAllUserCategories(req, res);
})

app.get('/getUserLatestFavorites/:id/:amount', (req, res) => {
    User.getUserLatestFavorites(req, res);
})

app.get('/checkIfUserExist/:email/:username', (req, res) => {
    User.checkIfUserExist(req, res);
})

app.post('/register', (req, res) => {
    User.register(req, res);
})

app.put('/updateFavoritePoints', (req, res) => {
    User.updateFavoritePoints(req, res);
})

app.listen(PORT, () => { console.log(`listening to ${PORT}`) })