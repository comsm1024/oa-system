import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, message, Popconfirm, Modal, Dropdown } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, InboxOutlined, MoreOutlined } from '@ant-design/icons';
import { processService, Process, ProcessListParams } from '../../../../services/processService';
import { useNavigate } from 'react-router-dom';
import ProcessForm from '../ProcessForm';

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
  
  // 创建流程相关状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);

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
  const handleEdit = async (process: Process) => {
    try {
      // 获取流程详情
      const processDetail = await processService.getProcessDetail(process.id);
      setCurrentProcess(processDetail);
      setEditModalVisible(true);
    } catch (error) {
      message.error('获取流程详情失败');
    }
  };

  // 处理创建流程
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // 处理创建流程表单提交
  const handleCreateSubmit = async (values: any) => {
    try {
      await processService.createProcess(values);
      message.success('流程创建成功');
      setCreateModalVisible(false);
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
  };

  // 处理编辑提交
  const handleEditSubmit = async (values: any) => {
    if (!currentProcess) return;
    
    try {
      await processService.updateProcess(currentProcess.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchProcessList();
    } catch (error) {
      // 错误已在请求拦截器中处理
    }
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
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Process) => {
        const items = [
          record.status === 'inactive' ? {
            key: 'activate',
            label: '激活',
            icon: <PlayCircleOutlined />,
            onClick: () => handleActivate(record.id),
          } : null,
          record.status === 'active' ? {
            key: 'deactivate',
            label: '停用',
            icon: <PauseCircleOutlined />,
            onClick: () => handleDeactivate(record.id),
          } : null,
          record.status !== 'archived' ? {
            key: 'archive',
            label: '归档',
            icon: <InboxOutlined />,
            onClick: () => handleArchive(record.id),
          } : null,
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除此流程吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span>删除</span>
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
          },
        ].filter((item): item is NonNullable<typeof item> => item !== null);

        return (
          <Space size="middle" style={{ whiteSpace: 'nowrap' }}>
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
            >
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
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
        scroll={{ x: 'max-content' }}
      />

      {/* 创建流程模态框 */}
      <Modal
        title="创建流程"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProcessForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑流程"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentProcess && (
          <ProcessForm
            initialValues={currentProcess}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
      </Modal>
    </Card>
  );
};

export default ProcessList; 