import { useState } from 'react';
import {
  Typography,
  Tabs,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Badge,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ProcessDesigner from './components/ProcessDesigner';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 流程定义接口
interface ProcessDefinition {
  id: string;
  name: string;
  key: string;
  version: number;
  description: string;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
}

// 流程实例接口
interface ProcessInstance {
  id: string;
  processDefinitionName: string;
  businessKey: string;
  startUser: string;
  startTime: string;
  status: 'running' | 'completed' | 'terminated';
  endTime?: string;
}

// 任务接口
interface Task {
  id: string;
  name: string;
  processInstanceId: string;
  processDefinitionName: string;
  assignee: string;
  createTime: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'canceled';
}

const ProcessManagement = () => {
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);
  const [currentProcessKey, setCurrentProcessKey] = useState<string>();
  const [definitionForm] = Form.useForm();

  // 流程定义列
  const definitionColumns: ColumnsType<ProcessDefinition> = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '流程标识',
      dataIndex: 'key',
      key: 'key',
      width: 150,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status === 'active' ? '启用' : '停用'}
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size={[4, 0]} wrap>
          <Tooltip title="设计流程">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleDesign(record)}
            />
          </Tooltip>
          <Tooltip title="启动流程">
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartProcess(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditDefinition(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDefinition(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 流程实例列
  const instanceColumns: ColumnsType<ProcessInstance> = [
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
      key: 'processDefinitionName',
      width: 200,
    },
    {
      title: '业务标识',
      dataIndex: 'businessKey',
      key: 'businessKey',
      width: 150,
    },
    {
      title: '发起人',
      dataIndex: 'startUser',
      key: 'startUser',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 170,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          running: { color: 'processing' as const, text: '运行中' },
          completed: { color: 'success' as const, text: '已完成' },
          terminated: { color: 'error' as const, text: '已终止' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size={[4, 0]} wrap>
          <Tooltip title="查看历史">
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record.id)}
            />
          </Tooltip>
          {record.status === 'running' && (
            <Tooltip title="终止流程">
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleTerminateInstance(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 任务列
  const taskColumns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '所属流程',
      dataIndex: 'processDefinitionName',
      key: 'processDefinitionName',
      width: 200,
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: '到期时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 170,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const colorMap = {
          high: 'red',
          medium: 'gold',
          low: 'blue',
        };
        const textMap = {
          high: '高',
          medium: '中',
          low: '低',
        };
        return (
          <Tag color={colorMap[priority as keyof typeof colorMap]}>
            {textMap[priority as keyof typeof textMap]}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'processing' as const, text: '处理中' },
          completed: { color: 'success' as const, text: '已完成' },
          canceled: { color: 'error' as const, text: '已取消' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color} text={config.text} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size={[4, 0]} wrap>
          {record.status === 'pending' && (
            <>
              <Tooltip title="完成">
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleCompleteTask(record.id)}
                />
              </Tooltip>
              <Tooltip title="转办">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleTransferTask(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 示例数据
  const definitionData: ProcessDefinition[] = [
    {
      id: '1',
      name: '请假申请流程',
      key: 'leave-process',
      version: 1,
      description: '员工请假申请的审批流程',
      status: 'active',
      createTime: '2024-03-20 10:00:00',
      updateTime: '2024-03-20 10:00:00',
    },
    {
      id: '2',
      name: '报销申请流程',
      key: 'expense-process',
      version: 2,
      description: '员工报销申请的审批流程',
      status: 'active',
      createTime: '2024-03-19 14:00:00',
      updateTime: '2024-03-20 09:00:00',
    },
  ];

  const instanceData: ProcessInstance[] = [
    {
      id: '1',
      processDefinitionName: '请假申请流程',
      businessKey: 'LEAVE-2024-001',
      startUser: '张三',
      startTime: '2024-03-20 10:30:00',
      status: 'running',
    },
    {
      id: '2',
      processDefinitionName: '报销申请流程',
      businessKey: 'EXPENSE-2024-001',
      startUser: '李四',
      startTime: '2024-03-19 14:30:00',
      status: 'completed',
      endTime: '2024-03-20 09:30:00',
    },
  ];

  const taskData: Task[] = [
    {
      id: '1',
      name: '部门经理审批',
      processInstanceId: '1',
      processDefinitionName: '请假申请流程',
      assignee: '王经理',
      createTime: '2024-03-20 10:30:00',
      dueDate: '2024-03-21 10:30:00',
      priority: 'high',
      status: 'pending',
    },
    {
      id: '2',
      name: '财务审核',
      processInstanceId: '2',
      processDefinitionName: '报销申请流程',
      assignee: '李财务',
      createTime: '2024-03-19 14:30:00',
      dueDate: '2024-03-20 14:30:00',
      priority: 'medium',
      status: 'completed',
    },
  ];

  // 处理函数
  const handleStartProcess = (id: string) => {
    message.success('流程启动成功');
  };

  const handleEditDefinition = (record: ProcessDefinition) => {
    definitionForm.setFieldsValue(record);
    setDefinitionModalVisible(true);
  };

  const handleDeleteDefinition = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个流程定义吗？',
      onOk() {
        message.success('删除成功');
      },
    });
  };

  const handleViewHistory = (id: string) => {
    message.info('查看流程历史');
  };

  const handleTerminateInstance = (id: string) => {
    Modal.confirm({
      title: '确认终止',
      content: '确定要终止这个流程实例吗？',
      onOk() {
        message.success('流程已终止');
      },
    });
  };

  const handleCompleteTask = (id: string) => {
    message.success('任务已完成');
  };

  const handleTransferTask = (id: string) => {
    message.info('转办功能待实现');
  };

  const handleSaveDefinition = (values: any) => {
    console.log('保存流程定义:', values);
    message.success('保存成功');
    setDefinitionModalVisible(false);
    definitionForm.resetFields();
  };

  // 处理流程设计
  const handleDesign = (record: ProcessDefinition) => {
    setCurrentProcessKey(record.key);
    setDesignerVisible(true);
  };

  // 处理流程保存
  const handleSaveProcess = (data: any) => {
    console.log('保存流程数据:', data);
    message.success('流程保存成功');
    setDesignerVisible(false);
  };

  const items: TabsProps['items'] = [
    {
      key: 'definition',
      label: '流程定义',
      children: (
        <Card
          title="流程定义列表"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                definitionForm.resetFields();
                setDefinitionModalVisible(true);
              }}
            >
              新建流程
            </Button>
          }
        >
          <Table
            columns={definitionColumns}
            dataSource={definitionData}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'instance',
      label: '流程实例',
      children: (
        <Card title="流程实例列表">
          <Table
            columns={instanceColumns}
            dataSource={instanceData}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'task',
      label: '任务管理',
      children: (
        <Card title="任务列表">
          <Table
            columns={taskColumns}
            dataSource={taskData}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>流程管理</Title>
      <Tabs defaultActiveKey="definition" items={items} />

      <Modal
        title="流程定义"
        open={definitionModalVisible}
        onOk={() => definitionForm.submit()}
        onCancel={() => setDefinitionModalVisible(false)}
        width={600}
      >
        <Form
          form={definitionForm}
          layout="vertical"
          onFinish={handleSaveDefinition}
        >
          <Form.Item
            name="name"
            label="流程名称"
            rules={[{ required: true, message: '请输入流程名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="key"
            label="流程标识"
            rules={[{ required: true, message: '请输入流程标识' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="流程描述"
            rules={[{ required: true, message: '请输入流程描述' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 流程设计器 Modal */}
      <Modal
        title="流程设计"
        open={designerVisible}
        onCancel={() => setDesignerVisible(false)}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
        footer={null}
      >
        <ProcessDesigner
          processKey={currentProcessKey}
          onSave={handleSaveProcess}
        />
      </Modal>
    </div>
  );
};

export default ProcessManagement; 