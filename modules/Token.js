var jwt = require('jsonwebtoken');
const secret = "TutBanana";

exports.generateToken = function (payload, expires) {

    var token = jwt.sign(payload, secret, {
        expiresIn: expires
    });

    return token;
}

exports.getDataFromToken = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err)
                reject(false);
            else {
                var decoded = jwt.decode(token, { complete: true });
                resolve(decoded);
            }
        })
    })
}

exports.checkToken = function (req) {

    return new Promise((resolve, reject) => {

        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, secret, function (err, decoded) {
                if (err)
                    reject(null);

                var decoded = jwt.decode(token, { complete: true });
                resolve(decoded);
            })
        }

        reject(null);
    })
}

module.exports = exports;
