<template>
  <div class="row justify-center items-center" style="height: 100vh;">
    <q-card class="q-pa-xl shadow-4" style="width: 420px; border-radius: 18px;">

      <div class="column items-center q-mb-lg">
        <q-avatar size="80px" color="primary" text-color="white">
          <q-icon name="lock_reset" size="40px" />
        </q-avatar>

        <div class="text-h5 text-primary text-weight-bold q-mt-md">
          Recuperar contraseña
        </div>

        <div class="text-body2 text-grey-7 text-center q-mt-sm">
          Ingresa tu correo y te enviaremos instrucciones
        </div>
      </div>

      <q-input
        v-model="correo"
        label="Correo electrónico"
        filled
        dense
        class="q-mb-lg"
      >
        <template #prepend>
          <q-icon name="mail" />
        </template>
      </q-input>

      <q-btn
        label="Enviar instrucciones"
        color="primary"
        unelevated
        class="full-width"
        @click="sendInstructions"
      />

      <div class="text-center q-mt-md">
        <a class="text-primary cursor-pointer" @click="$router.push('/login')">Volver al login</a>
      </div>
    </q-card>
  </div>
</template>

<script>
export default {
  name: "ForgotPassword",

  data() {
    return {
      correo: "",
    };
  },

  methods: {
    async sendInstructions() {
      if (!this.correo) {
        this.$q.notify({
          type: "warning",
          message: "Ingresa tu correo",
          position: "bottom",
        });
        return;
      }

      try {
        // aquí llamas a tu backend cuando lo tengas
        // await this.$api.post("/api/usuario/forgot-password", { correo: this.correo });

        this.$q.notify({
          type: "positive",
          message: "Si el correo existe, se enviarán instrucciones",
          position: "bottom",
        });

        this.correo = "";
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error al procesar la solicitud",
          position: "bottom",
        });
      }
    }
  }
};
</script>

<style scoped>
.full-width { width: 100%; }
</style>
