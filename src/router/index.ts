import { createRouter, createWebHistory } from 'vue-router'
import RESTFul from '@/views/RESTFul.vue'
import SysSetting from '@/views/Setting.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/restful'
    },
    {
      path: '/restful',
      name: 'RESTFul',
      component: RESTFul,
    },
    {
      path: '/setting',
      name: 'Setting',
      component: SysSetting,
    },
  ],
})

export default router
