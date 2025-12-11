<template>
  <q-page class="gestion-alertas-page">
    <!-- Indicador de Carga Global -->
    <q-inner-loading :showing="isLoading" class="loading-overlay">
      <div class="loading-content">
        <q-spinner-hourglass size="50px" color="primary" />
        <div class="loading-text q-mt-md">
          <div class="text-h6 text-weight-bold">{{ mensajeCarga }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">Por favor espera...</div>
        </div>
      </div>
    </q-inner-loading>

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

        <!-- Fila 2: Selectores de Filtros -->
        <div class="filtros-fila-2">
          <!-- Tipo SLA -->
          <q-select
            outlined
            v-model="filtros.tipoSla"
            :options="opcionesTipoSla"
            label="Tipo SLA"
            dense
            class="filtro-select-nuevo"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="category" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Roles/Áreas -->
          <q-select
            outlined
            v-model="filtros.rolResponsable"
            :options="opcionesRoles.map((r) => r.nombre)"
            label="Roles/Áreas"
            dense
            class="filtro-select-nuevo"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="groups" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Nivel -->
          <q-select
            outlined
            v-model="filtros.nivel"
            :options="opcionesNivel"
            label="Nivel"
            dense
            class="filtro-select-nuevo"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="priority_high" color="grey-6" size="20px" />
            </template>
          </q-select>

          <!-- Estado Tiempo -->
          <q-select
            outlined
            v-model="filtros.estadoTiempo"
            :options="opcionesEstadoTiempo"
            label="Estado Tiempo"
            dense
            class="filtro-select-nuevo"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="schedule" color="grey-6" size="20px" />
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
            :loading="isLoading"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 25, 50, 100]"
            class="alertas-table-custom"
          >
            <!-- Columna Solicitud -->
            <template v-slot:body-cell-solicitud="props">
              <q-td :props="props">
                <div class="solicitud-cell">
                  <div class="text-weight-bold text-primary text-body2">
                    {{ props.row.codigoSolicitud || 'N/A' }}
                  </div>
                  <div class="text-grey-7 text-caption solicitud-descripcion">
                    {{ props.row.mensaje || 'Sin mensaje' }}
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Columna Responsable con Avatar -->
            <template v-slot:body-cell-responsable="props">
              <q-td :props="props">
                <div class="responsable-cell">
                  <q-avatar size="36px" color="primary" text-color="white" class="q-mr-sm">
                    {{ getIniciales(props.row.nombreResponsable) }}
                  </q-avatar>
                  <span class="responsable-nombre">
                    {{ props.row.nombreResponsable || 'Sin Asignar' }}
                  </span>
                </div>
              </q-td>
            </template>

            <!-- Columna Rol -->
            <template v-slot:body-cell-rol="props">
              <q-td :props="props">
                <q-badge
                  color="blue-grey-2"
                  text-color="blue-grey-8"
                  :label="props.row.nombreRol || 'Sin Rol'"
                  class="badge-rol"
                />
              </q-td>
            </template>

            <!-- Columna SLA -->
            <template v-slot:body-cell-sla="props">
              <q-td :props="props">
                <q-badge
                  outline
                  color="primary"
                  :label="props.row.codigoSla || 'N/A'"
                  class="badge-sla"
                >
                  <q-tooltip v-if="props.row.nombreSla">
                    {{ props.row.nombreSla }}
                  </q-tooltip>
                </q-badge>
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
                      Umbral: {{ props.row.diasUmbral || 0 }} días
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
                  <span v-if="props.row.diasRestantes >= 0" class="dias-numero-detalle text-grey-7">
                    {{ props.row.diasRestantes }} días restantes
                  </span>
                  <span v-else class="dias-numero-detalle text-negative">
                    {{ Math.abs(props.row.diasRestantes) }} días de retraso
                  </span>
                </div>
              </q-td>
            </template>

            <!-- Columna Estado -->
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.estado === 'LEIDA' ? 'green-2' : 'red-2'"
                  :text-color="props.row.estado === 'LEIDA' ? 'green-9' : 'red-9'"
                  :label="props.row.estado === 'LEIDA' ? 'Leída' : 'No Leída'"
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
                    @click.stop="eliminarAlerta(props.row.idAlerta)"
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

            <!-- Paginación personalizada -->
            <template v-slot:bottom>
              <div class="pagination-container full-width row justify-between items-center q-pa-md">
                <div class="pagination-info text-body2 text-grey-7">
                  Mostrando {{ paginacionInicio }} - {{ paginacionFin }} de
                  {{ alertasFiltradas.length }} alertas
                </div>
                <div class="pagination-controls row items-center q-gutter-sm">
                  <span class="text-body2 text-grey-7">Filas por página:</span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="[10, 25, 50, 100]"
                    dense
                    outlined
                    style="width: 80px"
                    class="rows-per-page-select"
                  />
                  <q-pagination
                    v-model="pagination.page"
                    :max="paginasTotales"
                    :max-pages="7"
                    direction-links
                    boundary-links
                    color="primary"
                    active-color="primary"
                    class="custom-pagination"
                  />
                </div>
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
import { onMounted, ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import ModalNotificarEmail from 'components/Alertas/ModalNotificarEmail.vue'

const $q = useQuasar()

// Estado local de alertas (ya no usamos store)
const alertas = ref([])
const isLoading = ref(false)
const mensajeCarga = ref('Cargando alertas...')

// Estado de Filtros con valores por defecto
const filtros = ref({
  busqueda: '',
  tipoSla: null,
  rolResponsable: null,
  nivel: null,
  estadoTiempo: 'VIGENTE', // Default: VIGENTE
})

// Opciones para los filtros
const opcionesNivel = ['CRITICO', 'MEDIO', 'BAJO']
const opcionesEstadoTiempo = ['VIGENTE', 'VENCIDO']

// Opciones de SLAs y Roles dinámicas desde el backend
const opcionesSlas = ref([])
const opcionesRoles = ref([])

// Opciones Legacy (mantener si se usa en la UI)
const opcionesTipoSla = computed(() => {
  return opcionesSlas.value.map((s) => s.nombre)
})

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
    name: 'rol',
    label: 'Rol',
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
  let resultado = alertas.value

  // Filtro de búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter((alerta) => {
      const solicitud = (alerta.codigoSolicitud || '').toLowerCase()
      const mensaje = (alerta.mensaje || '').toLowerCase()
      const responsable = (alerta.nombreResponsable || '').toLowerCase()
      return (
        solicitud.includes(busqueda) || mensaje.includes(busqueda) || responsable.includes(busqueda)
      )
    })
  }

  // Filtro de SLA (solo si está seleccionado) - usar nombreSla o codigoSla
  if (filtros.value.tipoSla && filtros.value.tipoSla !== 'Todos los SLA') {
    resultado = resultado.filter(
      (alerta) =>
        alerta.nombreSla === filtros.value.tipoSla || alerta.codigoSla === filtros.value.tipoSla,
    )
  }

  // Filtro de Rol (solo si está seleccionado)
  if (filtros.value.rolResponsable && filtros.value.rolResponsable !== 'Todos los roles') {
    resultado = resultado.filter((alerta) => alerta.nombreRol === filtros.value.rolResponsable)
  }

  return resultado
})

