<template>
  <q-page class="dashboard-page">
    <!-- Contenido -->

      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center">
          <q-icon name="insights" size="40px" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-medium">Visualización Analítica Interactiva SLA</div>
            <div class="text-grey-7">Análisis detallado y comparativas por período</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros
          </div>

          <!-- Fila 1: Rango de Fechas -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Mes Inicio -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.mesInicio"
                :options="mesesDisponibles"
                label="Mes Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Mes Fin -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.mesFin"
                :options="mesesDisponibles"
                label="Mes Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Año Inicio -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.anioInicio"
                :options="aniosDisponibles"
                label="Año Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Año Fin -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.anioFin"
                :options="aniosDisponibles"
                label="Año Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Fila 2: Filtros de Datos -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Tipos SLA -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="filtros.tiposSla"
                :options="tiposSlaDisponibles"
                label="Tipos SLA"
                outlined
                dense
                multiple
                use-chips
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Roles -->
            <div class="col-12 col-sm-6 col-md-3">
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
              </q-select>
            </div>

            <!-- Estado SLA -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.estado"
                :options="estadosDisponibles"
                label="Estado de Cumplimiento"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="track_changes" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Tipo de Gráfico -->
            <div class="col-12 col-sm-6 col-md-2">
              <q-select
                v-model="tipoGrafico"
                :options="tiposGraficoDisponibles"
                label="Tipo Gráfico"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="show_chart" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Vista de Gráficos (Toggle Switch) -->
            <div class="col-12 col-sm-6 col-md-2">
              <q-field outlined dense stack-label label="Vista de Gráficos">
                <template v-slot:prepend>
                  <q-icon name="view_module" color="primary" />
                </template>
                <template v-slot:control>
                  <div class="self-center full-width no-outline q-px-sm">
                    <q-toggle
                      v-model="vistaUnificada"
                      color="primary"
                      size="sm"
                      :label="vistaUnificada ? 'Unificado' : 'Separado'"
                      dense
                    />
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                color="primary"
                label="Aplicar Filtros"
                icon="search"
                @click="aplicarFiltros"
                :loading="loading"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                outline
                color="grey-7"
                label="Restablecer"
                icon="refresh"
                @click="restablecerFiltros"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                outline
                color="positive"
                label="Exportar PDF"
                icon="picture_as_pdf"
                @click="mostrarDialogoExportacion"
                :disable="graficos.length === 0"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading Indicator -->
      <div v-if="loading" class="row justify-center q-my-xl">
        <q-spinner-dots color="primary" size="40px" />
        <div class="text-grey-7 q-ml-sm self-center">Procesando datos analíticos...</div>
      </div>

      <!-- Gráficos Interactivos -->
      <div v-if="graficos.length > 0">
        <!-- Vista Unificada: Un solo gráfico con todos los SLAs -->
        <q-card v-if="vistaUnificada" flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-md">
              <q-icon name="bar_chart" class="q-mr-sm" />
              Comparación Unificada de Tipos SLA
            </div>
            <q-separator class="q-mb-md" />

            <div class="row">
              <!-- Gráfico Unificado - Ancho completo sin leyenda -->
              <div class="col-12">
                <div class="chart-wrapper">
                  <canvas id="chartUnificadoCanvas" ref="chartUnificadoCanvas"></canvas>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vista Separada: Un gráfico por cada tipo SLA -->
        <template v-else>
          <q-card
            v-for="(grafico, index) in graficos"
            :key="index"
            flat
            bordered
            :class="{ 'q-mb-lg': index < graficos.length - 1 }"
          >
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="bar_chart" class="q-mr-sm" />
                {{ grafico.titulo }}
              </div>
              <q-separator class="q-mb-md" />

              <div v-if="grafico.datos.labels && grafico.datos.labels.length > 0">
                <div class="row">
                  <!-- Gráfico -->
                  <div class="col-12 col-md-9">
                    <div class="chart-wrapper">
                      <canvas :id="`chartCanvas_${grafico.codigoSla}`" :ref="(el) => setChartRef(el, index)"></canvas>
                    </div>
                  </div>

                  <!-- Leyenda de colores a la derecha -->
                  <div class="col-12 col-md-3">
                    <div class="color-legend">
                      <div class="text-subtitle2 text-weight-medium q-mb-md">
                        Leyenda de Estado SLA:
                      </div>
                      <div class="legend-items">
                        <div class="legend-item q-mb-sm">
                          <q-chip color="positive" text-color="white" dense>
                            <q-icon name="check_circle" left />
                            Cumple
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">Completado dentro del umbral</div>
                        </div>
                        <div class="legend-item q-mb-sm">
                          <q-chip color="orange" text-color="white" dense>
                            <q-icon name="schedule" left />
                            Proceso
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">En curso dentro del tiempo</div>
                        </div>
                        <div class="legend-item">
                          <q-chip color="negative" text-color="white" dense>
                            <q-icon name="cancel" left />
                            No_cumple
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">Excedió el umbral</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-xl">
                <q-icon name="insert_chart_outlined" size="64px" color="grey-5" />
                <div class="text-h6 q-mt-md">No existen registros para este tipo SLA</div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <q-card v-else flat bordered>
        <q-card-section>
          <div class="text-center text-grey-7 q-pa-xl">
            <q-icon name="insert_chart_outlined" size="64px" color="grey-5" />
            <div class="text-h6 q-mt-md">No existen registros para los filtros seleccionados</div>
            <div class="text-body2 q-mt-sm">
              Intenta ajustar los filtros o seleccionar otro período
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Análisis Detallado: Top 5 Roles con Más Incumplimientos -->
      <div v-if="graficos.length > 0" class="row q-col-gutter-lg q-mt-lg q-mb-lg">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="priority_high" color="negative" class="q-mr-sm" />
                Top 5 Roles con Mayor Incumplimiento por Tipo de SLA
              </div>
              <q-separator class="q-mb-md" />

              <div class="row q-col-gutter-md">
                <div
                  v-for="grafico in graficos"
                  :key="grafico.codigoSla"
                  class="col-12 col-md-4"
                >
                  <div class="tipo-sla-card">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                      {{ grafico.codigoSla }}
                    </div>
                    <div v-if="grafico.topIncumplidores && grafico.topIncumplidores.length > 0">
                      <div
                        v-for="(rol, idx) in grafico.topIncumplidores.slice(0, 5)"
                        :key="idx"
                        class="incumplidor-item q-mb-sm"
                      >
                        <div class="row items-center justify-between">
                          <div class="col">
                            <div class="text-body2">
                              <q-badge
                                :color="idx === 0 ? 'negative' : idx === 1 ? 'orange' : 'grey-6'"
                                :label="idx + 1"
                                class="q-mr-xs"
                              />
                              {{ rol.nombre }}
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-chip
                              dense
                              color="negative"
                              text-color="white"
                              size="sm"
                            >
                              {{ rol.noCumplen }} incumplimientos
                            </q-chip>
                          </div>
                        </div>
                        <q-linear-progress
                          :value="rol.noCumplen / (grafico.totalNoCumplen || 1)"
                          color="negative"
                          class="q-mt-xs"
                        />
                      </div>
                    </div>
                    <div v-else class="text-center text-grey-6 q-py-md">
                      <q-icon name="check_circle" size="sm" color="positive" />
                      <div class="text-caption">Sin incumplimientos</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos de Distribución de Estados -->
      <div v-if="graficos.length > 0" class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="donut_small" color="primary" class="q-mr-sm" />
                Distribución de Estados por Solicitud
              </div>
              <canvas id="graficoDistribucionEstadosAnalytic" style="max-height: 350px"></canvas>
              <div class="text-center text-caption text-grey-7 q-mt-sm">
                Total de {{ estadisticas.totalSolicitudes }} solicitudes analizadas
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="assessment" color="primary" class="q-mr-sm" />
                Resumen de Incumplimientos por Tipo SLA
              </div>
              <canvas id="graficoResumenIncumplimientosAnalytic" style="max-height: 350px"></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Total Solicitudes</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.totalSolicitudes }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Promedio SLA</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.promedioSla }}%
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Roles Analizados</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.rolesAnalizados }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

    <!-- Diálogo de Selección de Exportación -->
    <q-dialog v-model="dialogoExportacion" persistent maximized transition-show="slide-up" transition-hide="slide-down" class="export-dialog">
      <q-card class="export-dialog-card">
        <q-bar class="bg-primary text-white">
          <q-icon name="picture_as_pdf" />
          <div class="text-weight-medium">Exportar Análisis SLA</div>
          <q-space />
          <q-btn flat dense round icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-medium">Selecciona las secciones a incluir</div>
          <div class="text-caption text-grey-7 q-mt-xs">Elige qué información deseas exportar en el PDF</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md scroll-section">
          <q-list separator class="rounded-borders">
            <q-item tag="label" v-ripple clickable class="q-py-md">
              <q-item-section avatar top>
                <q-checkbox v-model="seccionesExportar.graficos" color="primary" size="lg" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body1 text-weight-medium q-mb-xs">
                  <q-icon name="insights" color="primary" size="sm" class="q-mr-xs" />
                  Análisis de SLA por Tipo
                </q-item-label>
                <q-item-label caption lines="2" class="text-body2 text-grey-7">
                  Gráficos de cumplimiento por rol y tipo de SLA
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple clickable class="q-py-md">
              <q-item-section avatar top>
                <q-checkbox v-model="seccionesExportar.topRoles" color="primary" size="lg" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body1 text-weight-medium q-mb-xs">
                  <q-icon name="priority_high" color="negative" size="sm" class="q-mr-xs" />
                  Top 5 Roles con Mayor Incumplimiento
                </q-item-label>
                <q-item-label caption lines="2" class="text-body2 text-grey-7">
                  Análisis de roles con más incumplimientos por tipo SLA
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple clickable class="q-py-md">
              <q-item-section avatar top>
                <q-checkbox v-model="seccionesExportar.distribucion" color="primary" size="lg" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body1 text-weight-medium q-mb-xs">
                  <q-icon name="donut_small" color="primary" size="sm" class="q-mr-xs" />
                  Distribución de Estados por Solicitud
                </q-item-label>
                <q-item-label caption lines="2" class="text-body2 text-grey-7">
                  Gráfico de distribución de estados (Cumple/Proceso/No cumple)
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple clickable class="q-py-md">
              <q-item-section avatar top>
                <q-checkbox v-model="seccionesExportar.resumen" color="primary" size="lg" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body1 text-weight-medium q-mb-xs">
                  <q-icon name="assessment" color="primary" size="sm" class="q-mr-xs" />
                  Resumen de Incumplimientos por Tipo SLA
                </q-item-label>
                <q-item-label caption lines="2" class="text-body2 text-grey-7">
                  Gráfico de barras apiladas con estados por tipo SLA
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="q-pa-md bg-grey-1">
          <q-btn
            flat
            label="CANCELAR"
            color="grey-8"
            v-close-popup
            class="q-px-lg"
            icon="close"
          />
          <div class="row q-gutter-sm">
            <q-btn
              outline
              label="SELECCIONAR TODO"
              color="primary"
              @click="seleccionarTodo"
              class="q-px-lg"
              icon="done_all"
            />
            <q-btn
              unelevated
              label="EXPORTAR"
              color="positive"
              icon="picture_as_pdf"
              @click="confirmarExportacion"
              :disable="!algunaSeccionSeleccionada"
              class="q-px-xl"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { Chart, registerables } from 'chart.js'
