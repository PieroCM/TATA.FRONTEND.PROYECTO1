<template>
  <div class="configuracion-view">
    <PanelConfiguracion 
      v-if="currentView === 'main'"
      @navigate="handleNavigate"
    />
    <RolesSistemaPanel 
      v-else-if="currentView === 'rolesSistema'"
      @back="currentView = 'main'"
    />
    <ConfigSlaPanel 
      v-else-if="currentView === 'configSla'"
      @back="currentView = 'main'"
    />
    <RolRegistroPanel 
      v-else-if="currentView === 'rolesRegistro'"
      @back="currentView = 'main'"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelConfiguracion from 'src/components/Configuracion/PanelConfiguracion.vue'
import RolesSistemaPanel from 'src/components/Configuracion/RolesSistemaPanel.vue'
import ConfigSlaPanel from 'src/components/Configuracion/ConfigSlaPanel.vue'
import RolRegistroPanel from 'src/components/Configuracion/RolRegistroPanel.vue'

const currentView = ref('main')

const handleNavigate = (view) => {
  currentView.value = view
}
</script>

<style scoped lang="scss">
.configuracion-view {
  min-height: 100vh;
  background-color: #F5F7FB;
  padding: 24px;
}

@media (max-width: 767px) {
  .configuracion-view {
    padding: 16px;
  }
}
</style>
