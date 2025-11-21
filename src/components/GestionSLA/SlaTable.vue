<!--
  Tabla de registros SLA: muestra una tarjeta con la tabla completa.
  Recibe un array de registros y renderiza las filas usando SlaTableRow.
  Propaga eventos 'editar' y 'eliminar' hacia arriba.
-->
<template>
  <div class="sla-table-container">
    <div class="sla-table-card">
      <table class="sla-table">
        <thead class="sla-table__head">
          <tr>
            <th class="sla-table__header">Rol</th>
            <th class="sla-table__header">Fecha Solicitud</th>
            <th class="sla-table__header">Fecha Ingreso</th>
            <th class="sla-table__header">Código SLA</th>
            <th class="sla-table__header">Tipo</th>
            <th class="sla-table__header">Días</th>
            <th class="sla-table__header">Estado Solicitud</th>
            <th class="sla-table__header">Cumplimiento SLA</th>
            <th class="sla-table__header sla-table__header--center">Acciones</th>
          </tr>
        </thead>
        <tbody class="sla-table__body">
          <SlaTableRow
            v-for="(registro, index) in registros"
            :key="registro.id || index"
            :registro="registro"
            @editar="handleEditar"
            @eliminar="handleEliminar"
          />
          <tr v-if="registros.length === 0">
            <td colspan="9" class="sla-table__empty">No se encontraron registros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import SlaTableRow from './SlaTableRow.vue'

defineProps({
  registros: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['editar', 'eliminar'])

const handleEditar = (registro) => {
  emit('editar', registro)
}

const handleEliminar = (registro) => {
  emit('eliminar', registro)
}
</script>

<style scoped>
.sla-table-container {
  width: 100%;
}

.sla-table-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.sla-table {
  width: 100%;
  border-collapse: collapse;
}

.sla-table__head {
  background-color: #f5f5f5;
}

.sla-table__header {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.sla-table__header--center {
  text-align: center;
}

.sla-table__body {
  background-color: white;
}

.sla-table__empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
