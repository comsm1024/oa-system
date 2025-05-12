const departmentService = require('../services/departmentService');

class DepartmentController {
  /**
   * 创建部门
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async createDepartment(req, res) {
    try {
      const departmentData = req.body;
      const department = await departmentService.createDepartment(departmentData);
      res.status(201).json({
        success: true,
        message: '部门创建成功',
        data: department
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || '部门创建失败'
      });
    }
  }

  /**
   * 获取部门列表
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async getDepartments(req, res) {
    try {
      const departments = await departmentService.getDepartments();
      res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取部门列表失败'
      });
    }
  }

  /**
   * 获取单个部门信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const department = await departmentService.getDepartmentById(id);
      res.status(200).json({
        success: true,
        data: department
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || '部门不存在'
      });
    }
  }

  /**
   * 更新部门信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const departmentData = req.body;
      const department = await departmentService.updateDepartment(id, departmentData);
      res.status(200).json({
        success: true,
        message: '部门更新成功',
        data: department
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || '部门更新失败'
      });
    }
  }

  /**
   * 删除部门
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;
      await departmentService.deleteDepartment(id);
      res.status(200).json({
        success: true,
        message: '部门删除成功'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || '部门删除失败'
      });
    }
  }
}

module.exports = new DepartmentController(); 