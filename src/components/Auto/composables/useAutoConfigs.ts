import { ref } from 'vue'
import type { SummaryPayload } from '../steps/StepSummary.vue'

export type CreatedConfig = SummaryPayload & {
  id: string
  updatedAt: string
}

const STORAGE_KEY = 'posttest:auto-configs'

const normalizeConfigFromStorage = (raw: unknown): CreatedConfig | null => {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.id !== 'string' || typeof obj.updatedAt !== 'string') return null

  const repoInfoRaw = obj.repoInfo
  if (!repoInfoRaw || typeof repoInfoRaw !== 'object') return null
  const repoInfo = repoInfoRaw as Record<string, unknown>
  if (typeof repoInfo.repoURL !== 'string' || typeof repoInfo.techStack !== 'string') return null

  const repoDetailsRaw = obj.repoDetails
  if (!repoDetailsRaw || typeof repoDetailsRaw !== 'object') return null
  const repoDetails = repoDetailsRaw as Record<string, unknown>

  const testCasesRaw = Array.isArray(obj.testCases) ? (obj.testCases as unknown[]) : []
  const testCases = testCasesRaw
    .map((tc) => {
      if (!tc || typeof tc !== 'object') return null
      const caseObj = tc as Record<string, unknown>
      const method = typeof caseObj.method === 'string' ? caseObj.method : ''
      const path = typeof caseObj.path === 'string' ? caseObj.path : ''
      if (!method || !path) return null
      const summary = typeof caseObj.summary === 'string' ? caseObj.summary : ''
      const description = typeof caseObj.description === 'string' ? caseObj.description : undefined
      const result: SummaryPayload['testCases'][number] = {
        id: typeof caseObj.id === 'string' ? caseObj.id : `${method}-${path}`,
        method,
        path,
        summary,
      }
      if (description) result.description = description
      return result
    })
    .filter((tc): tc is SummaryPayload['testCases'][number] => tc !== null)

  const spec =
    obj.spec && typeof obj.spec === 'object' ? (obj.spec as Record<string, unknown>) : null

  return {
    repoInfo: {
      name: typeof repoInfo.name === 'string' ? repoInfo.name : undefined,
      repoURL: repoInfo.repoURL,
      org: typeof repoInfo.org === 'string' ? repoInfo.org : undefined,
      techStack: repoInfo.techStack,
    },
    repoDetails: {
      repoURL: typeof repoDetails.repoURL === 'string' ? repoDetails.repoURL : repoInfo.repoURL,
      org: typeof repoDetails.org === 'string' ? repoDetails.org : '未识别',
      repo: typeof repoDetails.repo === 'string' ? repoDetails.repo : '',
      repoName: typeof repoDetails.repoName === 'string' ? repoDetails.repoName : '',
      frameworkLabel:
        typeof repoDetails.frameworkLabel === 'string' ? repoDetails.frameworkLabel : '',
    },
    testCases,
    spec,
    id: obj.id,
    updatedAt: obj.updatedAt,
  }
}

const loadConfigsFromStorage = (): CreatedConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => normalizeConfigFromStorage(item))
      .filter((item): item is CreatedConfig => !!item)
  } catch (error) {
    console.warn('加载本地配置失败:', error)
    return []
  }
}

export function useAutoConfigs() {
  const configs = ref<CreatedConfig[]>(loadConfigsFromStorage())

  const persistConfigs = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.value))
    } catch (error) {
      console.warn('保存本地配置失败:', error)
    }
  }

  const addConfig = (payload: SummaryPayload) => {
    const sanitizedPayload: SummaryPayload = {
      repoInfo: { ...payload.repoInfo },
      repoDetails: { ...payload.repoDetails },
      testCases: payload.testCases.map((item) => ({ ...item })),
      spec: payload.spec ? JSON.parse(JSON.stringify(payload.spec)) : null,
    }

    const newConfig: CreatedConfig = {
      ...sanitizedPayload,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
    }
    configs.value = [newConfig, ...configs.value]
    persistConfigs()
    return newConfig
  }

  const updateConfig = (id: string, updates: Partial<CreatedConfig>) => {
    const index = configs.value.findIndex((c) => c.id === id)
    if (index === -1) return false
    configs.value[index] = {
      ...configs.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    configs.value = [...configs.value]
    persistConfigs()
    return true
  }

  const removeConfig = (id: string) => {
    const index = configs.value.findIndex((c) => c.id === id)
    if (index === -1) return false
    configs.value = configs.value.filter((c) => c.id !== id)
    persistConfigs()
    return true
  }

  return {
    configs,
    addConfig,
    updateConfig,
    removeConfig,
    persistConfigs,
  }
}
