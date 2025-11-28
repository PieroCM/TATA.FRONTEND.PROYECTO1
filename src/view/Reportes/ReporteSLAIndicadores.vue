<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando filtros...</div>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="table_chart" size="40px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-medium">Reporte Indicadores SLA Mensual</div>
              <div class="text-grey-7">
                Aplica filtros, revisa la tabla y el gráfico, y exporta el resultado.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="tune" class="q-mr-sm" />
            Configurar Filtros
          </div>
          <q-separator class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- Selector Mes -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.mes"
                :options="mesesDisponibles"
                label="Mes *"
                outlined
                dense
                :rules="[(val) => !!val || 'El mes es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Selector Año -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.anio"
                :options="aniosDisponibles"
                label="Año *"
                outlined
                dense
                :rules="[(val) => !!val || 'El año es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Dropdown Tipo SLA (por Código SLA) -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.codigoSla"
                :options="tiposSlaDisponibles"
                label="Tipo SLA (Código)"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
                <template v-slot:hint>
                  Opcional - Selecciona un SLA específico (SLA1, SLA2, ...)
                </template>
              </q-select>
            </div>

            <!-- Roles con Dialog (Multi-selección) -->
            <div class="col-12 col-md-3">
              <q-btn
                outline
                :badge="selectedRoles.length > 0 ? selectedRoles.length : undefined"
                @click="dialogRoles = true"
                class="filter-button w-full"
              >
                <q-icon name="people" color="primary" class="q-mr-sm" />
                <span>Roles/Áreas</span>
              </q-btn>
            </div>
          </div>

          <!-- Chips de selección actual -->
          <div v-if="filtrosActivos.length > 0" class="q-mt-md filters-summary">
            <div class="filters-summary-title text-caption q-mb-sm">Filtros aplicados:</div>
            <div class="row q-gutter-sm">
              <q-chip
                v-for="chip in filtrosActivos"
                :key="chip.key"
                color="grey-7"
                text-color="white"
                class="chip-padding"
                :icon="chip.icon"
                :removable="chip.removable"
                @remove="removerFiltro(chip.key)"
              >
                {{ chip.label }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Botones de acción -->
          <div class="row q-gutter-md">
            <q-btn
              color="primary"
              label="Ver reporte"
              icon="search"
              @click="verReporte"
              :loading="loading"
              :disable="!filtros.mes || !filtros.anio || !filtros.codigoSla"
            />
            <q-btn
              outline
              color="grey-7"
              label="Limpiar filtros"
              icon="refresh"
              @click="limpiarFiltros"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Resultados -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="assessment" class="q-mr-sm" />
            Resultados del Reporte
          </div>
          <q-separator class="q-mb-md" />

          <!-- Loading -->
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>

          <!-- Sin datos -->
          <div v-if="!loading && !hayReporte" class="text-center q-pa-xl">
            <q-icon name="insert_chart_outlined" size="80px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              Aún no se ha generado ningún reporte con los filtros actuales.
            </div>
            <div class="text-body2 text-grey-6 q-mt-sm">
              Configura los filtros y haz clic en <b>Ver reporte</b> para calcular los indicadores.
            </div>
          </div>

          <!-- Tabla + Gráfico + Botones Export -->
          <div v-else-if="!loading && hayReporte">
            <!-- Contenedor completo del reporte (para PDF) -->
            <div ref="reporteRef">
              <!-- Título del reporte -->
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-bold">
                  {{ tituloReporte }}
                </div>
                <div class="text-caption text-grey-7">
                  Total recursos: <b>{{ resumen.totalRecursos }}</b> | SLA promedio:
                  <b>{{ resumen.promedioSla }}%</b> | Roles incluidos:
                  <b>{{ resumen.rolesIncluidos }}</b>
                </div>
              </div>

              <!-- Tabla de resultados -->
              <q-table
                :rows="filasTabla"
                :columns="columnas"
                row-key="rol"
                flat
                bordered
                class="sla-report-table"
                :pagination="{ rowsPerPage: 10 }"
              >
                <!-- SLA -->
                <template v-slot:body-cell-sla="props">
                  <q-td :props="props">
                    <span v-if="props.row.sla === 'NA'">NA</span>
                    <span v-else>{{ props.row.sla }}%</span>
                  </q-td>
                </template>

                <!-- Indicador (círculo de color) -->
                <template v-slot:body-cell-indicador="props">
                  <q-td :props="props">
                    <q-icon name="circle" :color="getIndicadorColor(props.row)" size="18px">
                      <q-tooltip>
                        {{ getIndicadorTexto(props.row) }}
                      </q-tooltip>
                    </q-icon>
                  </q-td>
                </template>
              </q-table>

              <!-- Gráfico dinámico -->
              <div class="q-mt-xl">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Gráfico de SLA por Rol</div>

                <!-- Leyenda fuera del gráfico -->
                <div class="legend-container q-mb-md">
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: #21ba45"></div>
                    <span>SLA Cumplido (100%)</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: #f60008"></div>
                    <span>SLA Incumplido (&lt;100%)</span>
                  </div>
                </div>

                <div class="chart-wrapper" style="position: relative; width: 100%; height: 500px">
                  <canvas ref="chartCanvasRef" data-chart="sla" style="display: block"></canvas>
                </div>
              </div>
            </div>

            <!-- Botones de exportación -->
            <div class="row q-col-gutter-md q-mt-xl">
              <div class="col-12 col-md-auto">
                <q-btn
                  color="primary"
                  icon="file_download"
                  label="Exportar a Excel"
                  :loading="exportandoExcel"
                  @click="exportarExcel"
                />
              </div>
              <div class="col-12 col-md-auto">
                <q-btn
                  color="primary"
                  icon="picture_as_pdf"
                  label="Exportar a PDF"
                  :loading="exportandoPdf"
                  @click="exportarPdf"
                />
              </div>
              <div class="col-12 col-md-auto">
                <q-btn
                  color="primary"
                  icon="email"
                  label="Enviar por correo"
                  @click="dialogCorreo = true"
                  :disable="!hayReporte"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Diálogo para enviar por correo (componente separado) -->
      <EnviarReporteDialog
        v-model="dialogCorreo"
        :loading="enviandoCorreo"
        @submit="enviarPorCorreo"
      />

      <!-- Dialog para seleccionar Roles -->
      <q-dialog v-model="dialogRoles">
        <q-card style="min-width: 400px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Seleccionar Roles/Áreas</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-md">
            <!-- Opción Todos -->
            <div class="q-mb-md">
              <q-checkbox
                v-model="selectTodos"
                label="Seleccionar todos"
                @update:model-value="toggleTodos"
              />
            </div>

            <q-separator class="q-mb-md" />

            <!-- Lista de roles con scroll -->
            <div
              style="
                max-height: 350px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
              "
            >
              <div v-for="rol in rolesDisponibles" :key="rol" class="role-checkbox-item">
                <q-checkbox v-model="selectedRoles" :val="rol" :label="rol" />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Aplicar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
// npm i jspdf html2canvas
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { useAppStore } from 'stores/app-store'
import EnviarReporteDialog from 'components/Reportes/EnviarReporteDialog.vue'
import LogoPng from 'src/assets/Tata_logo.png'

Chart.register(...registerables, ChartDataLabels)

const $q = useQuasar()
const appStore = useAppStore()

// Persistencia en localStorage
const STORAGE_KEY = 'slaIndicadoresFiltros'

// Estados base
const loading = ref(false)
const exportandoExcel = ref(false)
const exportandoPdf = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)

