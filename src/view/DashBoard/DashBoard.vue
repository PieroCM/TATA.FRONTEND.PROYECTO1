<template>
  <q-page class="dashboard-page">
    <!-- Header del Dashboard -->
     <div class="dashboard-header q-mb-lg">
      <div class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="analytics" size="40px" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-medium">Dashboard Ejecutivo Mensual – SLA</div>
            <div class="text-grey-7">KPIs y métricas de cumplimiento por rol</div>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-chip v-if="loading" color="warning" text-color="white" icon="hourglass_empty">
            Cargando datos...
          </q-chip>
          <q-chip color="primary" text-color="white" icon="update"> Auto-refresh: 30s </q-chip>
        </div>
      </div>
    </div>

      <!-- Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Filtro Año -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.anio"
                :options="aniosDisponibles"
                label="Año"
                outlined
                dense
                @update:model-value="cargarDashboard"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-select>
            </div>

            <!-- Filtro Mes -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.mes"
                :options="mesesDisponibles"
                label="Mes"
                outlined
                dense
                @update:model-value="cargarDashboard"
              />
            </div>

            <!-- Botón Restablecer -->
            <div class="col-12 col-md-2">
              <q-btn
                outline
                color="primary"
                label="Restablecer Filtros"
                icon="refresh"
                @click="restablecerFiltros"
                class="full-width"
              />
            </div>
          </div>

          <!-- Filtros por Roles/Áreas -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Roles/Áreas</div>
            <div class="row q-gutter-sm">
              <q-chip
                v-for="rol in rolesSeleccionados"
                :key="rol"
                removable
                @remove="removerRol(rol)"
                color="primary"
                text-color="white"
                icon="person"
              >
                {{ rol }}
              </q-chip>
            </div>

            <!-- Select para agregar roles -->
            <q-select
              v-model="nuevoRol"
              :options="rolesDisponiblesParaSeleccionar"
              label="+ Agregar rol"
              outlined
              dense
              class="q-mt-sm"
              style="max-width: 300px"
              @update:model-value="agregarRol"
            />
          </div>

          <!-- Filtro por Estado SLA -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Estado de Cumplimiento SLA</div>
            <div class="row q-gutter-sm">
              <q-chip
                clickable
                :outline="filtroEstado !== 'Todos'"
                :color="filtroEstado === 'Todos' ? 'primary' : 'grey-4'"
                :text-color="filtroEstado === 'Todos' ? 'white' : 'grey-8'"
                icon="select_all"
                @click="filtroEstado = 'Todos'"
              >
                Todos
              </q-chip>
              <q-chip
                clickable
                :outline="filtroEstado !== 'Cumple'"
                :color="filtroEstado === 'Cumple' ? 'positive' : 'grey-4'"
                :text-color="filtroEstado === 'Cumple' ? 'white' : 'grey-8'"
                icon="check_circle"
                @click="filtroEstado = 'Cumple'"
              >
                Cumple
              </q-chip>
              <q-chip
                clickable
                :outline="filtroEstado !== 'Proceso'"
                :color="filtroEstado === 'Proceso' ? 'orange' : 'grey-4'"
                :text-color="filtroEstado === 'Proceso' ? 'white' : 'grey-8'"
                icon="schedule"
                @click="filtroEstado = 'Proceso'"
              >
                Proceso
              </q-chip>
              <q-chip
                clickable
                :outline="filtroEstado !== 'No_cumple'"
                :color="filtroEstado === 'No_cumple' ? 'negative' : 'grey-4'"
                :text-color="filtroEstado === 'No_cumple' ? 'white' : 'grey-8'"
                icon="cancel"
                @click="filtroEstado = 'No_cumple'"
              >
                No cumple
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tarjetas de KPIs principales -->
      <div class="row q-col-gutter-lg q-mb-lg relative-position">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <!-- SLA Global Mensual -->
        <div class="col-12 col-md-6 col-lg-3">
          <q-card flat bordered :class="['stat-card', getCardClass(slaGlobal)]">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-grey-7 text-subtitle2">SLA Global Mensual</div>
                  <div class="text-h3 text-weight-bold q-mt-sm">{{ slaGlobal }}%</div>
                </div>
                <div class="col-auto">
                  <q-icon
                    :name="getIconoSla(slaGlobal)"
                    :color="getColorSla(slaGlobal)"
                    size="48px"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Variación vs Mes Anterior -->
        <div class="col-12 col-md-6 col-lg-3">
          <q-card flat bordered :class="['stat-card', getCardClassVariacion(variacion)]">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-grey-7 text-subtitle2">Variación vs Mes Anterior</div>
                  <div class="row items-center q-mt-sm">
                    <q-icon
                      :name="variacion >= 0 ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                      :color="variacion >= 0 ? 'positive' : 'negative'"
                      size="40px"
                    />
                    <div
                      class="text-h4 text-weight-bold"
                      :class="variacion >= 0 ? 'text-positive' : 'text-negative'"
                    >
                      {{ variacion >= 0 ? '+' : '' }}{{ variacion }}%
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Rol con Mayor Cumplimiento -->
        <div class="col-12 col-md-6 col-lg-3">
          <q-card flat bordered class="stat-card card-success">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-grey-7 text-subtitle2">Mejor Rol</div>
                  <div class="text-body1 text-weight-bold text-positive q-mt-xs">
                    {{ mejorRol }}
                  </div>
                  <div class="text-h5 text-weight-bold text-grey-9">{{ mejorRolPorcentaje }}%</div>
                </div>
                <div class="col-auto">
                  <q-icon name="emoji_events" color="positive" size="40px" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Rol con Menor Cumplimiento -->
        <div class="col-12 col-md-6 col-lg-3">
          <q-card flat bordered class="stat-card card-warning">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-grey-7 text-subtitle2">Atención Requerida</div>
                  <div class="text-body1 text-weight-bold text-orange q-mt-xs">
                    {{ peorRol }}
                  </div>
                  <div class="text-h5 text-weight-bold text-grey-9">{{ peorRolPorcentaje }}%</div>
                </div>
                <div class="col-auto">
                  <q-icon name="trending_down" color="orange" size="40px" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Nuevos Gráficos de Análisis SLA -->
      <div class="row q-col-gutter-lg q-mb-lg relative-position">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <!-- Gráfico: N° de Cumplimiento por Mes -->
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="show_chart" color="primary" class="q-mr-sm" />
                N° de Cumplimiento por Mes
              </div>
              <canvas id="graficoMensual" style="max-height: 300px"></canvas>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfico: Rol que Incumple Más por Tipo SLA -->
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="bar_chart" color="negative" class="q-mr-sm" />
                Incumplimiento por Rol y Tipo SLA
              </div>
              <canvas id="graficoIncumplimientoRol" style="max-height: 300px"></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Análisis Detallado: Top 5 Roles con Más Incumplimientos -->
      <div class="row q-col-gutter-lg q-mb-lg relative-position">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

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
                  v-for="tipoSla in tiposSlaDisponibles.slice(0, 3)"
                  :key="tipoSla.idSla"
                  class="col-12 col-md-4"
                >
                  <div class="tipo-sla-card">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                      {{ tipoSla.nombre }}
                    </div>
                    <div v-if="tipoSla.topIncumplidores && tipoSla.topIncumplidores.length > 0">
                      <div
                        v-for="(rol, idx) in tipoSla.topIncumplidores.slice(0, 5)"
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
                          :value="rol.noCumplen / (tipoSla.estadisticas.noCumple || 1)"
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

      <!-- Gráfico: Distribución de Estados por Solicitud -->
      <div class="row q-col-gutter-lg q-mb-lg relative-position">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="donut_small" color="primary" class="q-mr-sm" />
                Distribución de Estados por Solicitud
              </div>
              <canvas id="graficoDistribucionEstados" style="max-height: 350px"></canvas>
              <div class="text-center text-caption text-grey-7 q-mt-sm">
                Total de {{ totalSolicitudes }} solicitudes analizadas
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
              <canvas id="graficoResumenIncumplimientos" style="max-height: 350px"></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos separados por Tipo de SLA -->
      <div class="row q-col-gutter-lg q-mb-lg relative-position">
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div
          v-for="tipoSla in tiposSlaDisponiblesFiltrados"
          :key="tipoSla.nombre"
          :class="tiposSlaDisponiblesFiltrados.length === 1 ? 'col-12' : 'col-12 col-lg-6'"
        >
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div>
                  <div class="text-h6 text-weight-medium">
                    {{ tipoSla.nombre }}
                  </div>
                  <div class="text-grey-7 text-caption">
                    Umbral: {{ tipoSla.diasUmbral }} días | Total:
                    {{ tipoSla.totalSolicitudes }} solicitudes
                  </div>
                </div>
                <q-chip
                  :color="getSlaChipColor(tipoSla.slaPromedio)"
                  text-color="white"
                  icon="analytics"
                >
                  SLA: {{ tipoSla.slaPromedio }}%
                </q-chip>
              </div>

              <!-- Mini-estadísticas por Estado -->
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-4">
                  <div class="mini-stat" style="background-color: #e8f5e9; border-left: 4px solid #4caf50">
                    <div class="text-caption text-grey-7">Cumple</div>
                    <div class="text-h6 text-weight-bold text-positive">
                      {{ tipoSla.estadisticas.cumple }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ tipoSla.estadisticas.cumplePct }}%
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="mini-stat" style="background-color: #fff3e0; border-left: 4px solid #ff9800">
                    <div class="text-caption text-grey-7">Proceso</div>
                    <div class="text-h6 text-weight-bold text-orange">
                      {{ tipoSla.estadisticas.proceso }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ tipoSla.estadisticas.procesoPct }}%
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="mini-stat" style="background-color: #ffebee; border-left: 4px solid #f44336">
                    <div class="text-caption text-grey-7">No cumple</div>
                    <div class="text-h6 text-weight-bold text-negative">
                      {{ tipoSla.estadisticas.noCumple }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ tipoSla.estadisticas.noCumplePct }}%
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <!-- Gráfico de barras por rol para este tipo de SLA -->
              <div v-if="tipoSla.cumplimientoRoles.length > 0" class="chart-container">
                <div
                  v-for="(rol, index) in tipoSla.cumplimientoRoles"
                  :key="index"
                  class="chart-row q-mb-md"
                >
                  <div class="chart-label">{{ rol.nombre }}</div>
                  <div class="chart-bar-container">
                    <div
                      class="chart-bar"
                      :style="{
                        width: `${rol.cumplimiento}%`,
                        background: getBarColorBySla(rol.cumplimiento),
                      }"
                    >
                      <span class="chart-value">{{ rol.cumplimiento }}% ({{ rol.total }})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-lg">
                No hay datos para este tipo de SLA
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useAppStore } from 'stores/app-store'
import { useSlaStore } from 'stores/useSlaStore'
import { Chart, registerables } from 'chart.js'

