import { Typography, Form, Input, Switch, Button, Select, Card } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const BasicSettings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <Card bordered={false}>
      <Title level={2}>基本设置</Title>
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
        style={{ maxWidth: 600 }}
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
  );
};

export default BasicSettings; 