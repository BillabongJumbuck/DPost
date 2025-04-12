import type { DHttpKeyValueDoc } from '@/utility/model/DHttpKeyValueDoc.ts'

/**
 * HTTP 响应实体类
 */
export type  DHttpResponse =  {
  /**
   * HTTP 状态码
   * @example 200
   */
  status: number

  /**
   * HTTP 状态描述
   * @example "OK"
   */
  statusText: string

  /**
   * 响应头 (键值对格式)
   * @example { "Content-Type": "application/json" }
   */
  headers: DHttpKeyValueDoc[]

  /**
   * 响应主体内容（原始数据）
   */
  data: string

  /**
   * 原始响应对象 (根据具体 HTTP 客户端实现)
   */
  rawResponse: Response

  /**
   * 响应内容大小
   */
  size: number

  /**
   * 响应时间 ms
   */
  responseTime: number
}
