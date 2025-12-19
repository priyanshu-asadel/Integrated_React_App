var Models = require("../models/index.model");
var bcrypt = require("bcryptjs");

module.exports = {
    createModuleName: function (req, res) {
		Models.ModulesName.create(req.body).then(function (module) {
			res.status(200).json({
				"msg": "Adding Module Name Successful",
				"data": module
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list module name
    listModuleName: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        Models.ModulesName.findAndCountAll({
            offset: offset,
            limit: limit,
            include: {
				model: Models.CompanyDetails,
				attributes: ["CompanyName"],
                as: 'Company'
			},
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function(module) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: module.count,
                    offset: offset,
                    limit: limit,
                    rows: module.rows
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
     // update module name
     updateModuleNameById: function(req, res) {
        Models.ModulesName.update(req.body, {
            where: {
                ModulesNameId: req.params.id
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
    },
     // delete module name
     deleteModuleNameById: function(req, res) {
        Models.ModulesName.destroy({
            where: {
                ModulesNameId: req.params.id
            }
        }).then(module => {
            res.status(200).json({
                'msg': 'Module Name has been deleted',
                "data": module
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting module name',
                "data": error
            });
        });
    },
}