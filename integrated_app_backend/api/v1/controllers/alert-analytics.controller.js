var Models = require("../models/index.model");
var sequelize = Models.sequelize; // Correct way to get sequelize

module.exports = {
    // create alert-analytics -- CORRECTED
    createAlertAnalytics: async function (req, res) {
        let { analyticsData, configData } = req.body;
        const t = await sequelize.transaction();

        // 1. Basic Validation Check (CRITICAL)
        if (!analyticsData || !analyticsData.CompanyId || !analyticsData.AlertAnalyticsName) {
            await t.rollback();
            return res.status(400).json({
                "msg": "Validation Error: Missing CompanyId or AlertAnalyticsName.",
                "data": null
            });
        }
        
        // 2. Data Preparation: Stringify JSON fields for database storage
        // This is necessary if your Sequelize model uses TEXT/VARCHAR instead of native JSON type.
        try {
            if (analyticsData.Classes) {
                analyticsData.Classes = JSON.stringify(analyticsData.Classes);
            }
            if (analyticsData.AlertThresholds) {
                analyticsData.AlertThresholds = JSON.stringify(analyticsData.AlertThresholds);
            }
            if (analyticsData.ConfidenceThresholds) {
                analyticsData.ConfidenceThresholds = JSON.stringify(analyticsData.ConfidenceThresholds);
            }
            
            // Set required config name
            configData.ConfigName = analyticsData.AlertAnalyticsName;

        } catch (e) {
            await t.rollback();
            console.log("JSON Stringify Error:", e);
            return res.status(400).json({
                "msg": "Data Formatting Error: Failed to stringify JSON fields.",
                "data": e.toString()
            });
        }


        // 3. Database Insertion (in transaction)
        try {
            // Insert DeepStream Config first
            const newConfig = await Models.DeepStreamModelConfigs.create(configData, { transaction: t });
            
            // Prepare Analytics payload with the new Config ID
            const finalAnalyticsData = {
                ...analyticsData,
                DeepStreamModelConfigId: newConfig.DeepStreamModelConfigId
            };
            
            // Insert Alert Analytics
            const alertAnalytics = await Models.AlertAnalytics.create(finalAnalyticsData, { transaction: t });
            
            await t.commit();
            res.status(200).json({
                "msg": "Adding AlertAnalytics Successful",
                "data": alertAnalytics
            });
        } catch (e) {
            await t.rollback();
            console.log("Sequelize Insert Error:", e);
            
            // Return a clearer message on what the database rejected
            const errorMsg = e.name === 'SequelizeUniqueConstraintError' ? 'Record already exists.' : e.original?.sqlMessage || e.message;
            
            res.status(400).json({
                "msg": "Fail to create analytics due to database constraint violation.",
                "data": errorMsg
            });
        }
    },
    
    // list alertAnalytics (Unchanged from previous step)
    listAlertAnalytics: function (req, res) {
        var offset = Number(req.params.offset) || 0;
        var limit = Number(req.params.limit) || 10;
        var companyId = req.query.companyId; 
        var whereClause = {};
        if (companyId && companyId !== '') { whereClause.CompanyId = companyId; }
        
        Models.AlertAnalytics.findAndCountAll({
            offset: offset, limit: limit, where: whereClause, 
            include: [
                { model: Models.CompanyDetails, attributes: ["CompanyName"], as: 'Company' },
                { model: Models.DeepStreamModelConfigs, as: 'DeepStreamModelConfig' }
            ],
            order: [['CreatedAt', 'DESC']]
        }).then(function (alertAnalytics) {
            res.status(200).json({
                "msg": "success",
                "data": {
                    total: alertAnalytics.count,
                    offset: offset,
                    limit: limit,
                    rows: alertAnalytics.rows
                }
            });
        }).catch(function (e) {
            console.log(e);
            res.status(400).json({ "msg": "Fail", "data": e });
        });
    },

    // update AlertAnalytics (Unchanged from previous step)
    updateAlertAnalyticsById: async function (req, res) {
        const { analyticsData, configData } = req.body;
        const t = await sequelize.transaction();
        
        // 1. Data Preparation: Stringify JSON fields for database storage
        try {
            if (analyticsData.Classes) {
                analyticsData.Classes = JSON.stringify(analyticsData.Classes);
            }
            if (analyticsData.AlertThresholds) {
                analyticsData.AlertThresholds = JSON.stringify(analyticsData.AlertThresholds);
            }
            if (analyticsData.ConfidenceThresholds) {
                analyticsData.ConfidenceThresholds = JSON.stringify(analyticsData.ConfidenceThresholds);
            }
        } catch (e) {
             await t.rollback();
             return res.status(400).json({
                "msg": "Data Formatting Error: Failed to stringify JSON fields during update.",
                "data": e.toString()
            });
        }
        
        try {
            await Models.AlertAnalytics.update(analyticsData, {
                where: { AlertAnalyticsId: req.params.id },
                transaction: t
            });
            
            if (configData && configData.DeepStreamModelConfigId) {
                await Models.DeepStreamModelConfigs.update(configData, {
                    where: { DeepStreamModelConfigId: configData.DeepStreamModelConfigId },
                    transaction: t
                });
            }
            await t.commit();
            res.status(200).json({ "msg": "success", "data": [1] });
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(400).json({ "msg": "error", "data": error.toString() });
        }
    },

    // delete AlertAnalytics (Unchanged from previous step)
    deleteAlertAnalyticsById: async function (req, res) {
        const t = await sequelize.transaction();
        try {
            const analytic = await Models.AlertAnalytics.findOne({
                where: { AlertAnalyticsId: req.params.id }
            });
            if (!analytic) {
                await t.rollback();
                return res.status(404).json({ 'msg': 'Analytics not found' });
            }
            await Models.AlertAnalytics.destroy({
                where: { AlertAnalyticsId: req.params.id },
                transaction: t
            });
            if (analytic.DeepStreamModelConfigId) {
                await Models.DeepStreamModelConfigs.destroy({
                    where: { DeepStreamModelConfigId: analytic.DeepStreamModelConfigId },
                    transaction: t
                });
            }
            await t.commit();
            res.status(200).json({ 'msg': 'AlertAnalytics and associated config have been deleted' });
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(400).json({ 'msg': 'Error In deleting AlertAnalytics', "data": error.toString() });
        }
    },
    
    // get all AlertAnalytics
    getAllAlertAnalytics: function (req, res) {
        Models.AlertAnalytics.findAll({
            attributes: ["AlertAnalyticsId", "AlertAnalyticsName", "CompanyId", "Classes"]
        }).then(function (AlertAnalytics) {
            res.status(200).json({
                "msg": "success",
                "data": AlertAnalytics
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