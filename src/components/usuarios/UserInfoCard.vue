<template>
  <div class="info-card">
    <!-- Header de la tarjeta -->
    <div class="card-header">
      <q-icon name="person" size="24px" color="primary" class="header-icon" />
      <h3 class="card-title">Información Personal</h3>
    </div>

    <q-separator class="card-separator" />

    <!-- Contenido -->
    <div class="card-content">
      <!-- Nombre Completo -->
      <div class="info-field">
        <label class="field-label">Nombre Completo</label>
        <div class="field-value">{{ nombreCompleto }}</div>
      </div>

      <!-- Documento de Identidad -->
      <div class="info-field">
        <label class="field-label">Documento de Identidad</label>
        <div class="field-value">{{ documento }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true,
  },
})

const nombreCompleto = computed(() => {
  if (props.usuario.personal) {
    return `${props.usuario.personal.nombres} ${props.usuario.personal.apellidos}`
  }
  return props.usuario.username || ''
})

const documento = computed(() => {
  return props.usuario.personal?.documento || ''
})
</script>

<style scoped>
.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-icon {
  background: #eff6ff;
  padding: 8px;
  border-radius: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card-separator {
  margin-bottom: 20px;
  background: #f3f4f6;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.department-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .info-card {
    padding: 20px;
  }

  .card-title {
    font-size: 16px;
  }
}
</style>
