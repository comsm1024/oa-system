import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, message, Popconfirm } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined, HistoryOutlined } from '@ant-design/icons';
import { processService, ProcessInstance, ProcessInstanceListParams } from '../../../../services/processService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ProcessInstanceList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instanceList, setInstanceList] = useState<ProcessInstance[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<ProcessInstanceListParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取流程实例列表
  const fetchInstanceList = async () => {
    setLoading(true);
    try {
      const result = await processService.getProcessInstanceList(searchParams);
      setInstanceList(result.list);
      setTotal(result.total);
    } catch (error) {
      // 错误已在请求拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchInstanceList();
  }, [searchParams]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams((prev: ProcessInstanceListParams) => ({
      ...prev,
      search: value,
      page: 1, // 重置页码
    }));
  };

  // 处理状态筛选
  const handleStatusChange = (value: string | undefined) => {
    setSearchParams((prev: ProcessInstanceListParams) => ({
      ...prev,
      status: value as 'pending' | 'in_progress' | 'completed' | 'rejected' | undefined,
      page: 1, // 重置页码
    }));
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setSearchParams((prev: ProcessInstanceListParams) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // 处理审批流程实例
  const handleApprove = async (id: number, comment?: string) => {
    try {
      await processService.approveProcessInstance(id, comment);
      message.success('审批成功');
      fetchInstanceList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理拒绝流程实例
  const handleReject = async (id: number, comment?: string) => {
    try {
      await processService.rejectProcessInstance(id, comment);
      message.success('已拒绝');
      fetchInstanceList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理退回流程实例
  const handleReturn = async (id: number, stepId: number, comment?: string) => {
    try {
      await processService.returnProcessInstance(id, stepId, comment);
      message.success('已退回');
      fetchInstanceList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理查看详情
  const handleViewDetail = (id: number) => {
    navigate(`/process-instance/detail/${id}`);
  };

  // 表格列定义
  const columns = [
    {
      title: '流程名称',
      dataIndex: 'processName',
      key: 'processName',
      render: (text: string, record: ProcessInstance) => (
        <a onClick={() => handleViewDetail(record.id)}>{text}</a>
      ),
    },
    {
      title: '当前步骤',
      dataIndex: 'currentStep',
      key: 'currentStep',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          in_progress: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '发起人',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProcessInstance) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<HistoryOutlined />} 
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleApprove(record.id)}
              >
                审批
              </Button>
              
              <Button 
                type="link" 
                danger
                icon={<CloseCircleOutlined />} 
                onClick={() => handleReject(record.id)}
              >
                拒绝
              </Button>
              
              <Button 
                type="link" 
                icon={<RollbackOutlined />} 
                onClick={() => handleReturn(record.id, record.currentStep)}
              >
                退回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="流程实例列表">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索流程名称"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            allowClear
            onChange={handleStatusChange}
            value={searchParams.status}
          >
            <Option value="pending">待处理</Option>
            <Option value="in_progress">处理中</Option>
            <Option value="completed">已完成</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={instanceList}
        rowKey="id"
        loading={loading}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default ProcessInstanceList; 