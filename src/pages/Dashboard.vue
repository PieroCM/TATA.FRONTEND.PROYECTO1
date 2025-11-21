<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando datos del dashboard...</div>
      </div>
    </div>

    <!-- Contenido del Dashboard -->
    <div v-else>
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
        <q-chip color="primary" text-color="white" icon="update">
          Auto-refresh: 30s
        </q-chip>
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
      </q-card-section>
    </q-card>

    <!-- Tarjetas de KPIs principales -->
    <div class="row q-col-gutter-lg q-mb-lg">
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
                <div class="text-h5 text-weight-bold text-grey-9">
                  {{ mejorRolPorcentaje }}%
                </div>
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
                <div class="text-h5 text-weight-bold text-grey-9">
                  {{ peorRolPorcentaje }}%
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="trending_down" color="orange" size="40px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos separados por Tipo de SLA -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div
        v-for="tipoSla in tiposSlaDisponibles"
        :key="tipoSla.nombre"
        :class="tiposSlaDisponibles.length === 1 ? 'col-12' : 'col-12 col-lg-6'"
      >
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-h6 text-weight-medium">
                  {{ tipoSla.nombre }}
                </div>
                <div class="text-grey-7 text-caption">
                  Umbral: {{ tipoSla.diasUmbral }} días | Total: {{ tipoSla.totalSolicitudes }} solicitudes
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
                      background: getBarColorBySla(rol.cumplimiento)
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAppStore } from 'stores/app-store'

// Obtener instancia de Quasar
const $q = useQuasar()
const appStore = useAppStore()

// Referencias reactivas
const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)
const autoRefresh = ref(true)
const refreshInterval = ref(null)

// Meses disponibles (declarar primero)
const mesesDisponibles = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Filtros (usar después de declarar mesesDisponibles)
const filtros = ref({
  anio: new Date().getFullYear(),
  mes: mesesDisponibles[new Date().getMonth()]
})

const aniosDisponibles = ref([])

// Roles
const rolesSeleccionados = ref([])
const nuevoRol = ref(null)
const rolesDisponibles = ref([])

