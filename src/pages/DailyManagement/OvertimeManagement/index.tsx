import { useState } from 'react';
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
  InputNumber,
  Row,
  Col,
  Progress,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { exportToFile } from '../../../utils/export';
import { ExportModal } from '../../../components/ExportModal.tsx';
import type { ExportFormat, ExportRow } from '../../../components/ExportModal.tsx';
import { generateMockData, OvertimeRequest } from './mockData';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OvertimeManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [showExpiryDate, setShowExpiryDate] = useState(false);

  const columns: ColumnsType<OvertimeRequest> = [
    {
      title: '申请人',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '加班类型',
      dataIndex: 'overtimeType',
      key: 'overtimeType',
      width: 120,
    },
    {
      title: '加班日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
    },
    {
      title: '时长(小时)',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      align: 'center',
    },
    {
      title: '加班原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 250,
    },
    {
      title: '补偿方式',
      dataIndex: 'compensationType',
      key: 'compensationType',
      width: 120,
      render: (compensationType: string) => {
        const colorMap = {
          '调休': 'blue',
          '加班工资': 'green',
          '加班工资和调休': 'purple'
        };
        return <Tag color={colorMap[compensationType as keyof typeof colorMap]}>{compensationType}</Tag>;
      },
    },
    {
      title: '调休有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (expiryDate: string | undefined, record: OvertimeRequest) => {
        if (!record.compensationType.includes('调休')) {
          return '-';
        }
        const isExpiringSoon = dayjs(expiryDate).diff(dayjs(), 'days') <= 7;
        return (
          <Tag color={isExpiringSoon ? 'warning' : undefined}>
            {expiryDate}
          </Tag>
        );
      },
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
      render: (_, item: OvertimeRequest) => (
        <Space size={[4, 0]} wrap>
          {item.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(item.key)}>
                批准
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReject(item.key)}>
                拒绝
              </Button>
            </>
          )}
          <Button type="link" size="small" onClick={() => handleView(item)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  const sampleData = generateMockData();

  const handleApprove = (key: string) => {
    message.success('加班申请已批准');
  };

  const handleReject = (key: string) => {
    message.error('加班申请已拒绝');
  };

  const handleView = (record: OvertimeRequest) => {
    const formData = {
      ...record,
      date: dayjs(record.date),
      startTime: dayjs(record.startTime, 'HH:mm'),
      endTime: dayjs(record.endTime, 'HH:mm'),
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      startTime: values.startTime.format('HH:mm'),
      endTime: values.endTime.format('HH:mm'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
    };
    console.log('提交的加班申请:', formattedValues);
    message.success('加班申请已提交');
    setIsModalVisible(false);
    form.resetFields();
  };

  // 准备预览数据
  const getPreviewData = () => {
    return sampleData.map(item => ({
      '申请人': item.employeeName,
      '加班类型': item.overtimeType,
      '加班日期': item.date,
      '开始时间': item.startTime,
      '结束时间': item.endTime,
      '时长(小时)': item.duration,
      '加班原因': item.reason,
      '补偿方式': item.compensationType,
      '调休有效期': item.expiryDate || '-',
      '状态': item.status === 'pending' ? '待审批' : 
             item.status === 'approved' ? '已批准' : '已拒绝'
    }));
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExportModalVisible(false);
    
    // 导出文件
    await exportToFile(getPreviewData(), '加班记录', format, (progress) => {
      setExportProgress(progress);
    });
  };

  const handleSearch = (values: any) => {
    const formattedValues = {
      ...values,
      dateRange: values.dateRange ? [
        values.dateRange[0].format('YYYY-MM-DD'),
        values.dateRange[1].format('YYYY-MM-DD'),
      ] : undefined,
    };
    console.log('搜索条件:', formattedValues);
    // 这里可以根据条件筛选数据
    message.success('搜索完成');
  };

  // 根据加班类型推荐补偿方式
  const handleOvertimeTypeChange = (value: string) => {
    const compensationMap = {
      '工作日加班': '加班工资',
      '节假日加班': '加班工资和调休',
      '周末加班': '调休'
    };
    form.setFieldValue('compensationType', compensationMap[value as keyof typeof compensationMap]);
  };

  // 验证结束时间必须大于开始时间
  const validateEndTime = (_: any, value: any) => {
    const startTime = form.getFieldValue('startTime');
    if (startTime && value && value.isBefore(startTime)) {
      return Promise.reject('结束时间必须大于开始时间');
    }
    return Promise.resolve();
  };

  // 自动计算时长
  const calculateDuration = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    if (startTime && endTime) {
      const hours = endTime.diff(startTime, 'hour', true);
      form.setFieldValue('duration', Math.max(0.5, Math.round(hours * 2) / 2));
    }
  };

  // 处理补偿方式变更
  const handleCompensationTypeChange = (value: string) => {
    setShowExpiryDate(value.includes('调休'));
    if (!value.includes('调休')) {
      form.setFieldValue('expiryDate', undefined);
    } else {
      // 默认设置为3个月后
      form.setFieldValue('expiryDate', dayjs().add(3, 'month'));
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="employeeName" label="申请人">
                <Input placeholder="请输入申请人姓名" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="overtimeType" label="加班类型">
                <Select placeholder="请选择加班类型" allowClear>
                  <Option value="工作日加班">工作日加班</Option>
                  <Option value="节假日加班">节假日加班</Option>
                  <Option value="周末加班">周末加班</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateRange" label="加班日期">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="pending">待审批</Option>
                  <Option value="approved">已批准</Option>
                  <Option value="rejected">已拒绝</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="compensationType" label="补偿方式">
                <Select placeholder="请选择补偿方式" allowClear>
                  <Option value="调休">调休</Option>
                  <Option value="加班工资">加班工资</Option>
                  <Option value="加班工资和调休">加班工资和调休</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => searchForm.resetFields()}>
                  重置
                </Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  搜索
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => setIsExportModalVisible(true)}
                >
                  导出记录
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="加班申请列表"
        extra={
          <Button type="primary" onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}>
            新建加班
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={sampleData}
          pagination={{
            total: sampleData.length,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title="加班申请"
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
            name="overtimeType"
            label="加班类型"
            rules={[{ required: true, message: '请选择加班类型' }]}
          >
            <Select onChange={handleOvertimeTypeChange}>
              <Option value="工作日加班">工作日加班</Option>
              <Option value="节假日加班">节假日加班</Option>
              <Option value="周末加班">周末加班</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="加班日期"
            rules={[{ required: true, message: '请选择加班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker.TimePicker 
                format="HH:mm" 
                style={{ width: '100%' }} 
                onChange={calculateDuration}
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="结束时间"
              rules={[
                { required: true, message: '请选择结束时间' },
                { validator: validateEndTime }
              ]}
            >
              <DatePicker.TimePicker 
                format="HH:mm" 
                style={{ width: '100%' }} 
                onChange={calculateDuration}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="duration"
            label="预计时长（小时）"
            rules={[
              { required: true, message: '请输入预计时长' },
              { type: 'number', min: 0.5, max: 24, message: '时长必须在0.5到24小时之间' }
            ]}
          >
            <InputNumber min={0.5} max={24} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="compensationType"
            label="补偿方式"
            rules={[
              { required: true, message: '请选择补偿方式' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const overtimeType = getFieldValue('overtimeType');
                  const duration = getFieldValue('duration');
                  
                  if (overtimeType === '节假日加班' && value === '调休' && duration > 8) {
                    return Promise.reject('节假日加班超过8小时必须包含加班工资补偿');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Select onChange={handleCompensationTypeChange}>
              <Option value="调休">调休</Option>
              <Option value="加班工资">加班工资</Option>
              <Option value="加班工资和调休">加班工资和调休</Option>
            </Select>
          </Form.Item>

          {showExpiryDate && (
            <>
              <Alert
                message="调休说明"
                description="调休时间到期前未使用将自动转为加班工资进行补偿"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.Item
                name="expiryDate"
                label="调休有效期"
                rules={[
                  { required: true, message: '请选择调休有效期' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const overtimeDate = getFieldValue('date');
                      if (value && overtimeDate && value.isBefore(overtimeDate)) {
                        return Promise.reject('调休有效期不能早于加班日期');
                      }
                      if (value && value.isBefore(dayjs())) {
                        return Promise.reject('调休有效期不能早于当前日期');
                      }
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="reason"
            label="加班原因"
            rules={[{ required: true, message: '请输入加班原因' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <ExportModal
        open={isExportModalVisible}
        onCancel={() => setIsExportModalVisible(false)}
        onExport={handleExport}
        data={getPreviewData()}
      />

      {exportProgress > 0 && exportProgress < 100 && (
        <Modal
          title="导出进度"
          open={true}
          footer={null}
          closable={false}
          maskClosable={false}
        >
          <Progress percent={Math.round(exportProgress)} status="active" />
        </Modal>
      )}
    </div>
  );
};

export default OvertimeManagement; 