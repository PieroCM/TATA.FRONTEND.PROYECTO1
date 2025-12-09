<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleClose">
    <q-card class="modal-card">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <h3 class="modal-title">
            {{ isCreate ? 'Crear Rol de Sistema' : 'Editar Rol de Sistema' }}
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
          <!-- Código -->
          <div class="form-group span-full">
            <label class="form-label">
              Código <span class="required">*</span>
            </label>
            <q-input
              v-model="formData.codigo"
              outlined
              dense
              placeholder="Ej: ADMIN, USER, VIEWER"
              class="form-input"
              :error="!!errors.codigo"
              :error-message="errors.codigo"
              @blur="validateField('codigo')"
            />
          </div>

          <!-- Nombre -->
          <div class="form-group span-full">
            <label class="form-label">
              Nombre <span class="required">*</span>
            </label>
            <q-input
              v-model="formData.nombre"
              outlined
              dense
              placeholder="Ej: Administrador"
              class="form-input"
              :error="!!errors.nombre"
              :error-message="errors.nombre"
              @blur="validateField('nombre')"
            />
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
              placeholder="Descripción detallada del rol..."
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
                  Indica si el rol está activo y disponible en el sistema
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

// Estado
const formData = ref({
  idRolSistema: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  esActivo: true
})

const errors = ref({
  codigo: '',
  nombre: ''
})

const saving = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.codigo?.trim() &&
    formData.value.nombre?.trim() &&
    !errors.value.codigo &&
    !errors.value.nombre
  )
})

// Methods
const resetForm = () => {
  formData.value = {
    idRolSistema: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    esActivo: true
  }
  errors.value = { codigo: '', nombre: '' }
}

const validateField = (field) => {
  errors.value[field] = ''

  if (field === 'codigo') {
    const codigo = formData.value.codigo?.trim()
    if (!codigo) {
      errors.value.codigo = 'El código es requerido'
    } else if (codigo.length < 2) {
      errors.value.codigo = 'El código debe tener al menos 2 caracteres'
    } else if (codigo.length > 50) {
      errors.value.codigo = 'El código no puede exceder 50 caracteres'
    } else if (!/^[A-Z0-9_-]+$/.test(codigo)) {
      errors.value.codigo = 'Solo se permiten letras mayúsculas, números, guiones y guiones bajos'
    }
  }

  if (field === 'nombre') {
    const nombre = formData.value.nombre?.trim()
    if (!nombre) {
      errors.value.nombre = 'El nombre es requerido'
    } else if (nombre.length < 3) {
      errors.value.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (nombre.length > 100) {
      errors.value.nombre = 'El nombre no puede exceder 100 caracteres'
    }
  }
}

const validateForm = () => {
  validateField('codigo')
  validateField('nombre')
  return !errors.value.codigo && !errors.value.nombre
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
      idRolSistema: newRol.idRolSistema || null,
      codigo: newRol.codigo || '',
      nombre: newRol.nombre || '',
      descripcion: newRol.descripcion || '',
      esActivo: newRol.esActivo ?? true
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    errors.value = { codigo: '', nombre: '' }
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
