<template>
  <q-page class="gestion-alertas-page">
    <!-- Encabezado Principal -->
    <div class="page-header q-mb-lg">
      <div class="header-content">
        <q-icon name="notifications_active" color="primary" size="40px" class="q-mr-md" />
        <div class="header-text">
          <h1 class="text-h4 text-weight-bold q-ma-none">Gestión de Alertas SLA</h1>
          <p class="subtitle text-grey-7 q-ma-none q-mt-xs">
            Monitoreo y gestión de alertas de vencimiento de solicitudes.
          </p>
        </div>
      </div>
    </div>

    <!-- Tarjeta de Filtros Avanzados -->
    <q-card flat bordered class="filtros-card q-mb-lg">
      <q-card-section>
        <div class="card-header q-mb-md">
          <q-icon name="filter_list" color="primary" size="24px" class="q-mr-sm" />
          <h2 class="text-h6 text-weight-semibold text-primary q-ma-none">Filtros Avanzados</h2>
        </div>

        <!-- Fila 1: Búsqueda y Acciones Principales -->
        <div class="filtros-fila-1 q-mb-lg">
          <!-- Input de Búsqueda (Expandible) -->
          <q-input
            outlined
            v-model="filtros.busqueda"
            placeholder="Buscar por Solicitud, Mensaje..."
            dense
            class="search-input-expandible"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>

          <!-- Botones de Acción -->
          <div class="acciones-buttons">
            <q-btn
              unelevated
              color="grey-8"
              text-color="white"
              icon="clear"
              label="Limpiar Filtros"
              @click="limpiarFiltros"
              no-caps
              class="btn-limpiar-nuevo"
            />
            <q-btn
              outline
              color="primary"
              icon="file_download"
              label="Exportar"
              @click="exportarDatos"
              no-caps
              class="btn-exportar-nuevo"
            />
          </div>
        </div>

        <!-- Fila 2: Selectores de Rango y Categoría (Grid 6 columnas) -->
        <div class="filtros-fila-2">
          <!-- Mes Inicio -->
          <q-select
            outlined
            v-model="filtros.mesInicio"
            :options="opcionesMeses"
            label="Mes Inicio"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Mes Fin -->
          <q-select
            outlined
            v-model="filtros.mesFin"
            :options="opcionesMeses"
            label="Mes Fin"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Año Inicio -->
          <q-select
            outlined
            v-model="filtros.anioInicio"
            :options="opcionesAnios"
            label="Año Inicio"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Año Fin -->
          <q-select
            outlined
            v-model="filtros.anioFin"
            :options="opcionesAnios"
            label="Año Fin"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Tipo SLA -->
          <q-select
            outlined
            v-model="filtros.tipoSla"
            :options="opcionesTipoSla"
            label="Tipo SLA"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Roles/Áreas -->
          <q-select
            outlined
            v-model="filtros.rolResponsable"
            :options="opcionesRoles"
            label="Roles/Áreas"
            dense
            class="filtro-select-nuevo"
          >
            <template v-slot:prepend>
              <q-icon name="groups" color="grey-6" size="20px" />
            </template>
          </q-select>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tarjeta de Tabla de Datos -->
    <q-card flat bordered class="tabla-card">
      <q-card-section>
        <div class="tabla-header q-mb-md">
          <h3 class="text-h6 text-weight-semibold q-ma-none">
            Alertas Activas ({{ alertasFiltradas.length }})
          </h3>
          <q-badge
            v-if="alertasCriticas > 0"
            color="orange-2"
            text-color="orange-9"
            class="badge-criticas"
          >
            {{ alertasCriticas }} Críticas
          </q-badge>
        </div>

        <!-- Tabla Principal -->
        <div class="table-responsive">
          <q-table
            flat
            :rows="alertasFiltradas"
            :columns="columns"
            row-key="idAlerta"
            :loading="store.loading"
            :pagination="pagination"
            hide-pagination
            class="alertas-table-custom"
          >
            <!-- Columna Solicitud -->
            <template v-slot:body-cell-solicitud="props">
              <q-td :props="props">
                <div class="solicitud-cell">
                  <div class="text-weight-bold text-primary text-body2">
                    {{ formatSolicitud(props.row.solicitud?.idSolicitud) }}
                  </div>
                  <div class="text-grey-7 text-caption solicitud-descripcion">
                    {{ props.row.solicitud?.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Columna Responsable con Avatar -->
            <template v-slot:body-cell-responsable="props">
              <q-td :props="props">
                <div class="responsable-cell">
                  <q-avatar size="36px" color="primary" text-color="white" class="q-mr-sm">
                    {{ getIniciales(props.row.solicitud?.rolRegistro?.nombreRol) }}
                  </q-avatar>
                  <span class="responsable-nombre">
                    {{ props.row.solicitud?.rolRegistro?.nombreRol || 'Sin Asignar' }}
                  </span>
                </div>
              </q-td>
            </template>

            <!-- Columna SLA -->
            <template v-slot:body-cell-sla="props">
              <q-td :props="props">
                <q-badge
                  outline
                  color="primary"
                  :label="props.row.solicitud?.configSla?.nombreSla || 'N/A'"
                  class="badge-sla"
                />
              </q-td>
            </template>

            <!-- Columna Línea de Tiempo -->
            <template v-slot:body-cell-lineaTiempo="props">
              <q-td :props="props">
                <div class="timeline-container">
                  <!-- Barra de progreso: Limitar visualmente a 100% -->
                  <q-linear-progress
                    :value="getProgreso(props.row)"
                    :color="getColorProgresoFromBackend(props.row)"
                    size="10px"
                    rounded
                    class="q-mb-xs"
                  />
                  <!-- Texto: Mostrar porcentaje real (puede ser > 100%) -->
                  <div class="timeline-info">
                    <span class="timeline-text text-grey-7">
                      {{ getPorcentajeProgresoTexto(props.row) }} completado
                    </span>
                    <span class="timeline-text text-grey-6">
                      Umbral: {{ props.row.solicitud?.configSla?.diasUmbral || 0 }} días
                    </span>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Columna Días Restantes -->
            <template v-slot:body-cell-diasRestantes="props">
              <q-td :props="props">
                <div class="dias-restantes-cell">
                  <!-- Badge con sistema de semáforos -->
                  <q-badge
                    :style="{
                      backgroundColor: getSlaStatus(props.row).colorBg,
                      color: getSlaStatus(props.row).colorText,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                    }"
                  >
                    {{ getSlaStatus(props.row).texto }}
                  </q-badge>
                  <!-- Número de días (solo si no está vencido) -->
                  <span
                    v-if="getDiasRestantesFromBackend(props.row) >= 0"
                    class="dias-numero-detalle text-grey-7"
                  >
                    {{ getDiasRestantesFromBackend(props.row) }} días restantes
                  </span>
                  <span v-else class="dias-numero-detalle text-negative">
                    {{ Math.abs(getDiasRestantesFromBackend(props.row)) }} días de retraso
                  </span>
                </div>
              </q-td>
            </template>

            <!-- Columna Estado -->
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.estado === 'NUEVA' ? 'red-2' : 'green-2'"
                  :text-color="props.row.estado === 'NUEVA' ? 'red-9' : 'green-9'"
                  :label="props.row.estado === 'NUEVA' ? 'Nueva' : 'Leída'"
                  class="badge-estado"
                />
              </q-td>
            </template>

            <!-- Columna Acciones -->
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <div class="acciones-cell">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="grey-7"
                    size="sm"
                    @click.stop="verDetalle(props.row)"
                  >
                    <q-tooltip>Ver</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="email"
                    color="grey-7"
                    size="sm"
                    @click.stop="abrirModalEmail(props.row)"
                  >
                    <q-tooltip>Enviar Email</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="grey-7"
                    size="sm"
                    @click.stop="confirmarEliminar(props.row)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <!-- Sin datos -->
            <template v-slot:no-data>
              <div class="empty-state">
                <q-icon name="notifications_none" size="64px" color="grey-5" />
                <p class="text-h6 text-grey-6 q-mt-md">No hay alertas que mostrar</p>
              </div>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modal de Notificación por Email -->
    <ModalNotificarEmail
      v-model="modalEmailVisible"
      :alerta="alertaSeleccionada"
      @notificacion-enviada="handleNotificacionEnviada"
    />
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAlertaStore } from 'stores/useAlertaStore'
import ModalNotificarEmail from 'components/Alertas/ModalNotificarEmail.vue'

