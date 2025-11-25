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
        transition-prev="slide-right"
        transition-next="slide-left"
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

    <!-- SECCIÓN DERECHA (REGISTRO) -->
    <div class="col-5 flex flex-center bg-page">
      <q-card class="login-card shadow-4 q-pa-xl">
        <div class="column items-center">
          <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
            <q-icon name="person_add" size="40px" />
          </q-avatar>

          <div class="text-h5 text-primary text-weight-bold q-mb-sm">Crear cuenta</div>

          <div class="text-body2 text-grey-7 q-mb-xl">Registra tus datos para continuar</div>
        </div>

        <!-- USERNAME -->
        <q-input v-model="username" label="Nombre de usuario" filled dense class="q-mb-md">
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- CORREO -->
        <q-input v-model="correo" label="Correo Electrónico" filled dense class="q-mb-md">
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <!-- PASSWORD -->
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
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
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- CONFIRM PASSWORD -->
        <q-input
          v-model="password_confirm"
          :type="showPassword ? 'text' : 'password'"
          label="Confirmar contraseña"
          filled
          dense
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- BOTÓN -->
        <q-btn
          label="Registrarse"
          color="primary"
          unelevated
          class="full-width q-mb-md"
          @click="register"
        />

        <!-- IR AL LOGIN -->
        <div class="text-center q-mt-md">
          ¿Ya tienes cuenta?
          <a class="text-primary cursor-pointer" @click="$router.push('/login')">
            Inicia sesión aquí
          </a>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',

  data() {
    return {
      slide: 0,
      username: '',
      correo: '',
      password: '',
      password_confirm: '',
      showPassword: false,

      // MISMO SLIDER QUE LOGIN
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
    async register() {
      // VALIDACIÓN: username vacío
      if (!this.username.trim()) {
        this.$q.notify({
          type: 'negative',
          message: 'El nombre de usuario es obligatorio',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: correo vacío
      if (!this.correo.trim()) {
        this.$q.notify({
          type: 'negative',
          message: 'El correo es obligatorio',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: correo inválido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.correo)) {
        this.$q.notify({
          type: 'negative',
          message: 'Ingresa un correo electrónico válido',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: contraseña vacía
      if (!this.password.trim()) {
        this.$q.notify({
          type: 'negative',
          message: 'La contraseña es obligatoria',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: contraseña mínima
      if (this.password.length < 6) {
        this.$q.notify({
          type: 'negative',
          message: 'La contraseña debe tener al menos 6 caracteres',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: confirmación vacía
      if (!this.password_confirm.trim()) {
        this.$q.notify({
          type: 'negative',
          message: 'Debes confirmar tu contraseña',
          position: 'bottom',
        })
        return
      }

      // VALIDACIÓN: contraseñas no coinciden
      if (this.password !== this.password_confirm) {
        this.$q.notify({
          type: 'negative',
          message: 'Las contraseñas no coinciden',
          position: 'bottom',
        })
        return
      }

      const data = {
        username: this.username,
        correo: this.correo,
        password: this.password,
      }

      try {
        await this.$api.post('/api/usuario/signup', data)

        this.$q.notify({
          type: 'positive',
          message: 'Registro exitoso',
          position: 'bottom',
        })

        // LIMPIAR FORMULARIO
        this.username = ''
        this.correo = ''
        this.password = ''
        this.password_confirm = ''

        // REDIRIGIR AL LOGIN
        setTimeout(() => {
          this.$router.push('/login')
        }, 600)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error en el registro',
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
