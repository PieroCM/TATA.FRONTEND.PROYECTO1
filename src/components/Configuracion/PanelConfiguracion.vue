<template>
  <div class="panel-configuracion">
    <!-- Header -->
    <div class="panel-header">
      <h1 class="panel-title">Configuración</h1>
      <p class="panel-subtitle">
        Administra los roles del sistema, los roles de registro y la configuración de SLA.
      </p>
    </div>

    <!-- Cards Container -->
    <div class="cards-container">
      <!-- Card 1: Roles de Sistema -->
      <div class="config-card" @click="navigate('rolesSistema')">
        <div class="card-content">
          <div class="icon-circle">
            <q-icon name="admin_panel_settings" size="32px" />
          </div>
          <h3 class="card-title">Roles de Sistema</h3>
          <p class="card-description">
            Gestiona los roles principales del sistema y sus permisos asociados
          </p>
        </div>
      </div>

      <!-- Card 2: Configuración SLA -->
      <div class="config-card" @click="navigate('configSla')">
        <div class="card-content">
          <div class="icon-circle">
            <q-icon name="settings" size="32px" />
          </div>
          <h3 class="card-title">Configuración SLA</h3>
          <p class="card-description">
            Define parámetros de tiempo límite por tipo de solicitud
          </p>
        </div>
      </div>

      <!-- Card 3: Roles de Registro -->
      <div class="config-card" @click="navigate('rolesRegistro')">
        <div class="card-content">
          <div class="icon-circle">
            <q-icon name="person" size="32px" />
          </div>
          <h3 class="card-title">Roles de Registro</h3>
          <p class="card-description">
            Administra roles específicos por bloque tecnológico
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Emits
const emit = defineEmits(['navigate'])

// Methods
const navigate = (view) => {
  emit('navigate', view)
}
</script>

<style scoped lang="scss">
.panel-configuracion {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== HEADER ========== */
.panel-header {
  margin-bottom: 32px;
}

.panel-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.panel-subtitle {
  margin: 8px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #6B7280;
  line-height: 1.6;
}

/* ========== CARDS CONTAINER ========== */
.cards-container {
  display: grid;
  gap: 24px;
  width: 100%;
  justify-items: center;
  
  /* Pantallas pequeñas (< 931px): Una columna, todo centrado */
  grid-template-columns: 1fr;
  
  /* Pantallas medianas (932px - 1375px): 2 columnas, tercera card centrada */
  @media (min-width: 932px) and (max-width: 1375px) {
    grid-template-columns: repeat(2, minmax(300px, 340px));
    justify-content: center;
    
    .config-card:nth-child(3) {
      grid-column: 1 / -1;
      justify-self: center;
    }
  }
  
  /* Pantallas grandes (>= 1376px): 3 columnas, todas en fila centradas */
  @media (min-width: 1376px) {
    grid-template-columns: repeat(3, minmax(300px, 340px));
    justify-content: center;
  }
}

/* ========== CONFIG CARD ========== */
.config-card {
  width: 100%;
  max-width: 340px;
  height: 210px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: #2563EB;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);

    .icon-circle {
      background-color: #BFDBFE;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }
}

.card-content {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background-color: #E3F0FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  .q-icon {
    color: #2563EB;
  }
}

.card-title {
  margin: 20px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.card-description {
  margin: 12px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  line-height: 1.5;
}



/* ========== RESPONSIVE ========== */
@media (max-width: 931px) {
  .panel-header {
    margin-bottom: 24px;
  }

  .panel-title {
    font-size: 24px;
  }

  .panel-subtitle {
    font-size: 14px;
  }

  .cards-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .config-card {
    width: 340px;
    max-width: 340px;
    height: auto;
    min-height: 180px;
  }

  .card-content {
    padding: 20px;
  }
}
</style>
