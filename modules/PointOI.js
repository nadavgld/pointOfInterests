var dbUtil = require('../DButils');

exports = module.exports;

exports.getAllPointsOfInterests = function (req, res) {
    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            // res.send(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getPointsByUserCategory = function (req, res) {
    var user_id = req.params.id;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getRandomPointOI = function (req, res) {
    var amount = parseInt(req.params.num);

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.getPointByName = function (req, res) {
    var name = req.params.name;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.addReviewToPoint = function (req, res) {
    var id = parseInt(req.body.point_id);
    var review = req.body.review;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.updateReviewToPoint = function (req, res) {
    var id = parseInt(req.body.point_id);
    var review = req.body.review;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.updatePointViews = function (req, res) {
    var id = parseInt(req.body.point_id);

    dbUtil.execQuery("select * from users")
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}