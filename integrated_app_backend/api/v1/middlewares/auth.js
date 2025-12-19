var jwt = require('jsonwebtoken');
var credentials = require('../../../config/credentials');

function verifyToken(req, res, next) {
    var header = req.headers['Authorization'] || req.headers['authorization'];
    var token = header ? header.split(" ")[1] : null;
    //console.log(token);
    if (!token) {
        res.status(403).send({
            "msg": 'Forbidden:No token provided.',
            "data": {
                "auth": false
            }
        });
    } else {
        jwt.verify(token, credentials.secret, function(err, decoded) {
            if (err) {
                res.status(401).send({
                    "msg": 'Unauthorised:Failed to authenticate User.',
                    "data": {
                        "auth": false
                    }
                });
            } else {
                req.userID = decoded.user_id;
                req.role = decoded.role
                next();
            }
        });
    }
}
module.exports = verifyToken;