// Registrar todos los componentes de Chart.js
Chart.register(...registerables)

// Obtener instancia de Quasar
const $q = useQuasar()
const appStore = useAppStore()
const slaStore = useSlaStore()

// Referencias reactivas
const loading = ref(false)

const autoRefresh = ref(true)
const refreshInterval = ref(null)

// Meses disponibles (declarar primero)
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

// Filtros (usar después de declarar mesesDisponibles)
const filtros = ref({
  anio: new Date().getFullYear(),
  mes: mesesDisponibles[new Date().getMonth()],
})

const aniosDisponibles = ref([])

// Roles
const rolesSeleccionados = ref([])
const nuevoRol = ref(null)
const rolesDisponibles = ref([])

// Computed: Roles disponibles para seleccionar (excluye los ya seleccionados)
const rolesDisponiblesParaSeleccionar = computed(() => {
  return rolesDisponibles.value.filter((rol) => !rolesSeleccionados.value.includes(rol))
})

// Estadísticas principales
const slaGlobal = ref(0)
const variacion = ref(0)
const mejorRol = ref('N/A')
const mejorRolPorcentaje = ref(0)
const peorRol = ref('N/A')
const peorRolPorcentaje = ref(0)

// Cumplimiento por roles
const cumplimientoRoles = ref([])

