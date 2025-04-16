import { Typography, Tabs, List, Avatar, Button, Input } from 'antd';
import { UserOutlined, MessageOutlined, NotificationOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

const CommunicationManagement = () => {
  const items: TabsProps['items'] = [
    {
      key: 'message',
      label: '即时消息',
      icon: <MessageOutlined />,
      children: (
        <div style={{ display: 'flex', height: 'calc(100vh - 250px)' }}>
          <div style={{ width: 250, borderRight: '1px solid #f0f0f0', padding: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={[
                { id: 1, name: '张三', message: '最新消息...' },
                { id: 2, name: '李四', message: '最新消息...' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ cursor: 'pointer' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={item.message}
                  />
                </List.Item>
              )}
            />
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={[
                  { id: 1, sender: '张三', content: '你好！', time: '10:00' },
                  { id: 2, sender: '我', content: '你好！有什么事吗？', time: '10:01' },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ justifyContent: item.sender === '我' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                        {item.sender} {item.time}
                      </div>
                      <div style={{ background: item.sender === '我' ? '#1890ff' : '#f0f0f0', 
                                  color: item.sender === '我' ? '#fff' : '#000',
                                  padding: '8px 12px',
                                  borderRadius: 8 }}>
                        {item.content}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea rows={4} placeholder="请输入消息..." />
              <Button type="primary">发送</Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'announcement',
      label: '公告管理',
      icon: <NotificationOutlined />,
      children: (
        <List
          itemLayout="vertical"
          dataSource={[
            {
              id: 1,
              title: '关于五一放假安排的通知',
              content: '根据国家规定，今年五一放假安排如下...',
              time: '2024-03-20',
            },
            {
              id: 2,
              title: '公司年度会议通知',
              content: '定于下周三下午2点在大会议室召开年度总结会议...',
              time: '2024-03-19',
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.time}
              />
              {item.content}
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>通讯管理</Title>
      <Tabs defaultActiveKey="message" items={items} />
    </div>
  );
};

export default CommunicationManagement; 