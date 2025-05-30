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
import { departmentService, DepartmentQuery } from '../../../services/departmentService';

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
  const [searchParams, setSearchParams] = useState<DepartmentQuery>({
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
      
      setDepartments(response);
    } catch (error) {
      console.error('获取部门列表失败:', error);
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [searchParams]);

  // 过滤部门列表
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Department> = [
    {
      title: '部门信息',
      dataIndex: 'name',
      key: 'name',
      minWidth: 180,
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
      minWidth: 150,
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
      minWidth: 150,
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
      minWidth: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
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
      await departmentService.deleteDepartment(id)
      fetchDepartments();
    } catch (error) {
      console.error('删除部门失败:', error);
      message.error('删除部门失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setSearchParams((prev: DepartmentQuery) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, values);
      } else {
        await departmentService.createDepartment(values);
      }
      message.success(editingDepartment ? '更新成功' : '创建成功');
      setIsModalVisible(false);
      form.resetFields();
      if (editingDepartment) {
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id ? { ...dept, ...values } : dept
        ));
      } else {
        fetchDepartments();
      }
    } catch (error) {
      console.error(editingDepartment ? '更新部门失败:' : '创建部门失败:', error);
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
        tableLayout="auto"
        columns={columns}
        dataSource={filteredDepartments}
        indentSize={30}
        rowKey="id"
        loading={loading}
        pagination={false}
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
            <Col span={24}>
              <Form.Item
                name="name"
                label="部门名称"
                rules={[{ required: true, message: '请输入部门名称' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="parentId"
            label="上级部门"
          >
            <TreeSelect
              treeData={departments}
              fieldNames={{ label: 'name', value: 'id' }}
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