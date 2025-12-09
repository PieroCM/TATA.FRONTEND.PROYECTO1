<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleClose">
    <q-card class="modal-card">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <h3 class="modal-title">
            {{ isCreate ? 'Crear Configuración SLA' : 'Editar Configuración SLA' }}
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
          <!-- Código SLA -->
          <div class="form-group">
            <label class="form-label">
              Código SLA <span class="required">*</span>
            </label>
            <q-input
              v-model="formData.codigoSla"
              outlined
              dense
              placeholder="Ej: SLA-001"
              class="form-input"
              :error="!!errors.codigoSla"
              :error-message="errors.codigoSla"
              @blur="validateField('codigoSla')"
              @input="validateField('codigoSla')"
            />
          </div>

          <!-- Días Umbral -->
          <div class="form-group">
            <label class="form-label">
              Días Umbral <span class="required">*</span>
            </label>
            <q-input
              v-model.number="formData.diasUmbral"
              outlined
              dense
              type="number"
              min="1"
              max="365"
              placeholder="Ej: 5"
              class="form-input"
              :error="!!errors.diasUmbral"
              :error-message="errors.diasUmbral"
              @blur="validateField('diasUmbral')"
            />
          </div>

          <!-- Tipo de Solicitud -->
          <div class="form-group span-full">
            <label class="form-label">
              Tipo de Solicitud <span class="required">*</span>
            </label>
            <q-select
              v-model="formData.tipoSolicitud"
              outlined
              dense
              :options="tiposOptions"
              placeholder="Selecciona un tipo"
              class="form-input"
              :error="!!errors.tipoSolicitud"
              :error-message="errors.tipoSolicitud"
              @blur="validateField('tipoSolicitud')"
            >
              <template v-slot:selected-item="scope">
                <span 
                  class="badge-tipo-selected" 
                  :class="getTipoBadgeClass(scope.opt)"
                >
                  {{ scope.opt }}
                </span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <span 
                      class="badge-tipo-option" 
                      :class="getTipoBadgeClass(scope.opt)"
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
              placeholder="Descripción detallada de la configuración..."
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
                  Indica si esta configuración está activa y aplicable
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
  config: {
    type: Object,
    default: null
  },
  isCreate: {
    type: Boolean,
    default: false
  },
  codesInUse: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'close'])

// Constantes
const tiposOptions = ['Crítico', 'Normal', 'Bajo']

// Estado
const formData = ref({
  idSla: null,
  codigoSla: '',
  descripcion: '',
  diasUmbral: null,
  tipoSolicitud: '',
  esActivo: true
})

const errors = ref({
  codigoSla: '',
  diasUmbral: '',
  tipoSolicitud: ''
})

const saving = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.codigoSla?.trim() &&
    formData.value.diasUmbral > 0 &&
    formData.value.tipoSolicitud &&
    !errors.value.codigoSla &&
    !errors.value.diasUmbral &&
    !errors.value.tipoSolicitud
  )
})

// Methods
const getTipoBadgeClass = (tipo) => {
  const tipoMap = {
    'Crítico': 'badge-critico',
    'Normal': 'badge-normal',
    'Bajo': 'badge-bajo'
  }
  return tipoMap[tipo] || 'badge-normal'
}

const resetForm = () => {
  formData.value = {
    idSla: null,
    codigoSla: '',
    descripcion: '',
    diasUmbral: null,
    tipoSolicitud: '',
    esActivo: true
  }
  errors.value = { codigoSla: '', diasUmbral: '', tipoSolicitud: '' }
}

const validateField = (field) => {
  errors.value[field] = ''

  if (field === 'codigoSla') {
    const codigo = formData.value.codigoSla?.trim()
    if (!codigo) {
      errors.value.codigoSla = 'El código SLA es requerido'
    } else if (codigo.length < 3) {
      errors.value.codigoSla = 'El código debe tener al menos 3 caracteres'
    } else if (codigo.length > 50) {
      errors.value.codigoSla = 'El código no puede exceder 50 caracteres'
    } else if (!/^[A-Z0-9_-]+$/i.test(codigo)) {
      errors.value.codigoSla = 'Solo se permiten letras, números, guiones y guiones bajos'
    } else {
      // Validar si el código ya existe
      const isDuplicate = props.codesInUse.some(item => 
        item.codigo.toLowerCase() === codigo.toLowerCase() && 
        item.id !== formData.value.idSla
      )
      if (isDuplicate) {
        errors.value.codigoSla = 'Este código SLA ya está en uso'
      }
    }
  }

  if (field === 'diasUmbral') {
    const dias = formData.value.diasUmbral
    if (!dias || dias === null) {
      errors.value.diasUmbral = 'Los días umbral son requeridos'
    } else if (dias < 1) {
      errors.value.diasUmbral = 'Debe ser al menos 1 día'
    } else if (dias > 365) {
      errors.value.diasUmbral = 'No puede exceder 365 días'
    } else if (!Number.isInteger(dias)) {
      errors.value.diasUmbral = 'Debe ser un número entero'
    }
  }

  if (field === 'tipoSolicitud') {
    if (!formData.value.tipoSolicitud) {
      errors.value.tipoSolicitud = 'El tipo de solicitud es requerido'
    }
  }
}

const validateForm = () => {
  validateField('codigoSla')
  validateField('diasUmbral')
  validateField('tipoSolicitud')
  return !errors.value.codigoSla && !errors.value.diasUmbral && !errors.value.tipoSolicitud
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
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    formData.value = {
      idSla: newConfig.idSla || null,
      codigoSla: newConfig.codigoSla || '',
      descripcion: newConfig.descripcion || '',
      diasUmbral: newConfig.diasUmbral || null,
      tipoSolicitud: newConfig.tipoSolicitud || '',
      esActivo: newConfig.esActivo ?? true
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    errors.value = { codigoSla: '', diasUmbral: '', tipoSolicitud: '' }
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
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    max-width: 100%;
    box-sizing: border-box;
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
.badge-tipo-selected,
.badge-tipo-option {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.badge-critico {
  background-color: #FEE2E2;
  color: #991B1B;
}

.badge-normal {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.badge-bajo {
  background-color: #E0E7FF;
  color: #3730A3;
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
