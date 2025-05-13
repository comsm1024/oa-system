const sequelize = require('./sequelize');
const Department = require('../models/department');

const initDatabase = async () => {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');

    // 检查是否需要创建初始部门
    const departmentCount = await Department.count();
    if (departmentCount === 0) {
      await Department.create({
        name: '总公司',
        code: 'DEPT-0001',
        description: '公司总部'
      });
      console.log('已创建初始部门');
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

module.exports = initDatabase; 