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
                :color="
                  kpis.slaGlobal >= 90 ? 'positive' : kpis.slaGlobal >= 70 ? 'warning' : 'negative'
                "
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px"
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
                <div
                  class="text-h4 text-weight-bold"
                  :class="kpis.variacion >= 0 ? 'text-positive' : 'text-negative'"
                >
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
              <div class="text-h5 text-weight-bold text-positive">
                {{ kpis.mejorRol.porcentaje }}%
              </div>
              <q-icon
                name="emoji_events"
                color="positive"
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px"
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
              <div class="text-h5 text-weight-bold text-warning">
                {{ kpis.atencionRequerida.porcentaje }}%
              </div>
              <q-icon
                name="trending_down"
                color="warning"
                size="32px"
                class="absolute"
                style="top: 16px; right: 16px"
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
                  Cumple
                </q-chip>
                <q-chip color="orange" text-color="white" dense>
                  <q-icon name="schedule" left size="sm" />
                  Proceso
                </q-chip>
                <q-chip color="negative" text-color="white" dense>
                  <q-icon name="cancel" left size="sm" />
                  No_cumple
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
                            {{ graficoGeneral[tipoSla].excelente.toFixed(1) }}% ({{
                              graficoGeneral[tipoSla].usuariosExcelente
                            }})
                          </span>
                        </div>
                        <div
                          v-if="graficoGeneral[tipoSla]?.aceptable > 0"
                          class="stacked-segment aceptable"
                          :style="{ width: graficoGeneral[tipoSla].aceptable + '%' }"
                        >
                          <span v-if="graficoGeneral[tipoSla].aceptable > 8" class="segment-label">
                            {{ graficoGeneral[tipoSla].aceptable.toFixed(1) }}% ({{
                              graficoGeneral[tipoSla].usuariosAceptable
                            }})
                          </span>
                        </div>
                        <div
                          v-if="graficoGeneral[tipoSla]?.bajo > 0"
                          class="stacked-segment bajo"
                          :style="{ width: graficoGeneral[tipoSla].bajo + '%' }"
                        >
                          <span v-if="graficoGeneral[tipoSla].bajo > 8" class="segment-label">
                            {{ graficoGeneral[tipoSla].bajo.toFixed(1) }}% ({{
                              graficoGeneral[tipoSla].usuariosBajo
                            }})
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
        <div v-for="tipoSla in tiposSlaConDatos" :key="tipoSla" class="col-12 col-md-6">
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
                Umbral: {{ datosPorTipo[tipoSla]?.dias || 0 }} días | Total:
                {{ datosPorTipo[tipoSla]?.total || 0 }} solicitudes
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
                      <div class="text-caption text-grey-7">
                        Usuarios: {{ rol.cumplidos }}/{{ rol.total }}
                      </div>
                    </div>
                    <div class="text-body2 text-weight-bold">{{ rol.porcentaje }}%</div>
                  </div>
                  <div class="barra-wrapper">
                    <div
                      class="barra-fill"
                      :style="{
                        width: rol.porcentaje + '%',
                        backgroundColor: getBarColor(rol.porcentaje),
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <!-- Sin datos -->
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
import { useAppStore } from 'stores/app-store'
import { useSlaStore } from 'stores/useSlaStore'
import { getPorcentajeColor, getPorcentajeColorHex } from 'src/utils/slaMappers'

const $q = useQuasar()
const appStore = useAppStore()
const slaStore = useSlaStore()

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
    porcentaje: 0,
  },
  atencionRequerida: {
    nombre: '-',
    porcentaje: 0,
  },
})

const datosPorTipo = ref({})
const graficoGeneral = ref({})

// Computed
const hayDatos = computed(() => {
  return Object.values(datosPorTipo.value).some((tipo) => tipo?.total > 0)
})

const tiposSlaConDatos = computed(() => {
  return Object.keys(datosPorTipo.value)
    .filter((tipo) => datosPorTipo.value[tipo]?.total > 0)
    .sort((a, b) => {
      // Extraer el número del código (ej: "SLA1" -> 1)
      const numA = parseInt(a.replace(/\D/g, ''), 10)
      const numB = parseInt(b.replace(/\D/g, ''), 10)
      return numA - numB // Orden ascendente: SLA1, SLA2, SLA3, etc.
    })
})

