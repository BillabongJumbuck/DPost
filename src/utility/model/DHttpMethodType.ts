export enum DHttpMethodType {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

// 类型安全的转换函数
export const toDHttpMethod = (method: string): DHttpMethodType => {
  const normalized = method.toUpperCase() as keyof typeof DHttpMethodType
  return DHttpMethodType[normalized] || DHttpMethodType.GET // 默认值策略
}