// Combos
const mesesDisponibles = [
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

const filtros = ref({
  mes: mesesDisponibles[new Date().getMonth()],
  anio: new Date().getFullYear(),
  codigoSla: null, // Código SLA: SLA1, SLA2, etc.
  roles: ['Todos los roles'],
})

const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([]) // [{ label, value: codigoSla }]
const rolesDisponibles = ref([]) // nombres de roles
const selectedRoles = ref([]) // roles seleccionados en el popover
const selectTodos = ref(false) // estado del checkbox "Seleccionar todos"
const dialogRoles = ref(false) // control del dialog de roles

// Datos del reporte
const filasTabla = ref([]) // [{ rol, numRecursos, sla }]
const resumen = ref({
  totalRecursos: 0,
  promedioSla: 0,
  rolesIncluidos: 0,
})
const solicitudesFiltradas = ref([]) // para exportar (ids)

// Chart
const chartCanvasRef = ref(null)
let chartInstance = null

// Para PDF
const reporteRef = ref(null)

// Diálogo correo
const dialogCorreo = ref(false)
const enviandoCorreo = ref(false)

// Emit por compatibilidad
const emit = defineEmits(['onFiltroChange'])

// Utilidad para cargar imágenes como HTMLImageElement (para jsPDF.addImage)
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// Comprimir imagen: reescala y exporta como JPEG con calidad reducida
const compressImage = (img, maxWidth = 400, quality = 0.6) => {
  const ratio = img.naturalWidth / img.naturalHeight || 1
  const targetW = Math.min(img.naturalWidth || maxWidth, maxWidth)
  const targetH = Math.round(targetW / ratio)
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  // Fondo blanco para evitar negro al convertir PNG con transparencia a JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.drawImage(img, 0, 0, targetW, targetH)
  return canvas.toDataURL('image/jpeg', quality)
}

// Columnas de la tabla
const columnas = [
  {
    name: 'rol',
    label: 'ROL',
    field: 'rol',
    align: 'left',
    sortable: true,
  },
  {
    name: 'numRecursos',
    label: 'NUM_RECURSOS',
    field: 'numRecursos',
    align: 'center',
    sortable: true,
  },
  {
    name: 'sla',
    label: 'SLA',
    field: 'sla',
    align: 'center',
    sortable: true,
  },
  {
    name: 'indicador',
    label: 'INDICADOR',
    field: 'indicador',
    align: 'center',
  },
]

// Computeds
const hayReporte = computed(() => filasTabla.value.length > 0)

const filtrosActivos = computed(() => {
  const activos = []

  if (filtros.value.mes && filtros.value.anio) {
    activos.push({
      key: 'periodo',
      label: `${filtros.value.mes} ${filtros.value.anio}`,
      icon: 'event',
      color: 'primary',
      removable: false,
    })
  }

  if (filtros.value.codigoSla) {
    activos.push({
      key: 'codigoSla',
      label: `SLA: ${filtros.value.codigoSla}`,
      icon: 'category',
      color: 'secondary',
      removable: true,
    })
  }

  if (selectedRoles.value && selectedRoles.value.length > 0) {
    const esTodos = selectedRoles.value.length === rolesDisponibles.value.length
    activos.push({
      key: 'roles',
      label: esTodos ? 'Roles: Todos' : `Roles: ${selectedRoles.value.length}`,
      icon: 'people',
      color: 'accent',
      removable: false,
    })
  }

  return activos
})

const tituloReporte = computed(() => {
  const mes = filtros.value.mes ? filtros.value.mes.toUpperCase() : ''
  const anio = filtros.value.anio || ''
  const codigo = filtros.value.codigoSla || 'SLA'

  return `Reporte Indicadores ${codigo} - ${mes}-${anio}`
})

// Auxiliares
const getMesNumero = (nombreMes) => {
  const idx = mesesDisponibles.indexOf(nombreMes)
  return idx >= 0 ? idx + 1 : 1
}

const getIndicadorColor = (row) => {
  // Gris cuando es NA (sin recursos)
  if (row.sla === 'NA') return 'grey-5'
  // Verde cuando es 100%
  if (row.sla === 100) return 'green-custom'
  // Rojo cuando es menor al 100%
  return 'red-custom'
}

const getIndicadorTexto = (row) => {
  if (row.sla === 'NA') return 'Sin recursos (NA)'
  if (row.sla === 100) return 'Cumple 100%'
  return `Incumplimiento (${row.sla}%)`
}

// Función para manejar seleccionar/deseleccionar todos
const toggleTodos = (value) => {
  if (value) {
    // Si se marca "Todos", seleccionar todos los roles
    selectedRoles.value = [...rolesDisponibles.value]
  } else {
    // Si se desmarca "Todos", deseleccionar todos
    selectedRoles.value = []
  }
}

// Actualizar selectTodos cuando cambian selectedRoles
watch(
  selectedRoles,
  (newVal) => {
    selectTodos.value = newVal.length === rolesDisponibles.value.length
  },
  { deep: true },
)

// Cargar combos iniciales
const cargarConfiguracionesIniciales = async () => {
  try {
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla'),
    ])

    // Años disponibles desde Solicitud
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [
        ...new Set(
          solicitudesRes.data
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear()),
        ),
      ].sort((a, b) => b - a)

      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    } else {
      const currentYear = new Date().getFullYear()
      aniosDisponibles.value = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
    }

    // Roles activos
    if (rolesRes.data) {
      const nombresRoles = rolesRes.data.filter((r) => r.esActivo !== false).map((r) => r.nombreRol)
      rolesDisponibles.value = nombresRoles
      // Por defecto, seleccionar todos los roles
      selectedRoles.value = [...nombresRoles]
      selectTodos.value = true
    }

    // Tipos SLA (código SLA)
    if (configSlaRes.data) {
      const activos = configSlaRes.data.filter((c) => c.esActivo)
      const codigos = []
      activos.forEach((c) => {
        if (!codigos.some((x) => x.value === c.codigoSla)) {
          codigos.push({
            label: `${c.codigoSla} - ${c.tipoSolicitud}`,
            value: c.codigoSla,
          })
        }
      })
      tiposSlaDisponibles.value = codigos
    }
  } catch (error) {
    console.error('Error al cargar configuraciones iniciales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar configuraciones de filtros',
      position: 'top-right',
    })
  }
}

