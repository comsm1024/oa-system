import { get, post } from "./request";

// 定义接口类型
export interface Leave {
  id: number;
  userId: number;
  type: string;
}

export const leaveService = {
  // 获取请假列表
  getLeaveList: (params: { page: number; pageSize: number; userId?: number; status?: 'pending' | 'approved' | 'rejected' }) => {
    return get<{ list: Leave[]; total: number }>('/leave/list', params);
  },
  // 创建请假
  createLeave: (data: { userId: number; type: string }) => {
    return post<Leave>('/leave/create', data);
  },
  // 审批请假
  approveLeave: (id: string, data: { status: 'approved' | 'rejected' }) => {
    return post<void>(`/leave/${id}/approve`, data);
  },
  // 拒绝请假
  rejectLeave: (id: number, data: { status: 'rejected' }) => {
    return post<void>(`/leave/${id}/reject`, data);
  },
}