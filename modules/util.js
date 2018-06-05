var dbUtil = require('../DButils');
var _this = this;

exports.getLatestReviewsToPoints = function (Points, amount) {
    // var top = amount == 0 ? "" : `top ${amount}`;
    return new Promise((resolve, reject) => {
        if (Points.length == 0)
            resolve([]);

        var promises = [];
        for (var i in Points) {
            const x = i;
            var point = Points[x];

            promises.push(new Promise((resolve, reject) => {
                dbUtil.execQuery(`select * from reviews where p_id = '${point.id}' order by timestamp desc`)
                    .then((response) => {
                        Points[x].total_reviews = response.length;
                        Points[x].reviews = [];
                        var top = amount == 0 ? response.length : amount;

                        for (var j = 0; j < top; j++) {
                            if (response[j] == undefined)
                                break;

                            Points[x].reviews.push(response[j]);
                        }

                        resolve(Points);

                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }));

            promises.push(new Promise((resolve, reject) => {
                dbUtil.execQuery(`select name from categories where id = '${point.category_id}'`)
                    .then((response) => {
                        Points[x].category = response[0].name;

                        resolve(Points);

                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }));
        }

        Promise.all(promises).then((data) => {
            resolve(data[Points.length - 1]);
        })
    });
}

exports.insertUserCategory = function (categories, uid) {
    return new Promise((resolve, reject) => {
        if (!categories || categories.length == 0)
            resolve();

        for (var i in categories) {
            const x = i;
            var category = categories[x];

            dbUtil.execQuery(`insert into usercategory(c_id,u_id) values ('${category}','${uid}')`)
                .then((response) => {

                    if (x == categories.length - 1) {
                        resolve();
                    }

                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });
}

exports.getPointById = function (Points) {
    return new Promise((resolve, reject) => {
        if (!Points || Points.length == 0)
            resolve();

        var promises = [];
        for (var i in Points) {
            const x = i;
            const fav = Points[x];
            const point = Points[x].p_id;

            promises.push(new Promise((resolve, reject) => {
                dbUtil.execQuery(`select * from points where id = '${point}'`)
                    .then((response) => {
                        Points[x] = response[0];
                        Points[x].fav = fav;

                        resolve(Points);

                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }));
        }
        Promise.all(promises).then((data) => {

            _this.getLatestReviewsToPoints(data[Points.length - 1], 0).then((response) => {
                resolve(response)
            })
        })
    });
}

module.exports = exports;
