// src/stores/ticketStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth' // 引入 auth 仓库，用来拿 Token

const API_URL = 'http://127.0.0.1:8000/api'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    tickets: [], // 存放报修单列表
    loading: false
  }),
  
  actions: {
    // 1. 获取报修单列表
    async fetchTickets() {
      const authStore = useAuthStore() // 获取当前登录用户信息
      
      // 如果没登录，直接不发请求，防止报错
      if (!authStore.token) return 

      this.loading = true
      try {
        // ⭐ 重点：发送请求时，手动把 Token 带在 headers 里
        // 这样后端 request.user 才能识别出你是谁
        const response = await axios.get(`${API_URL}/tickets/`, {
          headers: { 
            Authorization: `Token ${authStore.token}` 
          }
        })
        
        this.tickets = response.data
      } catch (error) {
        console.error('获取报修单失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 2. 提交新报修单
    async createTicket(ticketData) {
      const authStore = useAuthStore()
      try {
        // 发送 POST 请求
        await axios.post(`${API_URL}/tickets/`, ticketData, {
          headers: { Authorization: `Token ${authStore.token}` }
        })
        // 提交成功后，重新获取一下最新列表
        this.fetchTickets()
        return true
      } catch (error) {
        console.error('提交失败:', error)
        alert("提交失败：" + JSON.stringify(error.response?.data))
        return false
      }
    }
  }
})