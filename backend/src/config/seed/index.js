const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const departments = require('./departments');
const users = require('./users');

// 生成部门编码
const generateDepartmentCode = async (parentId = null, Department) => {
  try {
    let prefix = 'DEPT';
    if (parentId) {
      const parent = await Department.findByPk(parentId);
      if (!parent) {
        throw new Error('父部门不存在');
      }
      prefix = parent.code;
    }
    
    const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    return parentId ? `${prefix}-${uuid}` : `DEPT-${uuid}`;
  } catch (error) {
    throw error;
  }
};

// 递归创建部门及其子部门
const createDepartmentWithChildren = async (Department, deptData, parentId = null) => {
  try {
    // 生成部门编码
    const deptCode = await generateDepartmentCode(parentId, Department);
    
    // 创建当前部门
    const { children, ...deptInfo } = deptData;
    const department = await Department.create({
      ...deptInfo,
      code: deptCode,
      parentId
    });
    
    console.log(`部门创建成功: ${department.name}`);

    // 如果有子部门，递归创建
    if (children && Array.isArray(children)) {
      for (const childData of children) {
        await createDepartmentWithChildren(Department, childData, department.id);
      }
    }

    return department;
  } catch (error) {
    console.error(`部门创建失败 ${deptData.name}:`, error);
    throw error;
  }
};

// 创建部门数据
const createDepartments = async (Department) => {
  const createdDepartments = new Map();
  
  // 创建所有顶级部门及其子部门
  for (const deptData of departments) {
    try {
      const department = await createDepartmentWithChildren(Department, deptData);
      createdDepartments.set(department.code, department);
    } catch (error) {
      console.error(`顶级部门创建失败:`, error);
    }
  }
  
  return createdDepartments;
};

// 创建用户数据
const createUsers = async (User, departmentsMap) => {
  for (const user of users) {
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // 获取第一个可用的部门ID
      const firstDepartment = departmentsMap.values().next().value;
      const departmentId = firstDepartment ? firstDepartment.id : null;

      await User.create({
        ...user,
        password: hashedPassword,
        departments: departmentId ? [departmentId] : []
      });
      
      console.log(`用户创建成功: ${user.username}`);
    } catch (error) {
      console.error(`用户创建失败 ${user.username}:`, error);
    }
  }
};

// 初始化所有种子数据
const initSeedData = async (models) => {
  try {
    console.log('开始创建初始数据...');
    
    // 创建部门并获取部门映射
    const departmentsMap = await createDepartments(models.Department);
    
    // 创建用户
    await createUsers(models.User, departmentsMap);
    
    console.log('初始数据创建完成');
  } catch (error) {
    console.error('初始数据创建失败:', error);
  }
};

module.exports = initSeedData;