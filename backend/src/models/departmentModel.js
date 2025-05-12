/**
 * 部门数据模型
 */
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '部门名称'
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Departments',
        key: 'id'
      },
      comment: '上级部门ID'
    },
    managerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: '部门负责人ID'
    }
  });

  Department.associate = function(models) {
    Department.belongsTo(models.Department, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    Department.hasMany(models.User, {
      foreignKey: 'departmentId',
      as: 'members'
    });
  };

  return Department;
};