// Tipos de SLA con sus gráficos separados
const tiposSlaDisponibles = ref([])

// Todos los roles para filtros
const todosLosRoles = ref([])

// Filtro por estado
const filtroEstado = ref('Todos')

// Total de solicitudes
const totalSolicitudes = ref(0)

// Instancias de gráficos Chart.js
let graficoMensualInstance = null
let graficoIncumplimientoRolInstance = null
let graficoDistribucionEstadosInstance = null
let graficoResumenIncumplimientosInstance = null

// Computed para roles activos
const rolesActivos = computed(() => {
  return todosLosRoles.value.filter((r) => r.activo).map((r) => r.nombre)
})

// Computed para filtrar tipos SLA por estado
const tiposSlaDisponiblesFiltrados = computed(() => {
  if (filtroEstado.value === 'Todos') {
    return tiposSlaDisponibles.value
  }

  // Filtrar los tipos de SLA que tengan al menos una solicitud en el estado seleccionado
  return tiposSlaDisponibles.value.filter(tipoSla => {
    if (filtroEstado.value === 'Cumple') return tipoSla.estadisticas.cumple > 0
    if (filtroEstado.value === 'Proceso') return tipoSla.estadisticas.proceso > 0
    if (filtroEstado.value === 'No_cumple') return tipoSla.estadisticas.noCumple > 0
    return true
  })
})

// Watch para detectar cambios en los filtros de chips
watch(rolesActivos, (nuevosRoles) => {
  if (JSON.stringify(nuevosRoles.sort()) !== JSON.stringify(rolesSeleccionados.value.sort())) {
    rolesSeleccionados.value = [...nuevosRoles]
    cargarDashboard()
  }
})

// Métodos
const cargarAniosDisponibles = async () => {
  // Inicializar inmediatamente con años recientes para no bloquear UI
  const currentYear = new Date().getFullYear()
  if (aniosDisponibles.value.length === 0) {
    aniosDisponibles.value = [currentYear, currentYear - 1]
  }

  try {
    // Obtener años desde las solicitudes (en segundo plano si es necesario)
    const solicitudes = await slaStore.fetchSolicitudes()

    if (solicitudes && solicitudes.length > 0) {
      // Extraer años únicos de las fechas de solicitud
      const aniosUnicos = [
        ...new Set(
          solicitudes
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear()),
        ),
      ].sort((a, b) => b - a)

      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }
  } catch (error) {
    console.log('Usando años por defecto:', error.message)
    // Ya tenemos valores por defecto, no es necesario hacer nada más
  }
}

const cargarRolesDisponibles = async () => {
  try {
    // Usar tu endpoint de RolRegistro (roles técnicos)
    const roles = await slaStore.fetchRoles()

    if (roles && roles.length > 0) {
      // Filtrar solo roles activos
      const rolesActivos = roles.filter((r) => r.esActivo !== false)

      rolesDisponibles.value = rolesActivos.map((r) => r.nombreRol)

      // Si no hay roles seleccionados, seleccionar los primeros 3
      if (rolesSeleccionados.value.length === 0 && rolesDisponibles.value.length > 0) {
        rolesSeleccionados.value = rolesDisponibles.value.slice(
          0,
          Math.min(3, rolesDisponibles.value.length),
        )
      }

      // Actualizar todosLosRoles para los chips
      todosLosRoles.value = rolesActivos.map((r) => ({
        nombre: r.nombreRol,
        cantidad: 0, // Se actualizará con las solicitudes
        activo: rolesSeleccionados.value.includes(r.nombreRol),
      }))
    }
  } catch (error) {
    console.error('Error al cargar roles:', error)
    // Roles por defecto
    rolesDisponibles.value = [
      'Desarrollador Sr.',
      'QA Analyst',
      'DevOps Engineer',
      'Project Manager',
      'Business Analyst',
      'Data Engineer',
      'Scrum Master',
    ]
    if (rolesSeleccionados.value.length === 0) {
      rolesSeleccionados.value = rolesDisponibles.value.slice(0, 3)
    }
  }
}

