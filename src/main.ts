import './assets/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import VueTippy from 'vue-tippy';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(VueTippy, {
  directive: 'tippy', // 自定义指令名称
  component: 'tippy', // 自定义组件名称
});

app.use(router)

app.mount('#app')
