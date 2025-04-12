import axios, { type AxiosResponse } from 'axios'
import type {
  DHttpRequestDoc,
  DHttpResponse,
  DHttpKeyValueDoc,
  DHttpSuccessResponse,
  DHttpFailureResponse,
  DHttpFailureNetwork,
  DHttpFailureScript,
} from '@/utility/model'

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
const headersToKeyValueDocs = (headers: Record<string, any>): DHttpKeyValueDoc[] => {
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

export const sendHttpRequest = async (request: DHttpRequestDoc): Promise<DHttpResponse> => {
  const startTime = performance.now()

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

    // Configure axios request
    const config = {
      method: request.method,
      url: request.url,
      headers,
      params,
      data,
      responseType: 'arraybuffer' as const, // Use ArrayBuffer for body
      validateStatus: () => true, // Accept all status codes
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
        req: request,
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
        req: request,
      } satisfies DHttpFailureResponse
    }
  } catch (error: any) {
    const responseTime = Math.round(performance.now() - startTime)

    if (error.isAxiosError && error.response) {
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
        req: request,
      } satisfies DHttpFailureResponse
    } else if (error.isAxiosError) {
      // Handle network errors
      return {
        type: 'network_fail',
        error: error.message || 'Network error',
        req: request,
      } satisfies DHttpFailureNetwork
    } else {
      // Handle unexpected errors (e.g., scripting errors)
      return {
        type: 'script_fail',
        error: error instanceof Error ? error : new Error(String(error)),
      } satisfies DHttpFailureScript
    }
  }
}
