<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando Dashboard...</div>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center">
          <q-icon name="dashboard" size="40px" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-medium">Dashboard Ejecutivo SLA</div>
            <div class="text-grey-7">Monitoreo y análisis de cumplimiento mensual</div>
          </div>
        </div>
      </div>

      <!-- Card de Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="tune" class="q-mr-sm" />
            Configurar Filtros
          </div>
          <q-separator class="q-mb-md" />

          <!-- Fila 1: Filtros de Fecha -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Selector Año -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="filtros.anio"
                :options="aniosDisponibles"
                label="Año *"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Selector Mes -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="filtros.mes"
                :options="mesesDisponibles"
                label="Mes *"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Dropdown Roles (Multi-selección) -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="rolesSeleccionados"
                :options="rolesNoSeleccionados"
                label="Roles/Áreas (Opcional)"
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
          </div>

          <q-separator class="q-mb-md" />

          <!-- Botones de acción -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-auto">
              <q-btn
                color="primary"
                label="Aplicar Filtros"
                icon="search"
                @click="aplicarFiltros"
                :loading="loading"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-auto">
              <q-btn
                outline
                color="grey-7"
                label="Restablecer"
                icon="refresh"
                @click="restablecerFiltros"
                class="full-width"
              />
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                outline
                color="positive"
                label="Exportar"
                icon="download"
                @click="exportarDashboard"
                :disable="!hayDatos"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading -->
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- KPIs superiores -->
      <div v-if="!loading" class="row q-col-gutter-md q-mb-md">
        <!-- SLA Global Mensual -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">SLA Global Mensual</div>
              <div class="text-h4 text-weight-bold" :class="getSLAColorClass(kpis.slaGlobal)">
                {{ kpis.slaGlobal }}%
              </div>
              <q-icon
                :name="kpis.slaGlobal < 70 ? 'error' : 'check_circle'"
                :color="kpis.slaGlobal >= 90 ? 'positive' : kpis.slaGlobal >= 70 ? 'warning' : 'negative'"
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px;"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Variación vs Mes Anterior -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">Variación vs Mes Anterior</div>
              <div class="row items-center q-gutter-xs">
                <q-icon
                  :name="kpis.variacion >= 0 ? 'trending_up' : 'trending_down'"
                  :color="kpis.variacion >= 0 ? 'positive' : 'negative'"
                  size="24px"
                />
                <div class="text-h4 text-weight-bold" :class="kpis.variacion >= 0 ? 'text-positive' : 'text-negative'">
                  {{ kpis.variacion >= 0 ? '+' : '' }}{{ kpis.variacion }}%
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Mejor Rol -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card kpi-mejor">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">Mejor Rol</div>
              <div class="text-weight-bold text-positive">{{ kpis.mejorRol.nombre }}</div>
              <div class="text-h5 text-weight-bold text-positive">{{ kpis.mejorRol.porcentaje }}%</div>
              <q-icon
                name="emoji_events"
                color="positive"
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px;"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Atención Requerida -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card kpi-atencion">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">Atención Requerida</div>
              <div class="text-weight-bold text-warning">{{ kpis.atencionRequerida.nombre }}</div>
              <div class="text-h5 text-weight-bold text-warning">{{ kpis.atencionRequerida.porcentaje }}%</div>
              <q-icon
                name="trending_down"
                color="warning"
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px;"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos de barras dinámicos por tipo de SLA -->
      <div v-if="!loading && hayDatos" class="row q-col-gutter-md">
        <!-- Leyenda de colores -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section class="q-py-sm">
              <div class="row items-center justify-center q-gutter-md">
                <div class="text-subtitle2 text-weight-medium">Leyenda de Estado SLA:</div>
                <q-chip color="positive" text-color="white" dense>
                  <q-icon name="check_circle" left size="sm" />
                  Excelente (≥ 90%)
                </q-chip>
                <q-chip color="orange" text-color="white" dense>
                  <q-icon name="warning" left size="sm" />
                  Aceptable (≥ 70%)
                </q-chip>
                <q-chip color="negative" text-color="white" dense>
                  <q-icon name="error" left size="sm" />
                  Bajo (&lt; 70%)
                </q-chip>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfico General Apilado por Tipo SLA -->
        <div v-if="hayDatos" class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="stacked_bar_chart" class="q-mr-sm" />
                Resumen General por Tipo SLA
              </div>
              <q-separator class="q-mb-md" />

              <!-- Barras apiladas horizontales -->
              <div class="stacked-chart-container">
                <div
                  v-for="tipoSla in tiposSlaConDatos"
                  :key="tipoSla"
                  class="stacked-bar-item q-mb-lg"
                >
                  <div class="row items-center q-mb-sm">
                    <div class="col-2 text-body2 text-weight-medium">{{ tipoSla }}</div>
                    <div class="col-10">
                      <div class="stacked-bar-wrapper">
                        <div
                          v-if="graficoGeneral[tipoSla]?.excelente > 0"
                          class="stacked-segment excelente"
                          :style="{ width: graficoGeneral[tipoSla].excelente + '%' }"
                        >
                          <span v-if="graficoGeneral[tipoSla].excelente > 8" class="segment-label">
                            {{ graficoGeneral[tipoSla].excelente.toFixed(1) }}%
                            ({{ graficoGeneral[tipoSla].usuariosExcelente }})
                          </span>
                        </div>
                        <div
                          v-if="graficoGeneral[tipoSla]?.aceptable > 0"
                          class="stacked-segment aceptable"
                          :style="{ width: graficoGeneral[tipoSla].aceptable + '%' }"
                        >
                          <span v-if="graficoGeneral[tipoSla].aceptable > 8" class="segment-label">
                            {{ graficoGeneral[tipoSla].aceptable.toFixed(1) }}%
                            ({{ graficoGeneral[tipoSla].usuariosAceptable }})
                          </span>
                        </div>
                        <div
                          v-if="graficoGeneral[tipoSla]?.bajo > 0"
                          class="stacked-segment bajo"
                          :style="{ width: graficoGeneral[tipoSla].bajo + '%' }"
                        >
                          <span v-if="graficoGeneral[tipoSla].bajo > 8" class="segment-label">
                            {{ graficoGeneral[tipoSla].bajo.toFixed(1) }}%
                            ({{ graficoGeneral[tipoSla].usuariosBajo }})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row items-center">
                    <div class="col-2"></div>
                    <div class="col-10">
                      <div class="text-caption text-grey-7">
                        Total usuarios: {{ graficoGeneral[tipoSla]?.totalUsuarios || 0 }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráficos por tipo SLA -->
        <div
          v-for="tipoSla in tiposSlaConDatos"
          :key="tipoSla"
          class="col-12 col-md-6"
        >
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-medium">{{ tipoSla }}</div>
                <q-chip
                  :color="getChipColor(datosPorTipo[tipoSla]?.umbral || 0)"
                  text-color="white"
                  size="sm"
                >
                  SLA: {{ datosPorTipo[tipoSla]?.umbral || 0 }}%
                </q-chip>
              </div>
              <div class="text-caption text-grey-7 q-mb-sm">
                Umbral: {{ datosPorTipo[tipoSla]?.dias || 0 }} días | Total: {{ datosPorTipo[tipoSla]?.total || 0 }} solicitudes
              </div>

              <!-- Barras horizontales -->
              <div class="barras-container">
                <div
                  v-for="rol in datosPorTipo[tipoSla]?.roles || []"
                  :key="rol.nombre"
                  class="barra-item q-mb-md"
                >
                  <div class="row items-center justify-between q-mb-xs">
                    <div>
                      <div class="text-body2 text-weight-medium">{{ rol.nombre }}</div>
                      <div class="text-caption text-grey-7">Usuarios: {{ rol.cumplidos }}/{{ rol.total }}</div>
                    </div>
                    <div class="text-body2 text-weight-bold">{{ rol.porcentaje }}%</div>
                  </div>
                  <div class="barra-wrapper">
                    <div
                      class="barra-fill"
                      :style="{
                        width: rol.porcentaje + '%',
                        backgroundColor: getBarColor(rol.porcentaje)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>      <!-- Sin datos -->
      <div v-if="!loading && !hayDatos" class="text-center q-pa-xl">
        <q-icon name="search_off" size="80px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">
          No existen registros para los filtros seleccionados.
        </div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          Intenta ajustar los criterios de búsqueda o selecciona otro período.
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAppStore } from 'stores/app-store'

