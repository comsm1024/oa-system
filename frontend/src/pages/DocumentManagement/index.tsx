import { Typography, Table, Button, Upload, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface Document {
  id: string;
  title: string;
  category: string;
  uploadTime: string;
  size: string;
  uploader: string;
}

const DocumentManagement = () => {
  const columns: ColumnsType<Document> = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">下载</Button>
          <Button type="link">预览</Button>
          <Button type="link" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const demoData: Document[] = [
    {
      id: '1',
      title: '项目计划书.docx',
      category: '项目文档',
      uploadTime: '2024-03-20',
      size: '2.5MB',
      uploader: '张三',
    },
    {
      id: '2',
      title: '会议纪要.pdf',
      category: '会议记录',
      uploadTime: '2024-03-19',
      size: '1.2MB',
      uploader: '李四',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>文档管理</Title>
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            message.success(`${file.name} 文件上传中...`);
            return false;
          }}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            上传文档
          </Button>
        </Upload>
      </div>
      <Table columns={columns} dataSource={demoData} rowKey="id" />
    </div>
  );
};

export default DocumentManagement;