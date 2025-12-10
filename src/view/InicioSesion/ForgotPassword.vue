<template>
  <div class="row" style="height: 100vh; overflow: hidden">
    <div class="col-7 left-section">
      <q-carousel
        v-model="slide"
        animated
        infinite
        autoplay
        interval="5000"
        arrows
        transition-prev="fade"
        transition-next="fade"
        class="full-height"
      >
        <q-carousel-slide
          v-for="(item, index) in slides"
          :key="index"
          :name="index"
          :img-src="item.img"
        >
          <div class="absolute-full flex flex-center text-white text-center slide-content">
            <div>
              <div class="text-h4 text-bold">{{ item.title }}</div>
              <div class="text-subtitle1">{{ item.subtitle }}</div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <div class="col-5 flex flex-center bg-page">
      <q-card class="login-card shadow-4 q-pa-xl">
        <div class="column items-center">
          <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
            <q-icon name="lock_reset" size="40px" />
          </q-avatar>

          <div class="text-h5 text-primary text-weight-bold q-mb-sm">Recuperar Contraseña</div>

          <div class="text-body2 text-grey-7 q-mb-xl">
            <template v-if="!tokenReceived">
              Ingresa tu correo electrónico para enviarte un código de verificación.
            </template>
            <template v-else>
              {{
                fromUrl
                  ? 'Ingresa tu nueva contraseña para completar el restablecimiento.'
                  : 'Ingresa el código que recibiste y tu nueva contraseña.'
              }}
            </template>
          </div>
        </div>

        <template v-if="!tokenReceived">
          <q-input
            v-model="email"
            label="Correo Electrónico"
            filled
            dense
            type="email"
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-btn
            label="Enviar Código de Recuperación"
            color="primary"
            unelevated
            class="full-width q-mb-md"
            @click="requestPasswordReset"
            :loading="loading"
          />

          <div class="text-center text-caption text-grey-7 q-mt-sm">
            ¿Recordaste tu contraseña?
            <span class="text-primary cursor-pointer" @click="$router.push('/login')">
              Inicia sesión aquí
            </span>
          </div>
        </template>

        <template v-else>
          <!-- Mostrar email y token solo si NO viene de URL -->
          <q-input
            v-if="!fromUrl"
            v-model="token"
            label="Código de Verificación (Token)"
            filled
            dense
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>

          <!-- Mostrar email de manera informativa cuando viene de URL -->
          <q-input
            v-if="fromUrl"
            :model-value="email"
            label="Correo Electrónico"
            filled
            dense
            readonly
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            v-model="newPassword"
            :type="isPwd ? 'password' : 'text'"
            label="Nueva Contraseña"
            filled
            dense
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            :type="isPwd ? 'password' : 'text'"
            label="Confirmar Contraseña"
            filled
            dense
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <!-- Widget de Validación (Siempre Visible) -->
          <div class="validation-widget q-mb-md">
            <div class="widget-title">
              <q-icon name="info" size="18px" color="primary" />
              <span>Requisitos de Contraseña</span>
            </div>
            <div class="validation-list">
              <div class="validation-item" :class="{ valid: validations.minLength }">
                <q-icon :name="validations.minLength ? 'check_circle' : 'cancel'" size="18px" />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div class="validation-item" :class="{ valid: validations.hasUppercase }">
                <q-icon :name="validations.hasUppercase ? 'check_circle' : 'cancel'" size="18px" />
                <span>Mayúscula</span>
              </div>
              <div class="validation-item" :class="{ valid: validations.hasLowercase }">
                <q-icon :name="validations.hasLowercase ? 'check_circle' : 'cancel'" size="18px" />
                <span>Minúscula</span>
              </div>
              <div class="validation-item" :class="{ valid: validations.hasNumber }">
                <q-icon :name="validations.hasNumber ? 'check_circle' : 'cancel'" size="18px" />
                <span>Número</span>
              </div>
              <div class="validation-item" :class="{ valid: validations.hasSymbol }">
                <q-icon :name="validations.hasSymbol ? 'check_circle' : 'cancel'" size="18px" />
                <span>Símbolo</span>
              </div>
              <div class="validation-item" :class="{ valid: validations.passwordsMatch }">
                <q-icon
                  :name="validations.passwordsMatch ? 'check_circle' : 'cancel'"
                  size="18px"
                />
                <span>Coincidencia</span>
              </div>
            </div>
          </div>

          <q-btn
            label="Restablecer Contraseña"
            color="primary"
            unelevated
            class="full-width q-mb-md"
            @click="resetPassword"
            :loading="loading"
            :disable="!allValidationsPassed"
          />

          <!-- Solo mostrar opción de volver si NO viene de URL -->
          <div v-if="!fromUrl" class="text-center text-caption text-grey-7 q-mt-sm">
            <span
              class="text-primary cursor-pointer"
              @click="((tokenReceived = false), (token = ''))"
            >
              Volver a solicitar código
            </span>
          </div>
        </template>

        <div class="text-center text-grey-7 text-caption q-mt-md">
          Credenciales demo:<br />
          usuario@tcs.com / tcs2024
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',

  data() {
    return {
      slide: 0,
      email: '', // Correo para solicitar el token
      token: '', // Token recibido por email
      newPassword: '', // Nueva contraseña
      confirmPassword: '', // Confirmación de nueva contraseña
      isPwd: true, // Para ocultar/mostrar contraseña
      tokenReceived: false, // Controla qué formulario se muestra (Paso 1 o Paso 2)
      loading: false, // Estado de carga para los botones
      fromUrl: false, // Indica si llegó desde el enlace del correo
      validations: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSymbol: false,
        passwordsMatch: false,
      },

      // Datos del slider (pueden ser los mismos que en LoginForm)
      slides: [
        {
          img: 'https://plus.unsplash.com/premium_photo-1661963212517-830bbb7d76fc?auto=format&fit=crop&w=1600&q=80',
          title: 'Tecnología que Impulsa Resultados',
          subtitle: 'Soluciones inteligentes para un mundo conectado.',
        },
        {
          img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
          title: 'Consultoría que Transforma Negocios',
          subtitle: 'Estrategia, análisis y acompañamiento con visión global.',
        },
        {
          img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80',
          title: 'Innovación que Inspira el Futuro',
          subtitle: 'Creando soluciones que marcan la diferencia.',
        },
        {
          img: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?auto=format&fit=crop&w=1600&q=80',
          title: 'Transformación Digital sin Límites',
          subtitle: 'Impulsando organizaciones hacia su máximo potencial.',
        },
      ],
    }
  },

  computed: {
    allValidationsPassed() {
      return (
        this.validations.minLength &&
        this.validations.hasUppercase &&
        this.validations.hasLowercase &&
        this.validations.hasNumber &&
        this.validations.hasSymbol &&
        this.validations.passwordsMatch
      )
    },
  },

  watch: {
    newPassword() {
      this.updateValidations()
    },
    confirmPassword() {
      this.updateValidations()
    },
  },

  mounted() {
    // Capturar parámetros de la URL (email y token)
    const { email, token } = this.$route.query

    if (email && token) {
      // Si vienen email y token en la URL, es porque accedió desde el enlace del correo
      this.email = email
      this.token = token
      this.tokenReceived = true // Mostrar formulario de nueva contraseña
      this.fromUrl = true // Marcar que viene desde URL

      this.$q.notify({
        type: 'info',
        message: 'Por favor, ingresa tu nueva contraseña.',
        position: 'bottom',
        timeout: 3000,
      })
    }
  },

  methods: {
    updateValidations() {
      const pwd = this.newPassword
      this.validations.minLength = pwd.length >= 8
      this.validations.hasUppercase = /[A-Z]/.test(pwd)
      this.validations.hasLowercase = /[a-z]/.test(pwd)
      this.validations.hasNumber = /\d/.test(pwd)
      this.validations.hasSymbol = /[!@#$%^&*(),.?":{}|<>_-]/.test(pwd)
      this.validations.passwordsMatch =
        pwd.length > 0 && this.confirmPassword.length > 0 && pwd === this.confirmPassword
    },

    // Método para el Paso 1: Solicitar el Token
    async requestPasswordReset() {
      if (!this.email) {
        return this.$q.notify({
          type: 'warning',
          message: 'Por favor, ingresa tu correo electrónico.',
          position: 'bottom',
        })
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        return this.$q.notify({
          type: 'warning',
          message: 'Ingresa un correo electrónico válido',
          position: 'bottom',
        })
      }

      this.loading = true
      try {
        const response = await this.$api.post('/api/usuario/solicitar-recuperacion', {
          Email: this.email,
        })

        this.$q.notify({
          type: 'positive',
          message:
            response.data.message ||
            '✅ Correo enviado. Revisa tu bandeja de entrada y haz clic en el enlace de recuperación.',
          position: 'bottom',
          timeout: 5000,
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al solicitar la recuperación.',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },

    // Método para el Paso 2: Restablecer la Contraseña con el Token
    async resetPassword() {
      // Validar que email y token existan (especialmente importante cuando viene de URL)
      if (!this.email || !this.token) {
        return this.$q.notify({
          type: 'negative',
          message: 'El enlace de recuperación es inválido o ha expirado.',
          position: 'bottom',
        })
      }

      if (!this.newPassword || !this.confirmPassword) {
        return this.$q.notify({
          type: 'warning',
          message: 'Por favor, completa todos los campos.',
          position: 'bottom',
        })
      }
      if (this.newPassword !== this.confirmPassword) {
        return this.$q.notify({
          type: 'negative',
          message: 'Las contraseñas no coinciden.',
          position: 'bottom',
        })
      }
      if (this.newPassword.length < 6) {
        return this.$q.notify({
          type: 'warning',
          message: 'La nueva contraseña debe tener al menos 6 caracteres.',
          position: 'bottom',
        })
      }

      this.loading = true
      try {
        const response = await this.$api.post('/api/usuario/restablecer-password', {
          Email: this.email,
          Token: this.token,
          NuevaPassword: this.newPassword,
        })

        this.$q.notify({
          type: 'positive',
          message: response.data.message || 'Contraseña actualizada exitosamente.',
          position: 'bottom',
          timeout: 2000,
        })

        // Limpiar campos
        this.email = ''
        this.token = ''
        this.newPassword = ''
        this.confirmPassword = ''
        this.tokenReceived = false

        // Redirigir al login después de 1.5s
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message:
            error.response?.data?.message ||
            'Error al restablecer la contraseña. Revisa el código.',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Misma sección de estilos que LoginForm y RegisterForm */
.left-section {
  position: relative;
}

.slide-content {
  background: rgba(0, 0, 0, 0.45);
}

.bg-page {
  background: #f5f8ff;
}

.login-card {
  width: 420px;
  border-radius: 18px;
}

.full-width {
  width: 100%;
}

/* Widget de Validación */
.validation-widget {
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #1e40af;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.validation-item .q-icon {
  color: #ef4444;
}

.validation-item.valid {
  color: #16a34a;
  font-weight: 600;
}

.validation-item.valid .q-icon {
  color: #16a34a;
}
</style>
