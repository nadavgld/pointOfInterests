var express = require('express');
var router = express.Router();

var dbUtil = require('../DButils');

router.get('/', (req, res) => {
    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/random/:num', (req, res) => {
    var amount = parseInt(req.params.num);

    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/:name', (req, res) => {
    var name = req.params.name;

    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.post('/review', (req, res) => {
    var point_id = parseInt(req.body.point_id);
    var review = req.body.review;

    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.put('/review', (req, res) => {
    var point_id = parseInt(req.body.point_id);
    var review = req.body.review;

    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.put('/views', (req, res) => {
    var point_id = parseInt(req.body.point_id);

    dbUtil.execQuery("select * from points")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

module.exports = router;