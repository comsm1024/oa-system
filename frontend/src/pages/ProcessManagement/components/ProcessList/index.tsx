import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { processService, Process, ProcessListParams } from '../../../../services/processService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ProcessList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processList, setProcessList] = useState<Process[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<ProcessListParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取流程列表
  const fetchProcessList = async () => {
    setLoading(true);
    try {
      const result = await processService.getProcessList(searchParams);
      setProcessList(result.list);
      setTotal(result.total);
    } catch (error) {
      // 错误已在请求拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProcessList();
  }, [searchParams]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams((prev: ProcessListParams) => ({
      ...prev,
      search: value,
      page: 1, // 重置页码
    }));
  };

  // 处理状态筛选
  const handleStatusChange = (value: string | undefined) => {
    setSearchParams((prev: ProcessListParams) => ({
      ...prev,
      status: value as 'active' | 'inactive' | 'archived' | undefined,
      page: 1, // 重置页码
    }));
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setSearchParams((prev: ProcessListParams) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // 处理激活流程
  const handleActivate = async (id: number) => {
    try {
      await processService.activateProcess(id);
      message.success('流程已激活');
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理停用流程
  const handleDeactivate = async (id: number) => {
    try {
      await processService.deactivateProcess(id);
      message.success('流程已停用');
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理归档流程
  const handleArchive = async (id: number) => {
    try {
      await processService.archiveProcess(id);
      message.success('流程已归档');
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理删除流程
  const handleDelete = async (id: number) => {
    try {
      await processService.deleteProcess(id);
      message.success('流程已删除');
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理编辑流程
  const handleEdit = (id: number) => {
    navigate(`/process/edit/${id}`);
  };

  // 处理创建流程
  const handleCreate = () => {
    navigate('/process/create');
  };

  // 表格列定义
  const columns = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Process) => (
        <a onClick={() => navigate(`/process/detail/${record.id}`)}>{text}</a>
      ),
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
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '已激活' },
          inactive: { color: 'orange', text: '已停用' },
          archived: { color: 'gray', text: '已归档' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建人',
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
      render: (_: any, record: Process) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          
          {record.status === 'inactive' && (
            <Button 
              type="link" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleActivate(record.id)}
            >
              激活
            </Button>
          )}
          
          {record.status === 'active' && (
            <Button 
              type="link" 
              icon={<PauseCircleOutlined />} 
              onClick={() => handleDeactivate(record.id)}
            >
              停用
            </Button>
          )}
          
          {record.status !== 'archived' && (
            <Button 
              type="link" 
              icon={<InboxOutlined />} 
              onClick={() => handleArchive(record.id)}
            >
              归档
            </Button>
          )}
          
          <Popconfirm
            title="确定要删除此流程吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="流程定义列表"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建流程
        </Button>
      }
    >
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
            <Option value="active">已激活</Option>
            <Option value="inactive">已停用</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={processList}
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

export default ProcessList; 