/**
 * Alertas críticas (días restantes < 0 o <= 2)
 */
const alertasCriticas = computed(() => {
  return alertasFiltradas.value.filter((alerta) => {
    return alerta.diasRestantes < 0 || alerta.diasRestantes <= 2
  }).length
})

/**
 * Número total de páginas
 */
const paginasTotales = computed(() => {
  return Math.ceil(alertasFiltradas.value.length / pagination.value.rowsPerPage)
})

/**
 * Índice de inicio para la paginación
 */
const paginacionInicio = computed(() => {
  return (pagination.value.page - 1) * pagination.value.rowsPerPage + 1
})

/**
 * Índice de fin para la paginación
 */
const paginacionFin = computed(() => {
  const fin = pagination.value.page * pagination.value.rowsPerPage
  return Math.min(fin, alertasFiltradas.value.length)
})

/**
 * Obtiene iniciales de un nombre
 */
const getIniciales = (nombre) => {
  if (!nombre) return '?'
  const palabras = nombre
    .trim()
    .split(' ')
    .filter((p) => p.length > 0)
  if (palabras.length === 0) return '?'
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase()
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
}

/**
 * Sistema de Semáforos: Usa flags del backend (estaVencida, esCritica, colorEstado)
 * Retorna objeto con: clase CSS, color, texto, y estado
 */
