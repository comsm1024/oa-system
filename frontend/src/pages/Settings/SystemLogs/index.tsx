import { Typography, Card, Table, DatePicker, Form, Select, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface LogEntry {
  key: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}

const SystemLogs = () => {
  const columns: ColumnsType<LogEntry> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: 'info' | 'warning' | 'error') => {
        const colors: Record<'info' | 'warning' | 'error', string> = {
          info: 'blue',
          warning: 'gold',
          error: 'red',
        };
        return (
          <span style={{ color: colors[level] }}>
            {level.toUpperCase()}
          </span>
        );
      },
    },
  ];

  const logData: LogEntry[] = [
    {
      key: '1',
      timestamp: '2024-03-20 10:30:15',
      user: '张三',
      action: '登录',
      module: '系统',
      details: '用户登录成功',
      level: 'info',
    },
    {
      key: '2',
      timestamp: '2024-03-20 11:15:22',
      user: '李四',
      action: '修改',
      module: '用户管理',
      details: '修改用户权限设置',
      level: 'warning',
    },
    {
      key: '3',
      timestamp: '2024-03-20 14:45:30',
      user: '系统',
      action: '异常',
      module: '文档管理',
      details: '文件上传失败：服务器连接超时',
      level: 'error',
    },
  ];

  return (
    <Card bordered={false}>
      <Title level={2}>系统日志</Title>
      
      <Form layout="inline" style={{ marginBottom: 24 }}>
        <Form.Item label="时间范围">
          <RangePicker showTime />
        </Form.Item>
        <Form.Item label="日志级别">
          <Select style={{ width: 120 }} defaultValue="all">
            <Option value="all">全部</Option>
            <Option value="info">信息</Option>
            <Option value="warning">警告</Option>
            <Option value="error">错误</Option>
          </Select>
        </Form.Item>
        <Form.Item label="模块">
          <Select style={{ width: 120 }} defaultValue="all">
            <Option value="all">全部</Option>
            <Option value="system">系统</Option>
            <Option value="user">用户管理</Option>
            <Option value="document">文档管理</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary">查询</Button>
            <Button>重置</Button>
            <Button>导出日志</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={logData}
        pagination={{
          total: 100,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );
};

export default SystemLogs; 