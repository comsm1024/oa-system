import { get, post, put, del } from './request';

// 定义接口类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

// 用户相关接口
export const userService = {
  // 用户登录
  login: (data: LoginParams) => {
    return post<LoginResult>('/auth/login', data);
  },

  // 获取用户信息
  getUserInfo: () => {
    return get<User>('/user/info');
  },

  // 获取用户列表
  getUserList: (params?: { page: number; pageSize: number }) => {
    return get<User[]>('/user/list', params);
  },

  // 创建用户
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    return post<User>('/user/create', data);
  },

  // 更新用户
  updateUser: (id: number, data: Partial<User>) => {
    return put<User>(`/user/${id}`, data);
  },

  // 删除用户
  deleteUser: (id: number) => {
    return del<void>(`/user/${id}`);
  },
}; 