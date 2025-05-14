import { get, post, put, del } from './request';

export interface Department {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const departmentService = {
  // 获取部门列表
  getDepartments: (params?: DepartmentQuery) => {
    return get<Department[]>('/departments', params)
  },
  // 获取单个部门
  getDepartment: (id: number) => {
    return get<Department>(`/departments/${id}`)
  },
  // 创建部门
  createDepartment: (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    return post<Department>('/departments', data)
  },
  // 更新部门
  updateDepartment: (id: number, data: Partial<Department>) => {
    return put<Department>(`/departments/${id}`, data)
  },
  // 删除部门
  deleteDepartment: (id: number) => {
    return del(`/departments/${id}`)
  },
};
