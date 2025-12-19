var Models = require("../models/index.model");

module.exports = {
    createFloor: function (req, res) {
		Models.Floor.create(req.body).then(function (Floor) {
			res.status(200).json({
				"msg": "Adding Floor Successful",
				"data": Floor
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list Floor
    listFloor: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; // Get company filter from query parameter
        var siteId = req.query.siteId; // Get site filter from query parameter
        var buildingId = req.query.buildingId; // Get building filter from query parameter
        
        // Build where clause for filtering
        var whereClause = {};
        if (buildingId && buildingId !== '') {
            whereClause.BuildingId = buildingId;
        }
        
        // Build include clause with nested filtering
        var includeClause = {
            model: Models.Building,
            attributes: ["BuildingName"],
            required: true,
            as: 'Building',
            include: {
                model: Models.Site,
                attributes: ["SiteName"],
                required: true,
                as: 'Site'
            }
        };
        
        // Add site filter to building include
        if (siteId && siteId !== '') {
            includeClause.include.where = {
                SiteId: siteId
            };
        }
        
        // Add company filter to site include
        if (companyId && companyId !== '') {
            if (!includeClause.include.where) {
                includeClause.include.where = {};
            }
            includeClause.include.where.CompanyId = companyId;
        }
        
        Models.Floor.findAndCountAll({
            offset: offset,
            limit: limit,
            where: whereClause,
            include: includeClause,
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function(Floor) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: Floor.count,
                    offset: offset,
                    limit: limit,
                    rows: Floor.rows
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
     // update Floor
     updateFloorById: function(req, res) {
        Models.Floor.update(req.body, {
            where: {
                FloorId: req.params.id
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
     // delete Floor
     deleteFloorById: function(req, res) {
        Models.Floor.destroy({
            where: {
                FloorId: req.params.id
            }
        }).then(Floor => {
            res.status(200).json({
                'msg': 'Floor has been deleted',
                "data": Floor
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting Floor',
                "data": error
            });
        });
    },
    getAllFloor: function (req, res) {
		Models.Floor.findAll({
			attributes: ["FloorId", "FloorName", "BuildingId"]
		}).then(function (Floor) {
			res.status(200).json({
				"msg": "success",
				"data": Floor
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