const $q = useQuasar()
const store = useAlertaStore()

// Estado de Filtros (vacíos al inicio)
const filtros = ref({
  busqueda: '',
  mesInicio: null,
  mesFin: null,
  anioInicio: null,
  anioFin: null,
  tipoSla: null,
  rolResponsable: null,
})

// Opciones para los selectores
const opcionesMeses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const opcionesAnios = ['2023', '2024', '2025', '2026']

const opcionesTipoSla = ['Todos los SLA', 'SLA1', 'SLA2', 'SLA3']

const opcionesRoles = [
  'Todos los roles',
  'Desarrollador .NET',
  'Analista',
  'Project Manager',
  'QA Tester',
]

// Estado del modal de email
const modalEmailVisible = ref(false)
const alertaSeleccionada = ref(null)

// Configuración de paginación inicial
const pagination = ref({
  sortBy: 'fechaSolicitud',
  descending: true,
  page: 1,
  rowsPerPage: 25,
})

/**
 * Definición de columnas para la tabla
 */
const columns = [
  {
    name: 'solicitud',
    label: 'Solicitud',
    align: 'left',
    sortable: true,
  },
  {
    name: 'responsable',
    label: 'Responsable',
    align: 'left',
    sortable: true,
  },
  {
    name: 'sla',
    label: 'SLA',
    align: 'center',
    sortable: false,
  },
  {
    name: 'lineaTiempo',
    label: 'Línea de Tiempo',
    align: 'left',
    sortable: false,
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
  },
]

