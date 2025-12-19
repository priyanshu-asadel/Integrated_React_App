'use strict';
module.exports = (sequelize, DataTypes) => {
    var Site = sequelize.define('Site', {
        SiteId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'SiteId'
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
        SiteDescription: {
            type: DataTypes.STRING,
            field: 'SiteDescription',
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
    Site.associate = (models) => {
        Site.belongsTo(models.CompanyDetails, {
            foreignKey: 'CompanyId',
            as: 'Company'
        });
        Site.hasMany(models.Building, {
            foreignKey: 'SiteId',
            as: 'Building',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    };
    return Site;
};