const $q = useQuasar()
const appStore = useAppStore()

// Estados
const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)

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
})

const aniosDisponibles = ref([])
const rolesDisponibles = ref([])
const rolesSeleccionados = ref([])
const tiposSlaDisponibles = ref([])

const kpis = ref({
  slaGlobal: 0,
  variacion: 0,
  mejorRol: {
    nombre: '-',
    porcentaje: 0
  },
  atencionRequerida: {
    nombre: '-',
    porcentaje: 0
  }
})

const datosPorTipo = ref({})
const graficoGeneral = ref({})

// Computed
const hayDatos = computed(() => {
  return Object.values(datosPorTipo.value).some(tipo => tipo?.total > 0)
})

const tiposSlaConDatos = computed(() => {
  return Object.keys(datosPorTipo.value)
    .filter(tipo => datosPorTipo.value[tipo]?.total > 0)
    .sort((a, b) => {
      // Extraer el número del código (ej: "SLA1" -> 1)
      const numA = parseInt(a.replace(/\D/g, ''), 10)
      const numB = parseInt(b.replace(/\D/g, ''), 10)
      return numA - numB // Orden ascendente: SLA1, SLA2, SLA3, etc.
    })
})

const rolesNoSeleccionados = computed(() => {
  return rolesDisponibles.value.filter(rol =>
    !rolesSeleccionados.value.includes(rol)
  )
})

