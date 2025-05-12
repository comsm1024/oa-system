const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '部门ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '部门名称'
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '部门编码'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '上级部门ID'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '部门描述'
  }
}, {
  tableName: 'department',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Department; 