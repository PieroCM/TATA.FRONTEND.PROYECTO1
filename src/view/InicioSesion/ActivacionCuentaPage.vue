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

        <!-- Botón Activar -->
        <q-btn
          label="Activar Cuenta"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          :loading="loading"
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
      email: '', // Correo recibido de la URL
      token: '', // Token recibido de la URL
      newPassword: '', // Nueva contraseña
      confirmPassword: '', // Confirmación de nueva contraseña
      isPwd: true, // Para ocultar/mostrar contraseña
      loading: false, // Estado de carga para el botón

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

  mounted() {
    // Capturar parámetros de la URL (soporta email o username)
    const { email, username, token } = this.$route.query

    // Usar email si existe, sino username (para compatibilidad)
    this.email = email || username || ''
    this.token = token || ''
  },

  methods: {
    async activarCuenta() {
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
        await this.$api.post('/api/usuario/activar-cuenta', {
          Email: this.email,
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
</style>
