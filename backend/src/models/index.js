const User = require('./user');
const Department = require('./department');

// 初始化模型关联关系
const initModels = () => {
  const models = {
    User,
    Department
  };

  // 调用每个模型的 associate 方法（如果存在）
  Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

  return models;
};

module.exports = initModels(); 