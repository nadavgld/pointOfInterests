var dbUtil = require('../DButils');

exports.getLatestReviewsToPoints = function (Points, amount) {
    var top = amount == 0 ? "" : `top ${amount}`;
    return new Promise((resolve, reject) => {

        for (var i in Points) {
            const x = i;
            var point = Points[x];

            dbUtil.execQuery(`select ${top} * from reviews where p_id = '${point.id}' order by timestamp desc`)
                .then((response) => {
                    Points[x].reviews = response;

                    if (x == Points.length - 1) {
                        resolve(Points);
                    }

                })
                .catch((err) => {
                    console.log(err);
                    // res.status(500).send({ error: err });
                })
        }
    });
}

exports.insertUserCategory = function (categories, uid) {
    return new Promise((resolve, reject) => {

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

module.exports = exports;
