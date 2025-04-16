import { defineAsyncComponent } from "vue"
import { type Lens } from "./lenses"

const xmlLens: Lens = {
  lensName: "XML",
  isSupportedContentType: (contentType) => /\bxml\b/i.test(contentType),
  renderer: "xmlres",
  rendererImport: defineAsyncComponent(
    () => import("@/components/Lenses/XMLLensRenderer.vue")
  ),
}

export default xmlLens
