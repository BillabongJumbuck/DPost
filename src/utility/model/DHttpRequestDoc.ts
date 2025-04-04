import { DHttpRequest } from '@/utility/model/DHttpRequest.ts'
import type { DHttpResponse } from '@/utility/model/DHttpResponse.ts'

export type DHttpRequestDoc = {
  /**
   * unique id
   */
  id: string

  /**
   * The document type
   */
  type: "request"

  /**
   * The document name
   */
  name: string | "Untitled"

  /**
   * The request as it is in the document
   */
  request: DHttpRequest

  /**
   * Whether the request has any unsaved changes
   * (atleast as far as we can say)
   */
  isDirty: boolean | false;

  /**
   * Info about where this request should be saved.
   * This contains where the request is originated from basically.
   */
  // saveContext?: HoppRESTSaveContext

  /**
   * The response as it is in the document
   * (if any)
   */
  response?: DHttpResponse | null
}
