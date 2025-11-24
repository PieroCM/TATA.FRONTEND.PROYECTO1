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

            <!-- Dropdown Roles (Multi-selección) -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.roles"
                :options="rolesDisponibles"
                label="Roles/Áreas"
                outlined
                dense
                multiple
                use-chips
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="people" color="primary" />
                </template>
                <template v-slot:hint> Opcional - Selecciona uno o varios </template>
              </q-select>
            </div>
          </div>

          <!-- Chips de selección actual -->
          <div v-if="filtrosActivos.length > 0" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-sm">Filtros aplicados:</div>
            <div class="row q-gutter-sm">
              <q-chip
                v-for="chip in filtrosActivos"
                :key="chip.key"
                :color="chip.color"
                text-color="white"
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
              :disable="!filtros.mes || !filtros.anio"
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
                  Total recursos: <b>{{ resumen.totalRecursos }}</b> |
                  SLA promedio: <b>{{ resumen.promedioSla }}%</b> |
                  Roles incluidos: <b>{{ resumen.rolesIncluidos }}</b>
                </div>
              </div>

              <!-- Tabla de resultados -->
              <q-table
                :rows="filasTabla"
                :columns="columnas"
                row-key="rol"
                flat
                bordered
                :pagination="{ rowsPerPage: 10 }"
              >
                <!-- SLA -->
                <template v-slot:body-cell-sla="props">
                  <q-td :props="props">
                    <span v-if="props.row.numRecursos > 0">
                      {{ props.row.sla.toFixed(2) }}%
                    </span>
                    <span v-else>NA</span>
                  </q-td>
                </template>

                <!-- Indicador (círculo de color) -->
                <template v-slot:body-cell-indicador="props">
                  <q-td :props="props">
                    <q-icon
                      name="circle"
                      :color="getIndicadorColor(props.row)"
                      size="18px"
                    >
                      <q-tooltip>
                        {{ getIndicadorTexto(props.row) }}
                      </q-tooltip>
                    </q-icon>
                  </q-td>
                </template>
              </q-table>

              <!-- Gráfico dinámico -->
              <div class="q-mt-xl">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">
                  Gráfico de SLA por Rol
                </div>
                <div class="chart-wrapper">
                  <canvas ref="chartCanvas"></canvas>
                </div>
              </div>
            </div>

            <!-- Botones de exportación -->
            <div class="row q-col-gutter-md q-mt-xl">
              <div class="col-12 col-md-auto">
                <q-btn
                  color="positive"
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
                  outline
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
    </div>
  </q-page>
</template>

<script setup>
// npm i jspdf html2canvas
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Chart, registerables } from 'chart.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useAppStore } from 'stores/app-store'
import EnviarReporteDialog from 'components/Reportes/EnviarReporteDialog.vue'

Chart.register(...registerables)

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
  'Diciembre'
]

const filtros = ref({
  mes: mesesDisponibles[new Date().getMonth()],
  anio: new Date().getFullYear(),
  codigoSla: null, // Código SLA: SLA1, SLA2, etc.
  roles: []
})

const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([]) // [{ label, value: codigoSla }]
const rolesDisponibles = ref([]) // nombres de roles

// Datos del reporte
const filasTabla = ref([]) // [{ rol, numRecursos, sla }]
const resumen = ref({
  totalRecursos: 0,
  promedioSla: 0,
  rolesIncluidos: 0
})
const solicitudesFiltradas = ref([]) // para exportar (ids)

// Chart
const chartCanvas = ref(null)
let chartInstance = null

// Para PDF
const reporteRef = ref(null)

// Diálogo correo
const dialogCorreo = ref(false)
const enviandoCorreo = ref(false)

// Emit por compatibilidad
const emit = defineEmits(['onFiltroChange'])

