import { CircleNode, CircleNodeModel, RectNode, RectNodeModel } from '@logicflow/core';

// 开始节点
class StartNode extends CircleNode {}
class StartNodeModel extends CircleNodeModel {
  setAttributes() {
    this.r = 20;
    this.fill = '#e6f7ff';
    this.stroke = '#1890ff';
  }
}

// 结束节点
class EndNode extends CircleNode {}
class EndNodeModel extends CircleNodeModel {
  setAttributes() {
    this.r = 20;
    this.fill = '#fff1f0';
    this.stroke = '#ff4d4f';
  }
}

// 审批节点
class ApprovalNode extends RectNode {}
class ApprovalNodeModel extends RectNodeModel {
  setAttributes() {
    this.width = 120;
    this.height = 60;
    this.fill = '#f6ffed';
    this.stroke = '#52c41a';
  }
}

// 条件节点
class ConditionNode extends RectNode {}
class ConditionNodeModel extends RectNodeModel {
  setAttributes() {
    this.width = 100;
    this.height = 60;
    this.fill = '#fff7e6';
    this.stroke = '#faad14';
    this.radius = 4;
  }
}

// 并行节点
class ParallelNode extends RectNode {}
class ParallelNodeModel extends RectNodeModel {
  setAttributes() {
    this.width = 120;
    this.height = 60;
    this.fill = '#f9f0ff';
    this.stroke = '#722ed1';
  }
}

export const nodeDefinitions = {
  start: {
    type: 'start',
    view: StartNode,
    model: StartNodeModel,
  },
  end: {
    type: 'end',
    view: EndNode,
    model: EndNodeModel,
  },
  approval: {
    type: 'approval',
    view: ApprovalNode,
    model: ApprovalNodeModel,
  },
  condition: {
    type: 'condition',
    view: ConditionNode,
    model: ConditionNodeModel,
  },
  parallel: {
    type: 'parallel',
    view: ParallelNode,
    model: ParallelNodeModel,
  },
}; 