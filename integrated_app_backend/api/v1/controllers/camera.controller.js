var Models = require("../models/index.model");

module.exports = {
    // create camera
    createCamera: function (req, res) {
        // req.body now contains the 'AnalyticsConfig' JSON object
        Models.Camera.create(req.body).then(function (result) {
            res.status(200).json({
                "msg": "Adding Camera Successful",
                "data": result
            });
        }).catch(function (e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    
    // list cameras (This function is fine, it will pick up the new AnalyticsConfig column)
    listCameras: function (req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; 
        var workstationId = req.query.workstationId;
        var siteId = req.query.siteId; 
        var buildingId = req.query.buildingId; 
        var floorId = req.query.floorId; 
        
        var whereClause = {};
        if (floorId && floorId !== '') {
            whereClause.FloorId = floorId;
        }
        if (workstationId && workstationId !== '') {
            whereClause.WorkStationId = workstationId;
        }
        
        var floorInclude = {
            model: Models.Floor,
            attributes: ["FloorName"],
            as: 'Floor',
            required: false,
            include: {
                model: Models.Building,
                attributes: ["BuildingName"],
                as: 'Building',
                required: false,
                include: {
                    model: Models.Site,
                    attributes: ["SiteName"],
                    as: 'Site',
                    required: false
                }
            }
        };
        
        if (buildingId && buildingId !== '') {
            floorInclude.include.where = { BuildingId: buildingId };
            floorInclude.include.required = true;
            floorInclude.required = true;
        }
        
        if (siteId && siteId !== '') {
            if (!floorInclude.include.where) { floorInclude.include.where = {}; }
            floorInclude.include.where.SiteId = siteId;
            floorInclude.include.required = true;
            floorInclude.required = true;
        }
        
        if (companyId && companyId !== '') {
            if (!floorInclude.include.include.where) { floorInclude.include.include.where = {}; }
            floorInclude.include.include.where.CompanyId = companyId;
            floorInclude.include.include.required = true;
            floorInclude.include.required = true;
            floorInclude.required = true;
        }
        
        var workstationInclude = {
            model: Models.WorkStation,
            attributes: ["WorkStationName"],
            as: 'WorkStation',
            required: false
        };
        
        if (companyId && companyId !== '') {
            workstationInclude.where = { CompanyId: companyId };
            workstationInclude.required = true;
        }
        
        Models.Camera.findAndCountAll({
            where: whereClause,
            include: [floorInclude, workstationInclude],
            offset: offset,
            limit: limit,
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function (cameras) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: cameras.count,
                    offset: offset,
                    limit: limit,
                    rows: cameras.rows
                }
            });
        }).catch(function (e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },

    // delete camera (Unchanged)
    deleteCameraById: function (req, res) {
        Models.Camera.destroy({
            where: {
                CameraId: req.params.id
            }
        }).then(async camera => {
            res.status(200).json({
                'msg': 'Camera has been deleted',
                "data": camera
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In deleting camera',
                "data": error
            });
        });
    },

    // update camera
    updateCameraById: function (req, res) {
        // req.body now contains the 'AnalyticsConfig' JSON object
        Models.Camera.update(req.body, {
            where: {
                CameraId: req.params.id
            }
        }).then(async (affectedrows) => {
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

    // get all cameras (Unchanged)
    getAllCameras: function (req, res) {
        Models.Camera.findAll({
            attributes: ["CameraId", "CameraName", "RTSPUrl", "FloorId", "Status"]
        }).then(function (camera) {
            res.status(200).json({
                "msg": "success",
                "data": camera
            });
        }).catch(function (e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },

    // getAllCameraId (Unchanged)
    getAllCameraId: function (req, res) {
        Models.Camera.findAll({
            where: {
                FloorId: req.body.id
            },
            attributes: ["CameraId", "CameraName"],
            distinct: true
        }).then(distributor => {
            res.status(200).json({
                'msg': 'camera list',
                "data": distributor
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In getting camera',
                "data": error
            });
        });;
    },
    // getAllCameraForConfig (Unchanged, but seems to reference tables we haven't defined like Platform?)
    getAllCameraForConfig: function (req, res) {
        Models.Camera.findAll({
            attributes: ["CameraId", "RTSPUrl", "LineRoi", "TrainRoi", "TrackRoi", "YellowLineRoi"],
            include: [{
                model: Models.Platform,
                attributes: ["PlatformId"],
                include: {
                    model: Models.Station,
                    attributes: ["StationId"],
                    include: {
                        model: Models.Line,
                        attributes: ["LineId"]
                    }
                }
            }],
            distinct: true
        }).then(distributor => {
            res.status(200).json({
                'msg': 'camera list',
                "data": distributor
            });
        }).catch(error => {
            res.status(400).json({
                'msg': 'Error In getting camera',
                "data": error
            });
        });;
    },
    // list log (Unchanged)
    listLog: function (req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        Models.CameraLog.findAndCountAll({
            offset: offset,
            limit: limit,
            include: {
                model: Models.Camera,
                attributes: ["CameraId"],
                as: 'Camera'
            },
            order: [
                ['CreatedAt', 'DESC']
            ]
        }).then(function (log) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: log.count,
                    offset: offset,
                    limit: limit,
                    rows: log.rows
                }
            });
        }).catch(function (e) {
            console.log(e);
            res.status(400).json({
                "msg": "Fail",
                "data": e
            });
        });
    },
    // getCameraDetailsByFloorId (Unchanged)
    getCameraDetailsByFloorId: function (req, res) {
        Models.Camera.findOne({
            attributes: ["CameraUrl", "CameraName"],
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

}