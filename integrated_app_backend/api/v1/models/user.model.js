'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        UserId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'UserId'
        },
        CompanyId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'CompanyId'
        },
        UserName: {
            type: DataTypes.STRING,
            field: 'UserName',
            allowNull: false,
            required: true
        },
        UserEmail: {
            type: DataTypes.STRING,
            field: 'UserEmail',
            allowNull: false,
            required: true
        },
        UserPic: {
            type: DataTypes.STRING,
            field: 'UserPic',
            defaultValue: "NA",
            allowNull: false,
            required: true
        },
        Password: {
            type: DataTypes.STRING,
            field: 'Password',
            allowNull: false,
            required: true
        },
        Gender: {
            type: DataTypes.STRING,
            field: 'Gender',
            enum: ["Male", "Female", "Other"],
            required: true
        },
        Address: {
            type: DataTypes.STRING,
            field: 'Address',
            allowNull: false,
            required: true
        },
        ContactNo: {
            type: DataTypes.STRING,
            field: 'ContactNo',
            allowNull: false,
            required: true
        },
        Role: {
            type: DataTypes.STRING,
            field: 'Role',
            enum: ["SuperAdmin", "Admin", "User"],
            allowNull: false,
            required: true
        },
        Status: {
            type: DataTypes.STRING,
            field: 'Status',
            enum: ["active", "inactive"],
            defaultValue: "active",
            required: true
        },
        ComponentToAccess: {
            type: DataTypes.STRING,
            field: 'ComponentToAccess',
            defaultValue: "[1,2,3,4,5]",
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
    User.associate = (models) => {
        User.belongsTo(models.CompanyDetails, {
            foreignKey: 'CompanyId',
            as: 'Company'
        });
    };
    return User;
};