import { useAppStore } from 'stores/app-store'
import { useSlaStore } from 'stores/useSlaStore'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

Chart.register(...registerables)

const $q = useQuasar()
const appStore = useAppStore()
const slaStore = useSlaStore()

// Estados
const loading = ref(false)

const chartCanvasRefs = ref([])
const chartInstances = ref([])
const chartUnificadoCanvas = ref(null)
let chartUnificadoInstance = null
let graficoDistribucionEstadosAnalyticInstance = null
let graficoResumenIncumplimientosAnalyticInstance = null

const setChartRef = (el, index) => {
  if (el) {
    chartCanvasRefs.value[index] = el
  }
}

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

const tiposGraficoDisponibles = [
  { label: 'Barras', value: 'bar' },
  { label: 'Líneas', value: 'line' },
  { label: 'Área', value: 'area' },
  { label: 'Donut', value: 'doughnut' },
  { label: 'Radar', value: 'radar' },
]

const filtros = ref({
  mesInicio: null,
  mesFin: null,
  anioInicio: null,
  anioFin: null,
  tiposSla: [],
  roles: [],
  estado: null,
})

const estadosDisponibles = [
  { label: 'Todos', value: null },
  { label: 'Cumple', value: 'Cumple' },
  { label: 'Proceso', value: 'Proceso' },
  { label: 'No cumple', value: 'No_cumple' }
]

const tipoGrafico = ref({ label: 'Barras', value: 'bar' })
const vistaUnificada = ref(false) // false = separado, true = unificado
const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([])
const rolesDisponibles = ref([])

const graficos = ref([])

const estadisticas = ref({
  totalSolicitudes: 0,
  promedioSla: 0,
  rolesAnalizados: 0,
})

// Control del diálogo de exportación
const dialogoExportacion = ref(false)
const seccionesExportar = ref({
  graficos: true,
  topRoles: true,
  distribucion: true,
  resumen: true,
})

const algunaSeccionSeleccionada = computed(() => {
  return seccionesExportar.value.graficos ||
         seccionesExportar.value.topRoles ||
         seccionesExportar.value.distribucion ||
         seccionesExportar.value.resumen
})

// Computed
const construirTitulo = (codigoSla) => {
  let titulo = `Análisis ${codigoSla}`

  // Rango de meses
  if (filtros.value.mesInicio && filtros.value.mesFin) {
    titulo += ` - ${filtros.value.mesInicio} a ${filtros.value.mesFin}`
  } else if (filtros.value.mesInicio) {
    titulo += ` - ${filtros.value.mesInicio}`
  } else if (filtros.value.mesFin) {
    titulo += ` - hasta ${filtros.value.mesFin}`
  }

  // Rango de años
  if (filtros.value.anioInicio && filtros.value.anioFin) {
    titulo += ` (${filtros.value.anioInicio} - ${filtros.value.anioFin})`
  } else if (filtros.value.anioInicio) {
    titulo += ` (${filtros.value.anioInicio})`
  } else if (filtros.value.anioFin) {
    titulo += ` (hasta ${filtros.value.anioFin})`
  }

  return titulo
}

// Watchers
watch(tipoGrafico, () => {
  if (graficos.value.length > 0) {
    if (vistaUnificada.value) {
      crearGraficoUnificado()
    } else {
      crearGraficos()
    }
  }
})

watch(vistaUnificada, () => {
  if (graficos.value.length > 0) {
    nextTick(() => {
      if (vistaUnificada.value) {
        crearGraficoUnificado()
      } else {
        crearGraficos()
      }
    })
  }
})

// Métodos
const cargarConfiguracionesIniciales = async () => {
  try {
    // Cargar años
    const solicitudes = await slaStore.fetchSolicitudes()
    if (solicitudes && solicitudes.length > 0) {
      const aniosUnicos = [
        ...new Set(
          solicitudes
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear()),
        ),
      ].sort((a, b) => b - a)
      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }

    // Cargar roles
    const roles = await slaStore.fetchRoles()
    if (roles) {
      rolesDisponibles.value = roles.filter((r) => r.esActivo).map((r) => r.nombreRol)
    }

    // Cargar códigos SLA
    const configSla = await slaStore.fetchConfigSla()
    if (configSla) {
      tiposSlaDisponibles.value = [
        ...new Set(configSla.filter((c) => c.esActivo).map((c) => c.codigoSla)),
      ].sort((a, b) => {
        // Extraer el número del código (ej: "SLA1" -> 1)
        const numA = parseInt(a.replace(/\D/g, ''), 10)
        const numB = parseInt(b.replace(/\D/g, ''), 10)
        return numA - numB // Orden ascendente: SLA1, SLA2, SLA3, etc.
      })
    }
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
  }
}

