import axios, { type AxiosResponse } from 'axios'
import type { DHttpRequestDoc, DHttpResponse, DHttpKeyValueDoc } from '@/utility/model'

// Utility to filter active key-value pairs and convert to object
const toActiveKeyValueObject = (items: DHttpKeyValueDoc[]): Record<string, string> => {
  return items
    .filter(item => item.active)
    .reduce((obj, item) => {
      obj[item.key] = item.value
      return obj
    }, {} as Record<string, string>)
}

// Utility to calculate content size in bytes
const calculateSize = (data: string): number => {
  return new TextEncoder().encode(data).length
}

// Utility to convert string to ArrayBuffer
export const sendHttpRequest = async (request: DHttpRequestDoc): Promise<DHttpResponse> => {
  const startTime = performance.now()

  try {
    // Prepare headers
    const headers = toActiveKeyValueObject(request.headers)

    // Prepare query parameters
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
      // Ensure we get the raw Response object
      validateStatus: () => true, // Accept all status codes
    }

    // Send request
    const response: AxiosResponse = await axios(config)

    // Calculate response time
    const responseTime = Math.round(performance.now() - startTime)

    // Convert response headers to DHttpKeyValueDoc[]
    const responseHeaders: DHttpKeyValueDoc[] = Object.entries(response.headers).map(([key, value]) => ({
      id: `${key}-${Date.now()}`, // Unique ID (can refine if needed)
      key,
      value: String(value),
      description: '',
      active: true,
    }))

    // Prepare DHttpResponse
    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      rawResponse: response.request.response, // Browser Response object
      size: calculateSize(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
      responseTime,
    }

  } catch (error: any) {
    // Handle errors (e.g., network failure, invalid URL)
    const responseTime = Math.round(performance.now() - startTime)
    const errorMessage = error.message || 'Request failed'

    return {
      status: error.response?.status || 0,
      statusText: errorMessage,
      headers: [],
      data: errorMessage,
      rawResponse: error.response?.request?.response || null,
      size: calculateSize(errorMessage),
      responseTime,
    }
  }
}