// Ver reporte (cálculo en frontend)
const verReporte = async () => {
  if (!filtros.value.mes || !filtros.value.anio) {
    $q.notify({
      type: 'warning',
      message: 'Mes y Año son obligatorios',
      position: 'top-right',
    })
    return
  }

  if (!filtros.value.codigoSla) {
    $q.notify({
      type: 'warning',
      message: 'Tipo SLA es obligatorio',
      position: 'top-right',
    })
    return
  }

  loading.value = true

  try {
    const mesNumero = getMesNumero(filtros.value.mes)

    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla'),
    ])

    let solicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar por mes/año
    // Nota: parseamos la fecha como "YYYY-MM-DD" para evitar problemas de zona horaria
    solicitudes = solicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      // Extraer año y mes directamente del string para evitar problemas de timezone
      const [anioStr, mesStr] = s.fechaSolicitud.split('-')
      const anioFecha = parseInt(anioStr, 10)
      const mesFecha = parseInt(mesStr, 10)
      return anioFecha === filtros.value.anio && mesFecha === mesNumero
    })

    // Filtrar por Código SLA
    if (filtros.value.codigoSla) {
      const configsFiltradas = configsSla.filter((c) => c.codigoSla === filtros.value.codigoSla)
      const idsSla = configsFiltradas.map((c) => c.idSla)
      solicitudes = solicitudes.filter((s) => idsSla.includes(s.idSla))
    }

    // Filtrar por roles seleccionados
    if (selectedRoles.value && selectedRoles.value.length > 0) {
      const rolesIds = todosRoles
        .filter((r) => selectedRoles.value.includes(r.nombreRol))
        .map((r) => r.idRolRegistro)
      solicitudes = solicitudes.filter((s) => rolesIds.includes(s.idRolRegistro))
    }

    // Estados SLA válidos a considerar
    const estadosSlaValidos = ['CUMPLE SLA1', 'NO CUMPLE SLA1', 'CUMPLE SLA2', 'NO CUMPLE SLA2']

    // Filtrar solicitudes que tengan un estado SLA válido
    const solicitudesConEstadoValido = solicitudes.filter(
      (s) => s.estadoCumplimientoSla && estadosSlaValidos.includes(s.estadoCumplimientoSla),
    )

    solicitudesFiltradas.value = solicitudesConEstadoValido

    // Determinar qué roles mostrar en la tabla
    const rolesParaTabla = todosRoles.filter(
      (r) => r.esActivo !== false && selectedRoles.value.includes(r.nombreRol),
    )

    // Construir tabla por rol (solo los roles seleccionados)
    const filas = rolesParaTabla.map((rol) => {
      const solicitudesRol = solicitudesConEstadoValido.filter(
        (s) => s.idRolRegistro === rol.idRolRegistro,
      )
      const total = solicitudesRol.length
      const cumplen = solicitudesRol.filter(
        (s) =>
          s.estadoCumplimientoSla &&
          (s.estadoCumplimientoSla === 'CUMPLE SLA1' || s.estadoCumplimientoSla === 'CUMPLE SLA2'),
      ).length

      let sla
      if (total === 0) {
        // NA cuando no hay solicitudes
        sla = 'NA'
      } else if (cumplen === total) {
        // 100% cuando todas las solicitudes cumplen
        sla = 100
      } else {
        // Calcular porcentaje
        sla = parseFloat(((cumplen / total) * 100).toFixed(2))
      }

      return {
        rol: rol.nombreRol,
        numRecursos: total,
        sla: sla,
      }
    })

    filasTabla.value = filas

    // Resumen
    const rolesConRecursos = filas.filter((f) => f.numRecursos > 0 && f.sla !== 'NA')
    const totalRecursos = rolesConRecursos.reduce((acc, f) => acc + f.numRecursos, 0)
    const promedioSla =
      rolesConRecursos.length > 0
        ? parseFloat(
            (rolesConRecursos.reduce((acc, f) => acc + f.sla, 0) / rolesConRecursos.length).toFixed(
              2,
            ),
          )
        : 0

    resumen.value = {
      totalRecursos,
      promedioSla,
      rolesIncluidos: filas.length,
    }

    // Persistir filtros
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtros.value))

    // Emit por si el padre lo usa
    emit('onFiltroChange', {
      filtros: filtros.value,
      datos: filasTabla.value,
      resumen: resumen.value,
    })
  } catch (error) {
    console.error('Error al calcular reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al calcular el reporte',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading.value = false

    // Crear el gráfico después de que loading sea false y el DOM se actualice
    await nextTick()
    await nextTick()
    try {
      crearGrafico()
    } catch (graficoError) {
      console.error('Error al crear el gráfico:', graficoError)
    }
  }
}