const getSlaStatus = (alerta) => {
  const dias = alerta.diasRestantes ?? 0

  // Priorizar flags del backend si existen
  if (alerta.estaVencida || dias < 0) {
    return {
      clase: 'bg-danger',
      color: 'negative',
      colorBg: alerta.colorEstado || '#fee2e2',
      colorText: '#dc2626',
      texto: 'VENCIDO',
      estado: 'vencido',
    }
  } else if (alerta.esCritica || dias <= 2) {
    return {
      clase: 'bg-warning',
      color: 'warning',
      colorBg: alerta.colorEstado || '#fef3c7',
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
 * IMPORTANTE: Limita visualmente a 100%
 */
const getProgreso = (alerta) => {
  const porcentaje = alerta.porcentajeProgreso ?? 0
  // Limitar a 100% para la barra visual (no romper layout)
  return Math.min(porcentaje, 100) / 100
}

/**
 * Obtiene el porcentaje de progreso como número (puede ser > 100%)
 */
const getPorcentajeProgresoTexto = (alerta) => {
  const porcentaje = alerta.porcentajeProgreso ?? 0
  return porcentaje.toFixed(0) + '%'
}

/**
 * Determina color basado en sistema de semáforos
 */
const getColorProgresoFromBackend = (alerta) => {
  const status = getSlaStatus(alerta)
  return status.color
}

/**
 * Limpia todos los filtros y recarga las alertas
 * Resetea búsqueda y filtros estáticos a sus valores por defecto
 */
const limpiarFiltros = () => {
  // Resetear todos los filtros a sus valores por defecto
  filtros.value = {
    busqueda: '', // Limpiar búsqueda
    tipoSla: null, // Limpiar SLA
    rolResponsable: null, // Limpiar Rol
    nivel: null, // Limpiar nivel
    estadoTiempo: 'VIGENTE', // Default: VIGENTE
  }

  // Recargar alertas con los filtros actualizados
  cargarAlertas()
}

/**
 * Exporta datos a Excel
 */
const exportarDatos = () => {
  try {
    // Preparar datos para exportación usando campos del backend
    const datosExportar = alertasFiltradas.value.map((alerta) => ({
      Solicitud: alerta.codigoSolicitud || 'N/A',
      Responsable: alerta.nombreResponsable || 'Sin Asignar',
      Email: alerta.emailResponsable || 'Sin email',
      Rol: alerta.nombreRol || 'N/A',
      SLA: alerta.nombreSla || alerta.codigoSla || 'N/A',
      'Umbral (días)': alerta.diasUmbral || 0,
      Nivel: alerta.nivel || 'N/A',
      'Días Restantes': alerta.diasRestantes ?? 0,
      'Porcentaje Progreso': (alerta.porcentajeProgreso ?? 0).toFixed(2) + '%',
      'Estado Alerta': alerta.estado || 'ACTIVA',
      'Estado Solicitud': alerta.estadoSolicitud || 'N/A',
      'Estado SLA': alerta.estadoCumplimientoSla || 'N/A',
      Vencida: alerta.estaVencida ? 'SÍ' : 'NO',
      Crítica: alerta.esCritica ? 'SÍ' : 'NO',
      Mensaje: alerta.mensaje || '',
      'Fecha Solicitud': alerta.fechaSolicitud
        ? new Date(alerta.fechaSolicitud).toLocaleDateString('es-ES')
        : 'N/A',
      'Fecha Ingreso': alerta.fechaIngreso
        ? new Date(alerta.fechaIngreso).toLocaleDateString('es-ES')
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
    // console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar datos',
      position: 'top-right',
    })
  }
}

/**
 * Abre modal de notificación por email
 * CRÍTICO: Pre-llena el campo destinatario con emailResponsable
 */
const abrirModalEmail = (alerta) => {
  // console.log('📧 Abrir modal email para:', alerta)
  // console.log('📧 codigoSolicitud:', alerta.codigoSolicitud)
  // console.log('📧 emailResponsable:', alerta.emailResponsable)
  // console.log('📧 nombreResponsable:', alerta.nombreResponsable)

  alertaSeleccionada.value = alerta
  modalEmailVisible.value = true

  // console.log('📧 Modal visible:', modalEmailVisible.value)
  // console.log('📧 Alerta seleccionada:', alertaSeleccionada.value)
}

/**
 * Maneja evento de notificación enviada
 */
const handleNotificacionEnviada = (_data) => {
  // console.log('✅ Notificación enviada exitosamente:', _data)

  // Recargar datos para reflejar cambios
  cargarAlertas()
}

/**
 * Acción Ver Detalle
 * Muestra el mensaje de la alerta y la marca como leída usando PUT /api/alertas/{id}
 */
const verDetalle = async (alerta) => {
  // console.log('👁️ Ver detalle:', alerta.codigoSolicitud)

  // Mostrar mensaje en dialog
  $q.dialog({
    title: `Detalle: ${alerta.codigoSolicitud}`,
    message: alerta.mensaje || 'Sin mensaje disponible',
    html: true,
    ok: {
      label: 'Cerrar',
      color: 'primary',
    },
  })

  // Marcar como LEÍDA (si no está ya leída)
  if (!alerta.esLeida) {
    try {
      // console.log('📝 Marcando alerta como LEÍDA...')
      // console.log('📋 ID Alerta:', alerta.idAlerta)

      // Llamar al endpoint PUT /api/alertas/{id} con el formato que espera el backend
      await api.put(`/api/alertas/${alerta.idAlerta}`, {
        estado: 'LEIDA', // ✅ Backend espera: { "estado": "LEIDA" }
      })

      // Actualizar localmente ambos campos
      alerta.esLeida = true
      alerta.estado = 'LEIDA'

      $q.notify({
        type: 'positive',
        message: 'Alerta marcada como leída',
        position: 'top-right',
        icon: 'check_circle',
        timeout: 1500,
      })

      // console.log('✅ Alerta marcada como leída exitosamente')
    } catch (error) {
      // console.error('❌ Error al marcar como leída:', error)
      // console.error('❌ Detalles:', error.response?.data)

      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al marcar como leída',
        position: 'top-right',
      })
    }
  } else {
    // console.log('ℹ️ Alerta ya está marcada como leída')
  }
}

/**
 * Acción Eliminar con confirmación
 */
const eliminarAlerta = (idAlerta) => {
  // console.log('🗑️ Solicitud de eliminación, ID:', idAlerta)

  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar esta alerta? Esta acción no se puede deshacer.',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      icon: 'delete',
    },
    persistent: true,
  })
    .onOk(async () => {
      // console.log('✅ Usuario confirmó eliminación')

      // Mostrar loading
      const loading = $q.loading.show({
        message: 'Eliminando alerta...',
      })

      try {
        // Llamar al endpoint DELETE - usando /api/alerta/{id} (singular)
        await api.delete(`/api/alerta/${idAlerta}`)

        // Eliminar del array local para refresco inmediato
        const index = alertas.value.findIndex((a) => a.idAlerta === idAlerta)
        if (index !== -1) {
          alertas.value.splice(index, 1)
        }

        $q.notify({
          type: 'positive',
          message: 'Alerta eliminada exitosamente',
          position: 'top-right',
          icon: 'check_circle',
          timeout: 2000,
        })
      } catch (error) {
        // console.error('❌ Error al eliminar:', error)

        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al eliminar la alerta',
          position: 'top-right',
          timeout: 3000,
        })
      } finally {
        loading()
      }
    })
    .onCancel(() => {
      // console.log('❌ Usuario canceló eliminación')
    })
}

