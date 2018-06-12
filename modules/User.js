var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

var dbUtil = require('../DButils');
var Tokens = require('./Token');
var util = require('./util');

//Register
router.post('/', (req, res) => {
    var newUser = req.body;
    var category = req.body.categories;

    dbUtil.execQuery(`insert into users values(
        '${newUser.firstName}','${newUser.lastName}','${newUser.city}','${newUser.country}','${newUser.email}','${newUser.question}','${newUser.answer}','${newUser.username}','${newUser.password}','${newUser.question2}','${newUser.answer2}','0'
        )`)
        .then((response) => {
            dbUtil.execQuery(`select id from users where email = '${newUser.email}' and username = '${newUser.username}' `)
                .then((response2) => {
                    var id = response2[0].id;
                    util.insertUserCategory(category, id).then((response) => {
                        res.sendStatus(200);
                    }).catch((err) => {
                        console.log(err);
                    })
                })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

//Gets {amount} of points from {user_id} categories
router.get('/:user_id/point/:amount', (req, res) => {
    var user_id = parseInt(req.params.user_id);
    var amount = parseInt(req.params.amount);

    var top = amount == 0 ? "" : `top ${amount}`;

    var token = Tokens.checkToken(req)
        .then((response) => {
            query()
        })
        .catch((err) => {
            res.status(500).send("Invalid Token")
        })

    var query = () => {
        dbUtil.execQuery("select * from points where category_id in (select c_id from usercategory where u_id = '" + user_id + "') order by rating DESC")
            .then((response) => {
                response = filterSameCategory(response, amount);
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
    }
})

//Filtering top points from distinct categories
function filterSameCategory(arr, num) {
    var new_arr = [];
    var times = 0;

    for (i in arr) {
        var item = arr[i];

        var isIn = false;
        for (j in new_arr) {
            var new_item = new_arr[j];

            if (new_item.category_id == item.category_id) {
                isIn = true;
                break;
            }
        }

        if (!isIn) {
            new_arr.push(item);
            times++;

            if (times == num)
                break;
        }
    }

    return new_arr;
}

//Gets questions of user by {email}
router.get('/:email/question', (req, res) => {
    var email = req.params.email;

    dbUtil.execQuery(`select question,question2 from users where email = '${email}' `)
        .then((response) => {
            if (response.length == 0)
                res.send({ "error": "Email cannot be found" })
            else
                res.send({ "questions": response });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

//Gets user data stored in token
router.get('/token/:token', (req, res) => {
    Tokens.getDataFromToken(req.params.token).then((response) => {
        res.send(response.payload);
    }).catch((response) => {
        res.send({ error: 'Invalid Token' });
    })
})

//Checks if token is still alive
router.get('/tokenIsAlive/:token', (req, res) => {
    Tokens.getDataFromToken(req.params.token).then((response) => {
        res.send(response.payload);
    }).catch((response) => {
        res.send({ error: 'Invalid Token' });
    })
})

//Gets users password if answers are matched to questions
router.post('/password', (req, res) => {
    var email = req.body.email;
    var answer = req.body.answer.trim().toLowerCase();
    var answer2 = req.body.answer2.trim().toLowerCase();

    dbUtil.execQuery(`select password from users where email = '${email}' and answer = LOWER('${answer}') and answer2 = LOWER('${answer2}')`)
        .then((response) => {
            if (response[0])
                res.send(response[0]);
            else
                res.send({ "error": "Answers are not match" })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

//User login
router.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    dbUtil.execQuery(`select id,isAdmin,username from users where username = '${username}' and password = '${password}'`)
        .then((response) => {
            if (response.length == 0) {
                res.status(500).send({ error: 'Username and password are not match' });
            }
            else {
                //TOKEN GENERATE
                var payload = {
                    userName: response[0].username,
                    id: response[0].id,
                    isAdmin: response[0].isAdmin
                }

                var token = Tokens.generateToken(payload, "1d");
                res.send({ "token": token });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

//Gets user's categories
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

//Gets user's name by {user_id}
router.get('/:user_id/name', (req, res) => {
    var user_id = parseInt(req.params.user_id);

    dbUtil.execQuery("select username from users where id = '" + user_id + "'")
        .then((response) => {
            res.send(response[0]);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })

})

//Gets user's favorite point by {user_id}
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

//Get's latest {amount} of favorite points by {user_id}
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
                util.getPointById(response, 0).then((response) => {
                    res.send(response);
                }).catch((err) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: err });
            })
    }
})

//Checks if {email} or {username} already taken
router.get('/checkExistence/:email/:username', (req, res) => {
    var email = req.params.email;
    var username = req.params.username;

    dbUtil.execQuery(`select id from users where email = '${email}' or username = '${username}'`)
        .then((response) => {

            if (response.length == 0) {
                res.send({ 'isExists': false });
            } else {
                res.send({ 'isExists': true });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err });
        })
})

//Updates {user_id} favorite points
router.put('/favorite', (req, res) => {
    var user_id = parseInt(req.body.user_id);
    var fps = req.body.fps;

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
                const total = fps.length - 1;
                for (var i in fps) {
                    const currentIndex = i;
                    var fp = fps[i];
                    var d = fp.date;

                    dbUtil.execQuery(`if exists (select * from UserFavoritePoint where u_id = '${user_id}' and p_id = '${fp.point_id}') begin update UserFavoritePoint set active = '1', fav_order = '${fp.fav_order}', date = '${d}'
                                where u_id ='${user_id}' and p_id = '${fp.point_id}' end else begin insert into UserFavoritePoint values('${fp.point_id}', '${user_id}', '1', '${d}', '${fp.fav_order}') end`)
                        .then((response_1) => {
                            if (total == currentIndex)
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