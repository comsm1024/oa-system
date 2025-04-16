import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import UserManagement from '../pages/UserManagement';
import ProcessManagement from '../pages/ProcessManagement';
import DocumentManagement from '../pages/DocumentManagement';
import DailyManagement from '../pages/DailyManagement';
import CommunicationManagement from '../pages/CommunicationManagement';
import ReportManagement from '../pages/ReportManagement';
import BasicSettings from '../pages/Settings/BasicSettings';
import PermissionSettings from '../pages/Settings/PermissionSettings';
import SystemLogs from '../pages/Settings/SystemLogs';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'user',
        element: <UserManagement />,
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