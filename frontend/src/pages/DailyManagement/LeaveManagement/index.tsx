import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { leaveService } from '../../../services/leaveService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

interface LeaveRequest {
}

const LeaveManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>([]);

  const columns: ColumnsType<LeaveRequest> = [
    {
      title: '申请人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 100,
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '时长(天)',
      dataIndex: 'duration',
      key: 'duration',
      width: 90,
      align: 'center',
    },
    {
      title: '请假原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 250,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'gold', text: '待审批' },
          approved: { color: 'green', text: '已批准' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size={[4, 0]} wrap>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(record.key)}>
                批准
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record.key)}>
                拒绝
              </Button>
            </>
          )}
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  const fetchLeaveList = async () => {
    setLoading(true);
    try {
      const response = await leaveService.getLeaveList(searchParams);
      setLeaveList(response.list);
      setTotal(response.total);
    } catch (error) {
      console.error('获取请假列表失败:', error);
      message.error('获取请假列表失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaveList();
  }, [searchParams])

  const handleApprove = async (key: string) => {
    Modal.confirm({
      title: '审批确认',
      content: '确定通过该请假申请吗？',
      onOk: async () => {
        try {
          const response = await leaveService.approveLeave(key, {
            processKey: key,
            comment: '同意'
          });
          
          if (response.success) {
            message.success('请假申请已批准');
            // 刷新列表
            fetchLeaveList();
          } else {
            message.error(response.message || '审批失败');
          }
        } catch (error) {
          console.error('审批失败:', error);
          message.error('审批失败，请稍后重试');
        }
      }
    });
  };

  const handleReject = async (key: string) => {
    Modal.confirm({
      title: '审批确认',
      content: '确定拒绝该请假申请吗？',
      onOk: async () => {
        try {
          const response = await leaveService.rejectLeave({
            processKey: key,
            comment: '拒绝'
          });
          
          if (response.success) {
            message.error('请假申请已拒绝');
            // 刷新列表
            fetchLeaveList();
          } else {
            message.error(response.message || '审批失败');
          }
        } catch (error) {
          console.error('审批失败:', error);
          message.error('审批失败，请稍后重试');
        }
      }
    });
  };

  const handleView = (record: LeaveRequest) => {
    const formData = {
      ...record,
      dateRange: [dayjs(record.start_time), dayjs(record.end_time)],
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    const formattedValues = {
      ...values,
      start_time: values.dateRange[0].format('YYYY-MM-DD'),
      end_time: values.dateRange[1].format('YYYY-MM-DD'),
      dateRange: undefined,
    };
    console.log('提交的请假申请:', formattedValues);
    try {
      await leaveService.createLeave(formattedValues);
      message.success('请假申请已提交');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交请假申请失败:', error);
      message.error('提交请假申请失败');
    }
  };

  return (
    <div>
      <Card
        title="请假申请列表"
        extra={
          <Button type="primary" onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}>
            新建请假
          </Button>
        }
      >
        <Table 
          columns={columns}
          loading={loading}
          dataSource={leaveList}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="请假申请"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select>
              <Option value="年假">年假</Option>
              <Option value="事假">事假</Option>
              <Option value="病假">病假</Option>
              <Option value="婚假">婚假</Option>
              <Option value="产假">产假</Option>
              <Option value="丧假">丧假</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="请假时间"
            rules={[{ required: true, message: '请选择请假时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="请假原因"
            rules={[{ required: true, message: '请输入请假原因' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveManagement; 