const cargarDashboard = async () => {
  loading.value = true

  try {
    const mesNumero = mesesDisponibles.indexOf(filtros.value.mes) + 1

    // Obtener todas las solicitudes y roles
    const [solicitudesData, rolesData, configSlaData] = await Promise.all([
      slaStore.fetchSolicitudes(),
      slaStore.fetchRoles(),
      slaStore.fetchConfigSla(),
    ])

    const todasSolicitudes = solicitudesData || []
    const todosRoles = rolesData || []
    const configsSla = configSlaData || []

    // Filtrar solicitudes del mes y año seleccionados
    const solicitudesMes = todasSolicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio && fecha.getMonth() + 1 === mesNumero
    })

    // Si hay roles seleccionados, filtrar por esos roles
    let solicitudesFiltradas = solicitudesMes
    if (rolesSeleccionados.value.length > 0) {
      solicitudesFiltradas = solicitudesMes.filter((s) => {
        const rol = todosRoles.find((r) => r.idRolRegistro === s.idRolRegistro)
        return rol && rolesSeleccionados.value.includes(rol.nombreRol)
      })
    }

    // Calcular cumplimiento de SLA con estados
    const solicitudesConSla = solicitudesFiltradas.map((s) => {
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

      return { ...s, cumpleSla, diasUmbral, estadoSla }
    })

    // Calcular SLA Global
    const totalSolicitudes = solicitudesConSla.length
    const solicitudesCumplen = solicitudesConSla.filter((s) => s.cumpleSla).length
    slaGlobal.value =
      totalSolicitudes > 0
        ? parseFloat(((solicitudesCumplen / totalSolicitudes) * 100).toFixed(1))
        : 0

    // Calcular variación con mes anterior
    const mesAnterior = mesNumero === 1 ? 12 : mesNumero - 1
    const anioAnterior = mesNumero === 1 ? filtros.value.anio - 1 : filtros.value.anio

    const solicitudesMesAnterior = todasSolicitudes
      .filter((s) => {
        if (!s.fechaSolicitud) return false
        const fecha = new Date(s.fechaSolicitud)
        return fecha.getFullYear() === anioAnterior && fecha.getMonth() + 1 === mesAnterior
      })
      .map((s) => {
        const config = configsSla.find((c) => c.idSla === s.idSla)
        const diasUmbral = config?.diasUmbral || 0
        let cumpleSla = false
        if (s.fechaSolicitud && s.fechaIngreso) {
          const fechaSol = new Date(s.fechaSolicitud)
          const fechaIng = new Date(s.fechaIngreso)
          const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
          cumpleSla = diasTranscurridos <= diasUmbral
        }
        return { cumpleSla }
      })

    if (solicitudesMesAnterior.length > 0) {
      const slaMesAnterior =
        (solicitudesMesAnterior.filter((s) => s.cumpleSla).length / solicitudesMesAnterior.length) *
        100
      variacion.value = parseFloat((slaGlobal.value - slaMesAnterior).toFixed(1))
    } else {
      variacion.value = 0
    }

    // Calcular cumplimiento por rol
    const cumplimientoPorRol = todosRoles
      .filter((r) => r.esActivo)
      .filter((rol) => {
        // Si NO hay roles seleccionados, mostrar todos
        if (rolesSeleccionados.value.length === 0) return true
        // Si HAY roles seleccionados, mostrar solo esos (aunque no tengan registros)
        return rolesSeleccionados.value.includes(rol.nombreRol)
      })
      .map((rol) => {
        const solicitudesRol = solicitudesConSla.filter(
          (s) => s.idRolRegistro === rol.idRolRegistro,
        )
        const totalRol = solicitudesRol.length
        const cumplenRol = solicitudesRol.filter((s) => s.cumpleSla).length
        const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

        return {
          nombre: rol.nombreRol,
          cumplimiento: parseFloat(porcentaje.toFixed(1)),
          total: totalRol,
        }
      })
      .sort((a, b) => b.cumplimiento - a.cumplimiento)

    cumplimientoRoles.value = cumplimientoPorRol
    mejorRol.value = cumplimientoPorRol.length > 0 ? cumplimientoPorRol[0].nombre : 'N/A'
    mejorRolPorcentaje.value =
      cumplimientoPorRol.length > 0 ? cumplimientoPorRol[0].cumplimiento : 0
    peorRol.value =
      cumplimientoPorRol.length > 0
        ? cumplimientoPorRol[cumplimientoPorRol.length - 1].nombre
        : 'N/A'
    peorRolPorcentaje.value =
      cumplimientoPorRol.length > 0
        ? cumplimientoPorRol[cumplimientoPorRol.length - 1].cumplimiento
        : 0

    // Calcular gráficos separados por tipo de SLA con estadísticas por estado
    tiposSlaDisponibles.value = configsSla
      .filter((config) => config.esActivo)
      .map((config) => {
        // Filtrar solicitudes de este tipo de SLA
        const solicitudesTipoSla = solicitudesConSla.filter((s) => s.idSla === config.idSla)
        const totalTipoSla = solicitudesTipoSla.length
        const cumplenTipoSla = solicitudesTipoSla.filter((s) => s.cumpleSla).length
        const slaPromedio =
          totalTipoSla > 0 ? parseFloat(((cumplenTipoSla / totalTipoSla) * 100).toFixed(1)) : 0

        // Calcular estadísticas por estado
        const cumpleCount = solicitudesTipoSla.filter(s => s.estadoSla === 'Cumple').length
        const procesoCount = solicitudesTipoSla.filter(s => s.estadoSla === 'Proceso').length
        const noCumpleCount = solicitudesTipoSla.filter(s => s.estadoSla === 'No_cumple').length

        const estadisticas = {
          cumple: cumpleCount,
          proceso: procesoCount,
          noCumple: noCumpleCount,
          cumplePct: totalTipoSla > 0 ? parseFloat(((cumpleCount / totalTipoSla) * 100).toFixed(1)) : 0,
          procesoPct: totalTipoSla > 0 ? parseFloat(((procesoCount / totalTipoSla) * 100).toFixed(1)) : 0,
          noCumplePct: totalTipoSla > 0 ? parseFloat(((noCumpleCount / totalTipoSla) * 100).toFixed(1)) : 0
        }

        // Calcular cumplimiento por rol para este tipo de SLA
        const cumplimientoPorRolTipoSla = todosRoles
          .filter((r) => r.esActivo)
          .filter((rol) => {
            // Si NO hay roles seleccionados, mostrar todos
            if (rolesSeleccionados.value.length === 0) return true
            // Si HAY roles seleccionados, mostrar solo esos (aunque no tengan registros)
            return rolesSeleccionados.value.includes(rol.nombreRol)
          })
          .map((rol) => {
            const solicitudesRolTipo = solicitudesTipoSla.filter(
              (s) => s.idRolRegistro === rol.idRolRegistro,
            )
            const totalRolTipo = solicitudesRolTipo.length
            const cumplenRolTipo = solicitudesRolTipo.filter((s) => s.cumpleSla).length
            const noCumplenRolTipo = solicitudesRolTipo.filter((s) => s.estadoSla === 'No_cumple').length
            const porcentaje = totalRolTipo > 0 ? (cumplenRolTipo / totalRolTipo) * 100 : 0

            return {
              nombre: rol.nombreRol,
              cumplimiento: parseFloat(porcentaje.toFixed(1)),
              total: totalRolTipo,
              noCumplen: noCumplenRolTipo,
            }
          })
          .sort((a, b) => b.cumplimiento - a.cumplimiento)

        // Top 5 roles que más incumplen este tipo de SLA
        const topIncumplidores = todosRoles
          .filter((r) => r.esActivo)
          .map((rol) => {
            const solicitudesRolTipo = solicitudesTipoSla.filter(
              (s) => s.idRolRegistro === rol.idRolRegistro,
            )
            const noCumplenRolTipo = solicitudesRolTipo.filter((s) => s.estadoSla === 'No_cumple').length

            return {
              nombre: rol.nombreRol,
              noCumplen: noCumplenRolTipo,
            }
          })
          .filter(r => r.noCumplen > 0)
          .sort((a, b) => b.noCumplen - a.noCumplen)
          .slice(0, 5)

        return {
          nombre: config.tipoSolicitud || `SLA ${config.idSla}`,
          diasUmbral: config.diasUmbral,
          totalSolicitudes: totalTipoSla,
          slaPromedio: slaPromedio,
          cumplimientoRoles: cumplimientoPorRolTipoSla,
          estadisticas: estadisticas,
          idSla: config.idSla,
          topIncumplidores: topIncumplidores
        }
      })
      .filter((tipo) => tipo.totalSolicitudes > 0)

    // Actualizar total de solicitudes
    totalSolicitudes.value = solicitudesConSla.length

    // Crear los nuevos gráficos
    await crearGraficoCumplimientoMes(todasSolicitudes, configsSla)
    await crearGraficoIncumplimientoRol(solicitudesConSla, todosRoles, configsSla)
    await crearGraficoDistribucionEstados(solicitudesConSla)
    await crearGraficoResumenIncumplimientos(tiposSlaDisponibles.value, solicitudesConSla)

    // Actualizar todos los roles con cantidades
    todosLosRoles.value = todosRoles
      .filter((r) => r.esActivo)
      .map((rol) => {
        const cantidad = solicitudesMes.filter((s) => s.idRolRegistro === rol.idRolRegistro).length
        return {
          nombre: rol.nombreRol,
          cantidad: cantidad,
          activo: rolesSeleccionados.value.includes(rol.nombreRol),
        }
      })
  } catch (error) {
    console.error('Error al cargar dashboard desde API:', error)

    // Cargar datos de ejemplo cuando falla el API
    cargarDatosEjemplo()

    let errorMessage = 'Usando datos de ejemplo. '

    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage +=
        'No se pudo conectar con el servidor. Verifica que la API esté corriendo en Visual Studio.'
    } else if (error.response?.status === 404) {
      errorMessage +=
        'Los endpoints del API aún no están implementados. Revisa el archivo SlaController.cs'
    } else if (error.response?.status === 500) {
      errorMessage += 'Error en el servidor. Revisa los logs de la API en Visual Studio.'
    }

    $q.notify({
      type: 'warning',
      message: errorMessage,
      position: 'top-right',
      timeout: 5000,
      actions: [{ label: 'Reintentar', color: 'white', handler: () => cargarDashboard() }],
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const cargarDatosEjemplo = () => {
  // Datos de ejemplo cuando el API no está disponible
  slaGlobal.value = 87.5
  variacion.value = 2.3
  mejorRol.value = 'Desarrollador Sr.'

  cumplimientoRoles.value = [
    { nombre: 'Desarrollador Sr.', cumplimiento: 92.5 },
    { nombre: 'QA Analyst', cumplimiento: 88.3 },
    { nombre: 'DevOps Engineer', cumplimiento: 85.7 },
    { nombre: 'Desarrollador Jr.', cumplimiento: 82.1 },
    { nombre: 'Scrum Master', cumplimiento: 79.4 },
  ]

  todosLosRoles.value = [
    { nombre: 'Desarrollador Sr.', cantidad: 45, activo: true },
    { nombre: 'QA Analyst', cantidad: 32, activo: true },
    { nombre: 'DevOps Engineer', cantidad: 28, activo: true },
    { nombre: 'Desarrollador Jr.', cantidad: 38, activo: false },
    { nombre: 'Scrum Master', cantidad: 15, activo: false },
    { nombre: 'Product Owner', cantidad: 12, activo: false },
    { nombre: 'UX Designer', cantidad: 18, activo: false },
  ]

  rolesDisponibles.value = todosLosRoles.value.map((r) => r.nombre)
  rolesSeleccionados.value = todosLosRoles.value.filter((r) => r.activo).map((r) => r.nombre)
}

const restablecerFiltros = () => {
  const currentDate = new Date()
  filtros.value = {
    anio: currentDate.getFullYear(),
    mes: mesesDisponibles[currentDate.getMonth()],
  }

  // Restablecer roles a los primeros 3 disponibles
  if (rolesDisponibles.value.length > 0) {
    rolesSeleccionados.value = rolesDisponibles.value.slice(0, 3)
  }

  // Restablecer chips de roles
  todosLosRoles.value.forEach((rol) => {
    rol.activo = rolesSeleccionados.value.includes(rol.nombre)
  })

  cargarDashboard()
}

const agregarRol = (rol) => {
  if (rol && !rolesSeleccionados.value.includes(rol)) {
    rolesSeleccionados.value.push(rol)

    // Actualizar estado del chip
    const rolChip = todosLosRoles.value.find((r) => r.nombre === rol)
    if (rolChip) {
      rolChip.activo = true
    }

    cargarDashboard()
  }
  nuevoRol.value = null
}

const removerRol = (rol) => {
  const index = rolesSeleccionados.value.indexOf(rol)
  if (index > -1) {
    rolesSeleccionados.value.splice(index, 1)

    // Actualizar estado del chip
    const rolChip = todosLosRoles.value.find((r) => r.nombre === rol)
    if (rolChip) {
      rolChip.activo = false
    }

    cargarDashboard()
  }
}

// Crear gráfico de cumplimiento mensual
const crearGraficoCumplimientoMes = async (todasSolicitudes, configsSla) => {
  const ctx = document.getElementById('graficoMensual')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoMensualInstance) {
    graficoMensualInstance.destroy()
  }

  // Agrupar solicitudes por mes del año seleccionado
  const mesesData = Array(12).fill(0).map(() => ({ cumple: 0, proceso: 0, noCumple: 0 }))

  todasSolicitudes.forEach(sol => {
    if (!sol.fechaSolicitud) return
    const fecha = new Date(sol.fechaSolicitud)
    if (fecha.getFullYear() !== filtros.value.anio) return

    const mes = fecha.getMonth()
    const config = configsSla.find(c => c.idSla === sol.idSla)
    const diasUmbral = config?.diasUmbral || 0

    if (sol.fechaSolicitud && sol.fechaIngreso) {
      const fechaSol = new Date(sol.fechaSolicitud)
      const fechaIng = new Date(sol.fechaIngreso)
      const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
      if (diasTranscurridos <= diasUmbral) {
        mesesData[mes].cumple++
      } else {
        mesesData[mes].noCumple++
      }
    } else if (sol.fechaSolicitud && !sol.fechaIngreso) {
      const fechaSol = new Date(sol.fechaSolicitud)
      const hoy = new Date()
      const diasTranscurridos = Math.floor((hoy - fechaSol) / (1000 * 60 * 60 * 24))
      if (diasTranscurridos > diasUmbral) {
        mesesData[mes].noCumple++
      } else {
        mesesData[mes].proceso++
      }
    }
  })

  graficoMensualInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Cumple',
          data: mesesData.map(m => m.cumple),
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          borderWidth: 1
        },
        {
          label: 'Proceso',
          data: mesesData.map(m => m.proceso),
          backgroundColor: '#FF9800',
          borderColor: '#FF9800',
          borderWidth: 1
        },
        {
          label: 'No cumple',
          data: mesesData.map(m => m.noCumple),
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
        x: { stacked: false },
        y: {
          stacked: false,
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            footer: (tooltipItems) => {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
              return `Total: ${total} solicitudes`
            }
          }
        }
      }
    }
  })
}

