'use strict';
module.exports = (sequelize, DataTypes) => {
    var AlertAnalytics = sequelize.define('AlertAnalytics', {
        AlertAnalyticsId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'AlertAnalyticsId'
        },
        CompanyId: {
            type: DataTypes.STRING,
            field: 'CompanyId',
            allowNull: false,
            required: true
        },
        AlertAnalyticsName: {
            type: DataTypes.STRING,
            field: 'AlertAnalyticsName',
            allowNull: false,
            required: true
        },
        AlertAnalyticsDescription: {
            type: DataTypes.STRING,
            field: 'AlertAnalyticsDescription',
            allowNull: false,
            required: true
        },
        DeepStreamModelConfigId: {
            type: DataTypes.STRING,
            field: 'DeepStreamModelConfigId',
            allowNull: true
        },
        Classes: {
            type: DataTypes.JSON,
            field: 'Classes',
            allowNull: true
        },
        AlertThresholds: {
            type: DataTypes.JSON,
            field: 'AlertThresholds',
            allowNull: true
        },
        ConfidenceThresholds: {
            type: DataTypes.JSON,
            field: 'ConfidenceThresholds',
            allowNull: true
        },
        DetectionModel: {
            type: DataTypes.STRING,
            field: 'DetectionModel',
            allowNull: true 
        },
        Status: {
            type: DataTypes.STRING(10),
            field: 'Status',
            defaultValue: 'true'
        },
        CreatedAt: {
            type: DataTypes.DATE,
            field: 'CreatedAt',
            defaultValue: DataTypes.NOW()
        },
        UpdatedAt: {
            type: DataTypes.DATE,
            field: 'UpdatedAt',
            defaultValue: DataTypes.NOW()
        }
    }, {
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        freezeTableName: true
    });
    AlertAnalytics.associate = (models) => {
        AlertAnalytics.belongsTo(models.CompanyDetails, {
            foreignKey: 'CompanyId',
            as: 'Company'
        });
        // This line correctly links Analytics to Configs
        AlertAnalytics.belongsTo(models.DeepStreamModelConfigs, {
            foreignKey: 'DeepStreamModelConfigId',
            as: 'DeepStreamModelConfig'
        });
    };
    return AlertAnalytics;
};