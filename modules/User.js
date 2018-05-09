var dbUtil = require('../DButils');

exports = module.exports;

exports.getVerificationQuestion = function (req, res) {
    var email = req.params.email;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.passwordRetrieve = function (req, res) {
    var user_id = parseInt(req.body.user_id);
    var answer = req.body.answer;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.login = function (req, res) {
    var newUser = req.body;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getAllUserCategories = function (req, res) {
    var user_id = parseInt(req.params.id);

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getUserLatestFavorites = function (req, res) {
    var user_id = parseInt(req.params.id);
    var amount = parseInt(req.params.amount);

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.checkIfUserExist = function (req, res) {
    var email = req.params.email
    var username = req.params.username;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.register = function (req, res) {
    var newUser = req.body;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.updateFavoritePoints = function (req, res) {
    var user_id = parseInt(req.body.user_id);
    var listOfPoints = req.body.fp;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}