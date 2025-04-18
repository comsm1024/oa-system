import { useEffect, useState, useRef } from 'react';
import { Card, Layout, Menu, Button, Space, message, Modal, Form, Input, Select, Steps } from 'antd';
import {
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  OneToOneOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import LogicFlow from '@logicflow/core';
import { DndPanel, SelectionSelect, Control, MiniMap } from '@logicflow/extension';
import { nodeDefinitions } from './nodes';
import '@logicflow/core/dist/index.css';
import '@logicflow/extension/lib/style/index.css';
import './index.css';
import type { DndPanel as DndPanelType } from '@logicflow/extension';

const { Sider, Content } = Layout;
const { Option } = Select;

// 节点类型定义
const nodeTypes = [
  { type: 'start', label: '开始节点', icon: '⭕' },
  { type: 'approval', label: '审批节点', icon: '📝' },
  { type: 'condition', label: '条件节点', icon: '❓' },
  { type: 'parallel', label: '并行节点', icon: '⚡' },
  { type: 'end', label: '结束节点', icon: '🔚' },
];

interface ProcessDesignerProps {
  processKey?: string;
  onSave?: (data: any) => void;
}

interface GraphNode {
  id: string;
  type: string;
  properties?: {
    name?: string;
    [key: string]: any;
  };
}

interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
  properties?: Record<string, any>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SimulationStep {
  node: GraphNode;
  status: 'wait' | 'process' | 'finish' | 'error';
  title: string;
  description: string;
}

const ProcessDesigner: React.FC<ProcessDesignerProps> = ({ processKey, onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lf, setLf] = useState<LogicFlow>();
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [nodeForm] = Form.useForm();
  const [simulationVisible, setSimulationVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationPath, setSimulationPath] = useState<any[]>([]);

  // 初始化流程设计器
  useEffect(() => {
    if (!containerRef.current) return;

    const logicflow = new LogicFlow({
      container: containerRef.current,
      grid: true,
      plugins: [DndPanel, SelectionSelect, Control, MiniMap],
      nodeTextEdit: true,
      nodeTextDraggable: true,
      adjustEdge: true,
      adjustNodePosition: true,
      dragOnConnecting: true,
      pluginsOptions: {
        dndPanel: {
          containerClassName: 'lf-dnd-container',
          itemClassName: 'lf-dnd-item',
          patternItems: [
            {
              type: 'start',
              text: '开始节点',
              icon: '⭕',
            },
            {
              type: 'approval',
              text: '审批节点',
              icon: '📝',
            },
            {
              type: 'condition',
              text: '条件节点',
              icon: '❓',
            },
            {
              type: 'parallel',
              text: '并行节点',
              icon: '⚡',
            },
            {
              type: 'end',
              text: '结束节点',
              icon: '🔚',
            },
          ]
        }
      },
      style: {
        rect: {
          radius: 5,
          strokeWidth: 2,
        },
        circle: {
          r: 25,
          strokeWidth: 2,
        },
        nodeText: {
          overflowMode: 'autoWrap',
          fontSize: 12,
        },
        edgeText: {
          textWidth: 100,
          fontSize: 12,
          background: {
            fill: '#fff',
          },
        },
      },
    });

    console.log('LogicFlow 已初始化');

    // 注册自定义节点
    Object.values(nodeDefinitions).forEach(node => {
      console.log(`注册节点 ${node.type}`);
      logicflow.register(node);
    });

    // 设置画布默认配置
    logicflow.setDefaultEdgeType('polyline');
    
    console.log('已设置默认边类型为polyline');
    
    // 渲染画布
    logicflow.render({});

    // 监听节点点击事件
    logicflow.on('node:click', ({ data }) => {
      setCurrentNode(data);
      nodeForm.setFieldsValue(data.properties);
      setNodeModalVisible(true);
    });

    // 添加拖拽相关事件监听
    logicflow.on('node:dragstart', () => {
      logicflow.updateEditConfig({ stopMoveGraph: true });
    });

    logicflow.on('node:dragend', () => {
      logicflow.updateEditConfig({ stopMoveGraph: false });
    });

    logicflow.on('connection:not-allowed', (data: any) => {
      message.error('无法建立此连接');
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

  // 开始模拟运行
  const handleStartSimulation = () => {
    if (!lf) return;
    const data = lf.getGraphData() as GraphData;
    console.log(data);
    
    // 查找开始节点
    const startNode = data.nodes.find(node => node.type === 'start');
    if (!startNode) {
      message.error('流程中必须包含开始节点');
      return;
    }

    // 初始化模拟路径
    setSimulationPath([{
      node: startNode,
      status: 'process',
      title: '开始节点',
      description: '流程开始'
    }]);
    setCurrentStep(0);
    setSimulationVisible(true);
  };

  // 处理节点选择
  const handleNodeSelect = (nodeId: string) => {
    if (!lf) return;
    const data = lf.getGraphData() as GraphData;
    
    // 获取当前节点的出边
    const edges = data.edges.filter(edge => edge.sourceNodeId === nodeId);
    const currentNode = data.nodes.find(node => node.id === nodeId);
    
    if (!currentNode) return;
    
    // 如果是结束节点，完成模拟
    if (currentNode.type === 'end') {
      setSimulationPath(prev => [
        ...prev,
        {
          node: currentNode,
          status: 'finish',
          title: '结束节点',
          description: '流程结束'
        }
      ]);
      message.success('流程模拟完成');
      return;
    }
    
    // 如果有多个出边（条件或并行），显示选择对话框
    if (edges.length > 1) {
      Modal.confirm({
        title: '选择下一步',
        content: (
          <Select
            style={{ width: '100%' }}
            onChange={(value) => {
              const nextNode = data.nodes.find(node => node.id === value);
              if (nextNode) {
                setSimulationPath(prev => [
                  ...prev,
                  {
                    node: nextNode,
                    status: 'process',
                    title: nextNode.properties?.name || nextNode.type,
                    description: `执行${nextNode.type === 'condition' ? '条件判断' : '节点任务'}`
                  }
                ]);
                setCurrentStep(prev => prev + 1);
              }
            }}
          >
            {edges.map(edge => {
              const targetNode = data.nodes.find(node => node.id === edge.targetNodeId);
              return (
                <Select.Option key={targetNode?.id} value={targetNode?.id}>
                  {targetNode?.properties?.name || targetNode?.type}
                </Select.Option>
              );
            })}
          </Select>
        ),
      });
    } else if (edges.length === 1) {
      // 如果只有一个出边，直接进入下一节点
      const nextNode = data.nodes.find(node => node.id === edges[0].targetNodeId);
      if (nextNode) {
        setSimulationPath(prev => [
          ...prev,
          {
            node: nextNode,
            status: 'process',
            title: nextNode.properties?.name || nextNode.type,
            description: `执行${nextNode.type === 'condition' ? '条件判断' : '节点任务'}`
          }
        ]);
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  return (
    <Layout className="process-designer-container">
      <Sider width={200} theme="light">
        <div>
          <div style={{ padding: '16px', fontWeight: 'bold', fontSize: '16px' }}>流程节点</div>
          <div className="lf-dnd-container" style={{ height: 'calc(100vh - 220px)', padding: '0 16px 16px 16px', overflowY: 'auto' }} />
        </div>
      </Sider>
      <Layout className='process-designer-content'>
        <Card
          bodyStyle={{ padding: '8px 16px' }}
          style={{ marginBottom: '8px' }}
          extra={
            <Space>
              <Button icon={<UndoOutlined />} onClick={handleUndo} />
              <Button icon={<RedoOutlined />} onClick={handleRedo} />
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              <Button icon={<OneToOneOutlined />} onClick={handleResetZoom} />
              <Button icon={<ImportOutlined />} onClick={handleImport} />
              <Button icon={<ExportOutlined />} onClick={handleExport} />
              <Button icon={<PlayCircleOutlined />} onClick={handleStartSimulation}>
                模拟运行
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
            </Space>
          }
        />
        <Content style={{ flex: 1, position: 'relative', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          <div 
            ref={containerRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
        </Content>
      </Layout>

      <Modal
        title="节点配置"
        open={nodeModalVisible}
        onOk={() => nodeForm.submit()}
        onCancel={() => setNodeModalVisible(false)}
        className="process-designer-modal"
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

      {/* 模拟运行对话框 */}
      <Modal
        title="流程模拟运行"
        open={simulationVisible}
        onCancel={() => setSimulationVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSimulationVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
        className="process-designer-modal"
      >
        <Steps
          direction="vertical"
          current={currentStep}
          items={simulationPath.map((item, index) => ({
            title: item.title,
            description: item.description,
            status: item.status,
            onClick: () => handleNodeSelect(item.node.id)
          }))}
        />
      </Modal>
    </Layout>
  );
};

export default ProcessDesigner; 