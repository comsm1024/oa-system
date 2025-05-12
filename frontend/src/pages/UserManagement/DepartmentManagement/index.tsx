import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Divider,
  Tooltip,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { departmentService } from '../../../services/departmentService.ts';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface Department {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);

  // 获取部门列表
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartments({
        ...searchParams,
        search: searchText
      });
      console.log(response)
      setDepartments(response.list);
    } catch (error) {
      console.error('获取部门列表失败:', error);
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 过滤部门列表
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 构建部门树形数据
  const buildTreeData = (departments: Department[]) => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      disabled: editingDepartment?.id === dept.id, // 不能选择自己作为父部门
      children: departments
        .filter(child => child.parentId === dept.id)
        .map(child => ({
          title: child.name,
          value: child.id,
          disabled: editingDepartment?.id === child.id,
        })),
    }));
  };

  const columns: ColumnsType<Department> = [
    {
      title: '部门信息',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <ApartmentOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '上级部门',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => {
        if (!parentId) return <Tag color="default">无</Tag>;
        const parent = departments.find(dept => dept.id === parentId);
        return parent ? (
          <Tag color="blue" style={{ padding: '4px 8px' }}>
            {parent.name}
          </Tag>
        ) : <Tag color="default">无</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <span>{description || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑部门">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#1890ff' }}
            >
              编辑
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除部门">
            <Popconfirm
              title="确定要删除此部门吗？"
              description="删除后数据将无法恢复，且必须先删除子部门"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              placement="left"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue(department);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        message.success('删除成功');
        fetchDepartments();
      } else {
        message.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除部门失败:', error);
      message.error('删除部门失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingDepartment
        ? `/api/departments/${editingDepartment.id}`
        : '/api/departments';
      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.success) {
        message.success(editingDepartment ? '更新成功' : '创建成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchDepartments();
      } else {
        message.error(data.message || (editingDepartment ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      console.error(editingDepartment ? '更新部门失败:' : '创建部门失败:', error);
      message.error(editingDepartment ? '更新部门失败' : '创建部门失败');
    }
  };

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>部门管理</Title>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="搜索部门"
                allowClear
                onSearch={value => setSearchText(value)}
                style={{ width: 200 }}
              />
              <Tooltip title="刷新列表">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchDepartments}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新建部门
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredDepartments}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingDepartment ? '编辑部门' : '新建部门'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingDepartment(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="部门名称"
                rules={[{ required: true, message: '请输入部门名称' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="部门编码"
                rules={[{ required: true, message: '请输入部门编码' }]}
              >
                <Input placeholder="请输入部门编码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="parentId"
            label="上级部门"
          >
            <TreeSelect
              treeData={buildTreeData(departments)}
              placeholder="请选择上级部门"
              allowClear
              treeDefaultExpandAll
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="部门描述"
          >
            <TextArea rows={4} placeholder="请输入部门描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentManagement; 