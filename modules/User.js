var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

var dbUtil = require('../DButils');
var Tokens = require('./Token');

router.post('/', (req, res) => {
    var newUser = req.body;

    dbUtil.execQuery(`insert into users values(
        '${newUser.firstName}','${newUser.lastName}','${newUser.city}','${newUser.country}','${newUser.email}','${newUser.question}','${newUser.answer}','${newUser.username}','${newUser.password}'
        )`)
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/:user_id/point', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {
        dbUtil.execQuery("select * from points where category_id in (select c_id from usercategory where u_id = '" + user_id + "')")
            .then((response) => {
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

router.get('/:email/question', (req, res) => {
    var email = req.params.email;

    dbUtil.execQuery(`select question from users where email = '${email}' `)
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.post('/password', (req, res) => {
    var user_id = parseInt(req.body.user_id);
    var answer = req.body.answer.trim().toLowerCase();

    dbUtil.execQuery(`select password from users where id = '${user_id}' and answer = LOWER('${answer}')`)
        .then((response) => {
            res.send(response[0]);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    dbUtil.execQuery(`select id from users where username = '${username}' and password = '${password}'`)
        .then((response) => {
            if (response.length == 0) {
                res.status(500).send({ error: 'Username and password are not match' });
            }
            else {
                //TOKEN
                var payload = {
                    userName: username,
                    id: response[0].id
                }

                var token = Tokens.generateToken(payload, "1d");
                res.send(token);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.get('/:user_id/category', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {
        dbUtil.execQuery("select * from categories where id in (select c_id from usercategory where u_id = '" + user_id + "')")
            .then((response) => {
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

router.get('/:user_id/favorite', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {

        dbUtil.execQuery(`select * from UserFavoritePoint where u_id = '${user_id}' and active = '1' order by fav_order asc`)
            .then((response) => {
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

router.get('/:user_id/latest/:amount', (req, res) => {
    var user_id = parseInt(req.params.user_id);
    var amount = parseInt(req.params.amount);

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {

        dbUtil.execQuery(`select top ${amount} * from UserFavoritePoint where u_id = '${user_id}' and active = '1' order by date desc`)
            .then((response) => {
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

router.get('/checkExistence/:email/:username', (req, res) => {
    var email = req.params.email;
    var username = req.params.username;

    dbUtil.execQuery(`select id from users where email = '${email}' or username = '${username}'`)
        .then((response) => {

            if (response.length == 0) {
                res.send(false);
            } else {
                res.send(true);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

router.put('/favorite', (req, res) => {
    var user_id = parseInt(req.body.user_id);
    var fps = req.body.fp;

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {
        dbUtil.execQuery("update UserFavoritePoint set active = '0', fav_order = '0' where u_id = '" + user_id + "'")
            .then((response) => {
                for (var i in fps) {
                    var fp = fps[i];

                    //USE THIS DATE FUNCTION IN CLIENT WHEN FAVORITE A POINT (!!)
                    var d = new Date().toISOString().slice(0, 19).replace('T', ' ');

                    dbUtil.execQuery(`update UserFavoritePoint set active = '1', fav_order = '${fp.fav_order}', date = '${d}'
                                where u_id ='${user_id}' and p_id = '${fp.point_id}'`)
                        .then((response_1) => {
                            res.sendStatus(200);
                        })
                        .catch((err_1) => {
                            console.log(err_1);
                            res.status(500).send({ error: err_1 });
                        })
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

module.exports = router;