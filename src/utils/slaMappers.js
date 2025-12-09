/**
 * Utilidades centralizadas para mapeo de estados SLA
 * Usado en: GestionSLA, Dashboards (SLA_FiltrosReporte, SLA_AnaliticaInteractiva)
 *
 * El backend calcula:
 * - NumDiasSla: Días consumidos del SLA
 * - EstadoCumplimientoSla: EN_PROCESO_SLA1, CUMPLE_SLA2, NO_CUMPLE_SLA3, etc.
 * - EstadoSolicitud: ACTIVA, EN_PROCESO, VENCIDO, CERRADO
 */

/**
 * Mapea EstadoCumplimientoSla a color de Quasar
 * @param {string} estadoCumplimiento - Estado del backend (ej: "EN_PROCESO_SLA1", "CUMPLE_SLA2")
 * @returns {string} - Color de Quasar: 'positive', 'warning', 'negative', 'grey'
 */
export function getCumplimientoSlaColor(estadoCumplimiento) {
  if (!estadoCumplimiento) return 'grey'

  const estado = estadoCumplimiento.toUpperCase().trim()

  // Orden importante: verificar NO_CUMPLE antes que CUMPLE
  if (estado.startsWith('NO_CUMPLE_')) return 'negative' // Rojo
  if (estado.startsWith('CUMPLE_')) return 'positive' // Verde
  if (estado.startsWith('EN_PROCESO_')) return 'warning' // Amarillo/Naranja

  return 'grey'
}

/**
 * Mapea EstadoCumplimientoSla a etiqueta legible
 * @param {string} estadoCumplimiento - Estado del backend
 * @returns {string} - Label amigable: "Cumple SLA", "No Cumple", "En Proceso"
 */
export function getCumplimientoSlaLabel(estadoCumplimiento) {
  if (!estadoCumplimiento) return 'Sin estado'

  const estado = estadoCumplimiento.toUpperCase().trim()

  if (estado.startsWith('NO_CUMPLE_')) return 'No Cumple'
  if (estado.startsWith('CUMPLE_')) return 'Cumple SLA'
  if (estado.startsWith('EN_PROCESO_')) return 'En Proceso'

  // Fallback: mostrar con espacios en lugar de guiones bajos
  return estadoCumplimiento.replace(/_/g, ' ')
}

/**
 * Mapea EstadoSolicitud a color de Quasar
 * @param {string} estadoSolicitud - Estado del backend (ACTIVA, EN_PROCESO, VENCIDO, CERRADO)
 * @returns {string} - Color de Quasar
 */
export function getEstadoSolicitudColor(estadoSolicitud) {
  if (!estadoSolicitud) return 'grey'

  const estado = estadoSolicitud.toUpperCase().trim()

  const colorMap = {
    ACTIVA: 'positive', // Verde
    EN_PROCESO: 'info', // Azul
    VENCIDO: 'negative', // Rojo
    CERRADO: 'grey-7', // Gris oscuro
    // Compatibilidad con estados antiguos
    ACTIVO: 'positive',
    INACTIVO: 'grey',
    PREVENTIVO: 'orange',
  }

  return colorMap[estado] || 'grey'
}

/**
 * Mapea EstadoSolicitud a etiqueta legible
 * @param {string} estadoSolicitud
 * @returns {string}
 */
export function getEstadoSolicitudLabel(estadoSolicitud) {
  if (!estadoSolicitud) return 'Sin estado'

  const estado = estadoSolicitud.toUpperCase().trim()

  const labelMap = {
    ACTIVA: 'Activa',
    EN_PROCESO: 'En Proceso',
    VENCIDO: 'Vencido',
    CERRADO: 'Cerrado',
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
    PREVENTIVO: 'Preventivo',
  }

  return labelMap[estado] || estadoSolicitud
}

/**
 * Verifica si una solicitud es crítica (necesita atención)
 * @param {object} solicitud - Objeto con estadoSolicitud y cumplimientoSla
 * @returns {boolean}
 */
export function esSolicitudCritica(solicitud) {
  if (!solicitud) return false

  const { estadoSolicitud, cumplimientoSla } = solicitud

  // Es crítica si está vencida o no cumple SLA
  if (estadoSolicitud?.toUpperCase() === 'VENCIDO') return true
  if (cumplimientoSla?.toUpperCase().startsWith('NO_CUMPLE_')) return true

  return false
}

