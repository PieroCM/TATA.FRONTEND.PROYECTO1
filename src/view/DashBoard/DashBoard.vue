<template>
  <q-page class="q-pa-xl">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Bienvenido 👋</div>
        <div class="text-subtitle1 text-grey-7">
          Has ingresado correctamente al panel principal.
        </div>
      </div>

      <q-btn color="negative" icon="logout" label="Cerrar sesión" @click="logout" />
    </div>

    <!-- GRID DE CARDS -->
    <div class="row q-col-gutter-xl">
      <div class="col-4">
        <q-card class="shadow-3 q-pa-lg">
          <q-icon name="analytics" color="primary" size="40px" />
          <div class="text-h6 q-mt-md">Análisis de SLA</div>
          <div class="text-grey-7">Consulta métricas de cumplimiento y alertas del sistema.</div>
        </q-card>
      </div>

      <div class="col-4">
        <q-card class="shadow-3 q-pa-lg">
          <q-icon name="settings" color="primary" size="40px" />
          <div class="text-h6 q-mt-md">Configuraciones</div>
          <div class="text-grey-7">Administra el sistema, roles, permisos y parámetros.</div>
        </q-card>
      </div>

      <div class="col-4">
        <q-card class="shadow-3 q-pa-lg">
          <q-icon name="notifications" color="primary" size="40px" />
          <div class="text-h6 q-mt-md">Alertas del Sistema</div>
          <div class="text-grey-7">Revisa notificaciones importantes y eventos registrados.</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'DashBoard',

  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped></style>
