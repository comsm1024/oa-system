/**
 * 统一的响应格式
 * @param {Object} options 响应选项
 * @param {number} options.code 状态码
 * @param {string} options.message 消息
 * @param {any} options.data 数据
 * @returns {Object} 响应对象
 */
const createResponse = ({ code = 0, message = 'success', data = null }) => {
  return {
    code,
    message,
    data
  };
};

module.exports = {
  success: (data = null, message = 'success') => {
    return createResponse({ code: 0, message, data });
  },
  
  error: (message = 'error', code = 1, data = null) => {
    return createResponse({ code, message, data });
  },
  
  // 参数错误
  badRequest: (message = '参数错误', data = null) => {
    return createResponse({ code: 400, message, data });
  },
  
  // 未授权
  unauthorized: (message = '未授权', data = null) => {
    return createResponse({ code: 401, message, data });
  },
  
  // 禁止访问
  forbidden: (message = '禁止访问', data = null) => {
    return createResponse({ code: 403, message, data });
  },
  
  // 资源不存在
  notFound: (message = '资源不存在', data = null) => {
    return createResponse({ code: 404, message, data });
  },
  
  // 服务器错误
  serverError: (message = '服务器错误', data = null) => {
    return createResponse({ code: 500, message, data });
  }
}; 