// Columnas de la tabla
const columnas = [
  {
    name: 'rol',
    label: 'ROL',
    field: 'rol',
    align: 'left',
    sortable: true
  },
  {
    name: 'numRecursos',
    label: 'NUM_RECURSOS',
    field: 'numRecursos',
    align: 'center',
    sortable: true
  },
  {
    name: 'sla',
    label: 'SLA',
    field: 'sla',
    align: 'center',
    sortable: true
  },
  {
    name: 'indicador',
    label: 'INDICADOR',
    field: 'indicador',
    align: 'center'
  }
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
      removable: false
    })
  }

  if (filtros.value.codigoSla) {
    activos.push({
      key: 'codigoSla',
      label: `SLA: ${filtros.value.codigoSla}`,
      icon: 'category',
      color: 'secondary',
      removable: true
    })
  }

  if (filtros.value.roles && filtros.value.roles.length > 0) {
    activos.push({
      key: 'roles',
      label: `Roles: ${filtros.value.roles.length}`,
      icon: 'people',
      color: 'accent',
      removable: true
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
  if (row.numRecursos === 0) return 'grey-5'
  if (row.sla >= 90) return 'positive'
  if (row.sla >= 70) return 'orange'
  return 'negative'
}

const getIndicadorTexto = (row) => {
  if (row.numRecursos === 0) return 'Sin recursos (NA)'
  if (row.sla >= 90) return 'Excelente (≥ 90%)'
  if (row.sla >= 70) return 'Aceptable (≥ 70%)'
  return 'Bajo (< 70%)'
}

// Cargar combos iniciales
const cargarConfiguracionesIniciales = async () => {
  try {
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla')
    ])

    // Años disponibles desde Solicitud
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [
        ...new Set(
          solicitudesRes.data
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear())
        )
      ].sort((a, b) => b - a)

      aniosDisponibles.value =
        aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    } else {
      const currentYear = new Date().getFullYear()
      aniosDisponibles.value = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
    }

    // Roles activos
    if (rolesRes.data) {
      rolesDisponibles.value = rolesRes.data
        .filter((r) => r.esActivo !== false)
        .map((r) => r.nombreRol)
    }

    // Tipos SLA (código SLA)
    if (configSlaRes.data) {
      const activos = configSlaRes.data.filter((c) => c.esActivo)
      const codigos = []
      activos.forEach((c) => {
        if (!codigos.some((x) => x.value === c.codigoSla)) {
          codigos.push({
            label: `${c.codigoSla} - ${c.tipoSolicitud}`,
            value: c.codigoSla
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
      position: 'top-right'
    })
  }
}

// Ver reporte (cálculo en frontend)
const verReporte = async () => {
  if (!filtros.value.mes || !filtros.value.anio) {
    $q.notify({
      type: 'warning',
      message: 'Mes y Año son obligatorios',
      position: 'top-right'
    })
    return
  }

  loading.value = true

  try {
    const mesNumero = getMesNumero(filtros.value.mes)

    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla')
    ])

    let solicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar por mes/año
    solicitudes = solicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio && fecha.getMonth() + 1 === mesNumero
    })

    // Filtrar por Código SLA
    if (filtros.value.codigoSla) {
      const configsFiltradas = configsSla.filter(
        (c) => c.codigoSla === filtros.value.codigoSla
      )
      const idsSla = configsFiltradas.map((c) => c.idSla)
      solicitudes = solicitudes.filter((s) => idsSla.includes(s.idSla))
    }

    // Filtrar por roles
    if (filtros.value.roles && filtros.value.roles.length > 0) {
      const rolesIds = todosRoles
        .filter((r) => filtros.value.roles.includes(r.nombreRol))
        .map((r) => r.idRolRegistro)
      solicitudes = solicitudes.filter((s) => rolesIds.includes(s.idRolRegistro))
    }

    // Calcular cumplimiento por solicitud
    const solicitudesConSla = solicitudes.map((s) => {
      const config = configsSla.find((c) => c.idSla === s.idSla)
      const diasUmbral = config?.diasUmbral ?? 0

      let cumpleSla = false
      if (s.fechaSolicitud && s.fechaIngreso) {
        const fechaSol = new Date(s.fechaSolicitud)
        const fechaIng = new Date(s.fechaIngreso)
        const diffMs = fechaIng - fechaSol
        const diasTranscurridos = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        cumpleSla = diasTranscurridos <= diasUmbral
      }

      return { ...s, cumpleSla }
    })

    solicitudesFiltradas.value = solicitudesConSla

    // Construir tabla por rol (incluyendo roles con 0 recursos)
    const filas = (todosRoles || [])
      .filter((r) => r.esActivo !== false)
      .map((rol) => {
        const solicitudesRol = solicitudesConSla.filter(
          (s) => s.idRolRegistro === rol.idRolRegistro
        )
        const total = solicitudesRol.length
        const cumplen = solicitudesRol.filter((s) => s.cumpleSla).length
        const porcentaje = total > 0 ? (cumplen / total) * 100 : 0

        return {
          rol: rol.nombreRol,
          numRecursos: total,
          sla: total > 0 ? parseFloat(porcentaje.toFixed(2)) : 0
        }
      })

    filasTabla.value = filas

    // Resumen
    const rolesConRecursos = filas.filter((f) => f.numRecursos > 0)
    const totalRecursos = rolesConRecursos.reduce((acc, f) => acc + f.numRecursos, 0)
    const promedioSla =
      rolesConRecursos.length > 0
        ? parseFloat(
            (
              rolesConRecursos.reduce((acc, f) => acc + f.sla, 0) /
              rolesConRecursos.length
            ).toFixed(2)
          )
        : 0

    resumen.value = {
      totalRecursos,
      promedioSla,
      rolesIncluidos: filas.length
    }

    // Persistir filtros
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtros.value))

    // Emit por si el padre lo usa
    emit('onFiltroChange', {
      filtros: filtros.value,
      datos: filasTabla.value,
      resumen: resumen.value
    })

    await nextTick()
    crearGrafico()
  } catch (error) {
    console.error('Error al calcular reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al calcular el reporte',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const crearGrafico = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartCanvas.value || !filasTabla.value.length) return

  const ctx = chartCanvas.value.getContext('2d')

  const filasConDatos = filasTabla.value.filter((f) => f.numRecursos > 0)

  const labels = filasConDatos.map((f) => f.rol)
  const data = filasConDatos.map((f) => f.sla)
  const backgroundColors = filasConDatos.map((f) => {
    const color = getIndicadorColor(f)
    if (color === 'positive') return 'rgba(76, 175, 80, 0.8)'
    if (color === 'orange') return 'rgba(255, 152, 0, 0.8)'
    if (color === 'negative') return 'rgba(244, 67, 54, 0.8)'
    return 'rgba(158, 158, 158, 0.8)'
  })

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'SLA (%)',
          data,
          backgroundColor: backgroundColors
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    }
  })
}

