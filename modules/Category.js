var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

var dbUtil = require('../DButils');
var Tokens = require('./Token');

//Gets all categories
router.get('/', (req, res) => {
    dbUtil.execQuery("select * from categories")
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

module.exports = router;