// Crear gráfico de incumplimiento por rol
const crearGraficoIncumplimientoRol = async (solicitudesConSla, todosRoles, configsSla) => {
  const ctx = document.getElementById('graficoIncumplimientoRol')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoIncumplimientoRolInstance) {
    graficoIncumplimientoRolInstance.destroy()
  }

  // Calcular incumplimientos por rol y tipo SLA
  const dataPorTipoSla = {}

  configsSla.filter(c => c.esActivo).forEach(config => {
    const tipoNombre = config.tipoSolicitud || `SLA ${config.idSla}`
    dataPorTipoSla[tipoNombre] = {}

    todosRoles.filter(r => r.esActivo).forEach(rol => {
      const solicitudesRol = solicitudesConSla.filter(s =>
        s.idRolRegistro === rol.idRolRegistro &&
        s.idSla === config.idSla &&
        s.estadoSla === 'No_cumple'
      )
      dataPorTipoSla[tipoNombre][rol.nombreRol] = solicitudesRol.length
    })
  })

  // Preparar datos para el gráfico
  const rolesUnicos = [...new Set(todosRoles.filter(r => r.esActivo).map(r => r.nombreRol))]
  const datasets = Object.keys(dataPorTipoSla).map((tipoSla, index) => {
    const colores = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5']
    return {
      label: tipoSla,
      data: rolesUnicos.map(rol => dataPorTipoSla[tipoSla][rol] || 0),
      backgroundColor: colores[index % colores.length],
      borderColor: colores[index % colores.length],
      borderWidth: 1
    }
  })

  graficoIncumplimientoRolInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rolesUnicos,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y', // Barras horizontales
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Cantidad de solicitudes que NO cumplen SLA'
        }
      }
    }
  })
}

