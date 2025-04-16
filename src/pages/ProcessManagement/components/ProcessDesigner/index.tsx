import { useEffect, useState } from 'react';
import { Card, Layout, Menu, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import {
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  OneToOneOutlined,
} from '@ant-design/icons';
import LogicFlow from '@logicflow/core';
import { DndPanel, SelectionSelect, Control, MiniMap } from '@logicflow/extension';
import '@logicflow/core/dist/style/index.css';
import '@logicflow/extension/lib/style/index.css';
import './index.css';

const { Sider, Content } = Layout;
const { Option } = Select;

// 节点类型定义
const nodeTypes = [
  {
    type: 'start',
    label: '开始节点',
    icon: '🟢',
    properties: ['name'],
  },
  {
    type: 'approval',
    label: '审批节点',
    icon: '👤',
    properties: ['name', 'assignee', 'dueDate'],
  },
  {
    type: 'condition',
    label: '条件节点',
    icon: '❓',
    properties: ['name', 'condition'],
  },
  {
    type: 'parallel',
    label: '并行节点',
    icon: '⫲',
    properties: ['name'],
  },
  {
    type: 'end',
    label: '结束节点',
    icon: '⬤',
    properties: ['name'],
  },
];

interface ProcessDesignerProps {
  processKey?: string;
  onSave?: (data: any) => void;
}

const ProcessDesigner: React.FC<ProcessDesignerProps> = ({ processKey, onSave }) => {
  const [lf, setLf] = useState<LogicFlow>();
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [nodeForm] = Form.useForm();

  // 初始化流程设计器
  useEffect(() => {
    const logicflow = new LogicFlow({
      container: document.querySelector('#process-designer') as HTMLElement,
      grid: true,
      plugins: [DndPanel, SelectionSelect, Control, MiniMap],
    });

    // 注册自定义节点
    nodeTypes.forEach(node => {
      logicflow.register({
        type: node.type,
        view: {
          // 自定义节点样式
        },
        model: {
          // 自定义节点行为
        },
      });
    });

    // 监听节点点击事件
    logicflow.on('node:click', ({ data }) => {
      setCurrentNode(data);
      nodeForm.setFieldsValue(data.properties);
      setNodeModalVisible(true);
    });

    setLf(logicflow);

    // 如果有processKey，加载已有流程
    if (processKey) {
      // TODO: 加载流程数据
    }

    return () => {
      logicflow.destroy();
    };
  }, [processKey]);

  // 工具栏操作
  const handleUndo = () => lf?.undo();
  const handleRedo = () => lf?.redo();
  const handleZoomIn = () => lf?.zoom(true);
  const handleZoomOut = () => lf?.zoom(false);
  const handleResetZoom = () => lf?.resetZoom();

  // 保存流程
  const handleSave = () => {
    if (!lf) return;
    const data = lf.getGraphData();
    onSave?.(data);
    message.success('保存成功');
  };

  // 导入流程
  const handleImport = () => {
    Modal.confirm({
      title: '导入流程',
      content: '确定要导入新的流程数据吗？这将覆盖当前画布的内容。',
      onOk: () => {
        // TODO: 实现导入功能
        message.success('导入成功');
      },
    });
  };

  // 导出流程
  const handleExport = () => {
    if (!lf) return;
    const data = lf.getGraphData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `process-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  // 更新节点属性
  const handleUpdateNode = (values: any) => {
    if (!lf || !currentNode) return;
    lf.setProperties(currentNode.id, values);
    setNodeModalVisible(false);
    nodeForm.resetFields();
  };

  return (
    <Layout style={{ height: 'calc(100vh - 200px)' }}>
      <Sider width={200} theme="light">
        <div className="dnd-panel">
          <h3>流程节点</h3>
          {nodeTypes.map(node => (
            <div
              key={node.type}
              className="dnd-node"
              data-node-type={node.type}
            >
              <span className="node-icon">{node.icon}</span>
              <span>{node.label}</span>
            </div>
          ))}
        </div>
      </Sider>
      <Layout>
        <Card
          bodyStyle={{ padding: '8px 16px' }}
          extra={
            <Space>
              <Button icon={<UndoOutlined />} onClick={handleUndo} />
              <Button icon={<RedoOutlined />} onClick={handleRedo} />
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              <Button icon={<OneToOneOutlined />} onClick={handleResetZoom} />
              <Button icon={<ImportOutlined />} onClick={handleImport} />
              <Button icon={<ExportOutlined />} onClick={handleExport} />
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
            </Space>
          }
        />
        <Content>
          <div id="process-designer" style={{ height: '100%' }} />
        </Content>
      </Layout>

      <Modal
        title="节点配置"
        open={nodeModalVisible}
        onOk={() => nodeForm.submit()}
        onCancel={() => setNodeModalVisible(false)}
      >
        <Form
          form={nodeForm}
          layout="vertical"
          onFinish={handleUpdateNode}
        >
          <Form.Item
            name="name"
            label="节点名称"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input />
          </Form.Item>

          {currentNode?.type === 'approval' && (
            <>
              <Form.Item
                name="assignee"
                label="审批人"
                rules={[{ required: true, message: '请选择审批人' }]}
              >
                <Select>
                  <Option value="user1">张三</Option>
                  <Option value="user2">李四</Option>
                  <Option value="user3">王五</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="dueDate"
                label="截止时间"
              >
                <Input type="number" addonAfter="小时" />
              </Form.Item>
            </>
          )}

          {currentNode?.type === 'condition' && (
            <Form.Item
              name="condition"
              label="条件表达式"
              rules={[{ required: true, message: '请输入条件表达式' }]}
            >
              <Input.TextArea rows={4} placeholder="请输入条件表达式，例如：amount > 1000" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProcessDesigner; 