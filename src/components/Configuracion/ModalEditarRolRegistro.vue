<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleClose">
    <q-card class="modal-card">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <h3 class="modal-title">
            {{ isCreate ? 'Crear Rol de Registro' : 'Editar Rol de Registro' }}
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="handleClose"
          />
        </div>
      </q-card-section>

      <!-- Body -->
      <q-card-section class="modal-body">
        <form @submit.prevent="handleSubmit" class="form-grid">
          <!-- Nombre Rol -->
          <div class="form-group span-full">
            <label class="form-label">
              Nombre del Rol <span class="required">*</span>
            </label>
            <q-input
              v-model="formData.nombreRol"
              outlined
              dense
              placeholder="Ej: Desarrollador Full Stack"
              class="form-input"
              :error="!!errors.nombreRol"
              :error-message="errors.nombreRol"
              @blur="validateField('nombreRol')"
            />
          </div>

          <!-- Bloque Tech -->
          <div class="form-group span-full">
            <label class="form-label">
              Bloque Tecnológico <span class="required">*</span>
            </label>
            <q-select
              v-model="formData.bloqueTech"
              outlined
              dense
              :options="bloquesOptions"
              placeholder="Selecciona un bloque tecnológico"
              class="form-input"
              :error="!!errors.bloqueTech"
              :error-message="errors.bloqueTech"
              @blur="validateField('bloqueTech')"
            >
              <template v-slot:selected-item="scope">
                <span 
                  class="badge-bloque-selected" 
                  :class="getBloqueBadgeClass(scope.opt)"
                >
                  {{ scope.opt }}
                </span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <span 
                      class="badge-bloque-option" 
                      :class="getBloqueBadgeClass(scope.opt)"
                    >
                      {{ scope.opt }}
                    </span>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Descripción -->
          <div class="form-group span-full">
            <label class="form-label">
              Descripción
            </label>
            <q-input
              v-model="formData.descripcion"
              outlined
              dense
              type="textarea"
              rows="3"
              placeholder="Descripción detallada del rol de registro..."
              class="form-input"
              maxlength="500"
            />
            <p class="helper-text">{{ formData.descripcion?.length || 0 }}/500 caracteres</p>
          </div>

          <!-- Estado Activo -->
          <div class="form-group span-full">
            <div class="toggle-container">
              <div class="toggle-info">
                <label class="form-label">Estado Activo</label>
                <p class="toggle-description">
                  Indica si este rol de registro está activo y disponible
                </p>
              </div>
              <q-toggle
                v-model="formData.esActivo"
                color="primary"
                size="lg"
              />
            </div>
          </div>
        </form>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="modal-footer">
        <q-btn
          flat
          label="Cancelar"
          class="btn-cancel"
          @click="handleClose"
        />
        <q-btn
          unelevated
          label="Guardar"
          class="btn-save"
          :loading="saving"
          :disable="!isFormValid"
          @click="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  rol: {
    type: Object,
    default: null
  },
  isCreate: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'close'])

// Constantes
const bloquesOptions = ['Infrastructure', 'Development', 'Security', 'Data', 'Support']

// Estado
const formData = ref({
  idRolRegistro: null,
  nombreRol: '',
  bloqueTech: '',
  descripcion: '',
  esActivo: true
})

const errors = ref({
  nombreRol: '',
  bloqueTech: ''
})

const saving = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.nombreRol?.trim() &&
    formData.value.bloqueTech &&
    !errors.value.nombreRol &&
    !errors.value.bloqueTech
  )
})

// Methods
const getBloqueBadgeClass = (bloque) => {
  const bloqueMap = {
    'Infrastructure': 'badge-infrastructure',
    'Development': 'badge-development',
    'Security': 'badge-security',
    'Data': 'badge-data',
    'Support': 'badge-support'
  }
  return bloqueMap[bloque] || 'badge-default'
}

const resetForm = () => {
  formData.value = {
    idRolRegistro: null,
    nombreRol: '',
    bloqueTech: '',
    descripcion: '',
    esActivo: true
  }
  errors.value = { nombreRol: '', bloqueTech: '' }
}

