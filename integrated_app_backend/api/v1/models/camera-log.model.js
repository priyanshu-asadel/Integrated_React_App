'use strict';
module.exports = (sequelize, DataTypes) => {
    var CameraLog = sequelize.define('CameraLog', {
        CameraLogId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement : true,
            field: 'CameraLogId'
        },
        CameraLogName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'CameraLogName',
            required : true
        },
        CompanyId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'CompanyId',
            required : true
        },
        CameraId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'CameraId',
            required : true
        },
        CameraName: {
            type: DataTypes.STRING,
            field: 'CameraName',
            allowNull: false,
            required: true
        },
		CameraDescription: {
            type: DataTypes.STRING,
            field: 'CameraDescription',
            allowNull: false,
            required: true
        },
		HTTPUrl: {
            type: DataTypes.STRING,
            field: 'HTTPUrl',
            allowNull: false,
            required: true
        },
        RTSPUrl: {
            type: DataTypes.STRING,
            field: 'RTSPUrl',
            allowNull: false,
            required: true
        },
		Status: {
            type: DataTypes.STRING,
            field: 'Status',
            allowNull: false,
            required: true
        },
        CreatedAt: {
            type: DataTypes.DATE,
            field: 'CreatedAt',
            defaultValue: DataTypes.NOW()
        }
    }, {
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: false,
        freezeTableName: true
    });
    CameraLog.associate = function(models) {
        CameraLog.belongsTo(models.Camera, {
            foreignKey: 'CameraId',
            as: 'Camera'
        });
    }
    return CameraLog;
};