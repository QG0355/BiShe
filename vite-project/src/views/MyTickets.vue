<template>
  <div class="page-content">
    <div class="header-row">
      <h2><i class="fas fa-ticket-alt"></i> 我的报修记录</h2>
      <button @click="$router.push('/submit')" class="btn-primary">
        <i class="fas fa-plus"></i> 新建报修
      </button>
    </div>

    <div v-if="ticketStore.tickets.length === 0" class="empty-state">
      <p>暂无报修记录</p>
    </div>

    <div v-else class="ticket-list">
      <div v-for="ticket in ticketStore.tickets" :key="ticket.id" class="ticket-card">
        <div class="card-header">
          <span class="title">{{ ticket.title }}</span>
          <span class="status-tag">{{ formatStatus(ticket.status) }}</span>
        </div>
        <div class="card-body">
          <p><strong>位置：</strong>{{ ticket.location }}</p>
          <p><strong>描述：</strong>{{ ticket.description }}</p>
          <p class="time">{{ formatDate(ticket.submitTime) }}</p>
        </div>
        <div class="card-footer">
          <button v-if="ticket.status === 'pending_dispatch'" 
                  @click="deleteTicket(ticket.id)" 
                  class="btn-delete">
            <i class="fas fa-trash"></i> 撤销
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTicketStore } from '@/stores/ticketStore'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const ticketStore = useTicketStore()
const auth = useAuthStore()

onMounted(() => {
  ticketStore.fetchTickets()
})

// 撤销功能
async function deleteTicket(id) {
  if(!confirm("确定要撤销此报修单吗？")) return;
  try {
    await axios.delete(`http://127.0.0.1:8000/api/tickets/${id}/`, {
      headers: { Authorization: `Token ${auth.token}` }
    })
    alert("已撤销")
    ticketStore.fetchTickets() // 刷新列表
  } catch (e) {
    alert("撤销失败")
  }
}

function formatStatus(status) {
  const map = { 'pending_dispatch': '待派单', 'repairing': '维修中', 'finished': '待评价', 'closed': '已结单', 'rejected': '已驳回' }
  return map[status] || status
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.page-content { padding: 20px; max-width: 800px; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
.ticket-list { display: flex; flex-direction: column; gap: 15px; }
.ticket-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
.card-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px; }
.status-tag { background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.card-body p { margin: 5px 0; color: #666; font-size: 14px; }
.time { font-size: 12px; color: #999; }
.card-footer { margin-top: 10px; text-align: right; }
.btn-primary { padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-delete { padding: 5px 10px; background: white; border: 1px solid #ff4d4f; color: #ff4d4f; border-radius: 4px; cursor: pointer; }
.btn-delete:hover { background: #fff1f0; }
</style>