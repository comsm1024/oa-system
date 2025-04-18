import React, { useState } from 'react';
import { Modal, Radio, Space, Table, Tabs } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export type ExportFormat = 'csv' | 'excel';

export interface ExportRow {
  [key: string]: string | number;
}

interface ExportModalProps {
  open: boolean;
  onCancel: () => void;
  onExport: (format: ExportFormat) => void;
  data: ExportRow[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onCancel,
  onExport,
  data,
}) => {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [activeTab, setActiveTab] = useState<string>('settings');

  const handleFormatChange = (e: RadioChangeEvent) => {
    setFormat(e.target.value);
  };

  // 从数据中提取列定义
  const columns: ColumnsType<ExportRow> = Object.keys(data[0] || {}).map(key => ({
    title: key,
    dataIndex: key,
    key: key,
    ellipsis: true,
  }));

  const items = [
    {
      key: 'settings',
      label: '导出设置',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>请选择导出格式：</div>
          <Radio.Group value={format} onChange={handleFormatChange}>
            <Radio value="excel">Excel格式（.xlsx）</Radio>
            <Radio value="csv">CSV格式（.csv）</Radio>
          </Radio.Group>
        </Space>
      ),
    },
    {
      key: 'preview',
      label: '数据预览',
      children: (
        <Table
          columns={columns}
          dataSource={data.slice(0, 5)}
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      ),
    },
  ];

  return (
    <Modal
      title="导出设置"
      open={open}
      onOk={() => onExport(format)}
      onCancel={onCancel}
      okText="导出"
      cancelText="取消"
      width={800}
    >
      <Tabs 
        items={items}
        activeKey={activeTab}
        onChange={setActiveTab}
      />
    </Modal>
  );
}; 