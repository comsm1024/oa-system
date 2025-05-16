import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { ErrorCode, errorCodeConfig } from '../constants/errorCode';

// 响应数据接口
interface ApiResponse<T = any> {
  code: ErrorCode;
  message?: string;
  data?: T;
}

// 环境配置
const ENV = {
  development: {
    API_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000
  },
  production: {
    API_URL: '/api',
    TIMEOUT: 15000
  }
};

const config = process.env.NODE_ENV === 'production' ? ENV.production : ENV.development;

// 创建axios实例
const request = axios.create({
  baseURL: config.API_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求队列和重试机制
let isRefreshing = false;
let requests: Array<() => void> = [];

// 刷新token函数
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post<ApiResponse<{ token: string }>>(`${config.API_URL}/auth/refresh`, {
      refreshToken
    });
    const { token } = response.data.data || { token: '' };
    if (token) {
      localStorage.setItem('token', token);
      return token;
    }
    throw new Error('Token刷新失败');
  } catch (error) {
    throw error;
  }
};

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    const code = data.code as ErrorCode;
    
    // 处理成功响应
    if (code === ErrorCode.SUCCESS) {
      return data.data;
    }
    
    // 获取错误配置
    const errorConfig = errorCodeConfig[code] || errorCodeConfig[ErrorCode.UNKNOWN_ERROR];
    
    // Token过期处理
    if (code === ErrorCode.TOKEN_EXPIRED && !isRefreshing) {
      isRefreshing = true;
      
      // 尝试刷新token
      return refreshToken()
        .then(token => {
          // 重新发送所有等待的请求
          requests.forEach(cb => cb());
          requests = [];
          // 重试当前请求
          response.config.headers.Authorization = `Bearer ${token}`;
          return request(response.config);
        })
        .catch(error => {
          console.error('Token刷新失败:', error);
          // 刷新失败，执行登出
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
    
    // 如果配置了显示消息，则显示全局提示
    if (errorConfig.showMessage) {
      message.error(data.message || errorConfig.message);
    }
    
    // 如果需要登出，执行登出操作
    if (errorConfig.logout) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    // 返回一个带有完整错误信息的rejected promise
    return Promise.reject({
      code,
      message: data.message || errorConfig.message,
      data: data.data,
      config: errorConfig
    });
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理网络错误、超时等
    if (error.response) {
      const code = error.response.status as ErrorCode;
      const errorConfig = errorCodeConfig[code] || errorCodeConfig[ErrorCode.SERVER_ERROR];
      
      if (errorConfig.showMessage) {
        message.error(error.response.data?.message || errorConfig.message);
      }
      
      if (errorConfig.logout) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        code,
        message: error.response.data?.message || errorConfig.message,
        data: error.response.data,
        config: errorConfig
      });
    }
    
    // 请求超时
    if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试');
      return Promise.reject({
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: '请求超时，请稍后重试'
      });
    }
    
    // 其他网络错误
    message.error('网络错误，请检查网络连接');
    return Promise.reject({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: '网络错误，请检查网络连接'
    });
  }
);

// 封装GET请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, { params, ...config });
}

// 封装POST请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config);
}

// 封装PUT请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config);
}

// 封装DELETE请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, config);
}

export default request; 