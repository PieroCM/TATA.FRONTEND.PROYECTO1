<!--
  Badge de estado: muestra un chip con color según estado (Cumplido, Incumplido, Preventivo).
-->
<template>
  <span class="sla-status-badge" :class="statusClass">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['Cumplido', 'Incumplido', 'Preventivo'].includes(value)
  }
})

const statusClass = computed(() => {
  const statusMap = {
    'Cumplido': 'cumplido',
    'Incumplido': 'incumplido',
    'Preventivo': 'preventivo'
  }
  return `sla-status-badge--${statusMap[props.status]}`
})
</script>

<style scoped>
.sla-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.sla-status-badge--cumplido {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.sla-status-badge--incumplido {
  background-color: #ffebee;
  color: #c62828;
}

.sla-status-badge--preventivo {
  background-color: #e3f2fd;
  color: #1565c0;
}
</style>
