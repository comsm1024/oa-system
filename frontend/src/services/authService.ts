import { get, post } from './request';

// 定义接口类型
export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// 认证相关接口
export const authService = {
  // 登录
  login: (params: LoginParams) => {
    return post<LoginResponse>('/auth/login', params);
  },

  // 获取当前用户信息
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        return null;
      }
    }
    return null;
  },

  // 保存用户信息
  saveUser: (user: User, token: string): void => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },

  // 清除用户信息
  clearUser: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // 检查用户是否已登录
  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser() && !!localStorage.getItem('token');
  },

  // 获取用户角色
  getUserRole: (): string | null => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },

  // 检查用户是否有特定角色
  hasRole: (role: string): boolean => {
    const userRole = authService.getUserRole();
    return userRole === role;
  },

  // 检查用户是否是管理员
  isAdmin: (): boolean => {
    return authService.hasRole('admin');
  },

  // 获取当前用户详细信息
  fetchCurrentUser: () => {
    return get<User>('/auth/current-user');
  }
}; 