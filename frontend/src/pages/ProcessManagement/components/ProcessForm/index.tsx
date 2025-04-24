import React, { useState } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { processService } from '@/services/processService';
import type { ProcessStep } from '@/services/processService';

interface ProcessFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [steps, setSteps] = useState<Omit<ProcessStep, 'id'>[]>(initialValues?.steps || []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        steps,
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleAddStep = () => {
    const newStep: Omit<ProcessStep, 'id'> = {
      name: '',
      description: '',
      order: steps.length + 1,
      assigneeRole: '',
      requiredFields: [],
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // 重新排序
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    setSteps(newSteps);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="流程名称"
        rules={[{ required: true, message: '请输入流程名称' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="流程描述"
        rules={[{ required: true, message: '请输入流程描述' }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div>
        <h3>流程步骤</h3>
        {steps.map((step, index) => (
          <div key={index} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Input
                  placeholder="步骤名称"
                  value={step.name}
                  onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                  style={{ width: 200 }}
                />
                <Input
                  placeholder="处理角色"
                  value={step.assigneeRole}
                  onChange={(e) => handleStepChange(index, 'assigneeRole', e.target.value)}
                  style={{ width: 200 }}
                />
                <Button type="link" danger onClick={() => handleRemoveStep(index)}>
                  删除
                </Button>
              </Space>
              <Input.TextArea
                placeholder="步骤描述"
                value={step.description}
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                rows={2}
              />
              <Input
                placeholder="处理期限（天数）"
                type="number"
                value={step.deadline}
                onChange={(e) => handleStepChange(index, 'deadline', parseInt(e.target.value))}
                style={{ width: 200 }}
              />
            </Space>
          </div>
        ))}
        <Button type="dashed" onClick={handleAddStep} style={{ width: '100%' }}>
          添加步骤
        </Button>
      </div>

      <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProcessForm; 