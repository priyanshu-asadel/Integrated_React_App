'use strict';
module.exports = (sequelize, DataTypes) => {
    var Floor = sequelize.define('Floor', {
        FloorId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'FloorId'
        },
        BuildingId: {
            type: DataTypes.STRING,
            field: 'BuildingId',
            allowNull: false,
            required: true
        },
        FloorName: {
            type: DataTypes.STRING,
            field: 'FloorName',
            allowNull: false,
            required: true
        },
        FloorDescription: {
            type: DataTypes.STRING,
            field: 'FloorDescription',
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
    Floor.associate = (models) => {
        Floor.belongsTo(models.Building, {
            foreignKey: 'BuildingId',
            as: 'Building'
        });
        Floor.hasMany(models.Camera, {
            foreignKey: 'FloorId',
            as: 'Camera',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    };
    return Floor;
};