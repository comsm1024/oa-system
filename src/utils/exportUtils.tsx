import { message, Modal, Progress, Radio, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

export interface ExportRow {
  [key: string]: string | number;
}

export type ExportFormat = 'csv' | 'excel';

interface ExportModalProps {
  open: boolean;
  onCancel: () => void;
  onExport: (format: ExportFormat) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onCancel,
  onExport,
}) => {
  const [format, setFormat] = useState<ExportFormat>('excel');

  const handleFormatChange = (e: RadioChangeEvent) => {
    setFormat(e.target.value);
  };

  return (
    <Modal
      title="导出设置"
      open={open}
      onOk={() => onExport(format)}
      onCancel={onCancel}
      okText="导出"
      cancelText="取消"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>请选择导出格式：</div>
        <Radio.Group value={format} onChange={handleFormatChange}>
          <Radio value="excel">Excel格式（.xlsx）</Radio>
          <Radio value="csv">CSV格式（.csv）</Radio>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export const exportToFile = async (
  data: ExportRow[],
  filename: string,
  format: ExportFormat,
  onProgress?: (progress: number) => void
) => {
  try {
    // 开始导出
    onProgress?.(0);
    const key = 'export-progress';
    message.loading({ content: '正在准备导出数据...', key });

    // 获取所有列名
    const headers = Object.keys(data[0]);
    
    // 准备数据，分批处理以提高性能
    const batchSize = 1000;
    const totalRows = data.length;
    const processedRows: string[][] = [];
    
    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(item => 
        headers.map(header => String(item[header]))
      );
      processedRows.push(...batch);
      
      // 更新进度
      const progress = Math.min(90, (i / totalRows) * 100);
      onProgress?.(progress);
      message.loading({ content: `正在处理数据 ${Math.round(progress)}%...`, key });
      
      // 让出主线程，避免界面卡顿
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // 更新进度
    onProgress?.(95);
    message.loading({ content: '正在生成文件...', key });

    if (format === 'csv') {
      // 生成CSV内容
      const csvContent = [
        headers.join(','),
        ...processedRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // 创建Blob对象，添加BOM以支持中文
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, filename, 'csv');
    } else {
      // 如果是Excel格式，需要动态加载xlsx库
      const XLSX = await import('xlsx');
      
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 添加数据
      const ws = XLSX.utils.aoa_to_sheet([headers, ...processedRows]);
      
      // 设置列宽
      const colWidths = headers.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
      
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '数据');
      
      // 生成Excel文件
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadFile(blob, filename, 'xlsx');
    }

    // 完成导出
    onProgress?.(100);
    message.success({ content: '导出成功！', key });
  } catch (error) {
    console.error('导出失败:', error);
    message.error({ content: '导出失败，请重试', key: 'export-progress' });
    onProgress?.(0);
  }
};

const downloadFile = (blob: Blob, filename: string, extension: string) => {
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // 设置文件名
  const fullFilename = `${filename}_${dayjs().format('YYYY-MM-DD_HHmmss')}.${extension}`;
  
  // 触发下载
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理URL对象
  URL.revokeObjectURL(url);
}; 