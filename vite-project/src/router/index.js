import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/register', component: () => import('@/views/RegisterPage.vue') },
  { 
    path: '/', 
    component: () => import('@/layouts/MainLayout.vue'),
    // 首页不强制登录，允许游客看个大概
    children: [
      { path: '', component: () => import('@/views/SubmitTicket.vue') },
      { path: 'tickets', component: () => import('@/views/MyTickets.vue'), meta: { requiresAuth: true } },
      { path: 'workplace', component: () => import('@/views/Workplace.vue'), meta: { requiresAuth: true } },
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 简单的守卫逻辑：只拦截明确标记了 requiresAuth 的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }
  
  // 删掉了所有关于 /bind 的跳转逻辑！
  next()
})

export default router