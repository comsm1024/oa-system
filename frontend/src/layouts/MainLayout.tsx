import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
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
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { authService, User } from '../services/authService';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 从认证服务获取用户信息
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.clearUser();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: 'user/list',
          label: '用户列表',
        },
        {
          key: 'user/department',
          label: '部门管理',
        },
      ],
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
          defaultSelectedKeys={['user/list']}
          defaultOpenKeys={['user', 'settings']}
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
            padding: '0 24px',
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 