import { Typography, Form, Select, Button, Card, Table, Tag, Space, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface RolePermission {
  key: string;
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

const PermissionSettings = () => {
  const [form] = Form.useForm();

  const columns: ColumnsType<RolePermission> = [
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '查看',
      dataIndex: 'view',
      key: 'view',
      render: (value, record) => (
        <Switch defaultChecked={value} size="small" />
      ),
    },
    {
      title: '创建',
      dataIndex: 'create',
      key: 'create',
      render: (value) => (
        <Switch defaultChecked={value} size="small" />
      ),
    },
    {
      title: '编辑',
      dataIndex: 'edit',
      key: 'edit',
      render: (value) => (
        <Switch defaultChecked={value} size="small" />
      ),
    },
    {
      title: '删除',
      dataIndex: 'delete',
      key: 'delete',
      render: (value) => (
        <Switch defaultChecked={value} size="small" />
      ),
    },
  ];

  const permissionData: RolePermission[] = [
    {
      key: '1',
      module: '用户管理',
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
    {
      key: '2',
      module: '文档管理',
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
    {
      key: '3',
      module: '流程管理',
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    {
      key: '4',
      module: '报表管理',
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
  ];

  return (
    <Card bordered={false}>
      <Title level={2}>权限设置</Title>
      
      <div style={{ marginBottom: 24 }}>
        <Form layout="inline">
          <Form.Item label="选择角色">
            <Select
              style={{ width: 200 }}
              defaultValue="admin"
              onChange={(value) => console.log(value)}
            >
              <Option value="admin">系统管理员</Option>
              <Option value="manager">部门经理</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>

      <Table
        columns={columns}
        dataSource={permissionData}
        pagination={false}
        bordered
      />

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button>重置</Button>
          <Button type="primary">保存设置</Button>
        </Space>
      </div>
    </Card>
  );
};

export default PermissionSettings; 