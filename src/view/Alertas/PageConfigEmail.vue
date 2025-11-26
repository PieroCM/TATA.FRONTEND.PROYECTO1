<template>
  <q-page class="config-email-page">
    <!-- Encabezado Principal -->
    <div class="page-header q-mb-lg">
      <div class="header-content">
        <q-icon name="mail" color="primary" size="40px" class="q-mr-md" />
        <div class="header-text">
          <h1 class="text-h4 text-weight-bold q-ma-none">Configuración de Email</h1>
          <p class="subtitle text-grey-7 q-ma-none q-mt-xs">
            Gestiona automatización y comunicaciones por correo electrónico
          </p>
        </div>
      </div>
    </div>

    <!-- Sistema de Pestañas (Tabs) -->
    <div class="tabs-container q-mb-lg">
      <q-btn-toggle
        v-model="tabActivo"
        spread
        no-caps
        rounded
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-7"
        :options="[
          { label: 'Automatización', value: 'automatizacion', icon: 'schedule' },
          { label: 'Sala de Comunicaciones', value: 'comunicaciones', icon: 'email' },
        ]"
        class="custom-tabs"
      />
    </div>

    <!-- Tab: Automatización -->
    <div v-show="tabActivo === 'automatizacion'">
      <TabAutomatizacion />
    </div>

    <!-- Tab: Sala de Comunicaciones -->
    <div v-show="tabActivo === 'comunicaciones'">
      <TabSalaComunicaciones />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TabAutomatizacion from 'components/Alertas/TabAutomatizacion.vue'
import TabSalaComunicaciones from 'components/Alertas/TabSalaComunicaciones.vue'

// Estado de las pestañas
const tabActivo = ref('automatizacion')
</script>

<style scoped>
.config-email-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ===== ENCABEZADO PRINCIPAL ===== */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
}

.header-text h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
}

/* ===== TABS PERSONALIZADOS ===== */
.tabs-container {
  max-width: 600px;
}

.custom-tabs {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.custom-tabs :deep(.q-btn) {
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0;
}

.custom-tabs :deep(.q-btn__content) {
  gap: 8px;
}
</style>
