<!--
  Fila de la tabla: renderiza una fila con los datos del registro.
  Muestra: Rol, Fecha Solicitud, Fecha Ingreso, Código SLA, Tipo, Días SLA, Estado Solicitud, Cumplimiento SLA, Acciones.
  Emite eventos 'editar' y 'eliminar' hacia el padre.
  
  MEJORAS IMPLEMENTADAS:
  - ✅ Usa mappers centralizados (src/utils/slaMappers.js) para colores y labels
  - ✅ Resalta filas críticas (VENCIDO o NO_CUMPLE) automáticamente
  - ✅ Muestra días SLA calculados por el backend (NO recalcula en frontend)
  - ✅ Chips con colores de Quasar consistentes en toda la app
  
  IMPORTANTE: Todos los valores de SLA (dias, estadoSolicitud, cumplimientoSla) 
  YA VIENEN CALCULADOS desde el backend. Este componente solo los visualiza.
-->
<template>
  <tr class="sla-table-row" :class="{ 'sla-table-row--critica': esCritica }">
    <td class="sla-table-row__cell">{{ registro.rol || '-' }}</td>
    <td class="sla-table-row__cell">{{ formatFecha(registro.fechaSolicitud) }}</td>
    <td class="sla-table-row__cell">{{ formatFecha(registro.fechaIngreso) }}</td>
    <td class="sla-table-row__cell">
      <span class="sla-codigo-badge">{{ registro.codigoSla || '-' }}</span>
    </td>
    <td class="sla-table-row__cell">{{ registro.tipo || '-' }}</td>
    <td class="sla-table-row__cell sla-table-row__cell--dias">
      <!-- ✅ Muestra el valor de días que YA viene calculado del backend (numDiasSla) -->
      <span class="dias-sla-text">
        {{ registro.dias !== null && registro.dias !== undefined ? registro.dias : '-' }}
        <span v-if="registro.dias !== null && registro.dias !== undefined" class="dias-label"
          >días</span
        >
      </span>
    </td>
    <td class="sla-table-row__cell">
      <!-- ✅ Chip de Estado Solicitud usando mapper centralizado -->
      <q-chip
        :color="getEstadoSolicitudColor(registro.estadoSolicitud)"
        text-color="white"
        size="sm"
        dense
      >
        {{ getEstadoSolicitudLabel(registro.estadoSolicitud) }}
      </q-chip>
    </td>
    <td class="sla-table-row__cell">
      <!-- ✅ Chip de Cumplimiento SLA usando mapper centralizado -->
      <q-chip
        :color="getCumplimientoSlaColor(registro.cumplimientoSla)"
        text-color="white"
        size="sm"
        dense
      >
        {{ getCumplimientoSlaLabel(registro.cumplimientoSla) }}
      </q-chip>
    </td>
    <td class="sla-table-row__cell sla-table-row__cell--actions">
      <SlaActionButtons @editar="handleEditar" @eliminar="handleEliminar" />
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import SlaActionButtons from './SlaActionButtons.vue'
import {
  getCumplimientoSlaColor,
  getCumplimientoSlaLabel,
  getEstadoSolicitudColor,
  getEstadoSolicitudLabel,
  esSolicitudCritica,
  formatFecha,
} from 'src/utils/slaMappers'

const props = defineProps({
  registro: {
    type: Object,
    required: true,
    // Forma esperada del objeto (campos calculados YA vienen del backend):
    // {
    //   id: number,
    //   rol: string,
    //   fechaSolicitud: string,
    //   fechaIngreso: string | null,
    //   codigoSla: string,
    //   tipo: string,
    //   dias: number | null,                    // ✅ numDiasSla calculado por el worker backend
    //   estadoSolicitud: string,                // ✅ ACTIVA, EN_PROCESO, VENCIDO, CERRADO (del backend)
    //   cumplimientoSla: string,                // ✅ EN_PROCESO_SLA1, CUMPLE_SLA2, NO_CUMPLE_SLA3 (del backend)
    //   resumenSla: string
    // }
    //
    // IMPORTANTE: NO se recalculan días ni estados en este componente.
    // Solo se muestran los valores que ya vienen calculados desde el servidor.
  },
})

const emit = defineEmits(['editar', 'eliminar'])

// Computed: verifica si la fila es crítica (para resaltado visual)
// ✅ Usa el mapper centralizado que evalúa los valores del backend
const esCritica = computed(() => esSolicitudCritica(props.registro))

const handleEditar = () => {
  emit('editar', props.registro)
}

const handleEliminar = () => {
  emit('eliminar', props.registro)
}
</script>

<style scoped>
.sla-table-row {
  border-bottom: 1px solid #e0e0e0;
  transition:
    background-color 0.2s,
    border-left 0.2s;
}

.sla-table-row:hover {
  background-color: #f9f9f9;
}

/* Resaltado visual para solicitudes críticas (VENCIDO o NO_CUMPLE) */
.sla-table-row--critica {
  background-color: #fff5f5;
  border-left: 4px solid #f44336;
}

.sla-table-row--critica:hover {
  background-color: #ffebee;
}

.sla-table-row__cell {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  color: #333;
}

.sla-table-row__cell--actions {
  text-align: center;
}

/* Columna de días SLA */
.sla-table-row__cell--dias {
  text-align: center;
  font-weight: 600;
}

.dias-sla-text {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  color: #1976d2;
  font-size: 15px;
}

.dias-label {
  font-size: 11px;
  color: #666;
  font-weight: 400;
}

.sla-codigo-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background-color: #f3e5f5;
  color: #6a1b9a;
  letter-spacing: 0.5px;
}

/* Responsive: ajustes para tablets */
@media (max-width: 1024px) {
  .sla-table-row__cell {
    padding: 10px 12px;
    font-size: 13px;
  }

  .dias-sla-text {
    font-size: 14px;
  }
}

/* Responsive: ajustes para móviles (aunque en mobile se usan cards) */
@media (max-width: 767px) {
  .sla-table-row__cell {
    padding: 8px 10px;
    font-size: 12px;
  }

  .sla-codigo-badge {
    padding: 3px 8px;
    font-size: 11px;
  }
}
</style>
