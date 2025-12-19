var Models = require("../models/index.model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var credentials = require("../../../config/credentials");

module.exports = {
    // create user
    createUser: function(req, res) {
        var usr = req.body;
        var hashedPassword = bcrypt.hashSync(usr.Password, 8);
        usr.Password = hashedPassword;
        Models.User.create(usr).then(function(user) {
            res.status(200).json({
                "msg": "Adding User Successful",
                "data": user
            });
        }).catch(function(e) {
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    // change user password
    changeUserPassword: function(req, res) {
        var newPassword = bcrypt.hashSync(req.body.NewPassword, 8);
        var oldPassword = req.body.OldPassword;
        Models.User.findOne({
            where: {
                UserId: req.params.id
            },
            attributes: ["UserId", "UserEmail", "Password"]
        }).then(function(user) {
            var passwordIsValid = bcrypt.compareSync(oldPassword, user.Password);
            if (!passwordIsValid) {
                res.status(400).json({
                    "msg": "Password provided is wrong!",
                    "data": {
                        "auth": false
                    }
                });
            } else {
                Models.User.update({ Password: newPassword }, {
                    where: {
                        UserID: req.params.id
                    }
                }).then((affectedrows) => {
                    res.status(200).json({
                        "msg": "success",
                        "data": affectedrows
                    });
                });
            }
        }).catch(function(e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    // update user password
    updateUserPassword: function(req, res) {
        var newPassword = bcrypt.hashSync(req.body.NewPassword, 8);
        Models.User.findOne({
            where: {
                UserId: req.params.id
            },
            attributes: ["UserId", "UserEmail", "Password"]
        }).then(function(user) {
                Models.User.update({ Password: newPassword }, {
                    where: {
                        UserID: req.params.id
                    }
                }).then((affectedrows) => {
                    res.status(200).json({
                        "msg": "success",
                        "data": affectedrows
                    });
                });
            
        }).catch(function(e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    // login
    login: function(req, res) {
        var username = req.body.username;
        var pass = req.body.password;
        console.log(username);
        Models.User.findOne({
            where: {
                UserEmail: username
            },
            include: {
				model: Models.CompanyDetails,
				attributes: ["Modules"],
				as: 'Company'
			},
        }).then(function(user) {
            if (!user) {
                res.status(404).json({
                    "msg": "User not exists!",
                    "data": {
                        "auth": false,
                        "token": null
                    }
                });
            } else if (user.Status === "inactive") {
                res.status(403).json({
                    "msg": "User not allowed to login!",
                    "data": {
                        "auth": false,
                        "token": null
                    }
                });
            } else {
                var passwordIsValid = bcrypt.compareSync(pass, user.Password);
                if (!passwordIsValid) {
                    res.status(401).json({
                        "msg": "Password provided is wrong!",
                        "data": {
                            "auth": false,
                            "token": null
                        }
                    });
                } else {
                    var token = jwt.sign({
                        user_id: user.UserID,
                        role: user.Role
                    }, credentials.secret, {
                        //expiresIn: 86400 // expires in 24 hours
                    });
                    user.Password = "";
                    delete user["Password"];
                    res.status(200).json({
                        "msg": "success",
                        "data": {
                            "auth": true,
                            "token": token,
                            "user": user
                        }
                    });
                }
            }
        }).catch(function(e) {
            console.log(e);
            res.status(400).json({
                "msg": "Error occured while login",
                "data": e
            });
        });
    },
    // list users
    listUsers: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; // Get company filter from query parameter
        
        // Build where clause for filtering
        var whereClause = {};
        if (companyId && companyId !== '') {
            whereClause.CompanyId = companyId;
        }
        
        Models.User.findAndCountAll({
            offset: offset,
            limit: limit,
            where: whereClause,
            include: {
				model: Models.CompanyDetails,
				attributes: ["CompanyName"],
                as: 'Company'
			},
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function(users) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: users.count,
                    offset: offset,
                    limit: limit,
                    rows: users.rows
                }
            });
        }).catch(function(e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    // delete user
    deleteUserById: function(req, res) {
        Models.User.destroy({
            where: {
                UserId: req.params.id
            }
        }).then(user => {
            res.status(200).json({
                'msg': 'User has been deleted',
                "data": user
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting user',
                "data": error
            });
        });
    },
    // update user
    updateUserById: function(req, res) {
        Models.User.update(req.body, {
            where: {
                UserId: req.params.id
            }
        }).then((affectedrows) => {
            res.status(200).json({
                "msg": "success",
                "data": affectedrows
            });
        }).catch((error) => {
            console.log(error);
            res.status(400).json({
                "msg": "error",
                "data": error
            });
        });
    }
}
