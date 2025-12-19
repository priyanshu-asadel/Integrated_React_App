var Models = require("../models/index.model");
var bcrypt = require("bcryptjs");

module.exports = {
    createCompany: function (req, res) {
        var company = req.body;
        var hashedPassword = bcrypt.hashSync(company.Password, 8);
        company.Password = hashedPassword;
		Models.CompanyDetails.create(company).then(function (company) {
			res.status(200).json({
				"msg": "Adding Company Successful",
				"data": company
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list company
    listCompany: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        Models.CompanyDetails.findAndCountAll({
            offset: offset,
            limit: limit,
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function(company) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: company.count,
                    offset: offset,
                    limit: limit,
                    rows: company.rows
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
     // update company
     updateCompanyById: function(req, res) {
        Models.CompanyDetails.update(req.body, {
            where: {
                CompanyId: req.params.id
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
     // delete company
     deleteCompanyById: function(req, res) {
        Models.CompanyDetails.destroy({
            where: {
                CompanyId: req.params.id
            }
        }).then(company => {
            res.status(200).json({
                'msg': 'Company has been deleted',
                "data": company
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting company',
                "data": error
            });
        });
    },
    getAllCompany: function (req, res) {
		Models.CompanyDetails.findAll({
			attributes: ["CompanyId", "CompanyName", "Modules"]
		}).then(function (company) {
			res.status(200).json({
				"msg": "success",
				"data": company
			});
		}).catch(function (e) {
			console.log(e);
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	}
}