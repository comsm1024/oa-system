const db = require('../config/sequelize');
const { v4: uuidv4 } = require('uuid');
const Department = require('../models/department');

const generateNewCode = (parentCode = null) => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return parentCode ? `${parentCode}-${uuid}` : `DEPT-${uuid}`;
};

const updateDepartmentCodes = async () => {
  const transaction = await db.transaction();
  
  try {
    // 获取所有部门
    const departments = await Department.findAll({ transaction });
    
    // 创建一个映射来存储旧编码到新编码的对应关系
    const codeMapping = new Map();
    
    // 构建部门树形结构
    const departmentMap = new Map();
    const rootDepartments = [];
    
    // 首先构建查找映射
    departments.forEach(dept => {
      departmentMap.set(dept.id, dept);
    });
    
    // 构建树形结构
    departments.forEach(dept => {
      if (!dept.parentId) {
        rootDepartments.push(dept);
      }
    });

    // 递归更新部门编码
    const updateDepartmentCodeRecursively = async (department, parentNewCode = null) => {
      const newCode = generateNewCode(parentNewCode);
      codeMapping.set(department.code, newCode);
      
      await department.update({ code: newCode }, { transaction });
      console.log(`Updated department: ${department.name}, Old code: ${department.code}, New code: ${newCode}`);

      // 查找并更新子部门
      const childDepartments = departments.filter(d => d.parentId === department.id);
      for (const child of childDepartments) {
        await updateDepartmentCodeRecursively(child, newCode);
      }
    };

    // 从顶级部门开始递归更新
    for (const rootDept of rootDepartments) {
      await updateDepartmentCodeRecursively(rootDept);
    }

    await transaction.commit();
    console.log('Successfully updated all department codes');
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating department codes:', error);
    throw error;
  }
};

// 执行更新
updateDepartmentCodes()
  .then(() => {
    console.log('Department codes update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Department codes update failed:', error);
    process.exit(1);
  }); 