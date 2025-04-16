import { Typography, Form, Input, Switch, Button, Select, Card, Space } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div>
      <Title level={2}>系统设置</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="基本设置">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              companyName: '示例公司',
              systemName: 'OA办公系统',
              enableNotification: true,
              language: 'zh_CN',
            }}
          >
            <Form.Item
              label="公司名称"
              name="companyName"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="系统名称"
              name="systemName"
              rules={[{ required: true, message: '请输入系统名称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="系统语言"
              name="language"
              rules={[{ required: true, message: '请选择系统语言' }]}
            >
              <Select>
                <Option value="zh_CN">简体中文</Option>
                <Option value="en_US">English</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="启用通知"
              name="enableNotification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="权限设置">
          <Form layout="vertical">
            <Form.Item label="用户权限">
              <Select mode="multiple" placeholder="选择用户权限" style={{ width: '100%' }}>
                <Option value="admin">系统管理员</Option>
                <Option value="manager">部门经理</Option>
                <Option value="employee">普通员工</Option>
              </Select>
            </Form.Item>

            <Form.Item label="模块权限">
              <Select mode="multiple" placeholder="选择模块权限" style={{ width: '100%' }}>
                <Option value="user">用户管理</Option>
                <Option value="document">文档管理</Option>
                <Option value="process">流程管理</Option>
                <Option value="report">报表管理</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary">保存权限</Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="系统日志">
          <div style={{ height: 200, overflowY: 'auto', padding: 16, background: '#f5f5f5' }}>
            <p>2024-03-20 14:30:00 - 系统启动</p>
            <p>2024-03-20 14:35:12 - 用户登录: admin</p>
            <p>2024-03-20 14:40:25 - 文档上传: 会议纪要.docx</p>
            <p>2024-03-20 15:00:00 - 系统配置更新</p>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default Settings; 