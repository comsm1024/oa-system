import { useEffect, useState, useRef } from 'react';
import { Layout, Button, Space, message, Modal, Form, Input, Select, Steps } from 'antd';
import Card from 'antd/es/card';
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
import '@logicflow/core/dist/index.css';
import '@logicflow/extension/lib/style/index.css';
import './index.css';

const { Sider, Content } = Layout;
const { Option } = Select;

// 节点类型定义
const nodeTypes = [
  { type: 'circle', label: '开始节点', icon: '⭕' },
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
      nodeTextDraggable: false,
      adjustEdge: true,
      adjustNodePosition: true,
      dragOnConnecting: true,
      style: {
        rect: {
          width: 120,
          height: 60,
          radius: 5,
          strokeWidth: 2,
        },
        circle: {
          r: 25,
          strokeWidth: 2,
        },
        diamond: {
          width: 80,
          height: 80,
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

    // 设置默认边类型
    logicflow.setDefaultEdgeType('polyline');

    // 注册节点事件
    logicflow.on('node:click', ({ data }) => {
      setCurrentNode(data);
      nodeForm.setFieldsValue(data.properties);
      setNodeModalVisible(true);
    });

    // 注册边事件
    logicflow.on('edge:click', ({ data }) => {
      console.log('点击边', data);
    });

    // 注册画布事件
    logicflow.on('blank:click', () => {
      setCurrentNode(null);
      setNodeModalVisible(false);
    });

    // 注册连接事件
    logicflow.on('connection:created', ({ data }) => {
      console.log('创建连接', data);
    });

    // 注册删除事件
    logicflow.on('element:delete', ({ data }) => {
      console.log('删除元素', data);
    });

    const dndPanel = logicflow.extension.dndPanel as any;
    dndPanel.setPatternItems([
      {
        label: '选区',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
        callback: () => {
          const selectionSelect = logicflow.extension.selectionSelect as any;
          selectionSelect.openSelectionSelect();
          logicflow.once('selection:selected', () => {
            selectionSelect.closeSelectionSelect();
          });
        }
      },
      {
        type: 'circle',
        text: '开始',
        label: '开始节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
      },
      {
        type: 'rect',
        label: '用户任务',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'important-node'
      },
      {
        type: 'rect',
        label: '系统任务',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'import_icon'
      },
      {
        type: 'diamond',
        label: '条件判断',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
      },
      {
        type: 'circle',
        text: '结束',
        label: '结束节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
      }
    ]);
    
    console.log('已设置默认边类型为polyline');
    
    // 渲染画布
    logicflow.render({});

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
    
    // 获取流程数据
    const data = lf.getGraphData();
    
    // 验证流程
    const errors = validateProcess(data);
    if (errors.length > 0) {
      message.error(errors.join('\n'));
      return;
    }

    // 保存流程
    onSave?.(data);
    message.success('保存成功');
  };

  // 验证流程
  const validateProcess = (data: any) => {
    const errors: string[] = [];
    const nodes = data.nodes || [];
    const edges = data.edges || [];

    // 检查是否有开始节点
    const startNodes = nodes.filter((node: any) => node.type === 'circle' && node.text.value === '开始');
    if (startNodes.length === 0) {
      errors.push('流程必须包含一个开始节点');
    } else if (startNodes.length > 1) {
      errors.push('流程只能包含一个开始节点');
    }

    // 检查是否有结束节点
    const endNodes = nodes.filter((node: any) => node.type === 'circle' && node.text.value === '结束');
    if (endNodes.length === 0) {
      errors.push('流程必须包含一个结束节点');
    }

    // 检查节点连接
    nodes.forEach((node: any) => {
      const outEdges = edges.filter((edge: any) => edge.sourceNodeId === node.id);
      const inEdges = edges.filter((edge: any) => edge.targetNodeId === node.id);

      // 开始节点必须有出边
      if (node.type === 'circle' && node.text.value === '开始' && outEdges.length === 0) {
        errors.push('开始节点必须有出边');
      }

      // 结束节点必须有入边
      if (node.type === 'circle' && node.text.value === '结束' && inEdges.length === 0) {
        errors.push('结束节点必须有入边');
      }

      // 条件节点必须有多个出边
      if (node.type === 'diamond' && outEdges.length < 2) {
        errors.push('条件节点必须有多个出边');
      }

      // 其他节点必须有入边和出边
      if (node.type !== 'circle' && (inEdges.length === 0 || outEdges.length === 0)) {
        errors.push(`节点 ${node.text.value || node.id} 必须有入边和出边`);
      }
    });

    return errors;
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
    
    // 查找开始节点
    const startNode = data.nodes.find(node => node.type === 'circle' && node.text.value === '开始');
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
    if (currentNode.type === 'circle' && currentNode.text.value === '结束') {
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
    
    // 如果是条件节点，显示条件选择
    if (currentNode.type === 'diamond') {
      Modal.confirm({
        title: '条件判断',
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
                    title: nextNode.properties?.name || nextNode.text.value || nextNode.type,
                    description: `执行${nextNode.type === 'diamond' ? '条件判断' : '节点任务'}`
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
                  {targetNode?.properties?.name || targetNode?.text.value || targetNode?.type}
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
            title: nextNode.properties?.name || nextNode.text.value || nextNode.type,
            description: `执行${nextNode.type === 'diamond' ? '条件判断' : '节点任务'}`
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
          <div className="lf-dnd-container" style={{ padding: '0 16px 16px 16px' }}>
            {nodeTypes.map(node => (
              <div
                key={node.type}
                className="lf-dnd-item"
                data-type={node.type}
                data-text={node.label}
                data-icon={node.icon}
                draggable
                onDragStart={(e) => {
                  console.log('开始拖拽', node.type, node);
                  const dragData = {
                    type: node.type,
                    text: node.label,
                    icon: node.icon
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.setAttribute('data-dragging', 'true');
                }}
                onDragEnd={(e) => {
                  e.currentTarget.removeAttribute('data-dragging');
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  console.log('放置节点');
                }}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  userSelect: 'none',
                  backgroundColor: '#fff'
                }}
              >
                <span>{node.icon}</span>
                <span>{node.label}</span>
              </div>
            ))}
          </div>
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
                name="assigneeType"
                label="处理人类型"
                rules={[{ required: true, message: '请选择处理人类型' }]}
              >
                <Select>
                  <Option value="role">按角色</Option>
                  <Option value="user">指定用户</Option>
                  <Option value="department">按部门</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="assignee"
                label="处理人"
                rules={[{ required: true, message: '请选择处理人' }]}
              >
                <Select>
                  <Option value="manager">部门经理</Option>
                  <Option value="hr">人事</Option>
                  <Option value="finance">财务</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="timeout"
                label="超时时间"
              >
                <Input type="number" addonAfter="小时" />
              </Form.Item>
            </>
          )}

          {currentNode?.type === 'condition' && (
            <>
              <Form.Item
                name="conditionType"
                label="条件类型"
                rules={[{ required: true, message: '请选择条件类型' }]}
              >
                <Select>
                  <Option value="form">表单字段</Option>
                  <Option value="script">自定义脚本</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="condition"
                label="条件表达式"
                rules={[{ required: true, message: '请输入条件表达式' }]}
              >
                <Input.TextArea rows={4} placeholder="请输入条件表达式，例如：amount > 1000" />
              </Form.Item>
            </>
          )}

          {currentNode?.type === 'parallel' && (
            <>
              <Form.Item
                name="parallelType"
                label="并行类型"
                rules={[{ required: true, message: '请选择并行类型' }]}
              >
                <Select>
                  <Option value="all">全部通过</Option>
                  <Option value="any">任一通过</Option>
                  <Option value="count">指定数量</Option>
                </Select>
              </Form.Item>

              {nodeForm.getFieldValue('parallelType') === 'count' && (
                <Form.Item
                  name="count"
                  label="通过数量"
                  rules={[{ required: true, message: '请输入通过数量' }]}
                >
                  <Input type="number" min={1} />
                </Form.Item>
              )}
            </>
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