/**
 * Carga de selectores (SLAs y Roles) desde el backend
 */
const cargarSelectores = async () => {
  try {
    // console.log('📋 Iniciando carga de selectores...')

    // Cargar roles y SLAs en paralelo
    const [resSlas, resRoles] = await Promise.all([
      api.get('/api/email/slas'),
      api.get('/api/email/roles'),
    ])

    // console.log('📦 Respuesta SLAs:', resSlas.data)
    // console.log('📦 Respuesta Roles:', resRoles.data)

    // Mapear respuestas - el backend devuelve { total: n, slas: [...], roles: [...] }
    const slas = resSlas.data.slas || []
    const roles = resRoles.data.roles || []

    opcionesSlas.value = [
      { id: null, nombre: 'Todos los SLA' },
      ...slas.map((s) => ({
        id: s.id,
        nombre: s.descripcion || s.nombre, // Backend usa 'descripcion'
      })),
    ]

    opcionesRoles.value = [
      { id: null, nombre: 'Todos los roles' },
      ...roles.map((r) => ({
        id: r.id,
        nombre: r.descripcion || r.nombre, // Backend usa 'descripcion'
      })),
    ]

    // console.log('✅ SLAs procesados:', opcionesSlas.value)
    // console.log('✅ Roles procesados:', opcionesRoles.value)
  } catch (error) {
    // console.error('❌ Error cargando selectores:', error)
    // console.error('❌ Detalles:', error.response?.data)
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los filtros de SLA y Roles',
      position: 'top-right',
    })
    // Fallback
    opcionesSlas.value = [{ id: null, nombre: 'Todos los SLA' }]
    opcionesRoles.value = [{ id: null, nombre: 'Todos los roles' }]
  }
}

/**
 * Carga de alertas con filtros dinámicos usando URLSearchParams
 */