/**
 * Alertas filtradas según criterios
 */
const alertasFiltradas = computed(() => {
  let resultado = store.alertas

  // Filtro de búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter((alerta) => {
      const solicitud = formatSolicitud(alerta.solicitud?.idSolicitud).toLowerCase()
      const mensaje = (alerta.mensaje || '').toLowerCase()
      const rol = (alerta.solicitud?.rolRegistro?.nombreRol || '').toLowerCase()
      return solicitud.includes(busqueda) || mensaje.includes(busqueda) || rol.includes(busqueda)
    })
  }

  // Filtro de SLA (solo si está seleccionado)
  if (filtros.value.tipoSla && filtros.value.tipoSla !== 'Todos los SLA') {
    resultado = resultado.filter(
      (alerta) => alerta.solicitud?.configSla?.codigoSla === filtros.value.tipoSla,
    )
  }

  // Filtro de Rol (solo si está seleccionado)
  if (filtros.value.rolResponsable && filtros.value.rolResponsable !== 'Todos los roles') {
    resultado = resultado.filter(
      (alerta) => alerta.solicitud?.rolRegistro?.nombreRol === filtros.value.rolResponsable,
    )
  }

  return resultado
})

/**
 * Alertas críticas (días restantes < 0 o <= 2)
 */
const alertasCriticas = computed(() => {
  return alertasFiltradas.value.filter((alerta) => {
    const dias = getDiasRestantesFromBackend(alerta)
    return dias < 0 || dias <= 2
  }).length
})

/**
 * Formatea ID de solicitud como Sol-{id}
 */
const formatSolicitud = (id) => {
  return id ? `Sol-${id}` : 'N/A'
}

/**
 * Obtiene iniciales de un nombre
 */
const getIniciales = (nombre) => {
  if (!nombre) return '?'
  const palabras = nombre.split(' ')
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase()
  return (palabras[0][0] + palabras[1][0]).toUpperCase()
}

/**
 * Calcula días transcurridos desde fechaSolicitud hasta hoy
 */
const calcularDiasTranscurridos = (fechaStr) => {
  if (!fechaStr) return 0
  const fechaSolicitud = new Date(fechaStr)
  const hoy = new Date()
  const diferenciaMilisegundos = hoy - fechaSolicitud
  const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24))
  return diasTranscurridos
}

/**
 * Obtiene diasRestantes desde el backend (ya viene calculado)
 */
const getDiasRestantesFromBackend = (row) => {
  // El backend ya envía diasRestantes calculado
  return row.diasRestantes ?? 0
}

/**
 * Sistema de Semáforos: Determina estado visual basado en diasRestantes
 * Retorna objeto con: clase CSS, color, texto, y estado
 */
const getSlaStatus = (alerta) => {
  const dias = getDiasRestantesFromBackend(alerta)

  if (dias < 0) {
    return {
      clase: 'bg-danger',
      color: 'negative',
      colorBg: '#fee2e2',
      colorText: '#dc2626',
      texto: 'VENCIDO',
      estado: 'vencido',
    }
  } else if (dias <= 2) {
    return {
      clase: 'bg-warning',
      color: 'warning',
      colorBg: '#fef3c7',
      colorText: '#d97706',
      texto: 'Crítico',
      estado: 'critico',
    }
  } else if (dias <= 5) {
    return {
      clase: 'bg-orange',
      color: 'orange',
      colorBg: '#ffedd5',
      colorText: '#ea580c',
      texto: 'Riesgo',
      estado: 'riesgo',
    }
  } else {
    return {
      clase: 'bg-success',
      color: 'positive',
      colorBg: '#d1fae5',
      colorText: '#10b981',
      texto: 'En tiempo',
      estado: 'normal',
    }
  }
}

