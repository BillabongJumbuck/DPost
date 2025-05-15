import axios, { type AxiosResponse, type CancelTokenSource } from 'axios'
import type {
  DHttpRequestDoc,
  DHttpResponse,
  DHttpKeyValueDoc,
  DHttpSuccessResponse,
  DHttpFailureResponse,
  DHttpFailureNetwork,
  DHttpFailureScript,
} from '@/utility/model'

// 代理配置
const PROXY_URL = 'http://47.94.135.9:3000/api/'

// 判断是否为本地请求
const isLocalRequest = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1' ||
      urlObj.hostname === '0.0.0.0'
    )
  } catch {
    return false
  }
}

// Utility to filter active key-value pairs and convert to object
const toActiveKeyValueObject = (items: DHttpKeyValueDoc[]): Record<string, string> => {
  return items
    .filter((item) => item.active)
    .reduce(
      (obj, item) => {
        obj[item.key] = item.value
        return obj
      },
      {} as Record<string, string>,
    )
}

// Utility to calculate content size in bytes
const calculateSize = (data: ArrayBuffer | string): number => {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data).length
  }
  return data.byteLength
}

// Utility to convert response headers to DHttpKeyValueDoc[]
const headersToKeyValueDocs = (headers: Record<string, unknown>): DHttpKeyValueDoc[] => {
  return Object.entries(headers).map(([key, value], index) => ({
    id: `header-${index}-${key}-${Date.now()}`,
    key,
    value: String(value ?? ''),
    description: '',
    active: true,
  }))
}

// Utility to convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str).buffer
}

// 存储当前活动的请求
const activeRequests = new Map<string, CancelTokenSource>()

export const sendHttpRequest = async (request: DHttpRequestDoc): Promise<DHttpResponse | null> => {
  const startTime = performance.now()

  // 如果已经存在相同ID的请求，先取消它
  if (activeRequests.has(request.id)) {
    activeRequests.get(request.id)?.cancel('Request cancelled by user')
    activeRequests.delete(request.id)
  }

  // 创建新的取消令牌
  const source = axios.CancelToken.source()
  activeRequests.set(request.id, source)

  try {
    // Prepare headers (only active)
    const headers = toActiveKeyValueObject(request.headers)

    // Prepare query parameters (only active)
    const params = toActiveKeyValueObject(request.queryParams)

    // Prepare request body
    const bodyContent = request.body.bodyContent
    const data = bodyContent && bodyContent.trim() !== '' ? bodyContent : undefined

    // Set Content-Type if body is present and contentType is specified
    if (data && request.body.contentType) {
      headers['Content-Type'] = request.body.contentType
    }

    // 检查是否需要使用代理
    // const useProxy = !isLocalRequest(request.url)
    const useProxy = false
    const url = useProxy ? `${PROXY_URL}${request.url}` : request.url

    // Configure axios request
    const config = {
      method: request.method,
      url,
      headers,
      params,
      data,
      responseType: 'arraybuffer' as const,
      validateStatus: () => true,
      cancelToken: source.token,
    }

    // Send request
    const response: AxiosResponse<ArrayBuffer> = await axios(config)

    // Get response body
    const responseBody = response.data || stringToArrayBuffer('')

    // Calculate response time and size
    const responseTime = Math.round(performance.now() - startTime)
    const responseSize = calculateSize(responseBody)

    // Determine success or failure based on status code (2xx is success)
    const isSuccess = response.status >= 200 && response.status < 300

    const responseHeaders = headersToKeyValueDocs(response.headers)

    if (isSuccess) {
      return {
        type: 'success',
        headers: responseHeaders,
        body: responseBody,
        statusCode: response.status,
        statusText: response.statusText || 'OK',
        meta: {
          responseSize,
          responseDuration: responseTime,
        },
        // req: request,
      } satisfies DHttpSuccessResponse
    } else {
      return {
        type: 'failure',
        headers: responseHeaders,
        body: responseBody,
        statusCode: response.status,
        statusText: response.statusText || 'Error',
        meta: {
          responseSize,
          responseDuration: responseTime,
        },
        // req: request,
      } satisfies DHttpFailureResponse
    }
  } catch (error: unknown) {
    // 如果是取消请求导致的错误，返回特定的响应
    if (axios.isCancel(error)) {
      return null
    }
    const responseTime = Math.round(performance.now() - startTime)

    if (axios.isAxiosError(error) && error.response) {
      // Handle HTTP errors (e.g., 4xx, 5xx)
      const responseBody = error.response.data || stringToArrayBuffer('')
      const responseSize = calculateSize(responseBody)

      return {
        type: 'failure',
        headers: headersToKeyValueDocs(error.response.headers || {}),
        body: responseBody,
        statusCode: error.response.status || 0,
        statusText: error.response.statusText || error.message || 'Error',
        meta: {
          responseSize,
          responseDuration: responseTime,
        },
        // req: request,
      } satisfies DHttpFailureResponse
    } else if (axios.isAxiosError(error)) {
      // Handle network errors
      return {
        type: 'network_fail',
        error: error.message || 'Network error',
        // req: request,
      } satisfies DHttpFailureNetwork
    } else {
      // Handle unexpected errors (e.g., scripting errors)
      return {
        type: 'script_fail',
        error: error instanceof Error ? error : new Error(String(error)),
      } satisfies DHttpFailureScript
    }
  } finally {
    // 请求完成后移除取消令牌
    activeRequests.delete(request.id)
  }
}

// 添加取消请求的方法
export const cancelHttpRequest = (requestId: string): void => {
  if (activeRequests.has(requestId)) {
    activeRequests.get(requestId)?.cancel('Request cancelled by user')
    activeRequests.delete(requestId)
  }
}
