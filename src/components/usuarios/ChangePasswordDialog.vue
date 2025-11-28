<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="change-password-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <q-icon name="lock_reset" size="36px" color="primary" />
          <h3 class="dialog-title">Cambiar Contraseña</h3>
        </div>
        <p class="dialog-subtitle">
          Para cambiar tu contraseña, completa los siguientes campos. Deja los campos vacíos si no
          deseas cambiar tu contraseña.
        </p>
      </q-card-section>

      <q-separator />

      <!-- Contenido -->
      <q-card-section class="dialog-body">
        <div class="form-section">
          <!-- Contraseña Actual -->
          <q-input
            v-model="form.currentPassword"
            outlined
            :type="showCurrent ? 'text' : 'password'"
            label="Contraseña Actual"
            placeholder="Ingresa tu contraseña actual"
            class="password-input"
            :error="!!errors.currentPassword"
            :error-message="errors.currentPassword"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showCurrent ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showCurrent = !showCurrent"
              />
            </template>
          </q-input>

          <!-- Nueva Contraseña -->
          <q-input
            v-model="form.newPassword"
            outlined
            :type="showNew ? 'text' : 'password'"
            label="Nueva Contraseña"
            placeholder="Ingresa tu nueva contraseña"
            class="password-input"
            :error="!!errors.newPassword"
            :error-message="errors.newPassword"
            @update:model-value="validatePassword"
          >
            <template #prepend>
              <q-icon name="lock_open" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showNew ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showNew = !showNew"
              />
            </template>
          </q-input>

          <!-- Confirmar Nueva Contraseña -->
          <q-input
            v-model="form.confirmPassword"
            outlined
            :type="showConfirm ? 'text' : 'password'"
            label="Confirmar Nueva Contraseña"
            placeholder="Confirma tu nueva contraseña"
            class="password-input"
            :error="!!errors.confirmPassword"
            :error-message="errors.confirmPassword"
            @update:model-value="validateConfirm"
          >
            <template #prepend>
              <q-icon name="lock_open" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showConfirm = !showConfirm"
              />
            </template>
          </q-input>
        </div>

        <!-- Requisitos de Contraseña -->
        <div class="requirements-section">
          <div class="requirements-header">
            <q-icon name="info" size="20px" color="primary" />
            <span class="requirements-title">Requisitos de Contraseña</span>
          </div>

          <div class="requirements-list">
            <div class="requirement-item" :class="{ valid: validations.minLength }">
              <q-icon
                :name="validations.minLength ? 'check_circle' : 'radio_button_unchecked'"
                size="18px"
              />
              <span>Mínimo 8 caracteres</span>
            </div>

            <div class="requirement-item" :class="{ valid: validations.hasUppercase }">
              <q-icon
                :name="validations.hasUppercase ? 'check_circle' : 'radio_button_unchecked'"
                size="18px"
              />
              <span>Al menos una letra mayúscula</span>
            </div>

            <div class="requirement-item" :class="{ valid: validations.hasLowercase }">
              <q-icon
                :name="validations.hasLowercase ? 'check_circle' : 'radio_button_unchecked'"
                size="18px"
              />
              <span>Al menos una letra minúscula</span>
            </div>

            <div class="requirement-item" :class="{ valid: validations.hasNumber }">
              <q-icon
                :name="validations.hasNumber ? 'check_circle' : 'radio_button_unchecked'"
                size="18px"
              />
              <span>Al menos un número</span>
            </div>

            <div class="requirement-item" :class="{ valid: validations.hasSpecialChar }">
              <q-icon
                :name="validations.hasSpecialChar ? 'check_circle' : 'radio_button_unchecked'"
                size="18px"
              />
              <span>Un carácter especial (!@#$%^&*)</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions class="dialog-actions">
        <q-btn flat no-caps label="Cancelar" color="grey-7" class="cancel-btn" @click="cancelar" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="save-btn"
          :loading="loading"
          :disable="!isFormValid"
          @click="guardar"
        >
          <q-icon name="lock" size="18px" class="btn-icon" />
          Guardar Cambios
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const showDialog = ref(props.modelValue)
const loading = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const validations = reactive({
  minLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasNumber: false,
  hasSpecialChar: false,
})

watch(
  () => props.modelValue,
  (val) => {
    showDialog.value = val
    if (val) {
      resetForm()
    }
  },
)

watch(showDialog, (val) => {
  emit('update:modelValue', val)
})

const validatePassword = () => {
  const pwd = form.newPassword
  validations.minLength = pwd.length >= 8
  validations.hasUppercase = /[A-Z]/.test(pwd)
  validations.hasLowercase = /[a-z]/.test(pwd)
  validations.hasNumber = /\d/.test(pwd)
  validations.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

  errors.newPassword = ''
}

const validateConfirm = () => {
  if (form.confirmPassword && form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  } else {
    errors.confirmPassword = ''
  }
}

const isFormValid = computed(() => {
  return (
    form.currentPassword &&
    form.newPassword &&
    form.confirmPassword &&
    form.newPassword === form.confirmPassword &&
    validations.minLength &&
    validations.hasUppercase &&
    validations.hasLowercase &&
    validations.hasNumber &&
    validations.hasSpecialChar
  )
})

const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  showCurrent.value = false
  showNew.value = false
  showConfirm.value = false

  Object.keys(validations).forEach((key) => {
    validations[key] = false
  })
}

const cancelar = () => {
  showDialog.value = false
  resetForm()
}

const guardar = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    await emit('save', {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    showDialog.value = false
    resetForm()
  } catch (error) {
    errors.currentPassword = 'Contraseña actual incorrecta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-dialog {
  min-width: 700px;
  max-width: 800px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 28px 28px 20px 28px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.dialog-title {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dialog-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0 0 0;
  line-height: 1.5;
}

.dialog-body {
  padding: 24px 28px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.password-input :deep(.q-field__control) {
  border-radius: 10px;
}

.password-input :deep(input) {
  font-size: 15px;
}

/* Requisitos */
.requirements-section {
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
}

.requirements-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.requirements-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e40af;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.requirement-item.valid {
  color: #16a34a;
  font-weight: 600;
}

.requirement-item .q-icon {
  color: #9ca3af;
}

.requirement-item.valid .q-icon {
  color: #16a34a;
}

/* Acciones */
.dialog-actions {
  padding: 16px 28px 28px 28px;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.save-btn {
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.save-btn:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-icon {
  margin-right: 8px;
}

@media (max-width: 900px) {
  .change-password-dialog {
    min-width: 90vw;
    max-width: 95vw;
  }

  .dialog-body {
    grid-template-columns: 1fr;
  }

  .requirements-section {
    order: -1;
  }
}

@media (max-width: 600px) {
  .dialog-header {
    padding: 20px;
  }

  .dialog-body {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 20px 20px;
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
