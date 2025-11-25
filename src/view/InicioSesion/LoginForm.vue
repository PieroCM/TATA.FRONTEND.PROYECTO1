<template>
  <div class="row" style="height: 100vh; overflow: hidden">
    <!-- SECCIÓN IZQUIERDA (SLIDER) -->
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

    <!-- SECCIÓN DERECHA (LOGIN) -->
    <div class="col-5 flex flex-center bg-page">
      <q-card class="login-card shadow-4 q-pa-xl">
        <!-- Avatar -->
        <div class="column items-center">
          <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
            <q-icon name="person" size="40px" />
          </q-avatar>

          <div class="text-h5 text-primary text-weight-bold q-mb-sm">Iniciar sesión</div>
          <div class="text-body2 text-grey-7 q-mb-xl">Ingresa tus credenciales para continuar</div>
        </div>

        <!-- CORREO -->
        <q-input v-model="correo" label="Correo Electrónico" filled dense class="q-mb-md">
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <!-- PASSWORD + SHOW/HIDE -->
        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Contraseña"
          filled
          dense
          class="q-mb-sm"
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

        <!-- OLVIDASTE -->
        <div class="text-right q-mb-lg">
          <a class="text-primary cursor-pointer" @click="$router.push('/forgot-password')">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <!-- BOTÓN LOGIN -->
        <q-btn
          label="Ingresar"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          @click="login"
        />

        <div class="text-center text-grey-7 text-caption q-mt-md">
          Credenciales demo:<br />
          usuario@tcs.com / tcs2024
        </div>
      </q-card>
    </div>

    <!-- DIALOG RESET PASSWORD -->
    <q-dialog v-model="showResetDialog">
      <q-card class="q-pa-lg" style="width: 400px">
        <div class="text-h6 text-primary q-mb-md">Restablecer contraseña</div>

        <q-input v-model="resetEmail" label="Ingresa tu correo" filled dense type="email" />

        <div class="row justify-end q-mt-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Enviar" color="primary" @click="sendResetEmail" />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',

  data() {
    return {
      slide: 0,
      correo: '',
      password: '',
      isPwd: true, // 👈 Ocultar/mostrar contraseña
      resetEmail: '',
      showResetDialog: false,

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

  methods: {
    async login() {
      if (!this.correo || !this.password) {
        return this.$q.notify({
          type: 'warning',
          message: 'Por favor completa todos los campos',
          position: 'bottom',
        })
      }

      try {
        const response = await this.$api.post('/api/usuario/signin', {
          correo: this.correo,
          password: this.password,
        })

        localStorage.setItem('token', response.data.token)

        this.$q.notify({
          type: 'positive',
          message: 'Inicio de sesión exitoso',
          position: 'bottom',
          timeout: 1500,
        })

        // Redirigir al sistema (MainLayout)
        this.$router.push('/sistema')
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al iniciar sesión',
          position: 'bottom',
        })
      }
    },

    async sendResetEmail() {
      if (!this.resetEmail) {
        return this.$q.notify({
          type: 'warning',
          message: 'Ingresa un correo válido',
          position: 'bottom',
        })
      }

      try {
        await this.$api.post('/api/usuario/reset-password-request', {
          correo: this.resetEmail,
        })

        this.$q.notify({
          type: 'positive',
          message: 'Si el correo existe, se envió un enlace',
          position: 'bottom',
        })

        this.showResetDialog = false
        this.resetEmail = ''
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al enviar solicitud',
          position: 'bottom',
        })
      }
    },
  },
}
</script>

<style scoped>
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
