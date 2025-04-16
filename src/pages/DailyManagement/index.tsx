import { Typography, Tabs, Calendar, Badge } from 'antd';
import type { TabsProps } from 'antd';
import type { Dayjs } from 'dayjs';
import LeaveManagement from './LeaveManagement';
import OvertimeManagement from './OvertimeManagement';

const { Title } = Typography;

const DailyManagement = () => {
  const items: TabsProps['items'] = [
    {
      key: 'attendance',
      label: '考勤管理',
      children: (
        <div>
          <Calendar
            cellRender={(date: Dayjs) => {
              const day = date.date();
              if (day % 3 === 0) {
                return <Badge status="success" text="正常" />;
              } else if (day % 3 === 1) {
                return <Badge status="warning" text="迟到" />;
              }
              return null;
            }}
          />
        </div>
      ),
    },
    {
      key: 'leave',
      label: '请假管理',
      children: <LeaveManagement />,
    },
    {
      key: 'overtime',
      label: '加班管理',
      children: <OvertimeManagement />,
    },
  ];

  return (
    <div>
      <Title level={2}>日常管理</Title>
      <Tabs defaultActiveKey="attendance" items={items} />
    </div>
  );
};

export default DailyManagement; 