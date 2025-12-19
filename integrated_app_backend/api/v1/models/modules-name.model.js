'use strict';
module.exports = (sequelize, DataTypes) => {
    var ModulesName = sequelize.define('ModulesName', {
        ModulesNameId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'ModulesNameId'
        },
        CompanyId: {
            type: DataTypes.STRING,
            field: 'CompanyId',
            allowNull: false,
            required: true
        },
        SiteName: {
            type: DataTypes.STRING,
            field: 'SiteName',
            allowNull: false,
            required: true
        },
        BuildingName: {
            type: DataTypes.STRING,
            field: 'BuildingName',
            allowNull: false,
            required: true
        },
        FloorName: {
            type: DataTypes.STRING,
            field: 'FloorName',
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
    ModulesName.associate = (models) => {
        ModulesName.belongsTo(models.CompanyDetails, {
            foreignKey: 'CompanyId',
            as: 'Company'
        });
    };
    return ModulesName;
};