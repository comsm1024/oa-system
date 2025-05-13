const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oa_system',
  logging: false,
  timezone: '+08:00',
  define: {
    timestamps: true,
    underscored: true
  }
});

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = sequelize;