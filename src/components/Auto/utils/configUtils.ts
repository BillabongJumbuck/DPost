import type { SummaryPayload } from '../steps/StepSummary.vue'

const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']

export function validateOpenAPISpec(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return '文件内容不是有效的 JSON 对象'
  const s = spec as { openapi?: unknown; swagger?: unknown; paths?: unknown }
  const hasVersion = !!(s.openapi || s.swagger)
  if (!hasVersion) return '缺少 openapi/swagger 字段'
  if (!s.paths || typeof s.paths !== 'object') return '缺少 paths 字段'
  return null
}

export function deriveTestCasesFromSpec(spec: Record<string, unknown>): SummaryPayload['testCases'] {
  const paths = spec.paths
  if (!paths || typeof paths !== 'object') return []

  const list: SummaryPayload['testCases'] = []

  Object.entries(paths as Record<string, unknown>).forEach(([path, operations]) => {
    if (!operations || typeof operations !== 'object') return
    Object.entries(operations as Record<string, unknown>).forEach(([method, config]) => {
      const upperMethod = method.toUpperCase()
      if (!SUPPORTED_METHODS.includes(upperMethod)) return
      const op = (config ?? {}) as { summary?: unknown; description?: unknown }
      const summary =
        (typeof op.summary === 'string' && op.summary.trim()) || '未提供概要，请检查 OpenAPI 文档'
      const description = typeof op.description === 'string' ? op.description.trim() : undefined
      list.push({
        id: `${upperMethod}-${path}`,
        method: upperMethod,
        path,
        summary,
        description,
      })
    })
  })

  return list
}

export function formatDate(iso: string): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return formatter.format(new Date(iso))
}
