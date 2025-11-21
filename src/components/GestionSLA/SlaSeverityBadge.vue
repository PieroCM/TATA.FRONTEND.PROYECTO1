<!--
  Badge de severidad: muestra un chip con color según severidad (Alta, Media, Baja).
-->
<template>
  <span class="sla-severity-badge" :class="severityClass">
    {{ severity }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  severity: {
    type: String,
    required: true,
    validator: (value) => ['Alta', 'Media', 'Baja'].includes(value)
  }
})

const severityClass = computed(() => {
  return `sla-severity-badge--${props.severity.toLowerCase()}`
})
</script>

<style scoped>
.sla-severity-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.sla-severity-badge--alta {
  background-color: #ffebee;
  color: #c62828;
}

.sla-severity-badge--media {
  background-color: #fff3e0;
  color: #ef6c00;
}

.sla-severity-badge--baja {
  background-color: #e8f5e9;
  color: #2e7d32;
}
</style>
