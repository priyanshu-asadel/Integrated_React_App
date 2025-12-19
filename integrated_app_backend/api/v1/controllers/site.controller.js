var Models = require("../models/index.model");

module.exports = {
    createSite: function (req, res) {
		Models.Site.create(req.body).then(function (site) {
			res.status(200).json({
				"msg": "Adding Site Successful",
				"data": site
			});
		}).catch(function (e) {
			res.status(400).json({
				"msg": "Fail",
				"data": e
			});
		});
	},
    // list site
    listSite: function(req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; // Get company filter from query parameter
        
        // Build where clause for filtering
        var whereClause = {};
        if (companyId && companyId !== '') {
            whereClause.CompanyId = companyId;
        }
        
        Models.Site.findAndCountAll({
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
        }).then(function(site) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: site.count,
                    offset: offset,
                    limit: limit,
                    rows: site.rows
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
     // update site
     updateSiteById: function(req, res) {
        Models.Site.update(req.body, {
            where: {
                SiteId: req.params.id
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
     // delete site
     deleteSiteById: function(req, res) {
        Models.Site.destroy({
            where: {
                SiteId: req.params.id
            }
        }).then(site => {
            res.status(200).json({
                'msg': 'Site has been deleted',
                "data": site
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting site',
                "data": error
            });
        });
    },
    getAllSite: function (req, res) {
		Models.Site.findAll({
			attributes: ["SiteId", "SiteName", "CompanyId"]
		}).then(function (Site) {
			res.status(200).json({
				"msg": "success",
				"data": Site
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