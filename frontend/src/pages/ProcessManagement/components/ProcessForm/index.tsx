import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Card, Divider, InputNumber, Select, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { processService } from '../../../../services/processService';
import type { ProcessStep } from '../../../../services/processService';

interface ProcessFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [steps, setSteps] = useState<Omit<ProcessStep, 'id'>[]>([]);

  // 监听 initialValues 变化，更新表单和步骤数据
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
      });
      setSteps(initialValues.steps || []);
    } else {
      form.resetFields();
      setSteps([]);
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 确保每个步骤都有正确的 order 值
      const stepsWithOrder = steps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));
      onSubmit({
        ...values,
        steps: stepsWithOrder,
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
      assignee_role: '',
      deadline: 3,
      required_fields: [],
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    // 重新排序
    newSteps.forEach((step: Omit<ProcessStep, 'id'>, i: number) => {
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

  // 添加必填字段
  const handleAddRequiredField = (stepIndex: number) => {
    const fieldName = prompt('请输入字段名称');
    if (fieldName) {
      const newSteps = [...steps];
      newSteps[stepIndex].required_fields = [
        ...newSteps[stepIndex].required_fields,
        fieldName,
      ];
      setSteps(newSteps);
    }
  };

  // 删除必填字段
  const handleRemoveRequiredField = (stepIndex: number, fieldIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].required_fields = newSteps[stepIndex].required_fields.filter(
      (_: string, i: number) => i !== fieldIndex
    );
    setSteps(newSteps);
  };

  return (
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="流程名称"
        rules={[{ required: true, message: '请输入流程名称' }]}
      >
        <Input placeholder="请输入流程名称" />
      </Form.Item>

      <Form.Item
        name="description"
        label="流程描述"
        rules={[{ required: true, message: '请输入流程描述' }]}
      >
        <Input.TextArea rows={4} placeholder="请输入流程描述" />
      </Form.Item>

      <Divider orientation="left">流程步骤</Divider>

      {steps.map((step, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemoveStep(index)}
            />
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="步骤名称"
              value={step.name}
              onChange={(e) => handleStepChange(index, 'name', e.target.value)}
            />
            <Input.TextArea
              placeholder="步骤描述"
              value={step.description}
              onChange={(e) => handleStepChange(index, 'description', e.target.value)}
              rows={2}
            />
            <Space>
              <Select
                placeholder="审批角色"
                style={{ width: 200 }}
                value={step.assignee_role}
                onChange={(value) => handleStepChange(index, 'assignee_role', value)}
              >
                <Select.Option value="manager">部门经理</Select.Option>
                <Select.Option value="director">总监</Select.Option>
                <Select.Option value="ceo">CEO</Select.Option>
                <Select.Option value="finance">财务</Select.Option>
                <Select.Option value="hr">人力资源</Select.Option>
              </Select>
              <InputNumber
                placeholder="截止天数"
                min={1}
                value={step.deadline}
                onChange={(value) => handleStepChange(index, 'deadline', value)}
                addonAfter="天"
              />
            </Space>
            
            <div>
              <div style={{ marginBottom: 8 }}>
                <Button
                  type="dashed"
                  onClick={() => handleAddRequiredField(index)}
                  icon={<PlusOutlined />}
                >
                  添加必填字段
                </Button>
              </div>
              <div>
                {step.required_fields.map((field: string, fieldIndex: number) => (
                  <Tag
                    key={fieldIndex}
                    closable
                    onClose={() => handleRemoveRequiredField(index, fieldIndex)}
                    style={{ marginBottom: 8, marginRight: 8 }}
                  >
                    {field}
                  </Tag>
                ))}
              </div>
            </div>
          </Space>
        </Card>
      ))}

      <Button
        type="dashed"
        onClick={handleAddStep}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginBottom: 24 }}
      >
        添加步骤
      </Button>

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