// Computed: Roles disponibles para seleccionar (excluye los ya seleccionados)
const rolesDisponiblesParaSeleccionar = computed(() => {
  return rolesDisponibles.value.filter(rol => !rolesSeleccionados.value.includes(rol))
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

// Computed para roles activos
const rolesActivos = computed(() => {
  return todosLosRoles.value.filter(r => r.activo).map(r => r.nombre)
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
  try {
    // Obtener años desde las solicitudes
    const response = await api.get('/Solicitud')

    if (response.data && response.data.length > 0) {
      // Extraer años únicos de las fechas de solicitud
      const aniosUnicos = [...new Set(response.data
        .filter(s => s.fechaSolicitud)
        .map(s => new Date(s.fechaSolicitud).getFullYear())
      )].sort((a, b) => b - a)

      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    } else {
      const currentYear = new Date().getFullYear()
      aniosDisponibles.value = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
    }
  } catch (error) {
    console.log('Usando años por defecto:', error.message)
    const currentYear = new Date().getFullYear()
    aniosDisponibles.value = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
  }
}

const cargarRolesDisponibles = async () => {
  try {
    // Usar tu endpoint de RolRegistro (roles técnicos)
    const response = await api.get('/RolRegistro')

    if (response.data && response.data.length > 0) {
      // Filtrar solo roles activos
      const rolesActivos = response.data.filter(r => r.esActivo !== false)

      rolesDisponibles.value = rolesActivos.map(r => r.nombreRol)

      // Si no hay roles seleccionados, seleccionar los primeros 3
      if (rolesSeleccionados.value.length === 0 && rolesDisponibles.value.length > 0) {
        rolesSeleccionados.value = rolesDisponibles.value.slice(0, Math.min(3, rolesDisponibles.value.length))
      }

      // Actualizar todosLosRoles para los chips
      todosLosRoles.value = rolesActivos.map(r => ({
        nombre: r.nombreRol,
        cantidad: 0, // Se actualizará con las solicitudes
        activo: rolesSeleccionados.value.includes(r.nombreRol)
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
      'Scrum Master'
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
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/Solicitud'),
      api.get('/RolRegistro'),
      api.get('/ConfigSla')
    ])

    const todasSolicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar solicitudes del mes y año seleccionados
    const solicitudesMes = todasSolicitudes.filter(s => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio &&
             (fecha.getMonth() + 1) === mesNumero
    })

    // Si hay roles seleccionados, filtrar por esos roles
    let solicitudesFiltradas = solicitudesMes
    if (rolesSeleccionados.value.length > 0) {
      solicitudesFiltradas = solicitudesMes.filter(s => {
        const rol = todosRoles.find(r => r.idRolRegistro === s.idRolRegistro)
        return rol && rolesSeleccionados.value.includes(rol.nombreRol)
      })
    }

    // Calcular cumplimiento de SLA
    const solicitudesConSla = solicitudesFiltradas.map(s => {
      const config = configsSla.find(c => c.idSla === s.idSla)
      const diasUmbral = config?.diasUmbral || 0

      let cumpleSla = false
      if (s.fechaSolicitud && s.fechaIngreso) {
        const fechaSol = new Date(s.fechaSolicitud)
        const fechaIng = new Date(s.fechaIngreso)
        const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
        cumpleSla = diasTranscurridos <= diasUmbral
      }

      return { ...s, cumpleSla, diasUmbral }
    })

    // Calcular SLA Global
    const totalSolicitudes = solicitudesConSla.length
    const solicitudesCumplen = solicitudesConSla.filter(s => s.cumpleSla).length
    slaGlobal.value = totalSolicitudes > 0
      ? parseFloat(((solicitudesCumplen / totalSolicitudes) * 100).toFixed(1))
      : 0

    // Calcular variación con mes anterior
    const mesAnterior = mesNumero === 1 ? 12 : mesNumero - 1
    const anioAnterior = mesNumero === 1 ? filtros.value.anio - 1 : filtros.value.anio

    const solicitudesMesAnterior = todasSolicitudes.filter(s => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === anioAnterior && (fecha.getMonth() + 1) === mesAnterior
    }).map(s => {
      const config = configsSla.find(c => c.idSla === s.idSla)
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
      const slaMesAnterior = (solicitudesMesAnterior.filter(s => s.cumpleSla).length / solicitudesMesAnterior.length) * 100
      variacion.value = parseFloat((slaGlobal.value - slaMesAnterior).toFixed(1))
    } else {
      variacion.value = 0
    }

    // Calcular cumplimiento por rol
    const cumplimientoPorRol = todosRoles
      .filter(r => r.esActivo)
      .filter(rol => {
        // Si NO hay roles seleccionados, mostrar todos
        if (rolesSeleccionados.value.length === 0) return true
        // Si HAY roles seleccionados, mostrar solo esos (aunque no tengan registros)
        return rolesSeleccionados.value.includes(rol.nombreRol)
      })
      .map(rol => {
        const solicitudesRol = solicitudesConSla.filter(s => s.idRolRegistro === rol.idRolRegistro)
        const totalRol = solicitudesRol.length
        const cumplenRol = solicitudesRol.filter(s => s.cumpleSla).length
        const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

        return {
          nombre: rol.nombreRol,
          cumplimiento: parseFloat(porcentaje.toFixed(1)),
          total: totalRol
        }
      })
      .sort((a, b) => b.cumplimiento - a.cumplimiento)

    cumplimientoRoles.value = cumplimientoPorRol
    mejorRol.value = cumplimientoPorRol.length > 0 ? cumplimientoPorRol[0].nombre : 'N/A'
    mejorRolPorcentaje.value = cumplimientoPorRol.length > 0 ? cumplimientoPorRol[0].cumplimiento : 0
    peorRol.value = cumplimientoPorRol.length > 0 ? cumplimientoPorRol[cumplimientoPorRol.length - 1].nombre : 'N/A'
    peorRolPorcentaje.value = cumplimientoPorRol.length > 0 ? cumplimientoPorRol[cumplimientoPorRol.length - 1].cumplimiento : 0

    // Calcular gráficos separados por tipo de SLA
    tiposSlaDisponibles.value = configsSla
      .filter(config => config.esActivo)
      .map(config => {
        // Filtrar solicitudes de este tipo de SLA
        const solicitudesTipoSla = solicitudesConSla.filter(s => s.idSla === config.idSla)
        const totalTipoSla = solicitudesTipoSla.length
        const cumplenTipoSla = solicitudesTipoSla.filter(s => s.cumpleSla).length
        const slaPromedio = totalTipoSla > 0 ? parseFloat(((cumplenTipoSla / totalTipoSla) * 100).toFixed(1)) : 0

        // Calcular cumplimiento por rol para este tipo de SLA
        const cumplimientoPorRolTipoSla = todosRoles
          .filter(r => r.esActivo)
          .filter(rol => {
            // Si NO hay roles seleccionados, mostrar todos
            if (rolesSeleccionados.value.length === 0) return true
            // Si HAY roles seleccionados, mostrar solo esos (aunque no tengan registros)
            return rolesSeleccionados.value.includes(rol.nombreRol)
          })
          .map(rol => {
            const solicitudesRolTipo = solicitudesTipoSla.filter(s => s.idRolRegistro === rol.idRolRegistro)
            const totalRolTipo = solicitudesRolTipo.length
            const cumplenRolTipo = solicitudesRolTipo.filter(s => s.cumpleSla).length
            const porcentaje = totalRolTipo > 0 ? (cumplenRolTipo / totalRolTipo) * 100 : 0

            return {
              nombre: rol.nombreRol,
              cumplimiento: parseFloat(porcentaje.toFixed(1)),
              total: totalRolTipo
            }
          })
          .sort((a, b) => b.cumplimiento - a.cumplimiento)

        return {
          nombre: config.tipoSolicitud || `SLA ${config.idSla}`,
          diasUmbral: config.diasUmbral,
          totalSolicitudes: totalTipoSla,
          slaPromedio: slaPromedio,
          cumplimientoRoles: cumplimientoPorRolTipoSla
        }
      })
      .filter(tipo => tipo.totalSolicitudes > 0)

    // Actualizar todos los roles con cantidades
    todosLosRoles.value = todosRoles
      .filter(r => r.esActivo)
      .map(rol => {
        const cantidad = solicitudesMes.filter(s => s.idRolRegistro === rol.idRolRegistro).length
        return {
          nombre: rol.nombreRol,
          cantidad: cantidad,
          activo: rolesSeleccionados.value.includes(rol.nombreRol)
        }
      })

  } catch (error) {
    console.error('Error al cargar dashboard desde API:', error)

    // Cargar datos de ejemplo cuando falla el API
    cargarDatosEjemplo()

    let errorMessage = 'Usando datos de ejemplo. '

    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage += 'No se pudo conectar con el servidor. Verifica que la API esté corriendo en Visual Studio.'
    } else if (error.response?.status === 404) {
      errorMessage += 'Los endpoints del API aún no están implementados. Revisa el archivo SlaController.cs'
    } else if (error.response?.status === 500) {
      errorMessage += 'Error en el servidor. Revisa los logs de la API en Visual Studio.'
    }

    $q.notify({
      type: 'warning',
      message: errorMessage,
      position: 'top-right',
      timeout: 5000,
      actions: [
        { label: 'Reintentar', color: 'white', handler: () => cargarDashboard() }
      ]
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
    { nombre: 'Scrum Master', cumplimiento: 79.4 }
  ]

  todosLosRoles.value = [
    { nombre: 'Desarrollador Sr.', cantidad: 45, activo: true },
    { nombre: 'QA Analyst', cantidad: 32, activo: true },
    { nombre: 'DevOps Engineer', cantidad: 28, activo: true },
    { nombre: 'Desarrollador Jr.', cantidad: 38, activo: false },
    { nombre: 'Scrum Master', cantidad: 15, activo: false },
    { nombre: 'Product Owner', cantidad: 12, activo: false },
    { nombre: 'UX Designer', cantidad: 18, activo: false }
  ]

  rolesDisponibles.value = todosLosRoles.value.map(r => r.nombre)
  rolesSeleccionados.value = todosLosRoles.value.filter(r => r.activo).map(r => r.nombre)
}

const restablecerFiltros = () => {
  const currentDate = new Date()
  filtros.value = {
    anio: currentDate.getFullYear(),
    mes: mesesDisponibles[currentDate.getMonth()]
  }

  // Restablecer roles a los primeros 3 disponibles
  if (rolesDisponibles.value.length > 0) {
    rolesSeleccionados.value = rolesDisponibles.value.slice(0, 3)
  }

  // Restablecer chips de roles
  todosLosRoles.value.forEach(rol => {
    rol.activo = rolesSeleccionados.value.includes(rol.nombre)
  })

  cargarDashboard()
}

const agregarRol = (rol) => {
  if (rol && !rolesSeleccionados.value.includes(rol)) {
    rolesSeleccionados.value.push(rol)

    // Actualizar estado del chip
    const rolChip = todosLosRoles.value.find(r => r.nombre === rol)
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
    const rolChip = todosLosRoles.value.find(r => r.nombre === rol)
    if (rolChip) {
      rolChip.activo = false
    }

    cargarDashboard()
  }
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-success {
  border-left: 4px solid #4CAF50;
}

.card-warning {
  border-left: 4px solid #FF9800;
}

.card-danger {
  border-left: 4px solid #F44336;
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
</style>
