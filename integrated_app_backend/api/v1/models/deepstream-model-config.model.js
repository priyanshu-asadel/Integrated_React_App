'use strict';
module.exports = (sequelize, DataTypes) => {
    var DeepStreamModelConfig = sequelize.define('DeepStreamModelConfigs', {
        DeepStreamModelConfigId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'DeepStreamModelConfigId'
        },
        ConfigName: {
            type: DataTypes.STRING,
            field: 'ConfigName',
            allowNull: false
        },
        GpuId: { type: DataTypes.INTEGER, field: 'GpuId', defaultValue: 0 },
        BatchSize: { type: DataTypes.INTEGER, field: 'BatchSize', defaultValue: 1 },
        NetworkMode: { type: DataTypes.INTEGER, field: 'NetworkMode', defaultValue: 2 },
        NetworkType: { type: DataTypes.INTEGER, field: 'NetworkType', defaultValue: 0 },
        NumDetectedClasses: { type: DataTypes.INTEGER, field: 'NumDetectedClasses', defaultValue: 1 },
        ProcessMode: { type: DataTypes.INTEGER, field: 'ProcessMode', defaultValue: 1 },
        Interval: { type: DataTypes.INTEGER, field: 'Interval', defaultValue: 0 },
        OnnxFile: { type: DataTypes.STRING(1024), field: 'OnnxFile' },
        ModelEngineFile: { type: DataTypes.STRING(1024), field: 'ModelEngineFile' },
        LabelFilePath: { type: DataTypes.STRING(1024), field: 'LabelFilePath' },
        CustomLibPath: { type: DataTypes.STRING(1024), field: 'CustomLibPath' },
        ParseBboxFuncName: { type: DataTypes.STRING, field: 'ParseBboxFuncName', defaultValue: 'NvDsInferParseYolo' },
        EngineCreateFuncName: { type: DataTypes.STRING, field: 'EngineCreateFuncName', defaultValue: 'NvDsInferYoloCudaEngineGet' },
        PreClusterThreshold: { type: DataTypes.FLOAT, field: 'PreClusterThreshold', defaultValue: 0.5 },
        NmsIouThreshold: { type: DataTypes.FLOAT, field: 'NmsIouThreshold', defaultValue: 0.3 },
        TopK: { type: DataTypes.INTEGER, field: 'TopK', defaultValue: 300 },
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
    // No association needed here, it's defined in AlertAnalytics
    return DeepStreamModelConfig;
};