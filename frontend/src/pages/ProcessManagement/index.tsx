import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import ProcessList from './components/ProcessList';
import ProcessInstanceList from './components/ProcessInstanceList';
import ProcessDesigner from './components/ProcessDesigner';

const { TabPane } = Tabs;

const ProcessManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('list');

  // 从URL参数中获取当前tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveKey(tab);
    }
  }, [location.search]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    // 更新URL参数
    const params = new URLSearchParams(location.search);
    params.set('tab', key);
    navigate(`${location.pathname}?${params.toString()}`);
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