const validateField = (field) => {
  errors.value[field] = ''

  if (field === 'nombreRol') {
    const nombre = formData.value.nombreRol?.trim()
    if (!nombre) {
      errors.value.nombreRol = 'El nombre del rol es requerido'
    } else if (nombre.length < 3) {
      errors.value.nombreRol = 'El nombre debe tener al menos 3 caracteres'
    } else if (nombre.length > 150) {
      errors.value.nombreRol = 'El nombre no puede exceder 150 caracteres'
    }
  }

  if (field === 'bloqueTech') {
    if (!formData.value.bloqueTech) {
      errors.value.bloqueTech = 'El bloque tecnológico es requerido'
    }
  }
}

const validateForm = () => {
  validateField('nombreRol')
  validateField('bloqueTech')
  return !errors.value.nombreRol && !errors.value.bloqueTech
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('save', { ...formData.value })
  } catch (error) {
    console.error('Error al guardar:', error)
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Watchers (después de declarar todas las funciones)
watch(() => props.rol, (newRol) => {
  if (newRol) {
    formData.value = {
      idRolRegistro: newRol.idRolRegistro || null,
      nombreRol: newRol.nombreRol || '',
      bloqueTech: newRol.bloqueTech || '',
      descripcion: newRol.descripcion || '',
      esActivo: newRol.esActivo ?? true
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    errors.value = { nombreRol: '', bloqueTech: '' }
  }
})
</script>

<style scoped lang="scss">
.modal-card {
  width: 760px;
  max-width: 90vw;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* ========== HEADER ========== */
.modal-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid #F1F5F9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.close-btn {
  width: 40px;
  height: 40px;
  color: #6B7280;
  border-radius: 50%;

  &:hover {
    background-color: #F9FAFB;
    color: #111827;
  }
}

/* ========== BODY ========== */
.modal-body {
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.span-full {
    grid-column: 1 / -1;
  }
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
}

.required {
  color: #DC2626;
  font-weight: 700;
}

.form-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #FFFFFF;
    height: 48px;
    border: 1.5px solid #E5E7EB;
    padding: 0 16px;

    &:hover {
      border-color: #CBD5E1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
    padding-top: 0;
  }

  :deep(textarea.q-field__native) {
    padding-top: 12px;
    resize: vertical;
    line-height: 1.5;
  }

  :deep(input::placeholder),
  :deep(textarea::placeholder) {
    color: #9CA3AF;
  }

  &:deep(.q-field--error) {
    .q-field__control {
      border-color: #DC2626;
    }
  }

  :deep(.q-field__bottom) {
    padding-top: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
  }
}

.helper-text {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #9CA3AF;
  line-height: 1.4;
}

/* ========== BADGES EN SELECT ========== */
.badge-bloque-selected,
.badge-bloque-option {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  border: 1px solid transparent;
}

.badge-infrastructure {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  color: #1E40AF;
  border-color: #BFDBFE;
}

.badge-development {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  color: #15803D;
  border-color: #BBF7D0;
}

.badge-security {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  color: #991B1B;
  border-color: #FECACA;
}

.badge-data {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  border-color: #FCD34D;
}

.badge-support {
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  color: #5B21B6;
  border-color: #DDD6FE;
}

.badge-default {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  color: #374151;
  border-color: #E5E7EB;
}

/* ========== TOGGLE ========== */
.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.toggle-info {
  flex: 1;
}

.toggle-description {
  margin: 4px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
}

:deep(.q-toggle) {
  .q-toggle__inner {
    width: 52px;
    height: 28px;
  }

  .q-toggle__thumb {
    width: 22px;
    height: 22px;
  }

  .q-toggle__track {
    opacity: 1;
  }
}

/* ========== FOOTER ========== */
.modal-footer {
  padding: 24px 32px 32px 32px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  text-transform: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: #F3F4F6;
    color: #374151;
  }
}

.btn-save {
  height: 44px;
  padding: 0 32px;
  background: #2563EB;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  text-transform: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1E40AF;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    background: #9CA3AF;
    box-shadow: none;
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 767px) {
  .modal-card {
    width: 95vw;
    border-radius: 16px;
  }

  .modal-header {
    padding: 24px 20px 20px 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-body {
    padding: 24px 20px;
    max-height: 50vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-footer {
    padding: 20px;
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
    justify-content: center;
  }
}
</style>