// Limpiar filtros y reporte
const limpiarFiltros = () => {
  filtros.value = {
    mes: mesesDisponibles[new Date().getMonth()],
    anio: new Date().getFullYear(),
    codigoSla: null,
    roles: []
  }

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
    position: 'top-right'
  })
}

// Remover chip individual
const removerFiltro = (key) => {
  if (key === 'codigoSla') {
    filtros.value.codigoSla = null
  } else if (key === 'roles') {
    filtros.value.roles = []
  }
}

// Exportar a Excel usando /api/reporte/generar
const exportarExcel = async () => {
  if (!solicitudesFiltradas.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar',
      position: 'top-right'
    })
    return
  }

  exportandoExcel.value = true

  try {
    const ids = solicitudesFiltradas.value.map((s) => s.idSolicitud)

    const payload = {
      tipoReporte: 'SLA_MENSUAL',
      formato: 'XLSX',
      idsSolicitudes: ids,
      filtrosJson: JSON.stringify({
        CodigoSla: filtros.value.codigoSla,
        Anio: filtros.value.anio,
        Mes: getMesNumero(filtros.value.mes)
      })
    }

    const res = await api.post('/api/reporte/generar', payload)
    const reporte = res.data

    const baseUrl = api.defaults.baseURL || ''
    const normalizedPath = (reporte.rutaArchivo || '').replace(/\\/g, '/')
    const urlDescarga = `${baseUrl}${normalizedPath}`

    window.open(urlDescarga, '_blank')
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    $q.notify({
      type: 'negative',
      message:
        'Error al generar o descargar el Excel. Verifica el endpoint /api/reporte/generar y la publicación de /reports.',
      position: 'top-right',
      timeout: 5000
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
      position: 'top-right'
    })
    return
  }

  exportandoPdf.value = true

  try {
    const elemento = reporteRef.value

    const canvas = await html2canvas(elemento, {
      scale: 2
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const y = imgHeight > pageHeight ? 0 : (pageHeight - imgHeight) / 2

    pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)

    const fileName = `Reporte_SLA_${filtros.value.codigoSla || 'TODOS'}_${filtros.value.mes}_${
      filtros.value.anio
    }.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF',
      position: 'top-right'
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
      position: 'top-right'
    })
    return
  }

  enviandoCorreo.value = true
  try {
    // Aquí conectarás con tu futuro endpoint, por ejemplo:
    // await api.post('/api/reporte/enviar', {
    //   destinatarios: correos,
    //   mensaje,
    //   filtros: filtros.value
    // })

    $q.notify({
      type: 'info',
      message: 'Funcionalidad de envío por correo pendiente de implementación en el backend.',
      position: 'top-right',
      timeout: 4000
    })
  } catch (error) {
    console.error('Error al enviar correo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar correo',
      position: 'top-right'
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
        ...parsed
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
</style>
