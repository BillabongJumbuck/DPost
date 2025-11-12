export type ForkRepositoryPayload = {
  repo_url: string
  org?: string
}

export type ForkRepositoryResponse = {
  status: 'ok'
  data: Record<string, unknown>
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || ''

const buildURL = (path: string) => {
  if (!API_BASE_URL) return path
  return `${API_BASE_URL}${path}`
}

export async function forkRepository(
  payload: ForkRepositoryPayload,
): Promise<ForkRepositoryResponse> {
  try {
    const response = await fetch(buildURL('/repos/fork'), {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && 'message' in data && data.message) ||
        `Fork 仓库请求失败（${response.status}）`
      throw new Error(String(errorMessage))
    }

    return data as ForkRepositoryResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Fork 仓库请求失败，请稍后重试')
  }
}
