<template>
  <div class="activacion-container">
    <q-card class="activacion-card">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <q-icon name="verified_user" size="48px" color="primary" />
          <h3 class="dialog-title">Activar Cuenta</h3>
        </div>
        <p class="dialog-subtitle">
          Bienvenido al sistema. Para completar la activación de tu cuenta, establece tu contraseña
          segura.
        </p>
      </q-card-section>

      <q-separator />

      <!-- Contenido -->
      <q-card-section class="dialog-body">
        <!-- Validación del Token -->
        <div v-if="validandoToken" class="loading-section">
          <q-spinner-dots color="primary" size="50px" />
          <p class="loading-text">Validando enlace de activación...</p>
        </div>

        <!-- Token Inválido o Expirado -->
        <div v-else-if="tokenInvalido" class="error-section">
          <q-icon name="error_outline" size="80px" color="negative" />
          <h4 class="error-title">Enlace Inválido o Expirado</h4>
          <p class="error-text">
            El enlace de activación no es válido o ha expirado (24 horas). Por favor, contacta al
            administrador para que genere un nuevo enlace de activación.
          </p>
          <q-btn
            unelevated
            color="primary"
            label="Ir al Login"
            icon="login"
            @click="irAlLogin"
            class="q-mt-md"
          />
        </div>

        <!-- Formulario de Activación -->
        <template v-else>
          <div class="form-section">
            <!-- Email de Usuario (Solo informativo) -->
            <q-banner class="bg-blue-1 q-mb-md" rounded dense>
              <template #avatar>
                <q-icon name="email" color="primary" />
              </template>
              <strong>Cuenta:</strong> {{ email }}
            </q-banner>

            <!-- Nueva Contraseña -->
            <q-input
              v-model="form.newPassword"
              outlined
              :type="showNew ? 'text' : 'password'"
              label="Nueva Contraseña *"
              placeholder="Ingresa tu contraseña"
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
              label="Confirmar Contraseña *"
              placeholder="Confirma tu contraseña"
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
        </template>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions v-if="!tokenInvalido && !validandoToken" class="dialog-actions">
        <q-btn flat no-caps label="Cancelar" color="grey-7" class="cancel-btn" @click="cancelar" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="save-btn"
          :loading="loading"
          :disable="!isFormValid"
          @click="activarCuenta"
        >
          <q-icon name="verified_user" size="18px" class="btn-icon" />
          Activar Cuenta
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/authService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Extraer parámetros de la URL
const email = ref(route.query.email || '')
const token = ref(route.query.token || '')

const loading = ref(false)
const validandoToken = ref(true)
const tokenInvalido = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  newPassword: '',
  confirmPassword: '',
})

const showNew = ref(false)
const showConfirm = ref(false)

const validations = reactive({
  minLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasNumber: false,
  hasSpecialChar: false,
})

// Validar que existan los parámetros necesarios
onMounted(() => {
  setTimeout(() => {
    if (!email.value || !token.value) {
      tokenInvalido.value = true
      validandoToken.value = false
      $q.notify({
        type: 'negative',
        message: 'Enlace de activación incompleto',
        caption: 'Faltan parámetros en la URL',
        icon: 'error',
        position: 'top',
      })
    } else {
      validandoToken.value = false
    }
  }, 1000) // Simular validación
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

const activarCuenta = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    const payload = {
      email: email.value,
      token: token.value,
      nuevaPassword: form.newPassword,
    }

    await authService.activarCuenta(payload)

    $q.notify({
      type: 'positive',
      message: '¡Cuenta activada exitosamente!',
      caption: 'Ya puedes iniciar sesión con tu usuario y contraseña',
      icon: 'check_circle',
      position: 'top',
      timeout: 4000,
    })

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Error al activar cuenta:', error)

    $q.notify({
      type: 'negative',
      message: 'Error al activar cuenta',
      caption: error.message || 'El token es inválido, ha expirado o la cuenta ya está activada',
      icon: 'error',
      position: 'top',
      timeout: 5000,
    })

    // Si el error es de token inválido, mostrar la sección de error
    if (
      error.message?.toLowerCase().includes('token') ||
      error.message?.toLowerCase().includes('expirado')
    ) {
      tokenInvalido.value = true
    }
  } finally {
    loading.value = false
  }
}

const cancelar = () => {
  router.push('/login')
}

const irAlLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.activacion-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.activacion-card {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}

.dialog-header {
  padding: 32px 32px 24px 32px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dialog-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 8px 0 0 0;
  line-height: 1.6;
}

.dialog-body {
  padding: 32px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
}

/* Loading Section */
.loading-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

/* Error Section */
.error-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #dc2626;
  margin: 16px 0 8px 0;
}

.error-text {
  font-size: 15px;
  color: #6b7280;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 24px;
}

.requirements-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.requirements-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  padding: 20px 32px 32px 32px;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.cancel-btn {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  padding: 12px 32px;
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
  .dialog-body {
    grid-template-columns: 1fr;
  }

  .requirements-section {
    order: -1;
  }
}

@media (max-width: 600px) {
  .activacion-container {
    padding: 10px;
  }

  .dialog-header {
    padding: 24px 20px 20px 20px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .dialog-title {
    font-size: 26px;
  }

  .dialog-body {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 24px 20px;
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
