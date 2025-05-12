import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import UserManagement from '../pages/UserManagement';
import DepartmentManagement from '../pages/UserManagement/DepartmentManagement';
import ProcessManagement from '../pages/ProcessManagement';
import DocumentManagement from '../pages/DocumentManagement';
import DailyManagement from '../pages/DailyManagement';
import CommunicationManagement from '../pages/CommunicationManagement';
import ReportManagement from '../pages/ReportManagement';
import BasicSettings from '../pages/Settings/BasicSettings';
import PermissionSettings from '../pages/Settings/PermissionSettings';
import SystemLogs from '../pages/Settings/SystemLogs';
import Login from '../pages/Login';

// 简单的路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/user/list" replace />,
      },
      {
        path: 'user/list',
        element: <UserManagement />,
      },
      {
        path: 'user/department',
        element: <DepartmentManagement />,
      },
      {
        path: 'process',
        element: <ProcessManagement />,
      },
      {
        path: 'document',
        element: <DocumentManagement />,
      },
      {
        path: 'daily',
        element: <DailyManagement />,
      },
      {
        path: 'communication',
        element: <CommunicationManagement />,
      },
      {
        path: 'report',
        element: <ReportManagement />,
      },
      {
        path: 'settings/basic',
        element: <BasicSettings />,
      },
      {
        path: 'settings/permission',
        element: <PermissionSettings />,
      },
      {
        path: 'settings/logs',
        element: <SystemLogs />,
      },
    ],
  },
]);

export default router; 