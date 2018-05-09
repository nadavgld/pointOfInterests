var dbUtil = require('../DButils');

exports = module.exports;

exports.getAllCategories = function (req, res) {
    dbUtil.execQuery("select * from Categories")
        .then((response) => {
            console.log(response);
            // res.send(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
}
