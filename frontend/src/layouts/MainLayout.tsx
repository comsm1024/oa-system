import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CalendarOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'process',
      icon: <ProjectOutlined />,
      label: '流程管理',
    },
    {
      key: 'document',
      icon: <FileTextOutlined />,
      label: '文档管理',
    },
    {
      key: 'daily',
      icon: <CalendarOutlined />,
      label: '日常管理',
    },
    {
      key: 'communication',
      icon: <MessageOutlined />,
      label: '通讯管理',
    },
    {
      key: 'report',
      icon: <BarChartOutlined />,
      label: '报表管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'settings/basic',
          icon: <ToolOutlined />,
          label: '基本设置',
        },
        {
          key: 'settings/permission',
          icon: <SafetyCertificateOutlined />,
          label: '权限设置',
        },
        {
          key: 'settings/logs',
          icon: <FileSearchOutlined />,
          label: '系统日志',
        },
      ],
    },
  ];

  return (
    <Layout hasSider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: 'hidden auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['user']}
          defaultOpenKeys={['settings']}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200,
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        />
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 