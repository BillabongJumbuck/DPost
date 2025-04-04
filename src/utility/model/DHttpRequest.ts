import { DHttpMethodType } from '@/utility/model/DHttpMethodType.ts'

/**
 * HTTP 请求实体类
 */
class DHttpRequest {
  /**
   * 请求 URL (包含协议和路径)
   * @example "https://api.example.com/v1/users"
   */
  public url: string;
  /**
   * HTTP 请求方法
   * @default 'GET'
   */
  public method: DHttpMethodType;
  /**
   * 请求头 (键值对格式)
   * @example { "Content-Type": "application/json" }
   */
  public headers: Record<string, string>;
  /**
   * 请求主体内容
   * @example JSON.stringify({ username: "test" })
   */
  public body: string | FormData | URLSearchParams;
  /**
   * URL 查询参数
   * @example { page: "1", limit: "10" }
   */
  public queryParams: Record<string, string>;
  /**
   * 超时时间 (毫秒)
   * @default 30000
   */
  public timeout: number;

  constructor(config: {
    url: string;
    method?: DHttpMethodType;
    headers?: Record<string, string>;
    body?: string | FormData | URLSearchParams;
    queryParams?: Record<string, string>;
    timeout?: number;
  }) {
    this.url = config.url;
    this.method = config.method || DHttpMethodType.GET;
    this.headers = config.headers || {};
    this.body = config.body || '';
    this.queryParams = config.queryParams || {};
    this.timeout = config.timeout || 30_000;
  }
  /**
   * 添加单个请求头
   */
  addHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
  /**
   * 批量添加请求头
   */
  addHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }
  /**
   * 设置 JSON 格式请求体
   */
  setJSONBody(data: unknown): void {
    this.body = JSON.stringify(data);
    this.addHeader('Content-Type', 'application/json');
  }
  /**
   * 生成完整请求 URL (包含查询参数)
   */
  getFullUrl(): string {
    const url = new URL(this.url);
    Object.entries(this.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  }
}

export { DHttpRequest };