const crearGrafico = () => {
  try {
    console.log('=== INICIANDO crearGrafico ===')

    // Buscar el canvas en el DOM
    const canvasElement = document.querySelector('canvas[data-chart="sla"]')
    console.log('canvasElement encontrado:', !!canvasElement)

    if (!canvasElement) {
      console.log('ERROR: No se encontró el canvas en el DOM')
      return
    }

    if (chartInstance) {
      console.log('Destruyendo gráfico anterior')
      chartInstance.destroy()
    }

    if (!filasTabla.value.length) {
      console.log('ERROR: filasTabla está vacía')
      return
    }

    console.log('Obteniendo contexto del canvas')
    const ctx = canvasElement.getContext('2d')
    console.log('ctx:', !!ctx)

    // Usar directamente todas las filas de la tabla (que ya contiene todos los roles seleccionados)
    const filasConDatos = filasTabla.value

    if (!filasConDatos.length) {
      console.log('ERROR: No hay filas con datos válidos')
      return
    }

    const labels = filasConDatos.map((f) => f.rol)
    // Para datos, mostrar el SLA o 0 si no hay recursos
    const dataBruto = filasConDatos.map((f) => (f.numRecursos > 0 ? f.sla : 0))
    const numRecursos = filasConDatos.map((f) => f.numRecursos)

    // Crear dos datasets: uno para cumplimiento (verde) y otro para incumplimiento (rojo)
    const dataCumple = dataBruto.map((val, idx) => {
      if (filasConDatos[idx].numRecursos === 0) return 0
      return val === 100 ? val : 0
    })

    const dataIncumple = dataBruto.map((val, idx) => {
      if (filasConDatos[idx].numRecursos === 0) return 0
      return val < 100 && val !== 'NA' ? val : 0
    })

    console.log('Creando Chart con datos:', { labels, dataCumple, dataIncumple, numRecursos })

    // Determinar si se debe rotar los labels del eje X
    // Si hay muchos roles (más de 5), rotar 45 grados
    const debeRotar = labels.length > 5
    const maxRotation = debeRotar ? 45 : 0
    const minRotation = debeRotar ? 45 : 0

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'SLA Cumplido (100%)',
            data: dataCumple,
            backgroundColor: '#21ba45',
            borderColor: '#21ba45',
            borderWidth: 2,
            hoverBackgroundColor: '#21ba45',
            hoverBorderColor: '#21ba45',
          },
          {
            label: 'SLA Incumplido (<100%)',
            data: dataIncumple,
            backgroundColor: '#f60008',
            borderColor: '#f60008',
            borderWidth: 2,
            hoverBackgroundColor: '#f60008',
            hoverBorderColor: '#f60008',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            offset: 10,
            font: {
              weight: 'bold',
              size: 12,
            },
            color: '#333',
            formatter: function (value) {
              if (value === 0) return ''
              return value + '%'
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              title: (context) => {
                return `Rol: ${context[0].label}`
              },
              label: (context) => {
                const index = context.dataIndex
                const slaValue = context.parsed.y
                const numSolicitudes = numRecursos[index]
                const tipo = context.dataset.label
                return [`${tipo}: ${slaValue}%`, `Solicitudes: ${numSolicitudes}`]
              },
              afterLabel: () => '',
            },
          },
        },
        layout: {
          padding: {
            top: 40,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Roles/Áreas',
            },
            ticks: {
              maxRotation,
              minRotation,
            },
            stacked: true,
          },
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'SLA (%)',
            },
            ticks: {
              callback: (value) => `${value}%`,
            },
            stacked: true,
          },
        },
      },
    })

    console.log('Chart creado exitosamente')
  } catch (error) {
    console.error('Error en crearGrafico:', error)
    throw error
  }
}

