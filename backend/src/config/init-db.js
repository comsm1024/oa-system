const sequelize = require('./sequelize');
const models = require('../models');
const initSeedData = require('./seed');

const checkTableData = async (models) => {
  try {
    // 检查是否存在部门数据
    const departmentCount = await models.Department.count();
    // 检查是否存在用户数据
    const userCount = await models.User.count();
    
    return {
      hasDepartments: departmentCount > 0,
      hasUsers: userCount > 0
    };
  } catch (error) {
    console.error('检查数据失败:', error);
    return {
      hasDepartments: false,
      hasUsers: false
    };
  }
};

const initDatabase = async () => {
  try {
    // 同步数据库结构（不强制重建表）
    await sequelize.sync();
    console.log('数据库表结构同步完成');

    // 检查是否已存在数据
    const { hasDepartments, hasUsers } = await checkTableData(models);
    
    if (!hasDepartments && !hasUsers) {
      console.log('数据库中无初始数据，开始创建...');
      // 创建初始数据
      await initSeedData(models);
      console.log('初始数据创建完成');
    } else {
      console.log('数据库中已存在数据：');
      if (hasDepartments) console.log('- 已存在部门数据');
      if (hasUsers) console.log('- 已存在用户数据');
      console.log('跳过初始数据创建');
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 添加强制重新初始化的方法
const forceInitDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境不允许强制重新初始化数据库');
    }
    
    console.log('开始强制重新初始化数据库...');
    
    // 禁用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 强制重新创建所有表
    await sequelize.sync({ force: true });
    
    // 启用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('数据库表重建完成');

    // 创建初始数据
    await initSeedData(models);
    
    console.log('数据库强制重新初始化完成');
  } catch (error) {
    console.error('数据库强制重新初始化失败:', error);
    throw error;
  }
};

module.exports = {
  initDatabase,
  forceInitDatabase
}; 