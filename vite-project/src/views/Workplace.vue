<template>
  <div class="page-content">
    <h2>工作台</h2>
    <div v-for="t in tasks" :key="t.id" class="card">
      <h3>{{ t.title }} ({{ t.status }})</h3>
      <p>{{ t.description }}</p>
      
      <div v-if="role === 'admin' && t.status === 'pending_dispatch'">
         <input v-model="workerId" placeholder="维修工ID (看数据库)">
         <button @click="handle(t.id, 'assign')">派单</button>
      </div>

      <div v-if="role === 'maintenance' && t.status === 'repairing'">
         <button @click="handle(t.id, 'finish')">维修完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const tasks = ref([])
const workerId = ref('')
const role = computed(() => auth.currentUser?.role)

onMounted(async () => {
  const res = await axios.get('http://127.0.0.1:8000/api/tickets/', {
     headers: { Authorization: `Token ${auth.token}` }
  })
  tasks.value = res.data
})

async function handle(id, type) {
  await axios.post(`http://127.0.0.1:8000/api/tickets/${id}/handle/`, {
      type, worker_id: workerId.value
  }, { headers: { Authorization: `Token ${auth.token}` } })
  alert("操作成功")
  location.reload()
}
</script>
<style scoped>
.card { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
</style>