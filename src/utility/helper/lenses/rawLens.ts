import { defineAsyncComponent } from 'vue'
import { type Lens } from './lenses'

const rawLens: Lens = {
  lensName: 'Raw',
  isSupportedContentType: () => true,
  renderer: 'raw',
  rendererImport: defineAsyncComponent(() => import('@/components/Lenses/RawLensRenderer.vue')),
}

export default rawLens
