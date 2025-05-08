import { get, post, put, del } from './request';

// 定义接口类型
export interface Process {
  id: number;
  name: string;
  description: string;
  steps: ProcessStep[];
  status: 'active' | 'inactive' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStep {
  id: number;
  name: string;
  description: string;
  order: number;
  assignee_role: string;
  deadline?: number; // 天数
  required_fields: string[];
}

export interface ProcessInstance {
  id: number;
  processId: number;
  processName: string;
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  history: ProcessHistory[];
}

export interface ProcessHistory {
  id: number;
  stepId: number;
  stepName: string;
  action: 'approve' | 'reject' | 'return';
  comment?: string;
  operator: string;
  timestamp: string;
}

export interface ProcessCreateParams {
  name: string;
  description: string;
  steps: Omit<ProcessStep, 'id'>[];
}

export interface ProcessUpdateParams {
  name?: string;
  description?: string;
  steps?: Omit<ProcessStep, 'id'>[];
  status?: 'active' | 'inactive' | 'archived';
}

export interface ProcessInstanceCreateParams {
  processId: number;
  data: Record<string, any>;
}

export interface ProcessListParams {
  page: number;
  pageSize: number;
  status?: 'active' | 'inactive' | 'archived';
  search?: string;
}

export interface ProcessInstanceListParams {
  page: number;
  pageSize: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  processId?: number;
  search?: string;
}

// 流程相关接口
export const processService = {
  // 流程定义相关
  // 获取流程列表
  getProcessList: (params: ProcessListParams) => {
    return get<{ list: Process[]; total: number }>('/process/list', params);
  },

  // 获取流程详情
  getProcessDetail: (id: number) => {
    return get<Process>(`/process/${id}`);
  },

  // 创建流程
  createProcess: (data: ProcessCreateParams) => {
    return post<Process>('/process/create', data);
  },

  // 更新流程
  updateProcess: (id: number, data: ProcessUpdateParams) => {
    return put<Process>(`/process/${id}`, data);
  },

  // 删除流程
  deleteProcess: (id: number) => {
    return del<void>(`/process/${id}`);
  },

  // 激活流程
  activateProcess: (id: number) => {
    return put<Process>(`/process/${id}/activate`);
  },

  // 停用流程
  deactivateProcess: (id: number) => {
    return put<Process>(`/process/${id}/deactivate`);
  },

  // 归档流程
  archiveProcess: (id: number) => {
    return put<Process>(`/process/${id}/archive`);
  },

  // 流程实例相关
  // 获取流程实例列表
  getProcessInstanceList: (params: ProcessInstanceListParams) => {
    return get<{ list: ProcessInstance[]; total: number }>('/process-instance/list', params);
  },

  // 获取流程实例详情
  getProcessInstanceDetail: (id: number) => {
    return get<ProcessInstance>(`/process-instance/${id}`);
  },

  // 创建流程实例
  createProcessInstance: (data: ProcessInstanceCreateParams) => {
    return post<ProcessInstance>('/process-instance/create', data);
  },

  // 审批流程实例
  approveProcessInstance: (id: number, comment?: string) => {
    return put<ProcessInstance>(`/process-instance/${id}/approve`, { comment });
  },

  // 拒绝流程实例
  rejectProcessInstance: (id: number, comment?: string) => {
    return put<ProcessInstance>(`/process-instance/${id}/reject`, { comment });
  },

  // 退回流程实例
  returnProcessInstance: (id: number, stepId: number, comment?: string) => {
    return put<ProcessInstance>(`/process-instance/${id}/return`, { stepId, comment });
  },

  // 获取我的待办流程
  getMyPendingProcesses: (params: { page: number; pageSize: number }) => {
    return get<{ list: ProcessInstance[]; total: number }>('/process-instance/my-pending', params);
  },

  // 获取我发起的流程
  getMyInitiatedProcesses: (params: { page: number; pageSize: number }) => {
    return get<{ list: ProcessInstance[]; total: number }>('/process-instance/my-initiated', params);
  },
}; 