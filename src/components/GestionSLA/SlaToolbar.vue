<!--
  Toolbar superior: muestra título, subtítulo y botón para crear nuevo registro.
  Emite el evento 'nuevo-registro' cuando se hace click.
-->
<template>
  <div class="sla-toolbar">
    <div class="sla-toolbar__content">
      <div class="sla-toolbar__text">
        <h1 class="sla-toolbar__title">Gestión de Solicitudes SLA</h1>
        <p class="sla-toolbar__subtitle">Crear, editar y eliminar solicitudes manualmente</p>
      </div>
      <button class="sla-toolbar__btn-primary" @click="emitNuevoRegistro">
        <span class="sla-toolbar__btn-icon">+</span>
        Nueva Solicitud
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['nuevo-registro'])

const emitNuevoRegistro = () => {
  emit('nuevo-registro')
}
</script>

<style scoped>
.sla-toolbar {
  margin-bottom: 24px;
}

.sla-toolbar__content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sla-toolbar__text {
  flex: 1;
}

.sla-toolbar__title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.sla-toolbar__subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.sla-toolbar__btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sla-toolbar__btn-primary:hover {
  background-color: #1565c0;
}

.sla-toolbar__btn-icon {
  font-size: 18px;
  font-weight: 600;
}
</style>
