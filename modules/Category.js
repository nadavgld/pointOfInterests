var express = require('express');
var router = express.Router();

var dbUtil = require('../DButils');

router.get('/', (req, res) => {
    dbUtil.execQuery("select name from categories")
        .then((response) => {
            // console.log(response);
            res.send(response.map((c)=> c.name));
            // res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });            
        })
})

module.exports = router;
