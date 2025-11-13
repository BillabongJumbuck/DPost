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

export type SubmitTestCasePayload = {
  repo_url: string
  org?: string
  tech_stack: 'springboot_maven' | 'nodejs_express' | 'python_flask'
  test_case_file: File | Blob
}

export type SubmitTestCaseResponse = {
  status: 'ok'
  message: string
  file_path: string
  repo_full_name: string
  org?: string
  tech_stack: string
}

export async function submitTestCase(
  payload: SubmitTestCasePayload,
): Promise<SubmitTestCaseResponse> {
  try {
    const formData = new FormData()
    formData.append('repo_url', payload.repo_url)
    if (payload.org) {
      formData.append('org', payload.org)
    }
    formData.append('tech_stack', payload.tech_stack)
    formData.append('test_case_file', payload.test_case_file, 'test-case.json')

    const response = await fetch(buildURL('/repos/test'), {
      method: 'POST',
      body: formData,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && 'message' in data && data.message) ||
        `提交测试用例失败（${response.status}）`
      throw new Error(String(errorMessage))
    }

    return data as SubmitTestCaseResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('提交测试用例失败，请稍后重试')
  }
}

export type UpdateTestCasePayload = SubmitTestCasePayload

export type UpdateTestCaseResponse = {
  status: 'ok'
  message: string
  file_path: string
  repo_full_name: string
  org?: string
  tech_stack: string
}

export async function updateTestCase(
  payload: UpdateTestCasePayload,
): Promise<UpdateTestCaseResponse> {
  try {
    const formData = new FormData()
    formData.append('repo_url', payload.repo_url)
    if (payload.org) {
      formData.append('org', payload.org)
    }
    formData.append('tech_stack', payload.tech_stack)
    formData.append('test_case_file', payload.test_case_file, 'test-case.json')

    const response = await fetch(buildURL('/repos/test'), {
      method: 'PUT',
      body: formData,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && 'message' in data && data.message) ||
        `更新测试用例失败（${response.status}）`
      throw new Error(String(errorMessage))
    }

    return data as UpdateTestCaseResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('更新测试用例失败，请稍后重试')
  }
}

export type DeleteRepositoryPayload = {
  repo_url: string
  org?: string
}

export type DeleteRepositoryResponse = {
  status: 'ok'
  message: string
  repo_full_name: string
  org?: string
  fork_owner?: string
  deleted_from?: {
    github: boolean
    database: boolean
    test_case_file: boolean
  }
  warning?: string
}

export async function deleteRepository(
  payload: DeleteRepositoryPayload,
): Promise<DeleteRepositoryResponse> {
  try {
    const response = await fetch(buildURL('/repos'), {
      method: 'DELETE',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && 'message' in data && data.message) ||
        `删除仓库失败（${response.status}）`
      throw new Error(String(errorMessage))
    }

    return data as DeleteRepositoryResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('删除仓库失败，请稍后重试')
  }
}
