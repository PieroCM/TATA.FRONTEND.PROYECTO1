<template>
  <div class="info-card">
    <!-- Header de la tarjeta -->
    <div class="card-header">
      <q-icon name="shield" size="24px" color="primary" class="header-icon" />
      <h3 class="card-title">Información de Acceso</h3>
    </div>

    <q-separator class="card-separator" />

    <!-- Contenido -->
    <div class="card-content">
      <!-- Correo Corporativo -->
      <div class="info-field">
        <label class="field-label">Correo corporativo</label>

        <!-- Modo normal -->
        <div v-if="!editMode" class="field-value">
          <q-icon name="email" size="18px" color="grey-6" />
          {{ correoCorporativo }}
        </div>

        <!-- Modo edición -->
        <q-input
          v-else
          v-model="emailEditado"
          outlined
          dense
          type="email"
          placeholder="usuario@empresa.com"
          class="email-input-edit"
        >
          <template #prepend>
            <q-icon name="email" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Rol del Sistema -->
      <div class="info-field">
        <label class="field-label">Rol del Sistema</label>
        <div class="field-value">
          <q-icon name="admin_panel_settings" size="18px" color="primary" />
          {{ rolNombre }}
        </div>
      </div>

      <!-- Estado de Cuenta -->
      <div class="info-field">
        <label class="field-label">Estado de Cuenta</label>
        <div class="field-value">
          <div class="status-indicator" :class="estadoClass">
            <div class="status-dot"></div>
            <span class="status-text">{{ estadoTexto }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:email'])

const emailEditado = ref('')

const correoCorporativo = computed(() => {
  return props.usuario.personal?.correo_corporativo || props.usuario.correo || ''
})

const rolNombre = computed(() => {
  // console.log('🔍 AccessInfoCard - usuario.rol:', props.usuario.rol)
  // console.log('🔍 AccessInfoCard - rol.nombre:', props.usuario.rol?.nombre)
  return props.usuario.rol?.nombre || 'Sin rol asignado'
})

const estadoTexto = computed(() => {
  return props.usuario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'
})

const estadoClass = computed(() => {
  return props.usuario.estado === 'ACTIVO' ? 'status-active' : 'status-inactive'
})

// Sincronizar email editado con el valor original
watch(
  () => props.editMode,
  (newVal) => {
    if (newVal) {
      emailEditado.value = correoCorporativo.value
    }
  },
  { immediate: true },
)

watch(emailEditado, (newVal) => {
  emit('update:email', newVal)
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

/* Input de edición de email */
.email-input-edit {
  margin-top: 4px;
}

.email-input-edit :deep(.q-field__control) {
  border-radius: 10px;
  border: 2px solid #3b82f6 !important;
  background: white;
  padding: 10px 16px;
  min-height: 60px;
  box-shadow: none !important;
}

.email-input-edit :deep(.q-field__control::before),
.email-input-edit :deep(.q-field__control::after) {
  border: none !important;
}

.email-input-edit :deep(.q-field__prepend) {
  padding-right: 8px;
}

.email-input-edit :deep(.q-field__native) {
  padding: 0;
  min-height: 30px;
  display: flex;
  align-items: center;
}

.email-input-edit :deep(.q-field__control):hover {
  border-color: #2563eb !important;
}

.email-input-edit :deep(.q-field__control):focus-within {
  border-color: #1d4ed8 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.email-input-edit :deep(input) {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

.email-input-edit :deep(input::placeholder) {
  color: #9ca3af;
}

/* Estado */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.status-active {
  background: #f0fdf4;
  color: #16a34a;
}

.status-inactive {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active .status-dot {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}

.status-inactive .status-dot {
  background: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.status-text {
  font-weight: 600;
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
