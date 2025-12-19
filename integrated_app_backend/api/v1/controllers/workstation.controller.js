var Models = require("../models/index.model");

module.exports = {
    createWorkStation: function (req, res) {
		Models.WorkStation.create(req.body).then(function (workStation) {
			res.status(200).json({
				"msg": "Adding WorkStation Successful",
				"data": workStation
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list workStation
    listWorkStation: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        Models.WorkStation.findAndCountAll({
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
        }).then(function(workStation) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: workStation.count,
                    offset: offset,
                    limit: limit,
                    rows: workStation.rows
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
     // update workStation
     updateWorkStationById: function(req, res) {
        Models.WorkStation.update(req.body, {
            where: {
                WorkStationId: req.params.id
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
     // delete workStation
     deleteWorkStationById: function(req, res) {
        Models.WorkStation.destroy({
            where: {
                WorkStationId: req.params.id
            }
        }).then(workStation => {
            res.status(200).json({
                'msg': 'WorkStation has been deleted',
                "data": workStation
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting workStation',
                "data": error
            });
        });
    },
    getAllWorkStation: function (req, res) {
		Models.WorkStation.findAll({
			attributes: ["WorkStationId", "WorkStationName", "CompanyId"]
		}).then(function (WorkStation) {
			res.status(200).json({
				"msg": "success",
				"data": WorkStation
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