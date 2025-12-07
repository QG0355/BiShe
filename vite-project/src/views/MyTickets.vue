<template>
  <div class="page-content">
    <div class="header-row">
      <h2><i class="fas fa-ticket-alt"></i> 我的报修记录</h2>
      <button v-if="auth.currentUser?.role === 'student'" 
              @click="$router.push('/submit')" 
              class="btn-primary">
        <i class="fas fa-plus"></i> 新建报修
      </button>
    </div>

    <div class="search-box">
      <input 
        v-model="searchText" 
        type="text" 
        placeholder="🔍 搜索标题、位置或单号..." 
        @keyup.enter="doSearch"
      >
      <button @click="doSearch" class="btn-search">搜索</button>
    </div>
    <div v-if="ticketStore.tickets.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-inbox"></i></div>
      <p>暂无相关记录</p>
    </div>

    <div v-else class="ticket-grid">
      <div v-for="ticket in ticketStore.tickets" :key="ticket.id" class="ticket-card">
        
        <div class="card-header">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <span :class="['status-badge', getStatusClass(ticket.status)]">
            {{ getStatusName(ticket.status) }}
          </span>
        </div>

        <h3 class="ticket-title">{{ ticket.title }}</h3>
        
        <div class="card-info">
          <p><i class="fas fa-map-marker-alt"></i> {{ ticket.location }}</p>
          <p><i class="fas fa-clock"></i> {{ formatDate(ticket.submitTime) }}</p>
        </div>

        <div class="card-actions" v-if="ticket.status === 'pending_dispatch' && auth.currentUser?.role === 'student'">
          <button @click="deleteTicket(ticket.id)" class="btn-text-danger">撤销工单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue' // 1. 引入 ref
import { useTicketStore } from '@/stores/ticketStore'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const ticketStore = useTicketStore()
const auth = useAuthStore()

// 2. 定义搜索变量
const searchText = ref('')

// 3. 定义搜索函数
function doSearch() {
  ticketStore.fetchTickets(searchText.value)
}

onMounted(() => {
  if (auth.isLoggedIn) {
    ticketStore.fetchTickets() // 默认加载全部
  }
})

// 撤销功能
async function deleteTicket(id) {
  if(!confirm("确定要撤销此报修单吗？")) return;
  try {
    await axios.delete(`http://127.0.0.1:8000/api/tickets/${id}/`, {
      headers: { Authorization: `Token ${auth.token}` }
    })
    alert("已撤销")
    // 撤销后重新刷新列表，保留当前的搜索条件
    ticketStore.fetchTickets(searchText.value)
  } catch (e) {
    alert("撤销失败")
  }
}

// 状态样式映射
function getStatusClass(status) {
  const map = {
    'pending_dispatch': 'pending',
    'repairing': 'processing',
    'finished': 'completed',
    'closed': 'closed',
    'rejected': 'closed'
  }
  return map[status] || ''
}

// 状态文字映射
function getStatusName(status) {
    const map = {
        'pending_dispatch': '正在处理',
        'repairing': '维修中',
        'finished': '已完成', 
        'closed': '已结单',
        'rejected': '已驳回'
    }
    return map[status] || status
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.page-content { 
  max-width: 1000px; 
  margin: 0 auto; 
  padding: 30px 20px; 
}

.header-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px; 
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 15px;
}

/* 👇👇👇 新增的搜索框样式 👇👇👇 */
.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-box input {
  flex: 1; 
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.btn-search {
  padding: 0 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.btn-search:hover {
  background: #5a6fd6;
}
/* 👆👆👆 新增样式结束 👆👆👆 */

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.ticket-card { 
  background: white; 
  border-radius: 12px; 
  padding: 20px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.04); 
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.ticket-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #888;}

.status-badge { 
  padding: 4px 10px; 
  border-radius: 6px; 
  font-size: 12px; 
  font-weight: 600; 
}
.status-badge.pending { background: #fff7e6; color: #fa8c16; }
.status-badge.processing { background: #e6f7ff; color: #1890ff; }
.status-badge.completed { background: #f6ffed; color: #52c41a; }
.status-badge.closed { background: #f5f5f5; color: #d9d9d9; }

.ticket-title { margin: 0 0 15px 0; font-size: 16px; color: #333; line-height: 1.4; }

.card-info p { margin: 5px 0; color: #666; font-size: 13px; display: flex; align-items: center; gap: 8px;}

.card-actions { margin-top: auto; padding-top: 15px; text-align: right; }

.btn-primary { padding: 8px 20px; background: #1890ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;}
.btn-text-danger { background: none; border: none; color: #ff4d4f; cursor: pointer; font-size: 13px; }
.btn-text-danger:hover { text-decoration: underline; }

.empty-state { text-align: center; padding: 60px; color: #bbb; }
.empty-icon { font-size: 48px; margin-bottom: 10px; opacity: 0.5; }
</style>