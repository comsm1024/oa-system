// models/department.js
const { DataTypes } = require('sequelize');
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
    unique: true,
    comment: '部门编码'
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

module.exports = Department;