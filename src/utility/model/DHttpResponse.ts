/**
 * HTTP 响应实体类
 */
class DHttpResponse {
  /**
   * HTTP 状态码
   * @example 200
   */
  public status: number;

  /**
   * HTTP 状态描述
   * @example "OK"
   */
  public statusText: string;

  /**
   * 响应头 (键值对格式)
   * @example { "Content-Type": "application/json" }
   */
  public headers: Record<string, string>;

  /**
   * 响应主体内容（原始数据）
   */
  public data: string | Blob | ArrayBuffer | FormData;

  /**
   * 原始响应对象 (根据具体 HTTP 客户端实现)
   */
  public rawResponse: Response;

  constructor(config: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: string | Blob | ArrayBuffer | FormData;
    rawResponse: Response;
  }) {
    this.status = config.status;
    this.statusText = config.statusText;
    this.headers = config.headers;
    this.data = config.data;
    this.rawResponse = config.rawResponse;
  }

  /**
   * 检查是否为成功状态码 (200-299)
   */
  isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * 获取指定响应头
   * @param key 不区分大小写的头名称
   */
  getHeader(key: string): string | undefined {
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(this.headers).find(
      k => k.toLowerCase() === lowerKey
    );
    return foundKey ? this.headers[foundKey] : undefined;
  }

  /**
   * 获取 Blob 格式内容（适用于文件下载）
   */
  async getBlob(): Promise<Blob> {
    if (!(this.data instanceof Blob)) {
      throw new Error('Response data is not a Blob');
    }
    return this.data;
  }

  /**
   * 获取文本内容
   */
  async getText(): Promise<string> {
    if (typeof this.data !== 'string') {
      throw new Error('Response data is not text');
    }
    return this.data;
  }
}

export { DHttpResponse };
