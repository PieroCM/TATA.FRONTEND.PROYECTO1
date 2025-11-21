<!--
  Botones de acción: editar y eliminar.
  Emite eventos 'editar' y 'eliminar'.
-->
<template>
  <div class="sla-action-buttons">
    <button
      class="sla-action-buttons__btn sla-action-buttons__btn--edit"
      @click="emitEditar"
      title="Editar"
    >
      ✏️
    </button>
    <button
      class="sla-action-buttons__btn sla-action-buttons__btn--delete"
      @click="emitEliminar"
      title="Eliminar"
    >
      🗑️
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['editar', 'eliminar'])

const emitEditar = () => {
  emit('editar')
}

const emitEliminar = () => {
  emit('eliminar')
}
</script>

<style scoped>
.sla-action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.sla-action-buttons__btn {
  padding: 6px 10px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.sla-action-buttons__btn:hover {
  background-color: #f5f5f5;
}

.sla-action-buttons__btn--edit:hover {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.sla-action-buttons__btn--delete:hover {
  border-color: #d32f2f;
  background-color: #ffebee;
}
</style>
