'use strict';
module.exports = (sequelize, DataTypes) => {
    var Building = sequelize.define('Building', {
        BuildingId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'BuildingId'
        },
        SiteId: {
            type: DataTypes.STRING,
            field: 'SiteId',
            allowNull: false,
            required: true
        },
        BuildingName: {
            type: DataTypes.STRING,
            field: 'BuildingName',
            allowNull: false,
            required: true
        },
        BuildingDescription: {
            type: DataTypes.STRING,
            field: 'BuildingDescription',
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
    Building.associate = (models) => {
        Building.belongsTo(models.Site, {
            foreignKey: 'SiteId',
            as: 'Site'
        });
        Building.hasMany(models.Floor, {
            foreignKey: 'FloorId',
            as: 'Floor',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    };
    return Building;
};