// Limpiar filtros y reporte
const limpiarFiltros = () => {
  filtros.value = {
    mes: mesesDisponibles[new Date().getMonth()],
    anio: new Date().getFullYear(),
    codigoSla: null,
  }

  // Restablecer roles a todos seleccionados
  selectedRoles.value = [...rolesDisponibles.value]
  selectTodos.value = true

  filasTabla.value = []
  resumen.value = { totalRecursos: 0, promedioSla: 0, rolesIncluidos: 0 }
  solicitudesFiltradas.value = []

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  localStorage.removeItem(STORAGE_KEY)

  $q.notify({
    type: 'info',
    message: 'Filtros y resultados restablecidos',
    position: 'top-right',
  })
}

// Remover chip individual
const removerFiltro = (key) => {
  if (key === 'codigoSla') {
    filtros.value.codigoSla = null
  }
}

// Exportar a Excel desde el frontend sin tocar backend
const exportarExcel = async () => {
  if (!filasTabla.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar',
      position: 'top-right',
    })
    return
  }

  exportandoExcel.value = true

  try {
    // Crear un nuevo workbook
    const wb = XLSX.utils.book_new()

    // Preparar datos de la tabla principal
    const datosTabla = filasTabla.value.map((fila) => ({
      ROL: fila.rol,
      NUM_RECURSOS: fila.numRecursos,
      'SLA (%)': fila.sla === 'NA' ? 'NA' : fila.sla,
      INDICADOR: getIndicadorTexto(fila),
    }))

    // Crear hoja de tabla
    const wsTabla = XLSX.utils.json_to_sheet(datosTabla)
    XLSX.utils.book_append_sheet(wb, wsTabla, 'Reporte')

    // Preparar datos del resumen
    const datosResumen = [
      ['RESUMEN DEL REPORTE'],
      [],
      ['Periodo:', `${filtros.value.mes} ${filtros.value.anio}`],
      ['Código SLA:', filtros.value.codigoSla],
      ['Roles Incluidos:', selectedRoles.value.join(', ')],
      [],
      ['INDICADORES CONSOLIDADOS'],
      ['Total Recursos:', resumen.value.totalRecursos],
      ['SLA Promedio:', `${resumen.value.promedioSla}%`],
      ['Roles Únicos:', resumen.value.rolesIncluidos],
      [],
      ['DESGLOSE POR ESTADO SLA'],
    ]

    // Calcular estadísticas
    const cumplimiento = filasTabla.value.filter((f) => f.sla === 100).length
    const incumplimiento = filasTabla.value.filter((f) => f.sla !== 'NA' && f.sla < 100).length
    const sinRecursos = filasTabla.value.filter((f) => f.sla === 'NA').length

    datosResumen.push(
      ['SLA Cumplido (100%):', cumplimiento],
      ['SLA Incumplido (<100%):', incumplimiento],
      ['Sin Recursos (NA):', sinRecursos],
    )

    // Crear hoja de resumen
    const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

    // Preparar datos de solicitudes filtradas
    if (solicitudesFiltradas.value.length > 0) {
      const datosSolicitudes = solicitudesFiltradas.value.map((sol) => ({
        ID: sol.idSolicitud,
        ROL: sol.nombreRol || 'N/A',
        FECHA: sol.fechaSolicitud || 'N/A',
        'ESTADO SLA': sol.estadoCumplimientoSla || 'N/A',
        'TIPO SOLICITUD': sol.tipoSolicitud || 'N/A',
      }))

      const wsSolicitudes = XLSX.utils.json_to_sheet(datosSolicitudes)
      XLSX.utils.book_append_sheet(wb, wsSolicitudes, 'Solicitudes')
    }

    // Generar nombre del archivo
    const fileName = `Reporte_SLA_${filtros.value.codigoSla || 'TODOS'}_${filtros.value.mes}_${
      filtros.value.anio
    }.xlsx`

    // Descargar el archivo
    XLSX.writeFile(wb, fileName)

    $q.notify({
      type: 'positive',
      message: 'Excel exportado exitosamente',
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el archivo Excel',
      position: 'top-right',
      timeout: 5000,
    })
  } finally {
    exportandoExcel.value = false
  }
}

