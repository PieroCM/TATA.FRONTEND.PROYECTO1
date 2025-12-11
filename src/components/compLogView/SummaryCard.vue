<template>
  <div :class="['summary-card', type]">
    <div class="summary-content">
      <!-- Icono -->
      <q-icon :name="icon" :class="['summary-icon', type]" size="32px" />

      <!-- Texto -->
      <div class="summary-text">
        <div class="label">{{ label }}</div>
        <div class="count">{{ count }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { QIcon } from 'quasar'
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true, // 'info' | 'success' | 'warning' | 'error'
  },
  count: {
    type: Number,
    default: 0,
  },
})

/* Mapeo para cada tipo */
const config = {
  info: {
    label: 'Info',
    icon: 'info',
  },
  success: {
    label: 'Success',
    icon: 'check_circle',
  },
  warning: {
    label: 'Warning',
    icon: 'warning',
  },
  error: {
    label: 'Error',
    icon: 'cancel',
  },
}

const current = computed(() => config[props.type] || config.info)
const label = computed(() => current.value.label)
const icon = computed(() => current.value.icon)
</script>

<style scoped>
.summary-card {
  min-width: 260px;
  min-height: 120px;
  border-radius: 14px;
  background: #f9fbff;
  display: flex;
  align-items: center;
  padding: 24px 30px;
  box-sizing: border-box;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
  cursor: pointer;
}

/* ------ HOVER PERSONALIZADO POR TIPO ------ */

/* INFO */
.summary-card.info:hover {
  background: rgba(47, 128, 237, 0.15); /* azul suave */
  box-shadow: 0 0 8px rgba(47, 128, 237, 0.35);
}

/* SUCCESS */
.summary-card.success:hover {
  background: rgba(39, 174, 96, 0.15); /* verde suave */
  box-shadow: 0 0 8px rgba(39, 174, 96, 0.35);
}

/* WARNING */
.summary-card.warning:hover {
  background: rgba(242, 201, 76, 0.25); /* amarillo suave */
  box-shadow: 0 0 8px rgba(242, 201, 76, 0.35);
}

/* ERROR */
.summary-card.error:hover {
  background: rgba(235, 87, 87, 0.15); /* rojo suave */
  box-shadow: 0 0 8px rgba(235, 87, 87, 0.35);
}

/* ------- CONTENIDO INTERNO -------- */

.summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Iconos por tipo */
.summary-icon.info {
  color: #2f80ed;
}

.summary-icon.success {
  color: #27ae60;
}

.summary-icon.warning {
  color: #f2c94c;
}

.summary-icon.error {
  color: #eb5757;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 18px;
  color: #374151;
  font-weight: 600;
  margin-bottom: 4px;
}

.count {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}
</style>
