'use strict';
module.exports = (sequelize, DataTypes) => {
    var WorkStation = sequelize.define('WorkStation', {
        WorkStationId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'WorkStationId'
        },
        CompanyId: {
            type: DataTypes.STRING,
            field: 'CompanyId',
            allowNull: false,
            required: true
        },
        WorkStationName: {
            type: DataTypes.STRING,
            field: 'WorkStationName',
            allowNull: false,
            required: true
        },
        WorkStationDescription: {
            type: DataTypes.STRING,
            field: 'WorkStationDescription',
            allowNull: false,
            required: true
        },
        Api: {
            type: DataTypes.STRING,
            field: 'Api',
            allowNull: false,
            required: true
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
    WorkStation.associate = (models) => {
        WorkStation.belongsTo(models.CompanyDetails, {
            foreignKey: 'CompanyId',
            as: 'Company'
        });
        WorkStation.hasMany(models.Camera, {
            foreignKey: 'WorkStationId',
            as: 'Camera',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    };
    return WorkStation;
};