import { get, post, put, del } from './request';

// 定义接口类型
export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DocumentCreateParams {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface DocumentUpdateParams {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface DocumentListParams {
  page: number;
  pageSize: number;
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
}

// 文档相关接口
export const documentService = {
  // 获取文档列表
  getDocumentList: (params: DocumentListParams) => {
    return get<{ list: Document[]; total: number }>('/document/list', params);
  },

  // 获取文档详情
  getDocumentDetail: (id: number) => {
    return get<Document>(`/document/${id}`);
  },

  // 创建文档
  createDocument: (data: DocumentCreateParams) => {
    return post<Document>('/document/create', data);
  },

  // 更新文档
  updateDocument: (id: number, data: DocumentUpdateParams) => {
    return put<Document>(`/document/${id}`, data);
  },

  // 删除文档
  deleteDocument: (id: number) => {
    return del<void>(`/document/${id}`);
  },

  // 发布文档
  publishDocument: (id: number) => {
    return put<Document>(`/document/${id}/publish`);
  },

  // 归档文档
  archiveDocument: (id: number) => {
    return put<Document>(`/document/${id}/archive`);
  },

  // 获取文档版本历史
  getDocumentVersions: (id: number) => {
    return get<{ version: number; createdAt: string; author: string }[]>(`/document/${id}/versions`);
  },

  // 恢复到指定版本
  revertToVersion: (id: number, version: number) => {
    return put<Document>(`/document/${id}/revert/${version}`);
  },

  // 获取文档分类列表
  getDocumentCategories: () => {
    return get<string[]>('/document/categories');
  },
}; 