const aplicarFiltros = async () => {
  // Validar rangos de fechas
  if (filtros.value.anioInicio && filtros.value.anioFin) {
    if (filtros.value.anioInicio > filtros.value.anioFin) {
      $q.notify({
        type: 'negative',
        message: 'El año de inicio no puede ser mayor al año final',
        position: 'top-right',
        timeout: 3000,
      })
      return
    }
  }

  // Validar rango de meses si están en el mismo año
  if (filtros.value.mesInicio && filtros.value.mesFin) {
    const mesInicioNum = mesesDisponibles.indexOf(filtros.value.mesInicio)
    const mesFinNum = mesesDisponibles.indexOf(filtros.value.mesFin)

    // Si hay mismo año o no hay filtro de años, validar meses
    if (
      !filtros.value.anioInicio ||
      !filtros.value.anioFin ||
      filtros.value.anioInicio === filtros.value.anioFin
    ) {
      if (mesInicioNum > mesFinNum) {
        $q.notify({
          type: 'negative',
          message: 'El mes de inicio no puede ser mayor al mes final',
          position: 'top-right',
          timeout: 3000,
        })
        return
      }
    }
  }

  loading.value = true

  try {
    const [solicitudesData, rolesData, configSlaData] = await Promise.all([
      slaStore.fetchSolicitudes(),
      slaStore.fetchRoles(),
      slaStore.fetchConfigSla(),
    ])

    let solicitudes = solicitudesData || []
    const todosRoles = rolesData || []
    const configsSla = configSlaData || []

    // Filtrar por rango de fechas (mes y año)
    solicitudes = solicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      const anio = fecha.getFullYear()
      const mes = fecha.getMonth() + 1 // 1-12

      // Filtrar por rango de años
      if (filtros.value.anioInicio && anio < filtros.value.anioInicio) return false
      if (filtros.value.anioFin && anio > filtros.value.anioFin) return false

      // Filtrar por rango de meses (solo si están en el mismo año o sin filtro de año)
      if (filtros.value.mesInicio || filtros.value.mesFin) {
        const mesInicioNum = filtros.value.mesInicio
          ? mesesDisponibles.indexOf(filtros.value.mesInicio) + 1
          : 1
        const mesFinNum = filtros.value.mesFin
          ? mesesDisponibles.indexOf(filtros.value.mesFin) + 1
          : 12

        // Si hay rango de años, aplicar lógica más compleja
        if (filtros.value.anioInicio && filtros.value.anioFin) {
          // Primer año: desde mesInicio hasta diciembre
          if (anio === filtros.value.anioInicio && mes < mesInicioNum) return false
          // Último año: desde enero hasta mesFin
          if (anio === filtros.value.anioFin && mes > mesFinNum) return false
        } else {
          // Sin rango de años, filtrar solo por meses
          if (mes < mesInicioNum || mes > mesFinNum) return false
        }
      }

      return true
    })

    // Determinar tipos SLA a procesar
    const tiposSlaProcesar = filtros.value.tiposSla && filtros.value.tiposSla.length > 0
      ? filtros.value.tiposSla
      : tiposSlaDisponibles.value

    // Limpiar gráficos anteriores
    graficos.value = []
    let totalSolicitudesGlobal = 0
    let sumaPromedios = 0
    let totalRolesAnalizados = 0

    // Procesar cada tipo de SLA seleccionado
    for (const codigoSla of tiposSlaProcesar) {
      // Filtrar configuraciones y solicitudes por este código SLA
      const configsFiltradas = configsSla.filter((c) => c.codigoSla === codigoSla)
      const idsSla = configsFiltradas.map((c) => c.idSla)
      let solicitudesTipo = solicitudes.filter((s) => idsSla.includes(s.idSla))

      // Filtrar por roles si están seleccionados
      if (filtros.value.roles && filtros.value.roles.length > 0) {
        const rolesIds = todosRoles
          .filter((r) => filtros.value.roles.includes(r.nombreRol))
          .map((r) => r.idRolRegistro)
        solicitudesTipo = solicitudesTipo.filter((s) => rolesIds.includes(s.idRolRegistro))
      }

      // Calcular cumplimiento para este tipo SLA con estados
      const solicitudesConSla = solicitudesTipo.map((s) => {
        const config = configsSla.find((c) => c.idSla === s.idSla)
        const diasUmbral = config?.diasUmbral || 0

        let cumpleSla = false
        let estadoSla = 'Proceso' // Por defecto

        if (s.fechaSolicitud && s.fechaIngreso) {
          // Solicitud completada
          const fechaSol = new Date(s.fechaSolicitud)
          const fechaIng = new Date(s.fechaIngreso)
          const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
          cumpleSla = diasTranscurridos <= diasUmbral
          estadoSla = cumpleSla ? 'Cumple' : 'No_cumple'
        } else if (s.fechaSolicitud && !s.fechaIngreso) {
          // Solicitud en proceso
          const fechaSol = new Date(s.fechaSolicitud)
          const hoy = new Date()
          const diasTranscurridos = Math.floor((hoy - fechaSol) / (1000 * 60 * 60 * 24))

          if (diasTranscurridos > diasUmbral) {
            estadoSla = 'No_cumple' // Ya excedió el umbral
          } else {
            estadoSla = 'Proceso' // Aún dentro del tiempo
          }
        }

        return { ...s, cumpleSla, estadoSla }
      })

      // Filtrar por estado si está seleccionado
      const solicitudesFiltradas = filtros.value.estado
        ? solicitudesConSla.filter(s => s.estadoSla === filtros.value.estado)
        : solicitudesConSla

      // Preparar datos por rol para este tipo SLA usando solicitudes filtradas por estado
      const cumplimientoPorRol = todosRoles
        .filter((r) => r.esActivo)
        .map((rol) => {
          const solicitudesRol = solicitudesFiltradas.filter(
            (s) => s.idRolRegistro === rol.idRolRegistro,
          )
          const totalRol = solicitudesRol.length
          const cumplenRol = solicitudesRol.filter((s) => s.cumpleSla).length
          const noCumplenRol = solicitudesRol.filter((s) => s.estadoSla === 'No_cumple').length
          const procesoRol = solicitudesRol.filter((s) => s.estadoSla === 'Proceso').length
          const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

          return {
            nombre: rol.nombreRol,
            porcentaje: parseFloat(porcentaje.toFixed(1)),
            total: totalRol,
            cumplidos: cumplenRol,
            noCumplen: noCumplenRol,
            proceso: procesoRol,
          }
        })
        .filter((r) => r.total > 0)
        .sort((a, b) => b.porcentaje - a.porcentaje)

      // Solo agregar gráfico si hay datos
      if (cumplimientoPorRol.length > 0) {
        // Configurar datos según tipo de gráfico con 3 estados
        let datosGrafico
        const labels = cumplimientoPorRol.map((r) => r.nombre)

        if (tipoGrafico.value.value === 'line') {
          datosGrafico = {
            labels: labels,
            datasets: [
              {
                label: 'Cumple',
                data: cumplimientoPorRol.map((r) => r.cumplidos),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#4CAF50',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: false,
                tension: 0.4,
              },
              {
                label: 'Proceso',
                data: cumplimientoPorRol.map((r) => r.proceso || 0),
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#FF9800',
                pointBorderColor: '#FF9800',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: false,
                tension: 0.4,
              },
              {
                label: 'No_cumple',
                data: cumplimientoPorRol.map((r) => r.noCumplen || 0),
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#F44336',
                pointBorderColor: '#F44336',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: false,
                tension: 0.4,
              },
            ],
          }
        } else if (tipoGrafico.value.value === 'doughnut' || tipoGrafico.value.value === 'radar') {
          // Para doughnut y radar, mantener el formato de porcentaje
          datosGrafico = {
            labels: labels,
            datasets: [
              {
                label: 'Cumplimiento SLA (%)',
                data: cumplimientoPorRol.map((r) => r.porcentaje),
                backgroundColor: cumplimientoPorRol.map((r) => getColorByPercentage(r.porcentaje)),
                borderColor: cumplimientoPorRol.map((r) => getColorByPercentage(r.porcentaje)),
                borderWidth: 2,
              },
            ],
          }
        } else {
          // Para barras y área, usar los 3 estados
          datosGrafico = {
            labels: labels,
            datasets: [
              {
                label: 'Cumple',
                data: cumplimientoPorRol.map((r) => r.cumplidos),
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                borderWidth: 1,
                fill: tipoGrafico.value.value === 'area',
              },
              {
                label: 'Proceso',
                data: cumplimientoPorRol.map((r) => r.proceso || 0),
                backgroundColor: '#FF9800',
                borderColor: '#FF9800',
                borderWidth: 1,
                fill: tipoGrafico.value.value === 'area',
              },
              {
                label: 'No_cumple',
                data: cumplimientoPorRol.map((r) => r.noCumplen || 0),
                backgroundColor: '#F44336',
                borderColor: '#F44336',
                borderWidth: 1,
                fill: tipoGrafico.value.value === 'area',
              },
            ],
          }
        }

        // Calcular top incumplidores para este tipo de SLA
        const topIncumplidores = cumplimientoPorRol
          .filter(r => r.noCumplen > 0)
          .sort((a, b) => b.noCumplen - a.noCumplen)
          .slice(0, 5)

        const totalNoCumplen = cumplimientoPorRol.reduce((sum, r) => sum + (r.noCumplen || 0), 0)

        graficos.value.push({
          codigoSla: codigoSla,
          titulo: construirTitulo(codigoSla),
          datos: datosGrafico,
          datosRoles: cumplimientoPorRol,
          topIncumplidores: topIncumplidores,
          totalNoCumplen: totalNoCumplen
        })

        // Acumular estadísticas globales
        totalSolicitudesGlobal += solicitudesConSla.length
        sumaPromedios += cumplimientoPorRol.reduce((sum, r) => sum + r.porcentaje, 0) / cumplimientoPorRol.length
        totalRolesAnalizados += cumplimientoPorRol.length
      }
    }

    // Estadísticas globales
    estadisticas.value.totalSolicitudes = totalSolicitudesGlobal
    estadisticas.value.promedioSla = graficos.value.length > 0
      ? parseFloat((sumaPromedios / graficos.value.length).toFixed(1))
      : 0
    estadisticas.value.rolesAnalizados = totalRolesAnalizados

    await nextTick()
    if (vistaUnificada.value) {
      crearGraficoUnificado()
    } else {
      crearGraficos()
    }

    // Crear gráficos de análisis adicionales
    crearGraficoDistribucionEstadosAnalytic()
    crearGraficoResumenIncumplimientosAnalytic()

  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos analíticos',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const crearGraficos = () => {
  // Destruir gráficos anteriores
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  // Crear un gráfico para cada tipo SLA
  graficos.value.forEach((grafico, index) => {
    const canvas = chartCanvasRefs.value[index]
    if (!canvas || !grafico.datos.labels.length) return

    const ctx = canvas.getContext('2d')
    const chartType = tipoGrafico.value.value === 'area' ? 'line' : tipoGrafico.value.value

    const chart = new Chart(ctx, {
      type: chartType,
      data: grafico.datos,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: tipoGrafico.value.value === 'doughnut' || tipoGrafico.value.value === 'line',
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: function (context) {
                const idx = context[0].dataIndex
                const rol = grafico.datosRoles[idx]
                return rol ? rol.nombre : ''
              },
              label: function (context) {
                const idx = context.dataIndex
                const datasetLabel = context.dataset.label
                const valor = context.parsed.y

                // Si es "Cumplimiento SLA (%)" mostrar porcentaje, si no mostrar cantidad
                if (datasetLabel === 'Cumplimiento SLA (%)') {
                  const rol = grafico.datosRoles[idx]
                  return rol ? `${datasetLabel}: ${rol.porcentaje}%` : ''
                } else {
                  return `${datasetLabel}: ${Math.floor(valor)} solicitudes`
                }
              },
              afterLabel: function (context) {
                const idx = context.dataIndex
                const rol = grafico.datosRoles[idx]
                if (!rol) return ''

                const lineas = [
                  `Total: ${rol.total} solicitudes`,
                  `Cumplimiento: ${rol.porcentaje}%`,
                  `✓ Cumple: ${rol.cumplidos}`,
                  `⏳ Proceso: ${rol.proceso || 0}`,
                  `✗ No cumple: ${rol.noCumplen || 0}`
                ]
                return lineas
              },
            },
          },
        },
        scales:
          tipoGrafico.value.value !== 'doughnut'
            ? {
                x: {
                  ticks: {
                    callback: function (value, idx) {
                      const rol = grafico.datosRoles[idx]
                      if (!rol) return ''
                      return [rol.nombre, `Total: ${rol.total}`]
                    },
                    font: function (context) {
                      if (context.tick && context.tick.label) {
                        const label = context.tick.label
                        if (typeof label === 'object' && label.length > 1 && context.index === 1) {
                          return { size: 10 }
                        }
                      }
                      return { size: 12 }
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      // Si es doughnut/radar mostrar %, si no, cantidad
                      if (tipoGrafico.value.value === 'doughnut' || tipoGrafico.value.value === 'radar') {
                        return value + '%'
                      }
                      return Math.floor(value)
                    },
                    precision: 0,
                  },
                  title: {
                    display: true,
                    text: tipoGrafico.value.value === 'doughnut' || tipoGrafico.value.value === 'radar'
                      ? 'Porcentaje de Cumplimiento'
                      : 'Cantidad de Solicitudes'
                  }
                },
              }
            : {},
      },
    })

    chartInstances.value[index] = chart
  })
}

