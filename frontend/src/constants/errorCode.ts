// 错误码类型定义
export enum ErrorCode {
  SUCCESS = 0,           // 成功
  UNKNOWN_ERROR = 1,     // 未知错误
  PARAM_ERROR = 400,     // 参数错误
  UNAUTHORIZED = 401,    // 未授权
  FORBIDDEN = 403,       // 禁止访问
  NOT_FOUND = 404,       // 资源不存在
  CONFLICT = 409,        // 资源冲突
  SERVER_ERROR = 500,    // 服务器错误
  SERVICE_UNAVAILABLE = 503,  // 服务不可用
  
  // 业务错误码 (1000-1999)
  BUSINESS_ERROR = 1000, // 业务错误
  VALIDATION_ERROR = 1001, // 表单验证错误
  DATA_NOT_FOUND = 1002,   // 数据不存在
  DATA_ALREADY_EXISTS = 1003, // 数据已存在
  OPERATION_FAILED = 1004,    // 操作失败

  // 认证错误码 (2000-2999)
  TOKEN_EXPIRED = 2001,     // Token过期
  TOKEN_INVALID = 2002,     // Token无效
  TOKEN_REQUIRED = 2003,    // Token缺失
}

// 错误码配置
interface ErrorCodeConfig {
  message: string;       // 默认错误信息
  showMessage?: boolean; // 是否显示全局提示
  logout?: boolean;      // 是否需要登出
  retry?: boolean;       // 是否需要自动重试（例如token过期时自动刷新）
}

export const errorCodeConfig: Record<ErrorCode, ErrorCodeConfig> = {
  [ErrorCode.SUCCESS]: {
    message: '操作成功',
    showMessage: false
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    message: '未知错误',
    showMessage: true
  },
  [ErrorCode.PARAM_ERROR]: {
    message: '参数错误',
    showMessage: true
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: '请先登录',
    showMessage: true,
    logout: true
  },
  [ErrorCode.FORBIDDEN]: {
    message: '无权访问',
    showMessage: true
  },
  [ErrorCode.NOT_FOUND]: {
    message: '资源不存在',
    showMessage: true
  },
  [ErrorCode.CONFLICT]: {
    message: '资源冲突',
    showMessage: true
  },
  [ErrorCode.SERVER_ERROR]: {
    message: '服务器错误',
    showMessage: true
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    message: '服务暂时不可用',
    showMessage: true
  },
  [ErrorCode.BUSINESS_ERROR]: {
    message: '业务处理失败',
    showMessage: false  // 业务错误由业务代码自行处理
  },
  [ErrorCode.VALIDATION_ERROR]: {
    message: '表单验证失败',
    showMessage: false  // 表单错误由表单组件自行处理
  },
  [ErrorCode.DATA_NOT_FOUND]: {
    message: '数据不存在',
    showMessage: false  // 数据不存在由业务代码自行处理
  },
  [ErrorCode.DATA_ALREADY_EXISTS]: {
    message: '数据已存在',
    showMessage: true
  },
  [ErrorCode.OPERATION_FAILED]: {
    message: '操作失败',
    showMessage: true
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    message: '登录已过期，请重新登录',
    showMessage: true,
    logout: true
  },
  [ErrorCode.TOKEN_INVALID]: {
    message: '登录状态无效，请重新登录',
    showMessage: true,
    logout: true
  },
  [ErrorCode.TOKEN_REQUIRED]: {
    message: '请先登录',
    showMessage: true,
    logout: true
  }
}; 