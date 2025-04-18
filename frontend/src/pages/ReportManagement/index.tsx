import { Typography, Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const ReportManagement = () => {
  return (
    <div>
      <Title level={2}>报表管理</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月考勤率"
              value={98.5}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文档数量"
              value={256}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={12}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="考勤统计">
            {/* 这里可以添加考勤统计图表 */}
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              考勤统计图表
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="绩效分析">
            {/* 这里可以添加绩效分析图表 */}
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              绩效分析图表
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportManagement; 