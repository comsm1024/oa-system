// models/department.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '部门名称'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '部门编码',
    unique: 'department_code_unique'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    },
    comment: '父部门ID'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '部门描述'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
    comment: '更新时间'
  }
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['code']
    }
  ]
});

// 自关联关系
Department.hasMany(Department, { as: 'children', foreignKey: 'parentId' });
Department.belongsTo(Department, { as: 'parent', foreignKey: 'parentId' });

// 与用户的关联关系将在 associate 方法中定义
Department.associate = (models) => {
  Department.hasMany(models.User, {
    foreignKey: 'departments',
    as: 'users',
    constraints: false // 因为使用 JSON 字段存储，不需要外键约束
  });
};

module.exports = Department;