// Crear gráfico de distribución de estados por solicitud (Donut)
const crearGraficoDistribucionEstados = async (solicitudesConSla) => {
  const ctx = document.getElementById('graficoDistribucionEstados')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoDistribucionEstadosInstance) {
    graficoDistribucionEstadosInstance.destroy()
  }

  // Contar solicitudes por estado
  const cumpleCount = solicitudesConSla.filter(s => s.estadoSla === 'Cumple').length
  const procesoCount = solicitudesConSla.filter(s => s.estadoSla === 'Proceso').length
  const noCumpleCount = solicitudesConSla.filter(s => s.estadoSla === 'No_cumple').length

  graficoDistribucionEstadosInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cumple', 'Proceso', 'No cumple'],
      datasets: [{
        data: [cumpleCount, procesoCount, noCumpleCount],
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

// Crear gráfico resumen de incumplimientos por tipo SLA (Barras)
const crearGraficoResumenIncumplimientos = async (tiposSla) => {
  const ctx = document.getElementById('graficoResumenIncumplimientos')
  if (!ctx) return

  // Destruir gráfico anterior si existe
  if (graficoResumenIncumplimientosInstance) {
    graficoResumenIncumplimientosInstance.destroy()
  }

  // Extraer datos de cada tipo SLA
  const labels = tiposSla.map(t => t.nombre)
  const cumpleData = tiposSla.map(t => t.estadisticas.cumple)
  const procesoData = tiposSla.map(t => t.estadisticas.proceso)
  const noCumpleData = tiposSla.map(t => t.estadisticas.noCumple)

  graficoResumenIncumplimientosInstance = new Chart(ctx, {
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

// Funciones para colores de barras y chips
const getBarColorBySla = (porcentaje) => {
  if (porcentaje >= 90) return 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)'
  if (porcentaje >= 70) return 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)'
  return 'linear-gradient(90deg, #F44336 0%, #EF5350 100%)'
}

const getSlaChipColor = (sla) => {
  if (sla >= 90) return 'positive'
  if (sla >= 70) return 'orange'
  return 'negative'
}

// Funciones para las tarjetas KPI
const getCardClass = (sla) => {
  if (sla >= 90) return 'card-success'
  if (sla >= 70) return 'card-warning'
  return 'card-danger'
}

const getCardClassVariacion = (variacion) => {
  if (variacion > 0) return 'card-success'
  if (variacion < -5) return 'card-danger'
  return 'card-warning'
}

const getIconoSla = (sla) => {
  if (sla >= 90) return 'check_circle'
  if (sla >= 70) return 'warning'
  return 'error'
}

const getColorSla = (sla) => {
  if (sla >= 90) return 'positive'
  if (sla >= 70) return 'orange'
  return 'negative'
}

const iniciarAutoRefresh = () => {
  if (autoRefresh.value) {
    // Actualizar cada 30 segundos
    refreshInterval.value = setInterval(() => {
      cargarDashboard()
    }, 30000)
  }
}

const detenerAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Inicialización
onMounted(async () => {
  await cargarAniosDisponibles()
  await cargarRolesDisponibles()
  await cargarDashboard()

  // Iniciar actualización automática
  iniciarAutoRefresh()
})

// Limpiar intervalo al desmontar
onBeforeUnmount(() => {
  detenerAutoRefresh()
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
  min-height: 140px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-success {
  border-left: 4px solid #4caf50;
}

.card-warning {
  border-left: 4px solid #ff9800;
}

.card-danger {
  border-left: 4px solid #f44336;
}

.mini-stat {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s;
}

.mini-stat:hover {
  transform: scale(1.05);
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

.chart-container {
  padding: 16px 0;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-label {
  min-width: 150px;
  text-align: right;
  color: #666;
  font-size: 14px;
}

.chart-bar-container {
  flex: 1;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: 40px;
}

.chart-bar {
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 0.6s ease;
}

.chart-value {
  color: white;
  font-weight: 600;
  font-size: 14px;
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

.mini-stat {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mini-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */

/* Desktop Large (1440px+) */
@media (min-width: 1440px) {
  .dashboard-page {
    padding: 32px;
    max-width: 1600px;
    margin: 0 auto;
  }

  .stat-card {
    min-height: 160px;
  }

  .chart-label {
    min-width: 180px;
  }
}

/* Desktop (1024px - 1439px) */
@media (max-width: 1439px) and (min-width: 1024px) {
  .dashboard-page {
    padding: 24px 20px;
  }

  .stat-card {
    min-height: 140px;
  }

  .chart-label {
    min-width: 150px;
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

  .stat-card {
    min-height: 120px;
  }

  .chart-label {
    min-width: 120px;
    font-size: 13px;
  }

  .chart-bar-container {
    height: 36px;
  }

  .mini-stat {
    padding: 10px;
  }

  .tipo-sla-card {
    min-height: 280px;
  }

  /* Reorganizar KPIs en tablet */
  .dashboard-page .col-lg-3 {
    width: 50% !important;
  }

  /* Ajustar filtros */
  .filters-card .col-md-2 {
    width: 50% !important;
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

  .stat-card {
    min-height: 100px;
    margin-bottom: 12px;
  }

  .stat-card .text-h3 {
    font-size: 1.75rem;
  }

  .chart-label {
    min-width: 100px;
    font-size: 12px;
    text-align: left;
  }

  .chart-bar-container {
    height: 32px;
  }

  .chart-value {
    font-size: 12px;
  }

  .mini-stat {
    padding: 8px;
  }

  .tipo-sla-card {
    min-height: 250px;
    padding: 12px;
  }

  .incumplidor-item {
    padding: 6px;
  }

  /* KPIs en dos columnas para tablet portrait */
  .dashboard-page .col-lg-3 {
    width: 50% !important;
  }

  /* Gráficos en columna completa */
  .dashboard-page .col-lg-6 {
    width: 100% !important;
    margin-bottom: 16px;
  }

  /* Filtros en columna completa */
  .filters-card .row > [class*="col-"] {
    width: 100% !important;
    margin-bottom: 8px;
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
  }

  .dashboard-header .q-chip {
    margin-top: 8px;
    align-self: flex-start;
  }

  .stat-card {
    min-height: 90px;
    margin-bottom: 8px;
  }

  .stat-card .text-h3 {
    font-size: 1.5rem;
  }

  .stat-card .text-h4,
  .stat-card .text-h5 {
    font-size: 1.25rem;
  }

  .chart-row {
    flex-direction: column;
    gap: 8px;
  }

  .chart-label {
    min-width: auto;
    width: 100%;
    text-align: left;
    margin-bottom: 4px;
  }

  .chart-bar-container {
    width: 100%;
    height: 28px;
  }

  .chart-value {
    font-size: 11px;
  }

  .mini-stat {
    padding: 6px;
    margin: 4px 0;
  }

  .tipo-sla-card {
    min-height: 200px;
    padding: 10px;
  }

  .incumplidor-item {
    padding: 4px;
    margin-bottom: 4px;
  }

  /* Todos los elementos en columna completa */
  .dashboard-page [class*="col-"] {
    width: 100% !important;
    margin-bottom: 8px;
  }

  .text-h6 {
    font-size: 1rem;
  }

  .text-h5 {
    font-size: 1.1rem;
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

  .dashboard-header .q-chip {
    font-size: 0.75rem;
    padding: 2px 8px;
  }

  .stat-card {
    min-height: 80px;
    margin-bottom: 6px;
  }

  .stat-card .text-h3 {
    font-size: 1.25rem;
  }

  .stat-card .text-h4,
  .stat-card .text-h5 {
    font-size: 1.1rem;
  }

  .stat-card .q-card-section {
    padding: 8px;
  }

  .stat-card .q-icon {
    font-size: 32px;
  }

  .chart-bar-container {
    height: 24px;
  }

  .chart-value {
    font-size: 10px;
  }

  .mini-stat {
    padding: 4px;
    margin: 2px 0;
  }

  .tipo-sla-card {
    min-height: 150px;
    padding: 8px;
  }

  .incumplidor-item {
    padding: 3px;
    margin-bottom: 3px;
  }

  .text-h6 {
    font-size: 0.95rem;
  }

  .text-subtitle2 {
    font-size: 0.85rem;
  }

  .filters-card .q-card-section {
    padding: 8px;
  }

  .filters-card .q-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-height: 36px;
  }

  .filters-card .q-chip {
    font-size: 0.75rem;
    padding: 2px 8px;
    margin: 2px;
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

  .stat-card .text-h3 {
    font-size: 1.1rem;
  }

  .stat-card .text-h4,
  .stat-card .text-h5 {
    font-size: 1rem;
  }

  .text-h6 {
    font-size: 0.85rem;
  }

  .chart-bar-container {
    height: 20px;
  }

  .tipo-sla-card {
    min-height: 120px;
  }

  .mini-stat {
    padding: 2px;
  }
}

/* Orientación landscape en móviles */
@media (max-height: 500px) and (orientation: landscape) {
  .dashboard-page {
    padding: 8px 16px;
  }

  .stat-card {
    min-height: 70px;
  }

  .chart-bar-container {
    height: 24px;
  }

  .dashboard-header {
    padding: 6px 12px;
  }

  .tipo-sla-card {
    min-height: 140px;
  }

  .mini-stat {
    padding: 4px;
  }

  /* Reorganizar KPIs en landscape */
  .dashboard-page .col-lg-3 {
    width: 25% !important;
  }

  /* Gráficos lado a lado en landscape */
  .dashboard-page .col-lg-6 {
    width: 50% !important;
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

  .stat-card {
    cursor: pointer;
  }

  .incumplidor-item {
    min-height: 44px;
  }
}

/* Alto contraste y accesibilidad */
@media (prefers-contrast: high) {
  .stat-card {
    border-width: 2px;
  }

  .chart-bar {
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .tipo-sla-card {
    border-width: 2px;
  }

  .mini-stat {
    border: 1px solid #ccc;
  }
}

/* Reducción de movimiento */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .mini-stat,
  .chart-bar,
  .incumplidor-item {
    transition: none;
  }

  .stat-card:hover,
  .mini-stat:hover,
  .incumplidor-item:hover {
    transform: none;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .dashboard-page {
    background: #1a1a1a;
  }

  .dashboard-header,
  .filters-card,
  .stat-card,
  .tipo-sla-card {
    background: #2d2d2d;
    color: #ffffff;
  }

  .mini-stat {
    background: #3d3d3d;
  }

  .chart-bar-container {
    background: #404040;
  }
}

/* Mejoras para impresión */
@media print {
  .dashboard-page {
    padding: 0;
    background: white;
  }

  .q-btn,
  .q-chip[clickable] {
    display: none;
  }

  .stat-card,
  .tipo-sla-card {
    border: 1px solid #ccc;
    page-break-inside: avoid;
    margin-bottom: 10px;
  }

  .dashboard-header {
    page-break-after: avoid;
  }

  .chart-container {
    page-break-inside: avoid;
  }

  .tipo-sla-card {
    min-height: auto;
  }
}
</style>