/**
 * Obtiene progreso para barra (0-1)
 * Usa porcentajeProgreso del backend si está disponible
 * IMPORTANTE: Limita visualmente a 100% pero muestra el valor real en texto
 */
const getProgreso = (row) => {
  // Usar porcentajeProgreso del backend si existe
  if (row.porcentajeProgreso !== undefined && row.porcentajeProgreso !== null) {
    // Limitar a 100% para la barra visual (no romper layout)
    return Math.min(row.porcentajeProgreso, 100) / 100
  }
  // Fallback: calcular basado en días
  const umbral = row.solicitud?.configSla?.diasUmbral || 1
  const transcurridos = calcularDiasTranscurridos(row.solicitud?.fechaSolicitud)
  const progreso = transcurridos / umbral
  return Math.min(progreso, 1)
}

/**
 * Obtiene el porcentaje de progreso como número (puede ser > 100%)
 */
const getPorcentajeProgresoTexto = (row) => {
  if (row.porcentajeProgreso !== undefined && row.porcentajeProgreso !== null) {
    return row.porcentajeProgreso.toFixed(0) + '%'
  }
  // Fallback
  const progreso = getProgreso(row) * 100
  return progreso.toFixed(0) + '%'
}

/**
 * Determina color basado en sistema de semáforos
 */
const getColorProgresoFromBackend = (row) => {
  const status = getSlaStatus(row)
  return status.color
}

/**
 * Limpia todos los filtros
 */
const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    mesInicio: null,
    mesFin: null,
    anioInicio: null,
    anioFin: null,
    tipoSla: null,
    rolResponsable: null,
  }
}

/**
 * Exporta datos a Excel
 */
