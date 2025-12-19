'use strict';
module.exports = (sequelize, DataTypes) => {
    var Alerts = sequelize.define('Alerts', {
        AlertId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'AlertId'
        },
        CameraId: {
            type: DataTypes.STRING,
            field: 'CameraId',
            allowNull: false,
            required: true
        },
        Analytics: {
            type: DataTypes.STRING,
            field: 'Analytics',
            allowNull: false,
            required: true
        },
        AlertType: {
            type: DataTypes.STRING,
            field: 'AlertType',
            allowNull: false,
            required: true
        },
        Image1: {
            type: DataTypes.STRING,
            field: 'Image1',
            defaultValue: "NA",
            required: true
        },
        Image2: {
            type: DataTypes.STRING,
            field: 'Image2',
            defaultValue: "NA",
            required: true
        },
        Seen: {
            type: DataTypes.STRING,
            field: 'Seen',
            allowNull: false,
            required: true,
            defaultValue: "No",
        },
        Status: {
            type: DataTypes.STRING,
            field: 'Status',
            allowNull: false,
            required: true,
            defaultValue: "Unresolved",
        },
        Remarks: {
            type: DataTypes.STRING,
            field: 'Remarks',
            allowNull: true,
            required: false,
            defaultValue: "NA",
        },
        UserID: {
            type: DataTypes.STRING,
            field: 'UserID',
            allowNull: true,
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
    Alerts.associate = (models) => {
        Alerts.belongsTo(models.AlertAnalytics, {
            foreignKey: 'Analytics',
            as: 'AlertAnalytics'
        });
        Alerts.belongsTo(models.Camera, {
            foreignKey: 'CameraId',
            as: 'Camera'
        });
    };
    return Alerts;
};