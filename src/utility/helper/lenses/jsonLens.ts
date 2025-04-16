import { defineAsyncComponent } from "vue"
import { isJSONContentType } from '@/utility/helper/contenttypes.ts'
import { type Lens } from "./lenses"

const jsonLens: Lens = {
  lensName: "JSON",
  isSupportedContentType: isJSONContentType,
  renderer: "json",
  rendererImport: defineAsyncComponent(
    () => import("@/components/Lenses/JSONLensRenderer.vue")
  ),
}

export default jsonLens
