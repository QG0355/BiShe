import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/register', component: () => import('@/views/RegisterPage.vue') },
  // 保留绑定页，但不需要强制鉴权（或者只在特定逻辑跳转）
  { path: '/bind', component: () => import('@/views/IdentityBind.vue') },
  { 
    path: '/', 
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // 主页改成 Dashboard (欢迎页)，不再是 SubmitTicket
      { path: '', component: () => import('@/views/Dashboard.vue') },
      { path: 'submit', component: () => import('@/views/SubmitTicket.vue') },
      { path: 'tickets', component: () => import('@/views/MyTickets.vue') },
      { path: 'workplace', component: () => import('@/views/Workplace.vue') },
      { path: 'admin', component: () => import('@/views/AdminDashboard.vue') }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 简单的守卫：只保护那些显式需要登录的页面
  // 这里我们稍微放宽一点，主页 "/" 允许未登录访问
  const publicPages = ['/login', '/register', '/']
  
  // 如果去的不是公共页面，且没登录，才跳登录页
  if (!publicPages.includes(to.path) && !authStore.isLoggedIn) {
    return next('/login')
  }

  // ⚠️ 删除了所有关于 "identity_bound" 的强制跳转逻辑！
  // 这样就不会白屏了。
  
  next()
})

export default router