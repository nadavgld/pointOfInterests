var express = require('express');
var router = express.Router();

var dbUtil = require('../DButils');

router.post('/', (req, res) => {
    var newUser = req.body;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.get('/:id/point', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    dbUtil.execQuery("select * from users")
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/:email/question', (req, res) => {
    var email = req.params.email;

    dbUtil.execQuery(`select question from users where email = '${email}' `)
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.post('/password', (req, res) => {
    var user_id = parseInt(req.body.user_id);
    var answer = req.body.answer;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.get('/:user_id/category', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    dbUtil.execQuery(`select * from users`)
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.get('/:user_id/favorite', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    dbUtil.execQuery(`select * from users`)
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.get('/:user_id/latest/:amount', (req, res) => {
    var user_id = parseInt(req.params.user_id);
    var amount = parseInt(req.params.amount);

    dbUtil.execQuery(`select * from users`)    
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.get('/checkExistence/:email/:username', (req, res) => {
    var email = req.params.email;
    var username = req.params.username;

    dbUtil.execQuery(`select * from users`)    
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

router.put('/favorite', (req, res) => {
    var user_id = parseInt(req.body.user_id);
    var favoritePoints = req.body.fp;

    dbUtil.execQuery("select * from users")
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

module.exports = router;