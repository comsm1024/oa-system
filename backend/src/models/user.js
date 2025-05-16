const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');
const Department = require('./department');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名',
    unique: 'username_unique'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱',
    unique: 'email_unique'
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '用户全名'
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    comment: '角色'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态'
  },
  departments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '所属部门ID',
    get() {
      const rawValue = this.getDataValue('departments');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('departments', JSON.stringify(value));
    }
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
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment: '最后登录时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// 定义虚拟字段来获取关联的部门信息
User.addHook('afterFind', async (users) => {
    console.log(users)
  if (!users) return;
  
  const processUser = async (user) => {
    try {
      // 检查 departments 字段是否存在且有值
      const departmentsValue = user.getDataValue('departments');
      if (!departmentsValue) {
        user.setDataValue('departmentList', []);
        return;
      }

      // 尝试解析 departments 字段
      let departmentIds;
      try {
        departmentIds = Array.isArray(departmentsValue) 
          ? departmentsValue 
          : JSON.parse(departmentsValue);
      } catch (parseError) {
        console.error('解析部门ID失败:', parseError);
        console.error('原始值:', departmentsValue);
        user.setDataValue('departmentList', []);
        return;
      }

      // 确保 departmentIds 是数组且不为空
      if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
        user.setDataValue('departmentList', []);
        return;
      }

      // 查询部门信息
      const departments = await Department.findAll({
        where: {
          id: departmentIds
        },
        attributes: ['id', 'name', 'code']
      });

      user.setDataValue('departmentList', departments);
    } catch (error) {
      console.error('处理用户部门关联时出错:', error);
      console.error('用户ID:', user.id);
      user.setDataValue('departmentList', []);
    }
  };

  try {
    if (Array.isArray(users)) {
      await Promise.all(users.map(processUser));
    } else {
      await processUser(users);
    }
  } catch (error) {
    console.error('处理用户列表时出错:', error);
  }
});

// 与部门的关联关系将在 associate 方法中定义
User.associate = (models) => {
  User.belongsToMany(models.Department, {
    through: 'user_departments',
    foreignKey: 'user_id',
    otherKey: 'department_id',
    as: 'departmentList',
    constraints: false // 因为使用 JSON 字段存储，不需要外键约束
  });
};

module.exports = User;