const rolesNoSeleccionados = computed(() => {
  return rolesDisponibles.value.filter((rol) => !rolesSeleccionados.value.includes(rol))
})

/**
 * Mapea porcentaje de cumplimiento a clase de color de Quasar
 * ✅ Usa mapper centralizado (getPorcentajeColor)
 */
const getSLAColorClass = (valor) => {
  const colorQuasar = getPorcentajeColor(valor)
  return `text-${colorQuasar}`
}

/**
 * Mapea porcentaje a color hexadecimal para gráficos de barras
 * ✅ Usa mapper centralizado (getPorcentajeColorHex)
 */
const getBarColor = (porcentaje) => {
  return getPorcentajeColorHex(porcentaje)
}

/**
 * Mapea porcentaje a color de Quasar para chips
 * ✅ Usa mapper centralizado (getPorcentajeColor)
 */
const getChipColor = (porcentaje) => {
  return getPorcentajeColor(porcentaje)
}

const cargarConfiguracionesIniciales = async () => {
  try {
    const [solicitudes, roles, configSla] = await Promise.all([
      slaStore.fetchSolicitudes(),
      slaStore.fetchRoles(),
      slaStore.fetchConfigSla(),
    ])

    // Años
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

    // Roles
    if (roles) {
      rolesDisponibles.value = roles.filter((r) => r.esActivo).map((r) => r.nombreRol)
    }

    // Códigos SLA disponibles en la base de datos
    if (configSla) {
      const codigosUnicos = [
        ...new Set(configSla.filter((c) => c.esActivo).map((c) => c.codigoSla)),
      ].sort((a, b) => {
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

    const [solicitudesData, rolesData, configSlaData] = await Promise.all([
      slaStore.fetchSolicitudes(),
      slaStore.fetchRoles(),
      slaStore.fetchConfigSla(),
    ])

    let solicitudes = solicitudesData || []
    const todosRoles = rolesData || []
    const configsSla = configSlaData || []

    // Filtrar por mes/año
    solicitudes = solicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio && fecha.getMonth() + 1 === mesNumero
    })

    // Obtener todos los códigos SLA activos únicos
    const codigosSlaActivos = [
      ...new Map(configsSla.filter((c) => c.esActivo).map((c) => [c.codigoSla, c])).values(),
    ]

    // Inicializar objeto para almacenar datos por código SLA
    const nuevosDatosPorTipo = {}

    // Procesar cada código SLA dinámicamente
    codigosSlaActivos.forEach((configSla) => {
      const codigoSla = configSla.codigoSla
      const diasUmbral = configSla.diasUmbral || 0

      const solicitudesTipo = solicitudes.filter((s) => {
        const config = configsSla.find((c) => c.idSla === s.idSla)
        return config?.codigoSla === codigoSla
      })

      // Calcular cumplimiento
      const solicitudesConSla = solicitudesTipo.map((s) => {
        const config = configsSla.find((c) => c.idSla === s.idSla)
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
      const rolesFiltrados =
        rolesSeleccionados.value.length > 0
          ? todosRoles.filter((r) => rolesSeleccionados.value.includes(r.nombreRol))
          : todosRoles.filter((r) => r.esActivo)

      const cumplimientoPorRol = rolesFiltrados
        .map((rol) => {
          const solicitudesRol = solicitudesConSla.filter(
            (s) => s.idRolRegistro === rol.idRolRegistro,
          )
          const totalRol = solicitudesRol.length
          const cumplenRol = solicitudesRol.filter((s) => s.cumpleSla).length
          const porcentaje = totalRol > 0 ? Math.round((cumplenRol / totalRol) * 100) : 0

          return {
            nombre: rol.nombreRol,
            total: totalRol,
            cumplidos: cumplenRol,
            porcentaje: porcentaje,
          }
        })
        // Mostrar siempre todos los roles, incluso con 0 solicitudes
        .sort((a, b) => b.porcentaje - a.porcentaje)

      // Calcular SLA global del tipo
      const totalSolicitudesTipo = solicitudesConSla.length
      const totalCumplidasTipo = solicitudesConSla.filter((s) => s.cumpleSla).length
      const slaGlobalTipo =
        totalSolicitudesTipo > 0 ? Math.round((totalCumplidasTipo / totalSolicitudesTipo) * 100) : 0

      nuevosDatosPorTipo[codigoSla] = {
        umbral: slaGlobalTipo,
        dias: diasUmbral,
        total: totalSolicitudesTipo,
        roles: cumplimientoPorRol,
      }
    })

    datosPorTipo.value = nuevosDatosPorTipo

    // Calcular datos para el gráfico general apilado
    const nuevoGraficoGeneral = {}
    Object.keys(nuevosDatosPorTipo).forEach((codigoSla) => {
      const tipo = nuevosDatosPorTipo[codigoSla]
      const rolesData = tipo.roles || []

      // Contar usuarios por categoría de cumplimiento
      let usuariosExcelente = 0
      let usuariosAceptable = 0
      let usuariosBajo = 0
      let totalUsuarios = 0

      rolesData.forEach((rol) => {
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
        totalUsuarios: totalUsuarios,
      }
    })

    graficoGeneral.value = nuevoGraficoGeneral

    // Calcular KPIs globales
    const totalSolicitudes = solicitudes.length
    const totalCumplidas = solicitudes.filter((s) => {
      const config = configsSla.find((c) => c.idSla === s.idSla)
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

    kpis.value.slaGlobal =
      totalSolicitudes > 0 ? parseFloat(((totalCumplidas / totalSolicitudes) * 100).toFixed(1)) : 0

    // Mejor y peor rol (de todos los roles combinados)
    const todosLosCumplimientos = []
    Object.values(nuevosDatosPorTipo).forEach((tipo) => {
      todosLosCumplimientos.push(...tipo.roles.filter((r) => r.total > 0))
    })

    if (todosLosCumplimientos.length > 0) {
      const mejorRolData = todosLosCumplimientos.reduce((max, rol) =>
        rol.porcentaje > max.porcentaje ? rol : max,
      )
      kpis.value.mejorRol = {
        nombre: mejorRolData.nombre,
        porcentaje: mejorRolData.porcentaje,
      }

      const peorRolData = todosLosCumplimientos.reduce((min, rol) =>
        rol.porcentaje < min.porcentaje ? rol : min,
      )
      kpis.value.atencionRequerida = {
        nombre: peorRolData.nombre,
        porcentaje: peorRolData.porcentaje,
      }
    } else {
      kpis.value.mejorRol = { nombre: '-', porcentaje: 0 }
      kpis.value.atencionRequerida = { nombre: '-', porcentaje: 0 }
    }

    // Calcular variación real comparando con el mes anterior
    if (totalSolicitudes > 0) {
      // Obtener el mes anterior
      let mesAnterior = mesNumero - 1
      let anioAnterior = filtros.value.anio
      if (mesAnterior === 0) {
        mesAnterior = 12
        anioAnterior -= 1
      }

      // Filtrar solicitudes del mes anterior
      const solicitudesMesAnterior = solicitudesData.filter((s) => {
        if (!s.fechaSolicitud) return false
        const fecha = new Date(s.fechaSolicitud)
        return fecha.getFullYear() === anioAnterior && fecha.getMonth() + 1 === mesAnterior
      })

      // Aplicar mismo filtro de roles si hay selección
      const rolesFiltrados =
        rolesSeleccionados.value.length > 0
          ? todosRoles
              .filter((r) => rolesSeleccionados.value.includes(r.nombreRol))
              .map((r) => r.idRolRegistro)
          : todosRoles.filter((r) => r.esActivo).map((r) => r.idRolRegistro)

      const solicitudesMesAnteriorFiltradas = solicitudesMesAnterior.filter((s) =>
        rolesFiltrados.includes(s.idRolRegistro),
      )

      // Calcular SLA del mes anterior
      const totalMesAnterior = solicitudesMesAnteriorFiltradas.length
      if (totalMesAnterior > 0) {
        const cumplidasMesAnterior = solicitudesMesAnteriorFiltradas.filter((s) => {
          const config = configsSla.find((c) => c.idSla === s.idSla)
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

        const slaMesAnterior = (cumplidasMesAnterior / totalMesAnterior) * 100
        kpis.value.variacion = parseFloat((kpis.value.slaGlobal - slaMesAnterior).toFixed(1))
      } else {
        // No hay datos del mes anterior
        kpis.value.variacion = 0
      }
    } else {
      // No hay datos del mes actual
      kpis.value.variacion = 0
    }
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
  border-left: 4px solid #4caf50;
}

.kpi-atencion {
  border-left: 4px solid #ff9800;
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
  background-color: #4caf50;
}

.stacked-segment.aceptable {
  background-color: #ff9800;
}

.stacked-segment.bajo {
  background-color: #f44336;
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

/* Desktop Large (1440px+) */
@media (min-width: 1440px) {
  .dashboard-page {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* Desktop (1024px - 1439px) */
@media (max-width: 1439px) and (min-width: 1024px) {
  .dashboard-page {
    padding: 24px 20px;
  }

  .stacked-bar-wrapper {
    height: 44px;
  }

  .segment-label {
    font-size: 11px;
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

  .stacked-bar-wrapper {
    height: 40px;
  }

  .segment-label {
    font-size: 10px;
  }

  .kpi-card .text-h4 {
    font-size: 1.75rem;
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

  .kpi-card {
    margin-bottom: 12px;
    min-height: 120px;
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

  .kpi-card .text-h4 {
    font-size: 1.5rem;
  }

  /* Reorganizar filtros en tablet */
  .filters-card .q-gutter-md > .col-md-4 {
    width: 50% !important;
  }

  /* Ajustar gráficos en dos columnas */
  .dashboard-content .col-md-6 {
    width: 100% !important;
    margin-bottom: 16px;
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

  .stacked-chart-container .row {
    flex-direction: column;
  }

  .stacked-chart-container .col-2,
  .stacked-chart-container .col-10 {
    width: 100%;
  }

  .stacked-chart-container .col-2 {
    margin-bottom: 6px;
    text-align: left;
  }

  .segment-label {
    display: none;
  }

  .filters-card .q-gutter-md {
    gap: 8px;
  }

  .filters-card .row > [class*='col-'] {
    width: 100% !important;
    margin-bottom: 8px;
  }

  .kpi-card {
    margin-bottom: 8px;
    min-height: 100px;
  }

  .kpi-card .text-h4 {
    font-size: 1.5rem;
  }

  .text-h6 {
    font-size: 1rem;
  }

  .text-h5 {
    font-size: 1.1rem;
  }

  .stacked-bar-wrapper {
    height: 32px;
  }

  .barra-wrapper {
    height: 24px;
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

  .stacked-bar-wrapper {
    height: 28px;
  }

  .barra-wrapper {
    height: 20px;
  }

  .kpi-card {
    margin-bottom: 6px;
    min-height: 90px;
  }

  .kpi-card .text-h4 {
    font-size: 1.25rem;
  }

  .kpi-card .q-card-section {
    padding: 12px;
  }

  .text-h6 {
    font-size: 0.95rem;
  }

  .text-subtitle1 {
    font-size: 0.85rem;
  }

  .filters-card .q-card-section {
    padding: 12px;
  }

  /* Botones de filtros en móvil pequeño */
  .filters-card .q-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  /* Reducir márgenes en elementos de lista */
  .stacked-bar-item {
    margin-bottom: 12px;
  }

  .barra-item {
    margin-bottom: 12px;
  }

  /* Ocultar iconos secundarios en móvil muy pequeño */
  .kpi-card .absolute {
    display: none;
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

  .kpi-card .text-h4 {
    font-size: 1.1rem;
  }

  .text-h6 {
    font-size: 0.85rem;
  }

  .stacked-bar-wrapper,
  .barra-wrapper {
    height: 24px;
  }
}

/* Orientación landscape en móviles */
@media (max-height: 500px) and (orientation: landscape) {
  .dashboard-page {
    padding: 8px 16px;
  }

  .kpi-card {
    min-height: 80px;
  }

  .stacked-bar-wrapper {
    height: 28px;
  }

  .dashboard-header {
    padding: 8px 12px;
  }

  .fullscreen-loading .text-h6 {
    font-size: 1rem;
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
  }
}

/* Alto contraste y accesibilidad */
@media (prefers-contrast: high) {
  .kpi-card {
    border-width: 2px;
  }

  .stacked-segment {
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .segment-label {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
}

/* Reducción de movimiento */
@media (prefers-reduced-motion: reduce) {
  .kpi-card,
  .stacked-segment,
  .barra-fill {
    transition: none;
  }

  .kpi-card:hover {
    transform: none;
  }
}
</style>
