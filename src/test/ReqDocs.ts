import { DHttpRequest,  DHttpMethodType  } from '@/utility/model'
import type { DHttpRequestDoc,} from '@/utility/model'


// 创建 FormData 示例
const formData = new FormData()
formData.append('file', new File([''], 'report.pdf'))

export const ReqDocs: DHttpRequestDoc[] = [
  // 基础未修改文档
  {
    id: '1',
    type: "request",
    name: "获取用户列表",
    request: new DHttpRequest({
      url: "https://api.example.com/users",
      queryParams: { page: "1" }
    }),
    isDirty: false
  },

  // 带响应的已修改文档
  {
    id: '2',
    type: "request",
    name: "创建新订单",
    request: new DHttpRequest({
      url: "https://api.example.com/orders",
      method: DHttpMethodType.POST,
    }),
    isDirty: true,
  },

  // 文件上传文档
  {
    id: '3',
    type: "request",
    name: "上传报告文档",
    request: new DHttpRequest({
      url: "https://api.example.com/uploads",
      method: DHttpMethodType.DELETE,
      body: formData,
      headers: { "X-Upload-Type": "document" }
    }),
    isDirty: false
  },

  // 错误响应文档
  {
    id: '4',
    type: "request",
    name: "获取无效资源",
    request: new DHttpRequest({
      url: "https://api.example.com/invalid-resource",
      timeout: 5000
    }),
    isDirty: false,
  },

  // 未命名的脏文档
  {
    id: '5',
    type: "request",
    name: "Untitled",
    request: new DHttpRequest({
      url: "https://api.example.com/drafts",
      method: DHttpMethodType.PATCH
    }),
    isDirty: true
  },

  // 复杂查询文档
  {
    id: '6',
    type: "request",
    name: "产品搜索",
    request: new DHttpRequest({
      url: "https://api.example.com/search",
      queryParams: {
        q: "wireless keyboard",
        category: "electronics",
        priceRange: "50-100"
      }
    }),
    isDirty: false,
    response: null
  }
]
