<!--
  Fila de la tabla: renderiza una fila con los datos del registro.
  Muestra: Rol, Fecha Solicitud, Fecha Ingreso, Tipo, Días, Estado, Acciones.
  Emite eventos 'editar' y 'eliminar' hacia el padre.
-->
<template>
  <tr class="sla-table-row">
    <td class="sla-table-row__cell">{{ registro.rol || '-' }}</td>
    <td class="sla-table-row__cell">{{ formatFecha(registro.fechaSolicitud) }}</td>
    <td class="sla-table-row__cell">{{ formatFecha(registro.fechaIngreso) }}</td>
    <td class="sla-table-row__cell">
      <span class="sla-codigo-badge">{{ registro.codigoSla || '-' }}</span>
    </td>
    <td class="sla-table-row__cell">{{ registro.tipo || '-' }}</td>
    <td class="sla-table-row__cell">{{ registro.dias || '-' }}</td>
    <td class="sla-table-row__cell">
      <span
        class="sla-estado-solicitud-badge"
        :class="getEstadoSolicitudClass(registro.estadoSolicitud)"
      >
        {{ formatEstadoSolicitud(registro.estadoSolicitud) }}
      </span>
    </td>
    <td class="sla-table-row__cell">
      <span class="sla-cumplimiento-badge" :class="getCumplimientoClass(registro.cumplimientoSla)">
        {{ formatCumplimiento(registro.cumplimientoSla) }}
      </span>
    </td>
    <td class="sla-table-row__cell sla-table-row__cell--actions">
      <SlaActionButtons @editar="handleEditar" @eliminar="handleEliminar" />
    </td>
  </tr>
</template>

<script setup>
import SlaActionButtons from './SlaActionButtons.vue'

const props = defineProps({
  registro: {
    type: Object,
    required: true,
    // Forma esperada del objeto:
    // {
    //   id: number,
    //   rol: string,
    //   fechaSolicitud: string,
    //   fechaIngreso: string | null,
    //   codigoSla: string,
    //   tipo: string,
    //   dias: number | null,
    //   estadoSolicitud: string (ACTIVO, INACTIVO, PREVENTIVO),
    //   cumplimientoSla: string (CUMPLE_SLA, NO_CUMPLE_SLA)
    // }
  },
})

const emit = defineEmits(['editar', 'eliminar'])

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  try {
    // Parsear la fecha como string 'YYYY-MM-DD' directamente
    // Sin convertir a objeto Date para evitar problemas de zona horaria
    const partes = fecha.split('T')[0].split('-') // Tomar solo la parte de fecha
    if (partes.length === 3) {
      const [year, month, day] = partes
      return `${day}/${month}/${year}` // Formato DD/MM/YYYY
    }

    // Fallback: usar toLocaleDateString
    const date = new Date(fecha + 'T00:00:00') // Forzar hora local
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return fecha
  }
}

// Funciones para Estado Solicitud (ACTIVO, INACTIVO, PREVENTIVO)
const formatEstadoSolicitud = (estado) => {
  if (!estado) return '-'
  const estadoNormalizado = estado.toUpperCase().trim()
  const estadosMap = {
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
    PREVENTIVO: 'Preventivo',
  }
  return estadosMap[estadoNormalizado] || estado
}

const getEstadoSolicitudClass = (estado) => {
  if (!estado) return ''
  const estadoNormalizado = estado.toUpperCase().trim()
  const classMap = {
    ACTIVO: 'sla-estado-solicitud-badge--activo',
    INACTIVO: 'sla-estado-solicitud-badge--inactivo',
    PREVENTIVO: 'sla-estado-solicitud-badge--preventivo',
  }
  return classMap[estadoNormalizado] || ''
}

// Funciones para Cumplimiento SLA (CUMPLE_SLA, NO_CUMPLE_SLA)
const formatCumplimiento = (estado) => {
  if (!estado) return '-'
  // Retornar el texto completo tal como viene del backend
  return estado
}

const getCumplimientoClass = (estado) => {
  if (!estado) return ''
  const estadoNormalizado = estado.toUpperCase().trim()

  // Detectar "NO CUMPLE" primero (porque también contiene "CUMPLE")
  if (estadoNormalizado.includes('NO CUMPLE') || estadoNormalizado.includes('NO_CUMPLE')) {
    return 'sla-cumplimiento-badge--incumplido'
  }
  // Detectar "CUMPLE"
  if (estadoNormalizado.includes('CUMPLE')) {
    return 'sla-cumplimiento-badge--cumplido'
  }

  return ''
}

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
  transition: background-color 0.2s;
}

.sla-table-row:hover {
  background-color: #f9f9f9;
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

/* Estilos para Estado Solicitud (ACTIVO, INACTIVO, PREVENTIVO) */
.sla-estado-solicitud-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.sla-estado-solicitud-badge--activo {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.sla-estado-solicitud-badge--inactivo {
  background-color: #f5f5f5;
  color: #757575;
}

.sla-estado-solicitud-badge--preventivo {
  background-color: #fff3e0;
  color: #ef6c00;
}

/* Estilos para Cumplimiento SLA (CUMPLE_SLA, NO_CUMPLE_SLA) */
.sla-cumplimiento-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.sla-cumplimiento-badge--cumplido {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.sla-cumplimiento-badge--incumplido {
  background-color: #ffebee;
  color: #c62828;
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
</style>