/**
 * Filtra registros por estado de cumplimiento SLA
 * @param {array} registros - Lista de registros
 * @param {string} filtro - 'EN_PROCESO', 'CUMPLE', 'NO_CUMPLE', 'TODOS'
 * @returns {array} - Registros filtrados
 */
export function filtrarPorCumplimientoSla(registros, filtro) {
  if (!filtro || filtro === 'TODOS') return registros

  const filtroUpper = filtro.toUpperCase()

  return registros.filter((registro) => {
    const cumplimiento = (registro.cumplimientoSla || '').toUpperCase()

    if (filtroUpper === 'EN_PROCESO') {
      return cumplimiento.startsWith('EN_PROCESO_')
    }
    if (filtroUpper === 'CUMPLE') {
      return cumplimiento.startsWith('CUMPLE_')
    }
    if (filtroUpper === 'NO_CUMPLE') {
      return cumplimiento.startsWith('NO_CUMPLE_')
    }

    return true
  })
}

/**
 * Filtra registros por estado de solicitud
 * @param {array} registros - Lista de registros
 * @param {string} filtro - 'ACTIVA', 'EN_PROCESO', 'VENCIDO', 'CERRADO', 'TODOS'
 * @returns {array} - Registros filtrados
 */
export function filtrarPorEstadoSolicitud(registros, filtro) {
  if (!filtro || filtro === 'TODOS') return registros

  return registros.filter((registro) => {
    return registro.estadoSolicitud?.toUpperCase() === filtro.toUpperCase()
  })
}

/**
 * Calcula porcentaje de cumplimiento SLA (para dashboards)
 * @param {number} cumplidos - Cantidad que cumple
 * @param {number} total - Total de solicitudes
 * @returns {number} - Porcentaje (0-100)
 */
export function calcularPorcentajeCumplimiento(cumplidos, total) {
  if (!total || total === 0) return 0
  return Math.round((cumplidos / total) * 100)
}

/**
 * Mapea porcentaje a color para gráficos (coherente con chips)
 * @param {number} porcentaje - Porcentaje de cumplimiento (0-100)
 * @returns {string} - Color de Quasar
 */
export function getPorcentajeColor(porcentaje) {
  if (porcentaje >= 90) return 'positive' // Verde
  if (porcentaje >= 70) return 'warning' // Naranja
  return 'negative' // Rojo
}

/**
 * Mapea porcentaje a color hexadecimal (para Chart.js)
 * @param {number} porcentaje
 * @returns {string} - Color hex
 */
export function getPorcentajeColorHex(porcentaje) {
  if (porcentaje >= 90) return '#4CAF50' // Verde
  if (porcentaje >= 70) return '#FF9800' // Naranja
  return '#F44336' // Rojo
}

/**
 * Formatea fecha ISO a DD/MM/YYYY
 * @param {string} fecha - Fecha en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 * @returns {string} - Fecha formateada DD/MM/YYYY o '-' si es null/undefined
 */
export function formatFecha(fecha) {
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

/**
 * Filtra registros por rango de fechas (helper para evitar código duplicado)
 * @param {array} registros - Lista de registros
 * @param {string} campo - Nombre del campo de fecha ('fechaSolicitud', 'fechaIngreso', etc.)
 * @param {string} desde - Fecha desde (YYYY-MM-DD) - opcional
 * @param {string} hasta - Fecha hasta (YYYY-MM-DD) - opcional
 * @returns {array} - Registros filtrados
 */
export function filtrarPorRangoFecha(registros, campo, desde, hasta) {
  let resultado = registros

  if (desde) {
    const filtroDesde = new Date(desde + 'T00:00:00')
    resultado = resultado.filter((registro) => {
      const fecha = registro[campo] ? new Date(registro[campo].split('T')[0] + 'T00:00:00') : null
      return fecha && fecha >= filtroDesde
    })
  }

  if (hasta) {
    const filtroHasta = new Date(hasta + 'T00:00:00')
    resultado = resultado.filter((registro) => {
      const fecha = registro[campo] ? new Date(registro[campo].split('T')[0] + 'T00:00:00') : null
      return fecha && fecha <= filtroHasta
    })
  }

  return resultado
}
