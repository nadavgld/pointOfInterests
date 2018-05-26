var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

var dbUtil = require('../DButils');
var Tokens = require('./Token');
var util = require('./util');

router.get('/', (req, res) => {
    dbUtil.execQuery("select * from points")
        .then((response) => {
            util.getLatestReviewsToPoints(response, 2).then((response) => {
                res.send(response);
            }).catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/random/:amount', (req, res) => {
    var num = parseInt(req.params.amount);
    const rating = 2;

    dbUtil.execQuery(`select top ${num} * from points where rating >= '${rating}' order by NEWID()`)
        .then((response) => {
            util.getLatestReviewsToPoints(response, 2).then((response) => {
                res.send(response);
            }).catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})


router.get('/:name', (req, res) => {
    var name = req.params.name.trim().toLowerCase();

    dbUtil.execQuery("select * from points where LOWER(name) like '%" + name + "%'")
        .then((response) => {
            util.getLatestReviewsToPoints(response, 0).then((response) => {
                res.send(response);
            }).catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.post('/review', (req, res) => {
    var point_id = parseInt(req.body.point_id);
    var review = req.body.review;

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })


    //TIMESTAMP IS IN UTC (-3 HOURS)
    var query = () => {
        dbUtil.execQuery(`insert into reviews(u_id,p_id,description,timestamp,rating)
                    values ('${review.u_id}','${point_id}','${review.description}',CURRENT_TIMESTAMP,'${review.rating}')`)
            .then((response) => {
                dbUtil.execQuery(`select AVG(cast(rating as Float)) as 'avgRate' from reviews where p_id = '${point_id}'`)
                .then((avg) => {
                    dbUtil.execQuery(`update points set
                    rating = '${avg[0].avgRate}'
                    where id = '${point_id}'`)
                        .then((response) => {
                            console.log(response);
                        })
                    res.send(avg);
                })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ 'err_msg': err });
            })
    }
})

//WITH REVIEW ID
router.put('/review', (req, res) => {
    var point_id = parseInt(req.body.point_id);
    var review = req.body.review;

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {
        dbUtil.execQuery(`update reviews set
                    description = '${review.description}', timestamp = CURRENT_TIMESTAMP ,rating = '${parseInt(review.rating)}'
                    where p_id = '${point_id}' and id = '${review.id}'`)
            .then((response) => {

                dbUtil.execQuery(`select AVG(cast(rating as Float)) as 'avgRate' from reviews where p_id = '${point_id}'`)
                    .then((avg) => {
                        dbUtil.execQuery(`update points set
                        rating = '${avg[0].avgRate}'
                        where id = '${point_id}'`)
                            .then((response) => {
                                console.log(response);
                            })
                        res.send(avg);
                    })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

router.put('/views', (req, res) => {
    var point_id = parseInt(req.body.point_id);

    dbUtil.execQuery(`select views from points where id = '${point_id}'`)
        .then((response) => {

            if (response[0]) {
                var views = parseInt(response[0].views);

                dbUtil.execQuery(`update points set views = ${views + 1} where id = '${point_id}'`)
                    .then((response2) => {
                        res.send({'currentViews': (views + 1)});
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({ error: err });
                    })
            } else
                res.sendStatus(500);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

module.exports = router;