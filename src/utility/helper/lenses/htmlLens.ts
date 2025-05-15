import { defineAsyncComponent } from 'vue'
import { type Lens } from './lenses'

const htmlLens: Lens = {
  lensName: 'HTML',
  isSupportedContentType: (contentType) =>
    /\btext\/html|application\/xhtml\+xml\b/i.test(contentType),
  renderer: 'htmlres',
  rendererImport: defineAsyncComponent(() => import('@/components/Lenses/HTMLLensRenderer.vue')),
}

export default htmlLens
