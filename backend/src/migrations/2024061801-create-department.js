/**
 * 创建部门表迁移文件
 */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Departments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '部门名称'
      },
      parentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Departments',
          key: 'id'
        },
        comment: '上级部门ID'
      },
      managerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        comment: '部门负责人ID'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 为用户表添加部门外键
    await queryInterface.addColumn('Users', 'departmentId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Departments',
        key: 'id'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'departmentId');
    await queryInterface.dropTable('Departments');
  }
};