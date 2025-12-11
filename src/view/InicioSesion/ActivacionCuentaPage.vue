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
            <q-icon name="verified_user" size="40px" />
          </q-avatar>

          <div class="text-h5 text-primary text-weight-bold q-mb-sm">Activar Cuenta</div>

          <div class="text-body2 text-grey-7 q-mb-xl">
            Establece tu contraseña para completar la activación de tu cuenta.
          </div>
        </div>

        <!-- Email informativo (solo lectura) -->
        <q-input
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

        <!-- Nueva Contraseña -->
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

        <!-- Confirmar Contraseña -->
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
              <q-icon :name="validations.passwordsMatch ? 'check_circle' : 'cancel'" size="18px" />
              <span>Coincidencia</span>
            </div>
          </div>
        </div>

        <!-- Botón Activar -->
        <q-btn
          label="Activar Cuenta"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          :loading="loading"
          :disable="!allValidationsPassed"
          @click="activarCuenta"
        />

        <div class="text-center text-caption text-grey-7 q-mt-sm">
          ¿Ya tienes cuenta?
          <span class="text-primary cursor-pointer" @click="$router.push('/login')">
            Inicia sesión aquí
          </span>
        </div>

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
  name: 'ActivacionCuentaPage',

  data() {
    return {
      slide: 0,
      email: '', // Identity recibida de la URL (puede ser email o username)
      token: '', // Token recibido de la URL
      newPassword: '', // Nueva contraseña
      confirmPassword: '', // Confirmación de nueva contraseña
      isPwd: true, // Para ocultar/mostrar contraseña
      loading: false, // Estado de carga para el botón
      validations: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSymbol: false,
        passwordsMatch: false,
      },

      // Mismos slides que ForgotPassword
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
    this.resolverIdentidad()
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
    /**
     * Resuelve la identidad del usuario desde los parámetros de la URL.
     * Soporta tanto email como username. El backend se encarga de la conversión.
     */
    resolverIdentidad() {
      const { email, username, token } = this.$route.query

      // Capturar identity (email o username)
      const identity = email || username || ''
      this.email = identity
      this.token = token || ''

      // Log informativo en consola
      // if (identity) {
      //   const esEmail = identity.includes('@')
      //   console.log(
      //     `[Activación] Identity detectada: ${esEmail ? 'EMAIL' : 'USERNAME'} → "${identity}"`,
      //   )
      //   console.log(`[Activación] Token recibido: ${this.token ? '✓' : '✗'}`)
      // } else {
      //   console.warn('[Activación] ⚠️ No se recibió email ni username en la URL')
      // }

      // Validar que exista token
      if (!this.token) {
        this.$q.notify({
          type: 'negative',
          message: 'Enlace de activación inválido o incompleto',
          position: 'bottom',
          timeout: 3000,
        })
      }
    },

    async activarCuenta() {
      // Validar que exista identity y token
      if (!this.email || !this.token) {
        return this.$q.notify({
          type: 'negative',
          message: 'El enlace de activación es inválido o ha expirado.',
          position: 'bottom',
        })
      }

      // Validaciones básicas
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
          message: 'La contraseña debe tener al menos 6 caracteres.',
          position: 'bottom',
        })
      }

      this.loading = true
      try {
        // El backend resuelve internamente si es email o username
        // console.log('[Activación] Enviando solicitud al backend con identity:', this.email)

        await this.$api.post('/api/usuario/activar-cuenta', {
          Email: this.email, // Puede ser email o username, backend lo resuelve
          Token: this.token,
          NuevaPassword: this.newPassword,
        })

        this.$q.notify({
          type: 'positive',
          message: '¡Cuenta activada exitosamente!',
          position: 'bottom',
          timeout: 2000,
        })

        // Limpiar campos
        this.newPassword = ''
        this.confirmPassword = ''

        // Redirigir al login después de 1.5s
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } catch (error) {
        // console.error('[Activación] Error:', error.response?.data || error.message)
        this.$q.notify({
          type: 'negative',
          message:
            error.response?.data?.message || 'Error al activar la cuenta. Verifica el enlace.',
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
/* Mismos estilos que ForgotPassword */
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

/* Responsivo: en tablets y móviles, el carrusel queda de fondo y el card se superpone centrado */
@media (max-width: 1024px) {
  /* ocultar textos sobre la imagen sombreada en pantallas pequeñas */
  .slide-content {
    display: none !important;
  }

  .left-section {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    height: 100vh;
  }

  /* asegurar alto completo del carrusel */
  .left-section .full-height {
    height: 100vh;
  }

  /* oscurecer ligeramente el fondo para mejorar contraste del card */
  .left-section::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1;
  }

  /* quitar fondo sólido del panel derecho en overlay */
  .bg-page {
    background: transparent !important;
  }

  /* hacer que la columna derecha se superponga y centre el card */
  .row > .col-5 {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    z-index: 2;
    padding: 16px; /* respiración en bordes pequeños */
  }

  .login-card {
    width: 90%;
    max-width: 420px;
    background: rgba(255, 255, 255, 0.92) !important;
    backdrop-filter: saturate(120%) blur(6px);
    -webkit-backdrop-filter: saturate(120%) blur(6px);
    border-radius: 16px;
    padding: 24px;
  }

  /* opcional: ocultar flechas del carrusel en pantallas pequeñas para limpiar la vista */
  :deep(.q-carousel__control) {
    display: none;
  }
}

@media (max-width: 600px) {
  .login-card {
    width: 92%;
    max-width: 360px;
    padding: 20px;
  }

  /* ajustar separaciones verticales grandes dentro del card en móviles */
  .login-card .q-mb-xl {
    margin-bottom: 16px !important;
  }
}
</style>
