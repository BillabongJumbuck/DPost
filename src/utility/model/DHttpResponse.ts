import type { DHttpKeyValueDoc } from '@/utility/model/DHttpKeyValueDoc.ts'

export type DHttpSuccessResponse = {
  type: 'success'
  headers: DHttpKeyValueDoc[]
  body: ArrayBuffer
  statusCode: number
  statusText: string
  meta: {
    responseSize: number // in bytes
    responseDuration: number // in millis
  }
  // req: DHttpRequestDoc
}

export type DHttpFailureResponse = {
  type: 'failure'
  headers: DHttpKeyValueDoc[]
  body: ArrayBuffer
  statusCode: number
  statusText: string
  meta: {
    responseSize: number // in bytes
    responseDuration: number // in millis
  }
  // req: DHttpRequestDoc
}

export type DHttpFailureNetwork = {
  type: 'network_fail'
  error: unknown
  // req: DHttpRequestDoc
}

export type DHttpFailureScript = {
  type: 'script_fail'
  error: Error
}

export type DHttpLoadingResponse = {
  type: 'loading'
  // req: DHttpRequestDoc
}

export type DHttpResponse =
  | DHttpLoadingResponse
  | DHttpSuccessResponse
  | DHttpFailureResponse
  | DHttpFailureNetwork
  | DHttpFailureScript