const exportarDatos = () => {
  try {
    // Preparar datos para exportación
    const datosExportar = alertasFiltradas.value.map((alerta) => ({
      Solicitud: formatSolicitud(alerta.solicitud?.idSolicitud),
      Responsable: alerta.solicitud?.rolRegistro?.nombreRol || 'Sin Asignar',
      SLA: alerta.solicitud?.configSla?.nombreSla || 'N/A',
      Nivel: alerta.nivel || 'N/A',
      'Días Transcurridos': calcularDiasTranscurridos(alerta.solicitud?.fechaSolicitud),
      'Días Restantes': getDiasRestantesFromBackend(alerta),
      'Umbral (días)': alerta.solicitud?.configSla?.diasUmbral || 0,
      Estado: alerta.estado || 'Pendiente',
      Mensaje: alerta.mensaje || '',
      'Fecha Solicitud': alerta.solicitud?.fechaSolicitud
        ? new Date(alerta.solicitud.fechaSolicitud).toLocaleDateString('es-ES')
        : 'N/A',
      'Fecha Registro': alerta.fechaRegistro
        ? new Date(alerta.fechaRegistro).toLocaleDateString('es-ES')
        : 'N/A',
    }))

    // Crear CSV
    const headers = Object.keys(datosExportar[0] || {})
    const csvContent = [
      headers.join(','),
      ...datosExportar.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
    ].join('\n')

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const fecha = new Date().toISOString().split('T')[0]

    link.setAttribute('href', url)
    link.setAttribute('download', `Alertas_SLA_${fecha}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    $q.notify({
      type: 'positive',
      message: `${datosExportar.length} alertas exportadas exitosamente`,
      position: 'top-right',
      icon: 'file_download',
    })
  } catch (error) {
    console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar datos',
      position: 'top-right',
    })
  }
}

/**
 * Abre modal de notificación por email
 */
const abrirModalEmail = (row) => {
  console.log('Abrir modal email para:', row)
  alertaSeleccionada.value = row
  modalEmailVisible.value = true
}

/**
 * Maneja evento de notificación enviada
 */
const handleNotificacionEnviada = (data) => {
  console.log('Notificación enviada:', data)
}

/**
 * Acción Ver Detalle
 */
const verDetalle = (row) => {
  $q.notify({
    type: 'info',
    message: `Ver detalle de alerta ${row.idAlerta}`,
    position: 'top-right',
  })
  console.log('Ver detalle:', row)
}

/**
 * Acción Eliminar con confirmación
 */
const confirmarEliminar = (row) => {
  console.log('Click en eliminar, row:', row)

  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar esta alerta?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    persistent: true,
  })
    .onOk(async () => {
      console.log('Usuario confirmó eliminación')
      try {
        await store.eliminarAlerta(row.idAlerta)
        $q.notify({
          type: 'positive',
          message: 'Alerta eliminada',
          position: 'top-right',
        })
      } catch (error) {
        console.error('Error al eliminar:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar',
          position: 'top-right',
        })
      }
    })
    .onCancel(() => {
      console.log('Usuario canceló eliminación')
    })
}

// Cargar alertas al montar el componente
onMounted(() => {
  store.fetchAlertas()
})
</script>

<style scoped>
.gestion-alertas-page {
  padding: 24px;
  background: #f5f7fa;
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

/* ===== TARJETAS ===== */
.filtros-card,
.tabla-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

/* ===== FILTROS REDISEÑADOS ===== */

/* Fila 1: Búsqueda y Acciones */
.filtros-fila-1 {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.search-input-expandible {
  flex: 1;
}

.search-input-expandible :deep(.q-field__control) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.search-input-expandible :deep(.q-field__native) {
  color: #374151;
}

.acciones-buttons {
  display: flex;
  gap: 12px;
}

.btn-limpiar-nuevo {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  padding: 0 20px;
}

.btn-exportar-nuevo {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  padding: 0 20px;
  border-width: 2px;
}

/* Fila 2: Grid de 6 columnas */
.filtros-fila-2 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.filtro-select-nuevo {
  min-width: 0;
}

.filtro-select-nuevo :deep(.q-field__control) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  height: 40px;
}

.filtro-select-nuevo :deep(.q-field__native) {
  color: #374151;
  font-size: 14px;
}

.filtro-select-nuevo :deep(.q-field__label) {
  color: #6b7280;
  font-size: 13px;
}

.filtro-select-nuevo :deep(.q-field__prepend) {
  padding-right: 8px;
}

.filtro-select-nuevo :deep(.q-field__control::before) {
  border: none;
}

/* ===== FILTROS LEGACY (ELIMINAR SI NO SE USA) ===== */
.filtros-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 2;
}

.filter-select {
  flex: 1;
  min-width: 150px;
}

.date-input {
  flex: 1;
}

.btn-exportar,
.btn-limpiar {
  text-transform: none;
  font-weight: 500;
  white-space: nowrap;
}

/* ===== TABLA ===== */
.tabla-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.badge-criticas {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.table-responsive {
  overflow-x: auto;
}

.alertas-table-custom {
  border-radius: 8px;
}

.alertas-table-custom :deep(thead tr) {
  background: #f8fafc;
}

.alertas-table-custom :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alertas-table-custom :deep(tbody tr) {
  border-bottom: 1px solid #f1f5f9;
}

.alertas-table-custom :deep(tbody tr:hover) {
  background: #f8fafc;
}

/* ===== CELDAS ESPECÍFICAS ===== */
.solicitud-cell {
  max-width: 300px;
}

.solicitud-descripcion {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
  display: block;
  margin-top: 4px;
}

.responsable-cell {
  display: flex;
  align-items: center;
}

.responsable-nombre {
  color: #475569;
  font-size: 13px;
}

.badge-sla {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Línea de Tiempo */
.timeline-container {
  min-width: 200px;
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.timeline-text {
  font-size: 11px;
  font-weight: 500;
}

/* Días Restantes */
.dias-restantes-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.dias-numero-detalle {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

/* Clases de semáforo (por si se necesitan globales) */
.bg-danger {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

.bg-warning {
  background-color: #fef3c7 !important;
  color: #d97706 !important;
}

.bg-orange {
  background-color: #ffedd5 !important;
  color: #ea580c !important;
}

.bg-success {
  background-color: #d1fae5 !important;
  color: #10b981 !important;
}

.dias-umbral {
  font-size: 11px;
  margin-top: 4px;
}

/* Estados */
.badge-estado {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Acciones */
.acciones-cell {
  display: flex;
  justify-content: center;
  gap: 4px;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* Responsive */
@media (max-width: 1400px) {
  .filtros-fila-2 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .filtros-fila-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filtros-fila-1 {
    flex-direction: column;
  }

  .search-input-expandible,
  .acciones-buttons {
    width: 100%;
  }

  .acciones-buttons {
    flex-direction: column;
  }

  .acciones-buttons .q-btn {
    width: 100%;
  }

  .filtros-fila-2 {
    grid-template-columns: 1fr;
  }
}
</style>
