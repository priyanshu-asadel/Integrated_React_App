const Models = require("../models/index.model");
const ping = require('ping');

module.exports = {
	pingCam: function (sio) {
		Models.Camera.findAll({
			attributes: ["CameraId","CameraName","CameraDescription","RTSPUrl", "HTTPUrl","Status"],
			include: [{
				model: Models.Floor,
				attributes: ["FloorName"],
				as: 'Floor',
				include: {
					model: Models.Building,
					attributes: ["BuildingName"],
					as: 'Building',
					include: {
						model: Models.Site,
						attributes: ["SiteName"],
						as: 'Site',
						include: {
							model: Models.CompanyDetails,
							attributes: ["CompanyName", "CompanyId"],
							as: 'Company'
						}
					}
				}
			}],
		})
		.then(function (cameras) {
				cameras.forEach(el => {
					let url = ((el.RTSPUrl).split("@")[1]).split(":")[0] || "";
					ping.sys.probe(url, function (isAlive) {
						// console.log(isAlive,'isAlive----------------------------------')
						if (!isAlive && el.Status == "true") {
							Models.Camera.update({
								"Status": "false"
							}, {
								where: {
									CameraId: el.CameraId
								}
							}).then((cam)=>{
								Models.CameraLog.create({
									CameraLogName : "Inactive",
									CompanyId: el?.Floor?.Building?.Site?.Company?.CompanyId,
									CameraId : el.CameraId,
									CameraName : el.CameraName,
									CameraDescription : el.CameraDescription,
									HTTPUrl: el.HTTPUrl,
									RTSPUrl : el.RTSPUrl,
									Status : "false"
								});
							});
							sio.emit("camera",{"CameraId":el.CameraId,"Status":"false"});
						}else if(isAlive && el.Status == "false"){
							Models.Camera.update({
								"Status": "true"
							}, {
								where: {
									CameraId: el.CameraId
								}
							}).then((cam)=>{
								Models.CameraLog.create({
									CameraLogName : "Active",
									CompanyId: el?.Floor?.Building?.Site?.Company?.CompanyId,
									CameraId : el.CameraId,
									CameraName : el.CameraName,
									CameraDescription : el.CameraDescription,
									RTSPUrl : el.RTSPUrl,
									HTTPUrl: el.HTTPUrl,
									Status : "true"
								});
							});
							sio.emit("camera",{"CameraId":el.CameraId,"Status":"true"});
						}
					});
				});
		}).catch(function (e) {
			console.log(e);
		});
	}
}