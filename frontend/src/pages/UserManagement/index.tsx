import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Divider,
  Avatar,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: 'zhangsan',
      name: '张三',
      email: 'zhangsan@example.com',
      department: '技术部',
      role: 'admin',
      status: 'active',
    },
    {
      id: 2,
      username: 'lisi',
      name: '李四',
      email: 'lisi@example.com',
      department: '人事部',
      role: 'user',
      status: 'active',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const filteredUsers = users.filter(user => {
    const matchSearch = (
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
    );
    const matchDepartment = !selectedDepartment || user.department === selectedDepartment;
    return matchSearch && matchDepartment;
  });

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Tooltip title={`发送邮件至 ${email}`}>
          <a href={`mailto:${email}`}>{email}</a>
        </Tooltip>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (department) => (
        <Tag color="blue" style={{ padding: '4px 8px' }}>
          {department}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          admin: { color: '#ff4d4f', text: '系统管理员' },
          manager: { color: '#1890ff', text: '部门经理' },
          user: { color: '#52c41a', text: '普通用户' },
        };
        const config = roleConfig[role as keyof typeof roleConfig];
        return (
          <Tag color={config.color} style={{ padding: '4px 8px' }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={status === 'active' ? 'success' : 'default'}
          style={{ padding: '4px 8px', width: '60px', textAlign: 'center' }}
        >
          {status === 'active' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑用户">
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
          <Tooltip title="删除用户">
            <Popconfirm
              title="确定要删除此用户吗？"
              description="删除后数据将无法恢复"
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
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    message.success('删除成功');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // 编辑用户
        setUsers(users.map(user =>
          user.id === editingUser.id ? { ...values, id: editingUser.id } : user
        ));
        message.success('更新成功');
      } else {
        // 添加用户
        const newUser = {
          ...values,
          id: Math.max(...users.map(u => u.id)) + 1,
          status: 'active',
        };
        setUsers([...users, newUser]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
    });
  };

  // 新增部门数据状态
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  
  // 获取部门数据
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('获取部门列表失败:', error);
        message.error('获取部门失败');
      }
    };
    fetchDepartments();
  }, []);

  const roles = ['admin', 'manager', 'user'];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>用户管理</Title>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Search
              placeholder="搜索用户名、姓名或邮箱"
              allowClear
              enterButton={<><SearchOutlined /> 搜索</>}
              size="large"
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} lg={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="选择部门筛选"
                allowClear
                size="large"
                onChange={value => setSelectedDepartment(value)}
                value={selectedDepartment}
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                ))}
              </Select>
              <Tooltip title="重置筛选">
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchText('');
                    setSelectedDepartment('');
                  }}
                />
              </Tooltip>
            </Space.Compact>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          position: ['bottomRight']
        }}
        style={{ width: '100%' }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  {departments.map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  {roles.map(role => (
                    <Option key={role} value={role}>
                      {role === 'admin' ? '系统管理员' : role === 'manager' ? '部门经理' : '普通用户'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;