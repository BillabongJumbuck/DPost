export type Content = "json" | "xml" | "multipart" | "html" | "plain" | "binary"

export const knownContentTypes: Record<string, Content> = {
  "application/json": "json",
  "application/ld+json": "json",
  "application/hal+json": "json",
  "application/vnd.api+json": "json",
  "application/xml": "xml",
  "application/x-www-form-urlencoded": "multipart",
  "multipart/form-data": "multipart",
  "application/octet-stream": "binary",
  "text/html": "html",
  "text/plain": "plain",
  "text/xml": "xml",
}

type ContentTypeTitle =
  | "文字"
  | "结构"
  | "其他"
  | "binary"

type SegmentedContentType = {
  title: ContentTypeTitle
  contentTypes: string[]
}

export const segmentedContentTypes: SegmentedContentType[] = [
  {
    title: "文字",
    contentTypes: [
      "application/json",
      "application/ld+json",
      "application/hal+json",
      "application/vnd.api+json",
      "application/xml",
      "text/xml",
    ],
  },
  {
    title: "结构",
    contentTypes: ["application/x-www-form-urlencoded", "multipart/form-data"],
  },
  {
    title: "binary",
    contentTypes: ["application/octet-stream"],
  },
  {
    title: "其他",
    contentTypes: ["text/html", "text/plain"],
  },
]

export function isJSONContentType(contentType: string) {
  return /\bjson\b/i.test(contentType)
}