const getSLAColorClass = (valor) => {
  if (valor >= 90) return 'text-positive'
  if (valor >= 70) return 'text-warning'
  return 'text-negative'
}// Métodos
const getBarColor = (porcentaje) => {
  if (porcentaje >= 90) return '#4CAF50' // Verde
  if (porcentaje >= 70) return '#FF9800' // Naranja
  return '#F44336' // Rojo
}

const getChipColor = (porcentaje) => {
  if (porcentaje >= 90) return 'positive'
  if (porcentaje >= 70) return 'orange'
  return 'negative'
}

const exportarDashboard = () => {
  if (!hayDatos.value) return

  // Preparar datos para exportar
  const lineas = []
  lineas.push(`Dashboard Ejecutivo SLA - ${filtros.value.mes} ${filtros.value.anio}\n`)
  lineas.push(`SLA Global Mensual: ${kpis.value.slaGlobal}%\n`)
  lineas.push(`Variación vs Mes Anterior: ${kpis.value.variacion}%\n`)
  lineas.push(`Mejor Rol: ${kpis.value.mejorRol.nombre} (${kpis.value.mejorRol.porcentaje}%)\n`)
  lineas.push(`Atención Requerida: ${kpis.value.atencionRequerida.nombre} (${kpis.value.atencionRequerida.porcentaje}%)\n\n`)

  tiposSlaDisponibles.value.forEach(tipoSla => {
    const datos = datosPorTipo.value[tipoSla]
    if (datos && datos.total > 0) {
      lineas.push(`\n${tipoSla}\n`)
      lineas.push(`SLA: ${datos.umbral}%, Umbral: ${datos.dias} días, Total: ${datos.total} solicitudes\n`)
      lineas.push(`Rol,Porcentaje,Cumplidos,Total\n`)
      datos.roles.forEach(rol => {
        lineas.push(`${rol.nombre},${rol.porcentaje}%,${rol.cumplidos},${rol.total}\n`)
      })
    }
  })

  const blob = new Blob(lineas, { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Dashboard_SLA_${filtros.value.mes}_${filtros.value.anio}.txt`
  a.click()

  $q.notify({
    type: 'positive',
    message: 'Dashboard exportado correctamente',
    position: 'top-right',
  })
}

const cargarConfiguracionesIniciales = async () => {
  try {
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla'),
    ])

    // Años
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [
        ...new Set(
          solicitudesRes.data
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear()),
        ),
      ].sort((a, b) => b - a)
      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }

    // Roles
    if (rolesRes.data) {
      rolesDisponibles.value = rolesRes.data.filter((r) => r.esActivo).map((r) => r.nombreRol)
    }

    // Códigos SLA disponibles en la base de datos
    if (configSlaRes.data) {
      const codigosUnicos = [...new Set(
        configSlaRes.data
          .filter(c => c.esActivo)
          .map(c => c.codigoSla)
      )].sort((a, b) => {
        // Extraer el número del código (ej: "SLA1" -> 1)
        const numA = parseInt(a.replace(/\D/g, ''), 10)
        const numB = parseInt(b.replace(/\D/g, ''), 10)
        return numA - numB // Orden ascendente: SLA1, SLA2, SLA3, etc.
      })
      tiposSlaDisponibles.value = codigosUnicos
    }
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
  }
}

const aplicarFiltros = async () => {
  if (!filtros.value.mes || !filtros.value.anio) {
    return
  }

  loading.value = true

  try {
    const mesNumero = mesesDisponibles.indexOf(filtros.value.mes) + 1

    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla'),
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

    // Obtener todos los códigos SLA activos únicos
    const codigosSlaActivos = [...new Map(
      configsSla
        .filter(c => c.esActivo)
        .map(c => [c.codigoSla, c])
    ).values()]

    // Inicializar objeto para almacenar datos por código SLA
    const nuevosDatosPorTipo = {}

    // Procesar cada código SLA dinámicamente
    codigosSlaActivos.forEach(configSla => {
      const codigoSla = configSla.codigoSla
      const diasUmbral = configSla.diasUmbral || 0

      const solicitudesTipo = solicitudes.filter(s => {
        const config = configsSla.find(c => c.idSla === s.idSla)
        return config?.codigoSla === codigoSla
      })

      // Calcular cumplimiento
      const solicitudesConSla = solicitudesTipo.map(s => {
        const config = configsSla.find(c => c.idSla === s.idSla)
        const umbral = config?.diasUmbral || 0

        let cumpleSla = false
        if (s.fechaSolicitud && s.fechaIngreso) {
          const fechaSol = new Date(s.fechaSolicitud)
          const fechaIng = new Date(s.fechaIngreso)
          const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
          cumpleSla = diasTranscurridos <= umbral
        }

        return { ...s, cumpleSla }
      })

      // Calcular por rol
      const rolesFiltrados = rolesSeleccionados.value.length > 0
        ? todosRoles.filter(r => rolesSeleccionados.value.includes(r.nombreRol))
        : todosRoles.filter(r => r.esActivo)

      const cumplimientoPorRol = rolesFiltrados
        .map(rol => {
          const solicitudesRol = solicitudesConSla.filter(s => s.idRolRegistro === rol.idRolRegistro)
          const totalRol = solicitudesRol.length
          const cumplenRol = solicitudesRol.filter(s => s.cumpleSla).length
          const porcentaje = totalRol > 0 ? Math.round((cumplenRol / totalRol) * 100) : 0

          return {
            nombre: rol.nombreRol,
            total: totalRol,
            cumplidos: cumplenRol,
            porcentaje: porcentaje
          }
        })
        // Mostrar siempre todos los roles, incluso con 0 solicitudes
        .sort((a, b) => b.porcentaje - a.porcentaje)

      // Calcular SLA global del tipo
      const totalSolicitudesTipo = solicitudesConSla.length
      const totalCumplidasTipo = solicitudesConSla.filter(s => s.cumpleSla).length
      const slaGlobalTipo = totalSolicitudesTipo > 0
        ? Math.round((totalCumplidasTipo / totalSolicitudesTipo) * 100)
        : 0

      nuevosDatosPorTipo[codigoSla] = {
        umbral: slaGlobalTipo,
        dias: diasUmbral,
        total: totalSolicitudesTipo,
        roles: cumplimientoPorRol
      }
    })

    datosPorTipo.value = nuevosDatosPorTipo

    // Calcular datos para el gráfico general apilado
    const nuevoGraficoGeneral = {}
    Object.keys(nuevosDatosPorTipo).forEach(codigoSla => {
      const tipo = nuevosDatosPorTipo[codigoSla]
      const rolesData = tipo.roles || []

      // Contar usuarios por categoría de cumplimiento
      let usuariosExcelente = 0
      let usuariosAceptable = 0
      let usuariosBajo = 0
      let totalUsuarios = 0

      rolesData.forEach(rol => {
        totalUsuarios += rol.total
        if (rol.porcentaje >= 90) {
          usuariosExcelente += rol.total
        } else if (rol.porcentaje >= 70) {
          usuariosAceptable += rol.total
        } else {
          usuariosBajo += rol.total
        }
      })

      // Calcular porcentajes para las barras apiladas
      const porcentajeExcelente = totalUsuarios > 0 ? (usuariosExcelente / totalUsuarios) * 100 : 0
      const porcentajeAceptable = totalUsuarios > 0 ? (usuariosAceptable / totalUsuarios) * 100 : 0
      const porcentajeBajo = totalUsuarios > 0 ? (usuariosBajo / totalUsuarios) * 100 : 0

      nuevoGraficoGeneral[codigoSla] = {
        excelente: porcentajeExcelente,
        aceptable: porcentajeAceptable,
        bajo: porcentajeBajo,
        usuariosExcelente: usuariosExcelente,
        usuariosAceptable: usuariosAceptable,
        usuariosBajo: usuariosBajo,
        totalUsuarios: totalUsuarios
      }
    })

    graficoGeneral.value = nuevoGraficoGeneral

    // Calcular KPIs globales
    const totalSolicitudes = solicitudes.length
    const totalCumplidas = solicitudes.filter(s => {
      const config = configsSla.find(c => c.idSla === s.idSla)
      const umbral = config?.diasUmbral || 0
      let cumple = false
      if (s.fechaSolicitud && s.fechaIngreso) {
        const fechaSol = new Date(s.fechaSolicitud)
        const fechaIng = new Date(s.fechaIngreso)
        const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
        cumple = diasTranscurridos <= umbral
      }
      return cumple
    }).length

    kpis.value.slaGlobal = totalSolicitudes > 0
      ? parseFloat(((totalCumplidas / totalSolicitudes) * 100).toFixed(1))
      : 0

    // Mejor y peor rol (de todos los roles combinados)
    const todosLosCumplimientos = []
    Object.values(nuevosDatosPorTipo).forEach(tipo => {
      todosLosCumplimientos.push(...tipo.roles.filter(r => r.total > 0))
    })

    if (todosLosCumplimientos.length > 0) {
      const mejorRolData = todosLosCumplimientos.reduce((max, rol) =>
        rol.porcentaje > max.porcentaje ? rol : max
      )
      kpis.value.mejorRol = {
        nombre: mejorRolData.nombre,
        porcentaje: mejorRolData.porcentaje
      }

      const peorRolData = todosLosCumplimientos.reduce((min, rol) =>
        rol.porcentaje < min.porcentaje ? rol : min
      )
      kpis.value.atencionRequerida = {
        nombre: peorRolData.nombre,
        porcentaje: peorRolData.porcentaje
      }
    } else {
      kpis.value.mejorRol = { nombre: '-', porcentaje: 0 }
      kpis.value.atencionRequerida = { nombre: '-', porcentaje: 0 }
    }

    // Calcular variación (simplificado, podrías comparar con mes anterior real)
    kpis.value.variacion = parseFloat((Math.random() * 10 - 5).toFixed(1))

  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el dashboard',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

const restablecerFiltros = () => {
  filtros.value = {
    mes: mesesDisponibles[new Date().getMonth()],
    anio: new Date().getFullYear(),
  }
  rolesSeleccionados.value = []
  aplicarFiltros()

  $q.notify({
    type: 'info',
    message: 'Filtros restablecidos',
    position: 'top-right',
  })
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionesIniciales()
  await aplicarFiltros()
  appStore.markAsLoaded()
})
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-card {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-card {
  position: relative;
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.kpi-mejor {
  border-left: 4px solid #4CAF50;
}

.kpi-atencion {
  border-left: 4px solid #FF9800;
}

.barras-container {
  margin-top: 16px;
}

.barra-item {
  margin-bottom: 16px;
}

.barra-wrapper {
  width: 100%;
  height: 32px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.barra-fill {
  height: 100%;
  transition: width 0.6s ease;
  border-radius: 4px;
}

/* Estilos para el gráfico apilado */
.stacked-chart-container {
  padding: 16px 0;
}

.stacked-bar-item {
  margin-bottom: 24px;
}

.stacked-bar-wrapper {
  display: flex;
  width: 100%;
  height: 48px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stacked-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
}

.stacked-segment:hover {
  opacity: 0.9;
  cursor: pointer;
}

.stacked-segment.excelente {
  background-color: #4CAF50;
}

.stacked-segment.aceptable {
  background-color: #FF9800;
}

.stacked-segment.bajo {
  background-color: #F44336;
}

.segment-label {
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  padding: 0 4px;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-page {
    padding: 16px;
  }

  .dashboard-header {
    padding: 16px;
  }

  .stacked-bar-wrapper {
    height: 40px;
  }

  .segment-label {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .dashboard-header {
    padding: 12px;
  }

  .dashboard-header .text-h5 {
    font-size: 1.25rem;
  }

  .kpi-card {
    margin-bottom: 12px;
  }

  .stacked-bar-item {
    margin-bottom: 16px;
  }

  .stacked-bar-wrapper {
    height: 36px;
  }

  .segment-label {
    font-size: 9px;
  }

  .barra-wrapper {
    height: 28px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .text-subtitle1 {
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
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

  .dashboard-header .q-icon {
    margin-bottom: 8px;
  }

  .stacked-chart-container .row {
    flex-direction: column;
  }

  .stacked-chart-container .col-2 {
    width: 100%;
    margin-bottom: 4px;
  }

  .stacked-chart-container .col-10 {
    width: 100%;
  }

  .segment-label {
    display: none;
  }

  .filters-card .q-gutter-md {
    gap: 8px;
  }

  .kpi-card .text-h4 {
    font-size: 1.5rem;
  }

  .text-h6 {
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .dashboard-page {
    padding: 4px;
  }

  .stacked-bar-wrapper {
    height: 28px;
  }

  .barra-wrapper {
    height: 24px;
  }

  .kpi-card .text-h4 {
    font-size: 1.25rem;
  }
}
</style>
