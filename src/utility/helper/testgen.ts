import type { DHttpKeyValueDoc } from '@/utility/model/DHttpKeyValueDoc'
import { DHttpMethodType } from '@/utility/model/DHttpMethodType'

// 返回给 RestMain.handleCreateNewTab 的数据结构（简化版）
export async function generateApiTest(): Promise<{
  name: string
  url: string
  method: DHttpMethodType
  headers: DHttpKeyValueDoc[]
  queryParams: DHttpKeyValueDoc[]
  body: { contentType: string | null; bodyContent: string | null }
}> {
  // 目前实现为同步返回默认示例数据。
  return {
    name: '生成的 API 测试',
    url: 'https://example.com/api',
    method: DHttpMethodType.GET,
    headers: [],
    queryParams: [],
    body: { contentType: null, bodyContent: null },
  }
}

export default generateApiTest
