import type { DHttpResponse } from '@/utility/model/DHttpResponse.ts'
import type { DHttpMethodType } from '@/utility/model/DHttpMethodType.ts'
import type { DHttpKeyValueDoc } from '@/utility/model/DHttpKeyValueDoc.ts'
import type { DHttpBody } from '@/utility/model/DHttpBody.ts'

export type DHttpRequestDoc = {
  /**
   * unique id
   */
  id: string

  /**
   * The document name
   */
  name: string

  /**
   * Whether the request has any unsaved changes
   * (atleast as far as we can say)
   */
  isDirty: boolean | false

  /**
   * 请求 URL (包含协议和路径)
   * @example "https://api.example.com/v1/users"
   */
  url: string
  /**
   * HTTP 请求方法
   * @default 'GET'
   */
  method: DHttpMethodType | DHttpMethodType.GET
  /**
   * 查询参数 (键值对格式)
   */
  queryParams: DHttpKeyValueDoc[]
  /**
   * 请求头 (键值对格式)
   */
  body: DHttpBody
  /**
   * 请求体
   */
  headers: DHttpKeyValueDoc[]
  /**
   * The response as it is in the document
   * (if any)
   */
  response: DHttpResponse | null
}
