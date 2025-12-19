'use strict';
module.exports = (sequelize, DataTypes) => {
    var Camera = sequelize.define('Camera', {
        CameraId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'CameraId'
        },
        WorkStationId: {
            type: DataTypes.STRING,
            field: 'WorkStationId',
            allowNull: false,
            required: true
        },
        FloorId: {
            type: DataTypes.STRING,
            field: 'FloorId',
            allowNull: false,
            required: true
        },
        CameraName: {
            type: DataTypes.STRING,
            field: 'CameraName',
            allowNull: false,
            required: true
        },
        HTTPUrl: {
            type: DataTypes.STRING,
            field: 'HTTPUrl',
            allowNull: false,
            required: true,
            defaultValue: 'NA'
        },
        RTSPUrl: {
            type: DataTypes.STRING,
            field: 'RTSPUrl',
            allowNull: false,
            required: true
        },
        CameraDescription: {
            type: DataTypes.STRING,
            field: 'CameraDescription',
            allowNull: false,
            required: true
        },
        Status:{
            type: DataTypes.STRING,
            field: 'Status',
            allowNull: false,
            required: true,
            defaultValue : "false"
        },
        CameraDefaultImage: {
            type: DataTypes.STRING,
            field: 'CameraDefaultImage',
            defaultValue: "NA",
            required: true
        },
        Api: {
            type: DataTypes.STRING,
            field: 'Api',
            defaultValue: "NA",
            required: true
        },
        Roi: {
            type: DataTypes.JSON,
            field: 'Roi',
            allowNull: true
        },
        // --- THIS IS THE NEW COLUMN ---
        AnalyticsConfig: {
            type: DataTypes.JSON,
            field: 'AnalyticsConfig',
            allowNull: true
        },
        // --- AlertAnalyticsId field is REMOVED ---
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
    Camera.associate = function(models) {
        Camera.belongsTo(models.WorkStation, {
            foreignKey: 'WorkStationId',
            as: 'WorkStation'
        });
        Camera.belongsTo(models.Floor, {
            foreignKey: 'FloorId',
            as: 'Floor'
        });
        Camera.hasMany(models.CameraLog, {
            foreignKey: 'CameraId',
            as: 'CameraLog',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    }
    return Camera;
};