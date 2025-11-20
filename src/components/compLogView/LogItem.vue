<template>
  <div class="log-item">
    <!-- ICONO -->
    <q-icon :name="iconName" :style="{ color: iconColor }" class="log-icon" />

    <div class="log-content">
      <!-- PRIMERA FILA -->
      <div class="header-row">
        <q-badge :style="badgeStyle" class="badge">
          {{ levelLabel }}
        </q-badge>

        <span class="date">{{ formattedDate }}</span>

        <span v-if="log.servicio" class="service"> • {{ log.servicio }} </span>
      </div>

      <!-- MENSAJE PRINCIPAL -->
      <div class="message">{{ log.mensaje }}</div>

      <!-- DETALLES -->
      <div v-if="log.detalles" class="details">
        {{ log.detalles }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  log: { type: Object, required: true },
})

// 🎨 COLORES EXACTOS SEGÚN FIGMA
const LEVELS = {
  INFO: {
    text: 'Info',
    color: '#2F80ED',
    bg: '#EAF3FF',
    icon: 'info',
  },
  SUCCESS: {
    text: 'Success',
    color: '#27AE60',
    bg: '#E8F7EE',
    icon: 'check_circle',
  },
  WARN: {
    text: 'Warning',
    color: '#F2C94C',
    bg: '#FFF7D1',
    icon: 'warning',
  },
  ERROR: {
    text: 'Error',
    color: '#E74C3C',
    bg: '#FFE7E7',
    icon: 'cancel',
  },
}

const level = computed(() => LEVELS[props.log.nivel] ?? LEVELS.INFO)

const iconName = computed(() => level.value.icon)
const iconColor = computed(() => level.value.color)
const levelLabel = computed(() => level.value.text)

const badgeStyle = computed(() => ({
  backgroundColor: level.value.bg,
  color: level.value.color,
  fontWeight: '500',
}))

const formattedDate = computed(() => props.log.fechaHora.replace('T', ' ').slice(0, 16))
</script>

<style scoped>
.log-item {
  display: flex;
  gap: 12px;
  padding: 18px 8px;
  border-bottom: 1px solid #eeeeee;
}

.log-icon {
  font-size: 22px;
  margin-top: 4px;
}

.log-content {
  flex: 1;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
}

.date {
  color: #6b7280;
  font-size: 13px;
}

.service {
  color: #2f80ed;
  font-size: 14px;
}

.message {
  font-size: 15px;
  margin-top: 6px;
}

.details {
  font-size: 13px;
  color: #555;
  margin-top: 2px;
}
</style>
