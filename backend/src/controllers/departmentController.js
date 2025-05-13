const db = require('../config/sequelize');
const response = require('../utils/response');
const Department = require('../models/department')
const { Op } = require('sequelize');

const generateDepartmentCode = async (parentId) => {
  const transaction = await db.transaction();
  try {
    let prefix = 'DEPT';
    if (parentId) {
      const parent = await Department.findByPk(parentId, { transaction });
      if (!parent) {
        throw new Error('父部门不存在');
      }
      prefix = parent.code;
    }
    
    // 查找同级最大编码
    const maxCode = await Department.findOne({
      where: { parentId },
      order: [['code', 'DESC']],
      transaction
    });
    
    let newCode;
    if (maxCode) {
      const lastNum = parseInt(maxCode.code.split('-').pop(), 10);
      newCode = `${prefix}-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      newCode = `${prefix}-0001`;
    }
    
    await transaction.commit();
    return newCode;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const checkCircularDependency = async (departmentId, newParentId) => {
  let currentId = newParentId;
  while (currentId) {
    if (currentId === departmentId) {
      return true; // 发现循环依赖
    }
    const parent = await Department.findByPk(currentId);
    currentId = parent ? parent.parentId : null;
  }
  return false;
};

const departmentController = {

  async createDepartment(req, res) {
    const transaction = await db.transaction();
    try {
      const { name, parentId, description } = req.body;
      
      if (parentId) {
        const parent = await Department.findByPk(parentId, { transaction });
        if (!parent) {
          throw new Error('父部门不存在');
        }
      }
      
      const code = await generateDepartmentCode(parentId);
      
      const department = await Department.create({
        name,
        code,
        parentId,
        description
      }, { transaction });
      
      await transaction.commit();
console.log(department)
      res.json(response.success(department, '部门创建成功'))
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: error.message || '部门创建失败'
      });
    }
  },

  async getDepartments(req, res) {
    try {
      const { page = 1, pageSize = 10, search } = req.query;
      const offset = (page - 1) * pageSize;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Department.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(pageSize),
        offset: offset
      });

      return res.json(response.success({
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }, '部门创建成功'))
    } 
    catch (error) {
      console.error('获取部门列表失败:', error);
      res.status(500).json(response.serverError('获取部门列表失败'));
    }
  },

  async getDepartmentById() {
    
  },

  async updateDepartment() {

  },

  async deleteDepartment() {

  }
}

module.exports = departmentController