/**
 * 用户数据模型（含部门关联）
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    name: DataTypes.STRING(50),
    email: {
      type: DataTypes.STRING(50),
      validate: {
        isEmail: true
      }
    },
    departmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  });

  User.associate = function(models) {
    User.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  };

  return User;
};