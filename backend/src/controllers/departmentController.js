const db = require('../config/sequelize');
const response = require('../utils/response');
const Department = require('../models/department')
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

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
    
    // 生成唯一的部门编码
    const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    const newCode = parentId ? `${prefix}-${uuid}` : `DEPT-${uuid}`;
    
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
      
      // 如果有父部门，检查父部门是否存在
      if (parentId) {
        const parent = await Department.findByPk(parentId, { transaction });
        if (!parent) {
          throw new Error('父部门不存在');
        }
      }

      const code = await generateDepartmentCode(parentId || null);
      
      const department = await Department.create({
        name,
        code,
        parentId: parentId || null,
        description
      }, { transaction });
      
      await transaction.commit();

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
      const { search } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows } = await Department.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
      });

      const buildDepartmentTree = (departments, parentId = null) => {
        return departments
          .filter(dept => dept.parentId === parentId)
          .map(dept => ({
            ...dept.toJSON(),
            children: buildDepartmentTree(departments, dept.id)
          }))
      };

      const treeData = buildDepartmentTree(rows);

      return res.json(response.success(treeData, '获取部门列表成功'))
    } 
    catch (error) {
      console.error('获取部门列表失败:', error);
      res.status(500).json(response.serverError('获取部门列表失败'));
    }
  },

  async getDepartmentById() {
    
  },

  async updateDepartment(req, res) {
    const transaction = await db.transaction();
    try {
      const { id } = req.params;
      const { name, parentId, description } = req.body;

      // 检查部门是否存在
      const department = await Department.findByPk(id);
      if (!department) {
        throw new Error('部门不存在');
      }

      // 如果有父部门,检查父部门是否存在
      if (parentId) {
        const parentDepartment = await Department.findByPk(parentId);
        if (!parentDepartment) {
          throw new Error('父部门不存在');
        }
      }

      // 更新部门信息
      await department.update({
        name,
        parentId: (parentId === undefined || parentId === '') ? null : parentId,
        description
      }, { transaction });

      await transaction.commit();

      res.json(response.success(department, '部门更新成功'));
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: error.message || '部门更新失败'
      });
    }
  },

  async deleteDepartment(req, res) {
    const transaction = await db.transaction();
    try {
      const { id } = req.params

      // 查询是否存在下级部门
      const childDepartments = await Department.findAll({
        where: { parentId: id },
        attributes: ['id', 'name', 'code', 'description'],
        transaction
      })
      
      // 如果存在下级部门，返回这些部门信息
      if (childDepartments && childDepartments.length > 0) {
        await transaction.rollback()
        return res.status(400).json(response.success(childDepartments, '该部门存在下级部门，无法删除'))
      }

      // 不存在下级部门，执行删除操作
      const result = await Department.destroy({
        where: { id },
        transaction
      })

      if (!result) {
        await transaction.rollback()
        return res.status(404).json(response.serverError('部门不存在'))
      }

      await transaction.commit()
      return res.json(response.success(result, '部门删除成功'))
    } catch (error) {
      await transaction.rollback()
      return res.status(500).json(response.serverError('部门删除失败'))
    }
  }
}

module.exports = departmentController