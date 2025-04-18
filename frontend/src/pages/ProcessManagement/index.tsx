import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import ProcessList from './components/ProcessList';
import ProcessInstanceList from './components/ProcessInstanceList';
import ProcessDesigner from './components/ProcessDesigner';

const { TabPane } = Tabs;

const ProcessManagement: React.FC = () => {
  const [activeKey, setActiveKey] = useState('list');

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <Card>
      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="流程定义列表" key="list">
          <ProcessList />
        </TabPane>
        <TabPane tab="流程实例列表" key="instance">
          <ProcessInstanceList />
        </TabPane>
        <TabPane tab="流程设计器" key="designer">
          <ProcessDesigner />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ProcessManagement; 