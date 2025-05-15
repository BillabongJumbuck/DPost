import axios, { AxiosError } from 'axios'
import { DHttpMethodType, type DHttpKeyValueDoc } from '@/utility/model'
import { API_ENDPOINTS } from '@/config/api'

// 接口响应类型定义
interface HarRequest {
  log: {
    entries: Array<{
      request: {
        method: string
        url: string
        headers: Array<{ name: string; value: string }>
        queryString: Array<{ name: string; value: string }>
        postData?: {
          mimeType: string
          text: string
        }
      }
    }>
  }
}

interface SuccessResponse {
  success: true
  data: {
    harRequest: string
  }
}

interface ErrorResponse {
  success: false
  error: string
  details?: string
}

type GenerateHarResponse = SuccessResponse | ErrorResponse

/**
 * 清理输入文本，移除可能的 Markdown 格式
 * @param input 原始输入文本
 * @returns 清理后的文本
 */
function cleanInput(input: string): string {
  return input
    .replace(/```(?:json)?\n?/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

/**
 * 将简单的键值对转换为 DHttpKeyValueDoc 格式
 */
function toDHttpKeyValueDoc(items: Array<{ name: string; value: string }>): DHttpKeyValueDoc[] {
  return items.map((item) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    key: item.name,
    value: item.value,
    description: '',
    active: true,
  }))
}

/**
 * 从代码或文档生成API测试
 * @param input 后端代码或API文档
 * @returns 新标签页数据
 * @throws {Error} 当请求失败或生成失败时抛出错误
 */
export async function generateApiTest(input: string): Promise<{
  name: string
  url: string
  method: DHttpMethodType
  headers: DHttpKeyValueDoc[]
  queryParams: DHttpKeyValueDoc[]
  body: {
    contentType: string | null
    bodyContent: string | null
  }
}> {
  try {
    const cleanedInput = cleanInput(input)

    const response = await axios.post<GenerateHarResponse>(
      API_ENDPOINTS.generateTest,
      {
        input: cleanedInput,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('服务器响应:', response.data)

    if (!response.data.success) {
      const errorData = response.data as ErrorResponse
      throw new Error(errorData.error + (errorData.details ? `\n${errorData.details}` : ''))
    }

    // 解析返回的 HAR 字符串
    const harString = response.data.data.harRequest
    console.log('原始 HAR 字符串:', harString)

    const cleanedHarString = cleanInput(harString)
    console.log('清理后的 HAR 字符串:', cleanedHarString)

    let harData: HarRequest
    try {
      harData = JSON.parse(cleanedHarString) as HarRequest
      console.log('解析后的 HAR 数据:', harData)
    } catch (parseError: unknown) {
      console.error('JSON 解析错误:', parseError)
      throw new Error(
        'HAR 数据格式错误: ' +
          (parseError instanceof Error ? parseError.message : String(parseError)),
      )
    }

    // 验证数据结构
    if (!harData?.log?.entries?.[0]?.request) {
      console.error('无效的 HAR 数据结构:', harData)
      throw new Error('无效的 HAR 数据结构')
    }

    const entry = harData.log.entries[0].request

    // 构建新标签页数据
    const newTabData: {
      name: string
      url: string
      method: DHttpMethodType
      headers: DHttpKeyValueDoc[]
      queryParams: DHttpKeyValueDoc[]
      body: {
        contentType: string | null
        bodyContent: string | null
      }
    } = {
      name: 'AI生成的API测试',
      url: entry.url,
      method: entry.method as DHttpMethodType,
      headers: toDHttpKeyValueDoc(entry.headers || []),
      queryParams: toDHttpKeyValueDoc(entry.queryString || []),
      body: {
        contentType: entry.postData?.mimeType || null,
        bodyContent: entry.postData?.text || null,
      },
    }

    console.log('生成的新标签页数据:', newTabData)
    return newTabData
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        const status = error.response.status
        const errorMessage = error.response.data?.error || '未知错误'

        switch (status) {
          case 400:
            throw new Error(`请求参数错误: ${errorMessage}`)
          case 500:
            throw new Error(`服务器内部错误: ${errorMessage}`)
          default:
            throw new Error(`请求失败 (${status}): ${errorMessage}`)
        }
      } else if (error.request) {
        throw new Error('服务器无响应，请检查网络连接')
      } else {
        throw new Error(`请求配置错误: ${error.message}`)
      }
    }

    console.error('生成API测试失败:', error)
    throw new Error('生成API测试失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}
