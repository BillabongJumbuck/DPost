import type { DHttpRequestDoc } from '@/utility/model'
import { DHttpMethodType } from '@/utility/model'

// 创建 FormData 示例
const formData = new FormData()
formData.append('file', new File([''], 'report.pdf'))

export const ReqDocs: DHttpRequestDoc[] = [
  // 基础未修改文档
  {
    id: '1',
    name: '获取用户列表',
    isDirty: false,
    url: 'http://localhost:8080',
    method: DHttpMethodType.GET,
    queryParams: [],
    headers: [],
    body: {
      contentType: null,
      bodyContent: null,
    },
    response: null,
  },

  // 带响应的已修改文档
  {
    id: '2',
    name: '创建新订单',
    isDirty: true,
    url: 'https://api.example.com/orders',
    method: DHttpMethodType.POST,
    queryParams: [],
    headers: [],
    body: {
      contentType: null,
      bodyContent: null,
    },
    response: null,
  },

  // 文件上传文档
  {
    id: '3',
    name: '上传报告文档',
    isDirty: false,
    url: 'https://api.example.com/uploads',
    method: DHttpMethodType.DELETE,
    queryParams: [],
    headers: [],
    body: {
      contentType: null,
      bodyContent: null,
    },
    response: null,
  },

  // 未命名的脏文档
  {
    id: '5',
    name: 'Untitled',
    isDirty: true,
    url: 'https://api.example.com/drafts',
    method: DHttpMethodType.PATCH,
    queryParams: [],
    headers: [],
    body: {
      contentType: null,
      bodyContent: null,
    },
    response: null,
  },

  // 复杂查询文档
  {
    id: '6',
    name: '产品搜索',
    isDirty: false,
    url: 'https://api.example.com/search',
    method: DHttpMethodType.GET,
    headers: [],
    queryParams: [],
    body: {
      contentType: 'text/html',
      bodyContent: "<html lang='zh-ch'></html>",
    },
    response: null,
  },
]