const cargarAlertas = async () => {
  isLoading.value = true
  mensajeCarga.value = 'Cargando alertas...'

  try {
    // Construcción de parámetros de consulta
    const params = new URLSearchParams()

    // Búsqueda de texto
    if (filtros.value.busqueda && filtros.value.busqueda.trim()) {
      params.append('busqueda', filtros.value.busqueda.trim())
    }

    // Filtro SLA - obtener el ID desde opcionesSlas
    if (filtros.value.tipoSla && filtros.value.tipoSla !== 'Todos los SLA') {
      const slaSeleccionado = opcionesSlas.value.find((s) => s.nombre === filtros.value.tipoSla)
      if (slaSeleccionado && slaSeleccionado.id) {
        params.append('idSla', slaSeleccionado.id)
      }
    }

    // Filtro Rol - obtener el ID desde opcionesRoles
    if (filtros.value.rolResponsable && filtros.value.rolResponsable !== 'Todos los roles') {
      const rolSeleccionado = opcionesRoles.value.find(
        (r) => r.nombre === filtros.value.rolResponsable,
      )
      if (rolSeleccionado && rolSeleccionado.id) {
        params.append('idRol', rolSeleccionado.id)
      }
    }

    // Filtro Nivel (CRITICO, MEDIO, BAJO)
    if (filtros.value.nivel) {
      params.append('nivel', filtros.value.nivel)
    }

    // Filtro Estado Tiempo (VIGENTE, VENCIDO)
    if (filtros.value.estadoTiempo) {
      params.append('estadoTiempo', filtros.value.estadoTiempo)
    }

    // Construir URL con parámetros
    const queryString = params.toString()
    const url = queryString ? `/api/alertas/dashboard?${queryString}` : '/api/alertas/dashboard'

    // console.log('📊 Cargando dashboard con filtros:', url)
    // console.log('📋 Parámetros:', Object.fromEntries(params))
    // console.log('📋 Parámetros:', Object.fromEntries(params))

    const response = await api.get(url)

    if (response.data && Array.isArray(response.data)) {
      alertas.value = response.data
      // console.log(`✅ ${alertas.value.length} alertas cargadas`)

      $q.notify({
        type: 'positive',
        message: 'Alertas cargadas correctamente',
        caption: `Total: ${alertas.value.length} alertas`,
        position: 'top-right',
        timeout: 2000,
        icon: 'check_circle',
      })
    } else {
      // console.warn('⚠️ Respuesta inválida del backend')
      alertas.value = []
    }
  } catch (error) {
    // console.error('❌ Error al cargar alertas:', error)
    // console.error('Detalles:', {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   message: error.message,
    //   url: error.config?.url,
    // })

    $q.notify({
      type: 'negative',
      message:
        error.response?.status === 404
          ? 'No se encontró el endpoint de alertas'
          : error.response?.status === 401
            ? 'No autorizado - verifica tu sesión'
            : 'Error al cargar las alertas. Verifica que el backend esté corriendo.',
      position: 'top-right',
      timeout: 5000,
      actions: [{ label: 'Cerrar', color: 'white' }],
    })

    alertas.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Watcher para recargar alertas cuando cambien los filtros
 * Incluye debounce para la búsqueda de texto
 */
let searchTimeout = null
watch(
  () => [
    filtros.value.tipoSla,
    filtros.value.rolResponsable,
    filtros.value.nivel,
    filtros.value.estadoTiempo,
    filtros.value.busqueda,
  ],
  (newValues, oldValues) => {
    // Si solo cambió la búsqueda, aplicar debounce de 500ms
    const busquedaCambio = newValues[4] !== oldValues[4]
    const otrosCambios = newValues.slice(0, 4).some((val, idx) => val !== oldValues[idx])

    if (busquedaCambio && !otrosCambios) {
      // Debounce para búsqueda
      if (searchTimeout) clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        cargarAlertas()
      }, 500)
    } else {
      // Recarga inmediata para otros filtros
      if (searchTimeout) clearTimeout(searchTimeout)
      cargarAlertas()
    }
  },
  { deep: true },
)

// Cargar alertas y selectores al montar el componente
onMounted(async () => {
  await cargarSelectores()
  await cargarAlertas()
})
</script>

<style scoped>
.gestion-alertas-page {
  padding: 24px;
  background: #f5f7fa;
  position: relative;
  min-height: 100vh;
}

/* ===== INDICADOR DE CARGA ===== */
.loading-overlay {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-text {
  text-align: center;
  color: #1976d2;
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

/* Fila 2: Grid de 3 columnas en pantallas grandes, adaptable a menores */
.filtros-fila-2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.badge-rol {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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

/* ===== PAGINACIÓN ===== */
.pagination-container {
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-info {
  font-weight: 500;
}

.rows-per-page-select :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
}

.custom-pagination :deep(.q-btn) {
  min-width: 32px;
  height: 32px;
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
