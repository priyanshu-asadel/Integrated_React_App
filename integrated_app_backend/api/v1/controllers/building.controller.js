var Models = require("../models/index.model");

module.exports = {
    createBuilding: function (req, res) {
		Models.Building.create(req.body).then(function (building) {
			res.status(200).json({
				"msg": "Adding Building Successful",
				"data": building
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list building
    listBuilding: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; // Get company filter from query parameter
        var siteId = req.query.siteId; // Get site filter from query parameter
        
        // Build where clause for filtering
        var whereClause = {};
        if (siteId && siteId !== '') {
            whereClause.SiteId = siteId;
        }
        
        // Build include clause with company filtering
        var includeClause = {
            model: Models.Site,
            attributes: ["SiteName"],
            as: 'Site'
        };
        
        if (companyId && companyId !== '') {
            includeClause.where = {
                CompanyId: companyId
            };
        }
        
        Models.Building.findAndCountAll({
            offset: offset,
            limit: limit,
            where: whereClause,
            include: includeClause,
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function(building) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: building.count,
                    offset: offset,
                    limit: limit,
                    rows: building.rows
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
     // update building
     updateBuildingById: function(req, res) {
        Models.Building.update(req.body, {
            where: {
                BuildingId: req.params.id
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
     // delete building
     deleteBuildingById: function(req, res) {
        Models.Building.destroy({
            where: {
                BuildingId: req.params.id
            }
        }).then(building => {
            res.status(200).json({
                'msg': 'Building has been deleted',
                "data": building
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting building',
                "data": error
            });
        });
    },
    getAllBuilding: function (req, res) {
		Models.Building.findAll({
			attributes: ["BuildingId", "BuildingName", "SiteId"]
		}).then(function (Building) {
			res.status(200).json({
				"msg": "success",
				"data": Building
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