// Exportar a PDF desde el frontend
const exportarPdf = async () => {
  if (!reporteRef.value) {
    $q.notify({
      type: 'warning',
      message: 'No hay contenido para exportar a PDF',
      position: 'top-right',
    })
    return
  }

  exportandoPdf.value = true

  try {
    // Primero, registrar el reporte en el backend
    const ids = solicitudesFiltradas.value.map((s) => s.idSolicitud)

    const payload = {
      tipoReporte: 'SLA_MENSUAL',
      formato: 'PDF',
      idsSolicitudes: ids,
      filtrosJson: JSON.stringify({
        mes: filtros.value.mes,
        anio: filtros.value.anio,
        codigoSla: filtros.value.codigoSla,
      }),
    }

    try {
      const res = await api.post('/api/reporte/generar', payload)
      console.log('Respuesta del backend:', res.data)
      console.log('Reporte generado en backend:', res.data)
      $q.notify({
        type: 'info',
        message: 'Reporte registrado',
        position: 'top-right',
        timeout: 2000,
      })
    } catch (apiError) {
      console.error('Error en API:', apiError)
      // El interceptor maneja 401 y redirige automáticamente
      if (apiError.response?.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      } else if (apiError.response?.status !== 401) {
        // Solo lanzar si no es 401 (que será manejado por interceptor)
        throw apiError
      }
    }

    // Crear PDF con tabla y gráfico en una sola página A4
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let currentY = 10

    // Logo superior (arriba-derecha) y luego título
    try {
      const logoImg = await loadImage(LogoPng)
      const logoW = 35 // mm
      const logoH = (logoW * logoImg.naturalHeight) / logoImg.naturalWidth
      const logoData = compressImage(logoImg, 320, 0.55) // JPEG comprimido
      pdf.addImage(logoData, 'JPEG', pageWidth - 10 - logoW, currentY, logoW, logoH)
      currentY += logoH + 6
    } catch (e) {
      // Si falla el logo, continuamos sin bloquear el PDF
      currentY += 4
    }

    // Título
    pdf.setFontSize(14)
    pdf.text('Reporte Indicadores SLA', 10, currentY)
    currentY += 8

    pdf.setFontSize(10)
    pdf.text(`Período: ${filtros.value.mes} - ${filtros.value.anio}`, 10, currentY)
    currentY += 5
    pdf.text(`Código SLA: ${filtros.value.codigoSla}`, 10, currentY)
    currentY += 7

    // Tabla
    const tableElement = reporteRef.value.querySelector('table')
    if (tableElement) {
      const tableCanvas = await html2canvas(tableElement, {
        scale: 1,
      })
      const tableImgData = tableCanvas.toDataURL('image/png')
      const tableImgWidth = pageWidth - 20
      const tableImgHeight = (tableCanvas.height * tableImgWidth) / tableCanvas.width

      // Ajustar altura de tabla si es muy grande
      const maxTableHeight = 60
      const adjustedTableHeight = Math.min(tableImgHeight, maxTableHeight)

      pdf.addImage(tableImgData, 'PNG', 10, currentY, tableImgWidth, adjustedTableHeight)
      currentY += adjustedTableHeight + 5
    }

    // Gráfico con leyenda en la misma página
    const chartElement = reporteRef.value.querySelector('.chart-wrapper')
    if (chartElement) {
      const chartCanvas = await html2canvas(chartElement, {
        scale: 1,
      })
      const chartImgData = chartCanvas.toDataURL('image/png')
      const chartImgWidth = pageWidth - 20

      // Calcular altura disponible restante en la página
      const remainingHeight = pageHeight - currentY - 15
      const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width
      const adjustedChartHeight = Math.min(chartImgHeight, remainingHeight)

      // Añadir título del gráfico con separación
      currentY += 15
      pdf.setFontSize(11)
      pdf.text('Gráfico de SLA por Rol', 10, currentY)
      currentY += 6

      // Añadir leyenda compacta
      pdf.setFontSize(9)
      pdf.setFillColor(33, 186, 69)
      pdf.rect(10, currentY, 3, 3, 'F')
      pdf.text('SLA Cumplido (100%)', 15, currentY + 2)

      pdf.setFillColor(246, 0, 8)
      pdf.rect(85, currentY, 3, 3, 'F')
      pdf.text('SLA Incumplido (<100%)', 90, currentY + 2)
      currentY += 6

      // Añadir gráfico
      pdf.addImage(chartImgData, 'PNG', 10, currentY, chartImgWidth, adjustedChartHeight)
    }

    const fileName = `Reporte_SLA_${filtros.value.codigoSla || 'TODOS'}_${filtros.value.mes}_${
      filtros.value.anio
    }.pdf`
    pdf.save(fileName)

    $q.notify({
      type: 'positive',
      message: 'PDF exportado exitosamente',
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    console.error('Detalles del error:', error.response?.data || error.message)
    $q.notify({
      type: 'negative',
      message: `Error al generar o descargar el PDF: ${error.response?.data?.message || error.message}`,
      position: 'top-right',
    })
  } finally {
    exportandoPdf.value = false
  }
}

// Enviar por correo (cuando tengas endpoint de backend)
// Por ahora no usamos _mensaje, pero eslint ya no se queja
const enviarPorCorreo = async ({ correos, mensaje: _mensaje }) => {
  if (!correos || !correos.length) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa al menos un correo destinatario',
      position: 'top-right',
    })
    return
  }

  enviandoCorreo.value = true
  try {
    // Generar PDF con tabla y gráfico en una sola página A4
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let currentY = 10

    // Logo superior (arriba-derecha) y luego título
    try {
      const logoImg = await loadImage(LogoPng)
      const logoW = 35 // mm
      const logoH = (logoW * logoImg.naturalHeight) / logoImg.naturalWidth
      const logoData = compressImage(logoImg, 320, 0.55)
      pdf.addImage(logoData, 'JPEG', pageWidth - 10 - logoW, currentY, logoW, logoH)
      currentY += logoH + 6
    } catch (e) {
      currentY += 4
    }

    // Título
    pdf.setFontSize(14)
    pdf.text('Reporte Indicadores SLA', 10, currentY)
    currentY += 8

    pdf.setFontSize(10)
    pdf.text(`Período: ${filtros.value.mes} - ${filtros.value.anio}`, 10, currentY)
    currentY += 5
    pdf.text(`Código SLA: ${filtros.value.codigoSla}`, 10, currentY)
    currentY += 7

    // Tabla
    const tableElement = reporteRef.value.querySelector('table')
    if (tableElement) {
      const tableCanvas = await html2canvas(tableElement, {
        scale: 1,
      })
      const tableImgData = tableCanvas.toDataURL('image/png')
      const tableImgWidth = pageWidth - 20
      const tableImgHeight = (tableCanvas.height * tableImgWidth) / tableCanvas.width

      // Ajustar altura de tabla si es muy grande
      const maxTableHeight = 60
      const adjustedTableHeight = Math.min(tableImgHeight, maxTableHeight)

      pdf.addImage(tableImgData, 'PNG', 10, currentY, tableImgWidth, adjustedTableHeight)
      currentY += adjustedTableHeight + 5
    }

    // Gráfico con leyenda en la misma página
    const chartElement = reporteRef.value.querySelector('.chart-wrapper')
    if (chartElement) {
      const chartCanvas = await html2canvas(chartElement, {
        scale: 1,
      })
      const chartImgData = chartCanvas.toDataURL('image/png')
      const chartImgWidth = pageWidth - 20

      // Calcular altura disponible restante en la página
      const remainingHeight = pageHeight - currentY - 15
      const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width
      const adjustedChartHeight = Math.min(chartImgHeight, remainingHeight)

      // Añadir título del gráfico con separación
      currentY += 15
      pdf.setFontSize(11)
      pdf.text('Gráfico de SLA por Rol', 10, currentY)
      currentY += 6

      // Añadir leyenda compacta
      pdf.setFontSize(9)
      pdf.setFillColor(33, 186, 69)
      pdf.rect(10, currentY, 3, 3, 'F')
      pdf.text('SLA Cumplido (100%)', 15, currentY + 2)

      pdf.setFillColor(246, 0, 8)
      pdf.rect(85, currentY, 3, 3, 'F')
      pdf.text('SLA Incumplido (<100%)', 90, currentY + 2)
      currentY += 6

      // Añadir gráfico
      pdf.addImage(chartImgData, 'PNG', 10, currentY, chartImgWidth, adjustedChartHeight)
    }

    // Convertir PDF a base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1]

    // Generar nombre de archivo
    const fileName = `Reporte_SLA_${filtros.value.codigoSla || 'TODOS'}_${filtros.value.mes}_${
      filtros.value.anio
    }.pdf`

    // Preparar payload para envío de correos
    const payload = {
      tos: correos,
      subject: `Reporte SLA - ${filtros.value.mes} ${filtros.value.anio}`,
      message: `<p>Adjunto encontrará el reporte de indicadores SLA para ${filtros.value.mes} ${filtros.value.anio}.</p><p><strong>Código SLA:</strong> ${filtros.value.codigoSla}</p>`,
      pdfBase64: pdfBase64,
      fileName: fileName,
    }

    // Enviar correos
    const res = await api.post('/api/reporte/enviar-correo', payload)

    console.log('Respuesta del envío de correos:', res.data)

    $q.notify({
      type: 'positive',
      message: `Reporte enviado exitosamente a ${correos.length} destinatario(s)`,
      position: 'top-right',
      timeout: 4000,
    })

    // Cerrar diálogo
    dialogCorreo.value = false
  } catch (error) {
    console.error('Error al enviar correo:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al enviar el reporte por correo',
      position: 'top-right',
      timeout: 5000,
    })
  } finally {
    enviandoCorreo.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionesIniciales()

  // Restaurar filtros si existen
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      filtros.value = {
        ...filtros.value,
        ...parsed,
      }
      await verReporte()
    } catch (e) {
      console.warn('No se pudieron restaurar filtros guardados:', e)
    }
  }

  appStore.markAsLoaded()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.filters-card {
  background: white;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-checkbox-item {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.role-checkbox-item:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 320px;
}

.fullscreen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.legend-container {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

:deep(.q-table__card) {
  font-size: 14px;
}

:deep(.q-table th),
:deep(.q-table td) {
  font-size: 14px;
}

:deep(.text-red-custom) {
  color: #f60008 !important;
}

:deep(.bg-red-custom) {
  background-color: #f60008 !important;
}

:deep(.text-green-custom) {
  color: #21ba45 !important;
}

:deep(.bg-green-custom) {
  background-color: #21ba45 !important;
}

.filter-button {
  height: 40px !important;
  padding: 0 12px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  text-transform: none !important;
  font-weight: 400 !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.filter-button:hover {
  background-color: rgba(33, 150, 243, 0.08) !important;
}

.w-full {
  width: 100% !important;
}

/* Encabezado de la tabla del reporte: fondo azul muy claro */
:deep(.sla-report-table thead tr th) {
  background-color: #eaf2f9 !important;
}

/* Color de texto específico solo para la etiqueta del botón Roles/Áreas (sin afectar el ícono) */
:deep(.filter-button .q-btn__content span) {
  color: rgba(0, 0, 0, 0.87) !important;
}

/* Borde gris consistente con selects outlined */
:deep(.filter-button.q-btn--outline) {
  border: 0.5px solid #b6b6b6 !important;
  background-color: #ffffff !important;
}

/* Controlar el borde real que Quasar dibuja con el pseudo-elemento :before */
:deep(.filter-button.q-btn--outline:before) {
  border: 0px solid #434343 !important; /* gris neutro en lugar de negro */
}

:deep(.filter-button.q-btn--outline:hover:before),
:deep(.filter-button.q-btn--outline:focus:before),
:deep(.filter-button.q-btn--outline:active:before) {
  border-color: #ab4545 !important;
  border: 0px solid !important;
}
.chip-padding {
  padding: 17px 20px !important; /* vertical | horizontal */
}
</style>
