import type { SummaryPayload } from '../steps/StepSummary.vue'
import { createValidator } from '@/schema/jsonSchemaValidator'
import testCaseSchema from '@/schema/schema.json'

const validateTestCase = createValidator(testCaseSchema)

export function validateTestCaseFormat(spec: unknown): string | null {
  if (!spec || typeof spec !== 'object') return '文件内容不是有效的 JSON 对象'
  
  const valid = validateTestCase(spec)
  if (!valid) {
    const errors = validateTestCase.errors || []
    if (errors.length > 0) {
      const firstError = errors[0]
      const path = firstError.instancePath || firstError.schemaPath
      return `格式验证失败：${path} ${firstError.message || '不符合规范'}`
    }
    return '格式验证失败：文件不符合测试用例格式规范'
  }
  
  const s = spec as { tests?: unknown }
  if (!s.tests || !Array.isArray(s.tests) || s.tests.length === 0) {
    return '缺少 tests 字段或 tests 为空数组'
  }
  
  return null
}

export function deriveTestCasesFromSpec(spec: Record<string, unknown>): SummaryPayload['testCases'] {
  const tests = spec.tests
  if (!Array.isArray(tests) || tests.length === 0) return []

  const list: SummaryPayload['testCases'] = []

  tests.forEach((test) => {
    if (!test || typeof test !== 'object') return
    const testObj = test as { name?: unknown; steps?: unknown }
    const testName = (typeof testObj.name === 'string' ? testObj.name : '未命名测试集') || '未命名测试集'
    const steps = Array.isArray(testObj.steps) ? testObj.steps : []

    steps.forEach((step, stepIndex) => {
      if (!step || typeof step !== 'object') return
      const stepObj = step as { name?: unknown; request?: unknown }
      const stepName = (typeof stepObj.name === 'string' ? stepObj.name : `步骤 ${stepIndex + 1}`) || `步骤 ${stepIndex + 1}`
      
      const request = stepObj.request
      if (!request || typeof request !== 'object') return
      const req = request as { method?: unknown; url?: unknown }
      
      const method = typeof req.method === 'string' ? req.method.toUpperCase() : 'UNKNOWN'
      const url = typeof req.url === 'string' ? req.url : '未指定 URL'
      
      list.push({
        id: `${testName}-${stepIndex}-${method}-${url}`,
        method,
        path: url,
        summary: stepName,
        description: `测试集：${testName}`,
        testName,
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
