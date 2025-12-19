'use strict';
module.exports = (sequelize, DataTypes) => {
    var CompanyDetails = sequelize.define('CompanyDetails', {
        CompanyId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'CompanyId'
        },
        CompanyName: {
            type: DataTypes.STRING,
            field: 'CompanyName',
            allowNull: false,
            required: true
        },
        CompanyEmail: {
            type: DataTypes.STRING,
            field: 'CompanyEmail',
            allowNull: false,
            required: true
        },
        PhoneNumber: {
            type: DataTypes.STRING,
            field: 'PhoneNumber',
            allowNull: false,
            required: true
        },
        Password: {
            type: DataTypes.STRING,
            field: 'Password',
            allowNull: false,
            required: true
        },
        Modules: {
            type: DataTypes.STRING,
            field: 'Modules',
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
    CompanyDetails.associate = (models) => {
        CompanyDetails.hasOne(models.ModulesName, {
            foreignKey: 'CompanyId',
            as: 'ModulesName',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
        CompanyDetails.hasMany(models.Site, {
            foreignKey: 'CompanyId',
            as: 'Site',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
        CompanyDetails.hasMany(models.User, {
            foreignKey: 'CompanyId',
            as: 'User',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
        CompanyDetails.hasMany(models.WorkStation, {
            foreignKey: 'CompanyId',
            as: 'WorkStation',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
        CompanyDetails.hasMany(models.AlertAnalytics, {
            foreignKey: 'CompanyId',
            as: 'AlertAnalytics',
            onDelete: 'CASCADE',
            hooks: true  // important for CASCADE to work with sequelize
        });
    };

    return CompanyDetails;
};