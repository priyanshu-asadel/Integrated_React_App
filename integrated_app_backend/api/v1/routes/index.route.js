var express = require('express');
var router = express.Router();

var verifyToken = require('../../v1/middlewares/auth');
var home = require('../controllers/home.controller');
var company = require('../controllers/company.controller'); // <-- TYPO FIXED
var moduleName = require('../controllers/module-name.controller');
var site = require('../controllers/site.controller');
var building = require('../controllers/building.controller');
var floor = require('../controllers/floor.controller');
var user = require('../controllers/user.controller');
var workstation = require('../controllers/workstation.controller');
var alertAnalytics = require('../controllers/alert-analytics.controller');
var verify = require('../controllers/verfiy.controller');
var camera = require('../controllers/camera.controller');
var alert = require('../controllers/alerts.controller');

//home
router.get("/", verifyToken, home.home);

//company
router.post("/company", company.createCompany)
router.get("/company/:offset/:limit", company.listCompany);
router.put("/company/:id", company.updateCompanyById);
router.delete("/company/:id", company.deleteCompanyById);
router.get("/get-all-company", company.getAllCompany);

//module-name
router.post("/module-name", moduleName.createModuleName)
router.get("/module-name/:offset/:limit", moduleName.listModuleName);
router.put("/module-name/:id", moduleName.updateModuleNameById);
router.delete("/module-name/:id", moduleName.deleteModuleNameById);

//site
router.post("/site", site.createSite)
router.get("/site/:offset/:limit", site.listSite);
router.put("/site/:id", site.updateSiteById);
router.delete("/site/:id", site.deleteSiteById);
router.get("/get-all-site", site.getAllSite);

//building
router.post("/building", building.createBuilding)
router.get("/building/:offset/:limit", building.listBuilding);
router.put("/building/:id", building.updateBuildingById);
router.delete("/building/:id", building.deleteBuildingById);
router.get("/get-all-building", building.getAllBuilding);

//floor
router.post("/floor", floor.createFloor)
router.get("/floor/:offset/:limit", floor.listFloor);
router.put("/floor/:id", floor.updateFloorById);
router.delete("/floor/:id", floor.deleteFloorById);
router.get("/get-all-floor", floor.getAllFloor);

// user
router.post("/user/login", user.login);
router.post("/user", user.createUser);
router.get("/user/:offset/:limit", user.listUsers);
router.put("/user/:id", user.updateUserById);
router.delete("/user/:id", user.deleteUserById);
router.put("/user/change-password/:id", user.changeUserPassword);
router.put("/user/update-password/:id", user.updateUserPassword);

//workstation
router.post("/workstation", workstation.createWorkStation)
router.get("/workstation/:offset/:limit", workstation.listWorkStation);
router.put("/workstation/:id", workstation.updateWorkStationById);
router.delete("/workstation/:id", workstation.deleteWorkStationById);
router.get("/get-all-workstation", workstation.getAllWorkStation);

// alert-analytics
router.post("/alert-analytics", alertAnalytics.createAlertAnalytics);
router.get("/alert-analytics/:offset/:limit", alertAnalytics.listAlertAnalytics);
router.put("/alert-analytics/:id", alertAnalytics.updateAlertAnalyticsById);
router.delete("/alert-analytics/:id", alertAnalytics.deleteAlertAnalyticsById);
router.get("/get-all-alert-analytics", alertAnalytics.getAllAlertAnalytics);

//verify
router.post("/verify-rtsp", verify.verifyRTSPUrl);

// camera
router.post("/camera", camera.createCamera);
router.get("/camera/:offset/:limit", camera.listCameras);
router.put("/camera/:id", camera.updateCameraById);
router.delete("/camera/:id", camera.deleteCameraById);
router.get("/camera-by-floor-id/:id", camera.getCameraDetailsByFloorId);
router.get("/all-cameras", camera.getAllCameras);
router.post("/camera/get-camera", camera.getAllCameraId);
router.get("/camera/get-camera-for-config", camera.getAllCameraForConfig);

//camera log
router.get("/camera-log/:offset/:limit", camera.listLog);

//alert
router.get("/count-by-status", alert.countAlertsByStatus);
router.get("/alert/pdf", alert.downloadPdf);
router.post("/alert", alert.getFilteredAlerts);
router.put("/alert/:id", alert.updateAlertById);
router.get("/unseen-alerts", alert.countUnseenAlert);
router.get("/alert-analytic-status", alert.getAlertAnalyticsSummary);
router.get("/camera-status", alert.getCameraSummary);
router.post("/analytics/status", alert.getAlertStatusSummaryForAnalytics);
router.post("/analytics/camera-status", alert.getAlertCameraSummaryForAnalytics);
router.post("/analytics/alert-status", alert.getAlertAnalyticsSummaryForAnalytics);

module.exports = router;