const crearGraficoUnificado = () => {
  // Destruir gráfico unificado anterior
  if (chartUnificadoInstance) {
    chartUnificadoInstance.destroy()
    chartUnificadoInstance = null
  }

  if (!chartUnificadoCanvas.value || graficos.value.length === 0) return

  const ctx = chartUnificadoCanvas.value.getContext('2d')
  const chartType = tipoGrafico.value.value === 'area' ? 'line' : tipoGrafico.value.value

  // Si es gráfico de líneas, crear un dataset por cada tipo SLA
  if (tipoGrafico.value.value === 'line' || tipoGrafico.value.value === 'area') {
    // Obtener todos los roles únicos
    const todosLosRoles = new Set()
    graficos.value.forEach(grafico => {
      grafico.datosRoles.forEach(rol => todosLosRoles.add(rol.nombre))
    })
    const rolesUnicos = Array.from(todosLosRoles)

    // Crear un dataset por cada tipo SLA
    const datasets = graficos.value.map((grafico, idx) => {
      const colores = [
        'rgba(33, 150, 243, 0.8)',   // Azul
        'rgba(156, 39, 176, 0.8)',   // Morado
        'rgba(255, 87, 34, 0.8)',    // Naranja oscuro
        'rgba(0, 150, 136, 0.8)',    // Verde azulado
        'rgba(255, 193, 7, 0.8)',    // Amarillo
        'rgba(121, 85, 72, 0.8)',    // Marrón
      ]
      const color = colores[idx % colores.length]

      // Mapear datos para cada rol
      const data = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        return rol ? rol.porcentaje : null
      })

      // Colores de puntos según nivel de cumplimiento
      const pointColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol) return 'rgba(200, 200, 200, 0.5)'
        return getColorByPercentage(rol.porcentaje)
      })

      return {
        label: grafico.codigoSla,
        data: data,
        datosRoles: grafico.datosRoles,
        borderColor: color,
        backgroundColor: color.replace('0.8', '0.1'),
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBorderWidth: 2,
        fill: tipoGrafico.value.value === 'area',
        tension: 0.4,
      }
    })

    chartUnificadoInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: rolesUnicos,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const dataIndex = context.dataIndex
                const rolNombre = rolesUnicos[dataIndex]
                const rol = dataset.datosRoles.find(r => r.nombre === rolNombre)

                if (!rol) return `${dataset.label}: Sin datos`
                return `${dataset.label}: ${rol.porcentaje}% (${rol.cumplidos}/${rol.total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y
                if (porcentaje >= 90) return '✓ Cumple (≥90%)'
                if (porcentaje >= 70) return '⚠ Proceso (≥70%)'
                if (porcentaje > 0) return '✗ No cumple (<70%)'
                return ''
              }
            }
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        },
      },
    })
  } else if (tipoGrafico.value.value === 'bar') {
    // Para barras: agrupar por roles con colores según nivel de cumplimiento
    const todosLosRoles = new Set()
    graficos.value.forEach(grafico => {
      grafico.datosRoles.forEach(rol => todosLosRoles.add(rol.nombre))
    })
    const rolesUnicos = Array.from(todosLosRoles)

    const datasets = graficos.value.map((grafico) => {
      const data = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        return rol ? rol.porcentaje : 0
      })

      // Asignar colores según el porcentaje de cada rol
      const backgroundColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol || rol.porcentaje === 0) return 'rgba(200, 200, 200, 0.3)'
        return getColorByPercentage(rol.porcentaje)
      })

      const borderColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol || rol.porcentaje === 0) return 'rgba(200, 200, 200, 0.5)'
        return getColorByPercentage(rol.porcentaje).replace('0.8', '1')
      })

      return {
        label: grafico.codigoSla,
        data: data,
        datosRoles: grafico.datosRoles,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      }
    })

    chartUnificadoInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rolesUnicos,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const dataIndex = context.dataIndex
                const rolNombre = rolesUnicos[dataIndex]
                const rol = dataset.datosRoles.find(r => r.nombre === rolNombre)

                if (!rol) return `${dataset.label}: Sin datos`
                return `${dataset.label}: ${rol.porcentaje}% (${rol.cumplidos}/${rol.total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y
                if (porcentaje >= 90) return '✓ Cumple'
                if (porcentaje >= 70) return '⚠ Proceso'
                if (porcentaje > 0) return '✗ No cumple'
                return ''
              }
            }
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        },
      },
    })
  } else {
    // Para otros tipos (doughnut, radar): mostrar promedio por tipo SLA con colores según nivel
    const labels = graficos.value.map(g => g.codigoSla)
    const data = graficos.value.map(g => {
      const promedio = g.datosRoles.reduce((sum, r) => sum + r.porcentaje, 0) / g.datosRoles.length
      return parseFloat(promedio.toFixed(1))
    })

    // Calcular totales de usuarios por SLA
    const usuariosTotales = graficos.value.map(g => {
      return g.datosRoles.reduce((sum, r) => sum + r.total, 0)
    })

    const usuariosCumplidos = graficos.value.map(g => {
      return g.datosRoles.reduce((sum, r) => sum + r.cumplidos, 0)
    })

    // Colores según el promedio de cada SLA
    const backgroundColors = data.map(promedio => getColorByPercentage(promedio))

    chartUnificadoInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Cumplimiento Promedio SLA (%)',
          data: data,
          usuariosTotales: usuariosTotales,
          usuariosCumplidos: usuariosCumplidos,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const index = context.dataIndex
                const porcentaje = context.parsed.y || context.parsed
                const total = dataset.usuariosTotales[index]
                const cumplidos = dataset.usuariosCumplidos[index]
                return `${context.label}: ${porcentaje}% (${cumplidos}/${total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y || context.parsed
                if (porcentaje >= 90) return 'Cumple (≥90%)'
                if (porcentaje >= 70) return 'Proceso (≥70%)'
                return 'No cumple (<70%)'
              }
            }
          }
        },
        scales: chartType !== 'doughnut' ? {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        } : {},
      },
    })
  }
}

const restablecerFiltros = () => {
  filtros.value = {
    mesInicio: null,
    mesFin: null,
    anioInicio: null,
    anioFin: null,
    tiposSla: [],
    roles: [],
  }
  tipoGrafico.value = { label: 'Barras', value: 'bar' }

  // Limpiar gráficos
  graficos.value = []
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  estadisticas.value = {
    totalSolicitudes: 0,
    promedioSla: 0,
    rolesAnalizados: 0,
  }
}

const mostrarDialogoExportacion = () => {
  dialogoExportacion.value = true
}

const seleccionarTodo = () => {
  seccionesExportar.value = {
    graficos: true,
    topRoles: true,
    distribucion: true,
    resumen: true,
  }
}

const confirmarExportacion = () => {
  dialogoExportacion.value = false
  exportarPDF()
}

const exportarPDF = async () => {
  try {
    // Validar que haya gráficos para exportar
    if (!graficos.value || graficos.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos para exportar. Por favor aplique los filtros primero.',
        position: 'top-right',
      })
      return
    }

    // Validar que al menos una sección esté seleccionada
    if (!algunaSeccionSeleccionada.value) {
      $q.notify({
        type: 'warning',
        message: 'Seleccione al menos una sección para exportar.',
        position: 'top-right',
      })
      return
    }

    $q.loading.show({ message: 'Generando PDF...' })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let yPos = margin
    let currentPage = 1

    // Cargar logo
    const logoUrl = '/src/assets/Tata_logo.png'
    let logoData = null
    try {
      const img = new Image()
      img.src = logoUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      logoData = canvas.toDataURL('image/png')
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error)
    }

    // Función para agregar header con logo
    const addHeader = () => {
      // Logo (esquina superior derecha)
      if (logoData) {
        const logoWidth = 40
        const logoHeight = 20
        pdf.addImage(logoData, 'PNG', pageWidth - margin - logoWidth, margin, logoWidth, logoHeight)
      }

      // Título
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text('Reporte de Análisis SLA', margin, margin + 7)

      // Subtítulo con información
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(80, 80, 80)

      let infoText = ''
      if (filtros.value.tiposSla && filtros.value.tiposSla.length > 0) {
        const totalRegistros = graficos.value.reduce((sum, g) => {
          return sum + (g.datosRoles?.reduce((s, r) => s + r.total, 0) || 0)
        }, 0)
        infoText = `Registros exportados: ${totalRegistros}`
      } else {
        infoText = 'Todos los tipos SLA'
      }
      pdf.text(infoText, margin, margin + 13)

      return margin + 20
    }

    // Función para agregar footer
    const addFooter = () => {
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Página ${currentPage}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }



    // Variable para controlar si ya se agregó la primera página
    let primeraSeccionAgregada = false

    // SECCIÓN 1: TOP DE ROLES - Tabla de datos
    if (seccionesExportar.value.topRoles) {
      yPos = addHeader()
      yPos += 5
      primeraSeccionAgregada = true

      // Preparar datos para tabla estilo logs
      const tableData = []

      graficos.value.forEach((grafico, idx) => {
        if (grafico.datosRoles && grafico.datosRoles.length > 0) {
          grafico.datosRoles.forEach((rol) => {
            tableData.push({
              id: idx + 1,
              codigoSla: grafico.codigoSla,
              rol: rol.nombre,
              porcentaje: `${rol.porcentaje}%`,
              cumplidos: rol.cumplidos,
              total: rol.total,
              nivel: rol.porcentaje >= 90 ? 'CUMPLE' : rol.porcentaje >= 70 ? 'PROCESO' : 'NO CUMPLE'
            })
          })
        }
      })

      // Dibujar tabla
      const colWidths = {
        id: 15,
        codigoSla: 25,
        rol: 50,
        porcentaje: 25,
        usuarios: 30,
        nivel: 35
      }

      // Header de tabla
      pdf.setFillColor(66, 139, 202) // Color azul del header
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')

      let xPos = margin + 2
      pdf.text('ID', xPos, yPos + 6.5)
      xPos += colWidths.id
      pdf.text('Código SLA', xPos, yPos + 6.5)
      xPos += colWidths.codigoSla
      pdf.text('Rol', xPos, yPos + 6.5)
      xPos += colWidths.rol
      pdf.text('SLA %', xPos, yPos + 6.5)
      xPos += colWidths.porcentaje
      pdf.text('Usuarios', xPos, yPos + 6.5)
      xPos += colWidths.usuarios
      pdf.text('Nivel', xPos, yPos + 6.5)

      yPos += 10

      // Filas de datos
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)

      tableData.forEach((row, index) => {
        // Verificar si hay espacio, si no, crear nueva página con header de tabla
        if (yPos + 8 > pageHeight - 20) {
          addFooter()
          pdf.addPage()
          currentPage++
          yPos = addHeader()
          yPos += 5

          // Redibujar header de tabla en nueva página
          pdf.setFillColor(66, 139, 202)
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')

          let xPosHeader = margin + 2
          pdf.text('ID', xPosHeader, yPos + 6.5)
          xPosHeader += colWidths.id
          pdf.text('Código SLA', xPosHeader, yPos + 6.5)
          xPosHeader += colWidths.codigoSla
          pdf.text('Rol', xPosHeader, yPos + 6.5)
          xPosHeader += colWidths.rol
          pdf.text('SLA %', xPosHeader, yPos + 6.5)
          xPosHeader += colWidths.porcentaje
          pdf.text('Usuarios', xPosHeader, yPos + 6.5)
          xPosHeader += colWidths.usuarios
          pdf.text('Nivel', xPosHeader, yPos + 6.5)

          yPos += 10
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
        }

        // Fila alternada
        const fillColor = index % 2 === 0 ? 255 : 245
        pdf.setFillColor(fillColor, fillColor, fillColor)
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')

        pdf.setTextColor(0, 0, 0)

        xPos = margin + 2
        pdf.text(String(row.id), xPos, yPos + 5.5)
        xPos += colWidths.id
        pdf.text(row.codigoSla, xPos, yPos + 5.5)
        xPos += colWidths.codigoSla

        // Truncar rol si es muy largo
        const rolText = row.rol.length > 25 ? row.rol.substring(0, 22) + '...' : row.rol
        pdf.text(rolText, xPos, yPos + 5.5)
        xPos += colWidths.rol
        pdf.text(row.porcentaje, xPos, yPos + 5.5)
        xPos += colWidths.porcentaje
        pdf.text(`${row.cumplidos}/${row.total}`, xPos, yPos + 5.5)
        xPos += colWidths.usuarios
        pdf.text(row.nivel, xPos, yPos + 5.5)

        yPos += 8
      })

      yPos += 10

      // Resumen de KPIs - Verificar si hay espacio, si no crear nueva página
      if (yPos + 60 > pageHeight - 20) {
        addFooter()
        pdf.addPage()
        currentPage++
        yPos = addHeader()
        yPos += 5
      }

      pdf.setFontSize(11)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Resumen Ejecutivo', margin, yPos)
      yPos += 8

      // Tabla de KPIs con estilo similar
      const kpiData = [
        { label: 'Total de Solicitudes', value: estadisticas.value.totalSolicitudes.toLocaleString() },
        { label: 'Promedio SLA General', value: `${estadisticas.value.promedioSla}%` },
        { label: 'Roles Analizados', value: estadisticas.value.rolesAnalizados.toLocaleString() },
      ]

      // Header KPI
      pdf.setFillColor(66, 139, 202)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')
      pdf.text('Indicador', margin + 2, yPos + 5.5)
      pdf.text('Valor', margin + (pageWidth - 2 * margin) * 0.65, yPos + 5.5)
      yPos += 8

      // Datos KPI
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)
      kpiData.forEach((kpi, index) => {
        const fillColor = index % 2 === 0 ? 255 : 245
        pdf.setFillColor(fillColor, fillColor, fillColor)
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.text(kpi.label, margin + 2, yPos + 4.5)
        pdf.text(kpi.value, margin + (pageWidth - 2 * margin) * 0.65, yPos + 4.5)
        yPos += 7
      })

      addFooter()

      // Agregar tabla visual de Top 5 Incumplidores por SLA
      graficos.value.forEach((grafico) => {
        if (grafico.topIncumplidores && grafico.topIncumplidores.length > 0) {
          // Nueva página para cada Top 5
          pdf.addPage()
          currentPage++
          yPos = addHeader()
          yPos += 5

          // Título del Top 5
          pdf.setFontSize(11)
          pdf.setFont(undefined, 'bold')
          pdf.setTextColor(66, 139, 202)
          pdf.text(`Top 5 Roles con Mayor Incumplimiento - ${grafico.codigoSla}`, margin, yPos)
          yPos += 10

          // Tabla de incumplidores
          const colWidthsTop = {
            rank: 15,
            rol: 120,
            incumplimientos: 50
          }

          // Header
          pdf.setFillColor(239, 83, 80) // Rojo para incumplimientos
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')

          let xPosTop = margin + 2
          pdf.text('#', xPosTop, yPos + 5.5)
          xPosTop += colWidthsTop.rank
          pdf.text('Rol', xPosTop, yPos + 5.5)
          xPosTop += colWidthsTop.rol
          pdf.text('Incumplimientos', xPosTop, yPos + 5.5)
          yPos += 8

          // Filas de datos
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
          grafico.topIncumplidores.slice(0, 5).forEach((rol, index) => {
            const fillColor = index % 2 === 0 ? 255 : 250
            pdf.setFillColor(fillColor, fillColor - 5, fillColor - 5)
            pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
            pdf.setTextColor(0, 0, 0)

            xPosTop = margin + 2
            pdf.text(String(index + 1), xPosTop, yPos + 4.5)
            xPosTop += colWidthsTop.rank
            const rolText = rol.nombre.length > 45 ? rol.nombre.substring(0, 42) + '...' : rol.nombre
            pdf.text(rolText, xPosTop, yPos + 4.5)
            xPosTop += colWidthsTop.rol
            pdf.text(String(rol.noCumplen), xPosTop, yPos + 4.5)
            yPos += 7
          })

          addFooter()
        }
      })
    }

    // SECCIÓN 2: ANÁLISIS DE SLA - Gráficos individuales
    if (seccionesExportar.value.graficos) {
      const graficosOrdenados = [...graficos.value].sort((a, b) => {
        const numA = parseInt(a.codigoSla.replace(/\D/g, '')) || 0
        const numB = parseInt(b.codigoSla.replace(/\D/g, '')) || 0
        return numA - numB
      })

      for (const grafico of graficosOrdenados) {
        if (primeraSeccionAgregada) {
          pdf.addPage()
          currentPage++
        } else {
          primeraSeccionAgregada = true
        }
        yPos = addHeader()
        yPos += 5

        // Título del gráfico
        pdf.setFontSize(12)
        pdf.setFont(undefined, 'bold')
        pdf.setTextColor(66, 139, 202)
        pdf.text(grafico.titulo, margin, yPos)
        yPos += 10

        // Agregar tabla de datos del SLA antes del gráfico
        if (grafico.datosRoles && grafico.datosRoles.length > 0) {
          pdf.setFontSize(10)
          pdf.setFont(undefined, 'bold')
          pdf.setTextColor(0, 0, 0)
          pdf.text('Detalle por Rol', margin, yPos)
          yPos += 8

          // Tabla de roles
          const colWidthsRol = {
            rol: 90,
            porcentaje: 35,
            usuarios: 40,
            nivel: 40
          }

          // Header
          pdf.setFillColor(66, 139, 202)
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')

          let xPosRol = margin + 2
          pdf.text('Rol', xPosRol, yPos + 5.5)
          xPosRol += colWidthsRol.rol
          pdf.text('SLA %', xPosRol, yPos + 5.5)
          xPosRol += colWidthsRol.porcentaje
          pdf.text('Usuarios', xPosRol, yPos + 5.5)
          xPosRol += colWidthsRol.usuarios
          pdf.text('Nivel', xPosRol, yPos + 5.5)
          yPos += 8

          // Datos
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
          grafico.datosRoles.forEach((rol, index) => {
            // Verificar espacio
            if (yPos + 7 > pageHeight - 20) {
              addFooter()
              pdf.addPage()
              currentPage++
              yPos = addHeader()
              yPos += 5

              // Redibujar header
              pdf.setFillColor(66, 139, 202)
              pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
              pdf.setTextColor(255, 255, 255)
              pdf.setFontSize(9)
              pdf.setFont(undefined, 'bold')

              xPosRol = margin + 2
              pdf.text('Rol', xPosRol, yPos + 5.5)
              xPosRol += colWidthsRol.rol
              pdf.text('SLA %', xPosRol, yPos + 5.5)
              xPosRol += colWidthsRol.porcentaje
              pdf.text('Usuarios', xPosRol, yPos + 5.5)
              xPosRol += colWidthsRol.usuarios
              pdf.text('Nivel', xPosRol, yPos + 5.5)
              yPos += 8

              pdf.setFont(undefined, 'normal')
              pdf.setFontSize(8)
            }

            const fillColor = index % 2 === 0 ? 255 : 245
            pdf.setFillColor(fillColor, fillColor, fillColor)
            pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
            pdf.setTextColor(0, 0, 0)

            xPosRol = margin + 2
            const rolText = rol.nombre.length > 35 ? rol.nombre.substring(0, 32) + '...' : rol.nombre
            pdf.text(rolText, xPosRol, yPos + 4.5)
            xPosRol += colWidthsRol.rol
            pdf.text(`${rol.porcentaje}%`, xPosRol, yPos + 4.5)
            xPosRol += colWidthsRol.porcentaje
            pdf.text(`${rol.cumplidos}/${rol.total}`, xPosRol, yPos + 4.5)
            xPosRol += colWidthsRol.usuarios

            const nivel = rol.porcentaje >= 90 ? 'CUMPLE' : rol.porcentaje >= 70 ? 'PROCESO' : 'NO CUMPLE'
            pdf.text(nivel, xPosRol, yPos + 4.5)
            yPos += 7
          })

          yPos += 10
        }

        // Agregar nueva página para el gráfico si hay tabla
        if (grafico.datosRoles && grafico.datosRoles.length > 0) {
          addFooter()
          pdf.addPage()
          currentPage++
          yPos = addHeader()
          yPos += 5

          pdf.setFontSize(12)
          pdf.setFont(undefined, 'bold')
          pdf.setTextColor(66, 139, 202)
          pdf.text(`${grafico.titulo} - Gráfico`, margin, yPos)
          yPos += 10
        }

        // Buscar el canvas del gráfico
        let canvas = null
        if (vistaUnificada.value) {
          canvas = document.getElementById('chartUnificadoCanvas')
        } else {
          const canvasId = `chartCanvas_${grafico.codigoSla}`
          canvas = document.getElementById(canvasId)
        }

        if (canvas) {
          try {
            const canvasImage = await html2canvas(canvas, {
              scale: 2,
              backgroundColor: '#ffffff',
            })

            const imgData = canvasImage.toDataURL('image/png')
            const imgWidth = pageWidth - 2 * margin
            const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width
            const maxHeight = pageHeight - yPos - 30
            const finalHeight = Math.min(imgHeight, maxHeight)
            const finalWidth = (finalHeight * canvasImage.width) / canvasImage.height

            pdf.addImage(imgData, 'PNG', margin, yPos, finalWidth, finalHeight)
            yPos += finalHeight + 5
          } catch (error) {
            console.error('Error al capturar gráfico:', error)
            pdf.setFontSize(9)
            pdf.setTextColor(200, 0, 0)
            pdf.text('Error al capturar gráfico', margin, yPos)
            yPos += 10
          }
        }

        addFooter()

        if (vistaUnificada.value) break
      }
    }

    // SECCIÓN 3: DISTRIBUCIÓN DE ESTADOS POR SOLICITUD
    if (seccionesExportar.value.distribucion) {
      if (primeraSeccionAgregada) {
        pdf.addPage()
        currentPage++
      } else {
        primeraSeccionAgregada = true
      }
      yPos = addHeader()
      yPos += 5

      // Título de la sección
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(66, 139, 202)
      pdf.text('Distribución de Estados por Solicitud', margin, yPos)
      yPos += 10

      // Agregar tabla de estadísticas de distribución
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Estadísticas de Distribución', margin, yPos)
      yPos += 8

      // Calcular totales
      let cumpleTotal = 0
      let procesoTotal = 0
      let noCumpleTotal = 0

      graficos.value.forEach(grafico => {
        grafico.datosRoles.forEach(rol => {
          cumpleTotal += rol.cumplidos || 0
          procesoTotal += rol.proceso || 0
          noCumpleTotal += rol.noCumplen || 0
        })
      })

      const totalSolicitudes = cumpleTotal + procesoTotal + noCumpleTotal

      // Tabla de distribución
      const distData = [
        { estado: 'Cumple', cantidad: cumpleTotal, porcentaje: totalSolicitudes > 0 ? ((cumpleTotal / totalSolicitudes) * 100).toFixed(1) : '0', color: [76, 175, 80] },
        { estado: 'En Proceso', cantidad: procesoTotal, porcentaje: totalSolicitudes > 0 ? ((procesoTotal / totalSolicitudes) * 100).toFixed(1) : '0', color: [255, 152, 0] },
        { estado: 'No Cumple', cantidad: noCumpleTotal, porcentaje: totalSolicitudes > 0 ? ((noCumpleTotal / totalSolicitudes) * 100).toFixed(1) : '0', color: [244, 67, 54] }
      ]

      // Header
      pdf.setFillColor(66, 139, 202)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')
      pdf.text('Estado', margin + 2, yPos + 5.5)
      pdf.text('Cantidad', margin + 70, yPos + 5.5)
      pdf.text('Porcentaje', margin + 120, yPos + 5.5)
      yPos += 8

      // Datos
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)
      distData.forEach((item) => {
        pdf.setFillColor(item.color[0], item.color[1], item.color[2], 0.1)
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.text(item.estado, margin + 2, yPos + 4.5)
        pdf.text(String(item.cantidad), margin + 70, yPos + 4.5)
        pdf.text(`${item.porcentaje}%`, margin + 120, yPos + 4.5)
        yPos += 7
      })

      yPos += 10

      // Capturar el gráfico de distribución
      const canvasDistribucion = document.getElementById('graficoDistribucionEstadosAnalytic')
      if (canvasDistribucion) {
        try {
          const canvasImage = await html2canvas(canvasDistribucion, {
            scale: 2,
            backgroundColor: '#ffffff',
          })

          const imgData = canvasImage.toDataURL('image/png')
          const imgWidth = (pageWidth - 2 * margin) * 0.7
          const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width
          const xOffset = margin + ((pageWidth - 2 * margin - imgWidth) / 2)

          if (yPos + imgHeight > pageHeight - 30) {
            addFooter()
            pdf.addPage()
            currentPage++
            yPos = addHeader()
            yPos += 5
          }

          pdf.addImage(imgData, 'PNG', xOffset, yPos, imgWidth, imgHeight)
          yPos += imgHeight + 5
        } catch (error) {
          console.error('Error al capturar gráfico de distribución:', error)
          pdf.setFontSize(9)
          pdf.setTextColor(200, 0, 0)
          pdf.text('Error al capturar gráfico de distribución', margin, yPos)
        }
      }

      addFooter()
    }

    // SECCIÓN 4: RESUMEN DE INCUMPLIMIENTOS POR TIPO SLA
    if (seccionesExportar.value.resumen) {
      if (primeraSeccionAgregada) {
        pdf.addPage()
        currentPage++
      } else {
        primeraSeccionAgregada = true
      }
      yPos = addHeader()
      yPos += 5

      // Título de la sección
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(66, 139, 202)
      pdf.text('Resumen de Incumplimientos por Tipo SLA', margin, yPos)
      yPos += 10

      // Agregar tabla de resumen de incumplimientos
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Detalle de Incumplimientos por Tipo SLA', margin, yPos)
      yPos += 8

      // Preparar datos de resumen
      const resumenData = []
      graficos.value.forEach(grafico => {
        let cumpleTotal = 0
        let procesoTotal = 0
        let noCumpleTotal = 0

        grafico.datosRoles.forEach(rol => {
          cumpleTotal += rol.cumplidos || 0
          procesoTotal += rol.proceso || 0
          noCumpleTotal += rol.noCumplen || 0
        })

        resumenData.push({
          codigo: grafico.codigoSla,
          cumple: cumpleTotal,
          proceso: procesoTotal,
          noCumple: noCumpleTotal,
          total: cumpleTotal + procesoTotal + noCumpleTotal
        })
      })

      // Header
      pdf.setFillColor(66, 139, 202)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')
      pdf.text('Tipo SLA', margin + 2, yPos + 5.5)
      pdf.text('Cumple', margin + 50, yPos + 5.5)
      pdf.text('Proceso', margin + 90, yPos + 5.5)
      pdf.text('No Cumple', margin + 130, yPos + 5.5)
      pdf.text('Total', margin + 175, yPos + 5.5)
      yPos += 8

      // Datos
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(8)
      resumenData.forEach((item, index) => {
        if (yPos + 7 > pageHeight - 20) {
          addFooter()
          pdf.addPage()
          currentPage++
          yPos = addHeader()
          yPos += 5

          // Redibujar header
          pdf.setFillColor(66, 139, 202)
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')
          pdf.text('Tipo SLA', margin + 2, yPos + 5.5)
          pdf.text('Cumple', margin + 50, yPos + 5.5)
          pdf.text('Proceso', margin + 90, yPos + 5.5)
          pdf.text('No Cumple', margin + 130, yPos + 5.5)
          pdf.text('Total', margin + 175, yPos + 5.5)
          yPos += 8
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
        }

        const fillColor = index % 2 === 0 ? 255 : 245
        pdf.setFillColor(fillColor, fillColor, fillColor)
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.text(item.codigo, margin + 2, yPos + 4.5)
        pdf.setTextColor(76, 175, 80)
        pdf.text(String(item.cumple), margin + 50, yPos + 4.5)
        pdf.setTextColor(255, 152, 0)
        pdf.text(String(item.proceso), margin + 90, yPos + 4.5)
        pdf.setTextColor(244, 67, 54)
        pdf.text(String(item.noCumple), margin + 130, yPos + 4.5)
        pdf.setTextColor(0, 0, 0)
        pdf.text(String(item.total), margin + 175, yPos + 4.5)
        yPos += 7
      })

      yPos += 10

      // Capturar el gráfico de resumen
      const canvasResumen = document.getElementById('graficoResumenIncumplimientosAnalytic')
      if (canvasResumen) {
        try {
          const canvasImage = await html2canvas(canvasResumen, {
            scale: 2,
            backgroundColor: '#ffffff',
          })

          const imgData = canvasImage.toDataURL('image/png')
          const imgWidth = pageWidth - 2 * margin
          const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width

          if (yPos + imgHeight > pageHeight - 30) {
            addFooter()
            pdf.addPage()
            currentPage++
            yPos = addHeader()
            yPos += 5
          }

          pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
        } catch (error) {
          console.error('Error al capturar gráfico de resumen:', error)
          pdf.setFontSize(9)
          pdf.setTextColor(200, 0, 0)
          pdf.text('Error al capturar gráfico de resumen', margin, yPos)
        }
      }

      addFooter()
    }

    // Guardar PDF
    const fileName = `Analisis_SLA_${new Date().getTime()}.pdf`
    pdf.save(fileName)

    $q.notify({
      type: 'positive',
      message: 'PDF exportado correctamente',
      position: 'top-right',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF',
      position: 'top-right',
    })
  } finally {
    $q.loading.hide()
  }
}

// Crear gráfico de distribución de estados para Analítica Interactiva
const crearGraficoDistribucionEstadosAnalytic = () => {
  const ctx = document.getElementById('graficoDistribucionEstadosAnalytic')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoDistribucionEstadosAnalyticInstance) {
    graficoDistribucionEstadosAnalyticInstance.destroy()
  }

  // Contar total de solicitudes por estado de todos los gráficos
  let cumpleTotal = 0
  let procesoTotal = 0
  let noCumpleTotal = 0

  graficos.value.forEach(grafico => {
    grafico.datosRoles.forEach(rol => {
      cumpleTotal += rol.cumplidos || 0
      procesoTotal += rol.proceso || 0
      noCumpleTotal += rol.noCumplen || 0
    })
  })

  graficoDistribucionEstadosAnalyticInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cumple', 'Proceso', 'No cumple'],
      datasets: [{
        data: [cumpleTotal, procesoTotal, noCumpleTotal],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 13 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${label}: ${value} solicitudes (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Crear gráfico resumen de incumplimientos para Analítica Interactiva
const crearGraficoResumenIncumplimientosAnalytic = () => {
  const ctx = document.getElementById('graficoResumenIncumplimientosAnalytic')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoResumenIncumplimientosAnalyticInstance) {
    graficoResumenIncumplimientosAnalyticInstance.destroy()
  }

  // Agrupar datos por tipo de SLA
  const labels = graficos.value.map(g => g.codigoSla)
  const cumpleData = graficos.value.map(g => {
    return g.datosRoles.reduce((sum, r) => sum + (r.cumplidos || 0), 0)
  })
  const procesoData = graficos.value.map(g => {
    return g.datosRoles.reduce((sum, r) => sum + (r.proceso || 0), 0)
  })
  const noCumpleData = graficos.value.map(g => {
    return g.datosRoles.reduce((sum, r) => sum + (r.noCumplen || 0), 0)
  })

  graficoResumenIncumplimientosAnalyticInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cumple',
          data: cumpleData,
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          borderWidth: 1
        },
        {
          label: 'Proceso',
          data: procesoData,
          backgroundColor: '#FF9800',
          borderColor: '#FF9800',
          borderWidth: 1
        },
        {
          label: 'No cumple',
          data: noCumpleData,
          backgroundColor: '#F44336',
          borderColor: '#F44336',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            footer: function(tooltipItems) {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
              return `Total: ${total} solicitudes`
            }
          }
        }
      }
    }
  })
}

const getColorByPercentage = (percentage) => {
  if (percentage >= 90) return 'rgba(76, 175, 80, 0.8)'
  if (percentage >= 70) return 'rgba(255, 152, 0, 0.8)'
  return 'rgba(244, 67, 54, 0.8)'
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionesIniciales()
  await aplicarFiltros()
})

onBeforeUnmount(() => {
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  if (chartUnificadoInstance) {
    chartUnificadoInstance.destroy()
    chartUnificadoInstance = null
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

.stat-card {
  background: white;
  border-radius: 8px;
  min-height: 100px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.color-legend {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: auto;
  min-height: auto;
  display: flex;
  flex-direction: column;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.legend-item .q-chip {
  font-size: 0.75rem;
  padding: 2px 8px;
  height: 24px;
}

.legend-item .text-caption {
  font-size: 0.7rem;
  line-height: 1.2;
}

.legend-item .text-subtitle2 {
  font-size: 0.8rem;
  margin-bottom: 8px !important;
}

.tipo-sla-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-height: 300px;
}

.incumplidor-item {
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.incumplidor-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateX(4px);
}

/* Responsive Design */

/* Desktop Large (1440px+) */
@media (min-width: 1440px) {
  .dashboard-page {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .chart-wrapper {
    min-height: 500px;
  }

  .color-legend {
    padding: 14px;
  }
}

/* Desktop (1024px - 1439px) */
@media (max-width: 1439px) and (min-width: 1024px) {
  .dashboard-page {
    padding: 24px 20px;
  }

  .chart-wrapper {
    min-height: 450px;
  }

  .color-legend {
    padding: 12px;
  }

  .stat-card {
    min-height: 90px;
  }
}

/* Tablet Landscape (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }

  .dashboard-header {
    padding: 16px;
  }

  .chart-wrapper {
    min-height: 350px;
  }

  .color-legend {
    padding: 10px;
  }

  .stat-card {
    min-height: 80px;
  }

  /* Reorganizar filtros para tablet */
  .filters-card .row > .col-md-4 {
    width: 50% !important;
  }

  .filters-card .row > .col-md-3 {
    width: 33.33% !important;
  }

  .filters-card .row > .col-md-2 {
    width: 25% !important;
  }
}

/* Tablet Portrait (600px - 767px) */
@media (max-width: 767px) and (min-width: 600px) {
  .dashboard-page {
    padding: 12px;
  }

  .dashboard-header {
    padding: 12px;
  }

  .dashboard-header .text-h5 {
    font-size: 1.25rem;
  }

  .chart-wrapper {
    min-height: 300px;
  }

  .color-legend {
    margin-top: 16px;
    padding: 10px;
  }

  .legend-items {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .legend-item {
    align-items: center;
    flex: 1 1 auto;
    min-width: 120px;
  }

  .stat-card {
    min-height: 70px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .text-h4 {
    font-size: 1.75rem;
  }

  /* Filtros en columna completa para tablet portrait */
  .filters-card .row > [class*="col-"] {
    width: 100% !important;
    margin-bottom: 8px;
  }

  /* Gráficos en columna completa */
  .dashboard-content .col-md-6,
  .dashboard-content .col-lg-6 {
    width: 100% !important;
    margin-bottom: 16px;
  }

  .tipo-sla-card {
    min-height: 250px;
  }
}

/* Mobile Large (480px - 599px) */
@media (max-width: 599px) and (min-width: 480px) {
  .dashboard-page {
    padding: 8px;
  }

  .dashboard-header {
    padding: 10px;
  }

  .dashboard-header .row {
    flex-direction: column;
    align-items: flex-start !important;
    text-align: left;
  }

  .dashboard-header .q-icon {
    margin-bottom: 8px;
    margin-right: 0;
  }

  .chart-wrapper {
    min-height: 250px;
  }

  .color-legend {
    margin-top: 12px;
    padding: 8px;
  }

  .legend-items {
    flex-direction: column;
    gap: 6px;
  }

  .legend-item {
    align-items: flex-start;
  }

  .stat-card {
    min-height: 60px;
  }

  .stat-card .text-h4 {
    font-size: 1.5rem;
  }

  .filters-card .q-gutter-md {
    gap: 8px;
  }

  .filters-card .row > [class*="col-"] {
    width: 100% !important;
    margin-bottom: 6px;
  }

  .text-h6 {
    font-size: 1rem;
  }

  .text-h5 {
    font-size: 1.1rem;
  }

  .tipo-sla-card {
    min-height: 200px;
    padding: 12px;
  }

  .incumplidor-item {
    padding: 6px;
  }
}

/* Mobile Small (320px - 479px) */
@media (max-width: 479px) {
  .dashboard-page {
    padding: 4px;
  }

  .dashboard-header {
    padding: 8px;
  }

  .dashboard-header .text-h5 {
    font-size: 1rem;
    line-height: 1.3;
  }

  .dashboard-header .text-grey-7 {
    font-size: 0.8rem;
  }

  .chart-wrapper {
    min-height: 200px;
  }

  .color-legend {
    padding: 6px;
    margin-top: 8px;
  }

  .color-legend .legend-item .q-chip {
    font-size: 0.7rem;
    padding: 1px 6px;
    height: 20px;
  }

  .color-legend .legend-item .text-caption {
    font-size: 0.65rem;
  }

  .stat-card {
    min-height: 50px;
  }

  .stat-card .text-h4 {
    font-size: 1.25rem;
  }

  .stat-card .text-subtitle2 {
    font-size: 0.85rem;
  }

  .stat-card .q-card-section {
    padding: 8px;
  }

  .text-h6 {
    font-size: 0.95rem;
  }

  .filters-card .q-card-section {
    padding: 8px;
  }

  .filters-card .q-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-height: 36px;
  }

  .tipo-sla-card {
    min-height: 150px;
    padding: 8px;
  }

  .incumplidor-item {
    padding: 4px;
    margin-bottom: 4px;
  }

  .legend-items .q-chip {
    font-size: 0.75rem;
    padding: 2px 8px;
  }
}

/* Mobile Extra Small (< 320px) */
@media (max-width: 319px) {
  .dashboard-page {
    padding: 2px;
  }

  .dashboard-header .text-h5 {
    font-size: 0.9rem;
  }

  .stat-card .text-h4 {
    font-size: 1.1rem;
  }

  .text-h6 {
    font-size: 0.85rem;
  }

  .chart-wrapper {
    min-height: 180px;
  }

  .tipo-sla-card {
    min-height: 120px;
  }
}

/* Orientación landscape en móviles */
@media (max-height: 500px) and (orientation: landscape) {
  .dashboard-page {
    padding: 8px 16px;
  }

  .chart-wrapper {
    min-height: 200px;
  }

  .color-legend {
    max-height: 180px;
    overflow-y: auto;
    padding: 8px;
  }

  .stat-card {
    min-height: 60px;
  }

  .dashboard-header {
    padding: 6px 12px;
  }

  .tipo-sla-card {
    min-height: 150px;
  }
}

/* Vista unificada específica para móvil */
@media (max-width: 767px) {
  .col-12.col-md-9 {
    width: 100% !important;
    margin-bottom: 12px;
  }

  .col-12.col-md-3 {
    width: 100% !important;
  }

  /* Forzar leyenda horizontal en móviles */
  .color-legend .legend-items {
    flex-direction: row !important;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .color-legend .legend-item {
    flex: 1 1 30%;
    min-width: auto;
    align-items: center;
    text-align: center;
  }

  .color-legend .legend-item .text-caption {
    display: none;
  }
}

/* Mejoras para interacción táctil */
@media (pointer: coarse) {
  .q-btn {
    min-height: 44px;
  }

  .q-select .q-field__control {
    min-height: 44px;
  }

  .q-chip {
    min-height: 32px;
    padding: 4px 12px;
  }

  .q-toggle {
    font-size: 16px;
  }
}

/* Alto contraste y accesibilidad */
@media (prefers-contrast: high) {
  .stat-card,
  .tipo-sla-card {
    border-width: 2px;
  }

  .incumplidor-item {
    border-width: 2px;
  }

  .color-legend {
    border-width: 2px;
  }
}

/* Reducción de movimiento */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .incumplidor-item {
    transition: none;
  }

  .incumplidor-item:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}

/* Mejoras para impresión */
@media print {
  .dashboard-page {
    padding: 0;
    background: white;
  }

  .q-btn {
    display: none;
  }

  .chart-wrapper {
    min-height: 300px;
    page-break-inside: avoid;
  }

  .stat-card {
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }
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

/* Estilos para el diálogo de exportación responsivo */
.export-dialog .q-dialog__backdrop {
  backdrop-filter: blur(4px);
}

.export-dialog-card {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.scroll-section {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 200px);
}

/* Desktop */
@media (min-width: 1024px) {
  .export-dialog .q-dialog__inner {
    padding: 40px;
  }

  .export-dialog-card {
    border-radius: 12px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  }
}

/* Tablet */
@media (max-width: 1023px) and (min-width: 600px) {
  .export-dialog .q-dialog__inner {
    padding: 24px;
  }

  .export-dialog-card {
    max-width: 90%;
    border-radius: 8px;
  }

  .scroll-section {
    max-height: calc(90vh - 180px);
  }

  .q-card-actions .q-btn {
    font-size: 13px !important;
    padding: 8px 16px !important;
  }
}

/* Mobile */
@media (max-width: 599px) {
  .export-dialog .q-dialog__inner {
    padding: 0;
  }

  .export-dialog-card {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .scroll-section {
    max-height: calc(100vh - 160px);
  }

  .q-card-actions {
    flex-direction: column-reverse !important;
    gap: 8px;
  }

  .q-card-actions > * {
    width: 100% !important;
  }

  .q-card-actions .row {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .q-card-actions .row .q-btn {
    width: 100% !important;
    margin: 0 !important;
  }

  .q-item {
    padding: 12px 16px !important;
  }

  .q-item-label {
    font-size: 14px !important;
  }

  .q-item-label.text-caption {
    font-size: 12px !important;
  }
}

/* Small Mobile */
@media (max-width: 374px) {
  .q-bar {
    font-size: 14px;
  }

  .q-card-section .text-subtitle1 {
    font-size: 16px !important;
  }

  .q-item-label {
    font-size: 13px !important;
  }

  .q-checkbox {
    transform: scale(0.9);
  }
}
</style>
