// API 基础配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3001',
  },
  // 生产环境
  production: {
    baseURL: 'http://47.94.135.9:3001', // 替换为您的 ECS 域名
  },
}

// 根据当前环境获取基础 URL
const env = import.meta.env.MODE || 'development'
export const BASE_URL = API_CONFIG[env as keyof typeof API_CONFIG].baseURL

// API 端点
export const API_ENDPOINTS = {
  // 代码生成
  generateCode: `${BASE_URL}/api/generate-client`,
  // 文档生成
  generateDocs: `${BASE_URL}/api/generate-docs`,
  // API 测试生成
  generateTest: `${BASE_URL}/api/generate-har`,
}
