<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header q-mb-lg">
      <div class="row items-center">
        <q-icon name="filter_alt" size="40px" color="primary" class="q-mr-md" />
        <div>
          <div class="text-h5 text-weight-medium">Filtros Dinámicos - Reporte SLA Mensual</div>
          <div class="text-grey-7">Configura y genera reportes personalizados</div>
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
              :rules="[val => !!val || 'El mes es obligatorio']"
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
              :rules="[val => !!val || 'El año es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Dropdown Tipo SLA -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipoSla"
              :options="tiposSlaDisponibles"
              label="Tipo SLA"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
              <template v-slot:hint>
                Opcional - Selecciona un tipo específico
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
              <template v-slot:hint>
                Opcional - Selecciona uno o varios
              </template>
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
            label="Aplicar Filtros"
            icon="search"
            @click="aplicarFiltros"
            :loading="loading"
            :disable="!filtros.mes || !filtros.anio"
          />
          <q-btn
            outline
            color="grey-7"
            label="Restablecer Filtros"
            icon="refresh"
            @click="restablecerFiltros"
          />
          <q-btn
            outline
            color="positive"
            label="Exportar Reporte"
            icon="download"
            @click="exportarReporte"
            :disable="!hayDatos"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 text-weight-medium q-mb-md">
          <q-icon name="table_chart" class="q-mr-sm" />
          Resultados del Reporte
        </div>
        <q-separator class="q-mb-md" />

        <!-- Loading -->
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <!-- Sin datos -->
        <div v-if="!loading && !hayDatos" class="text-center q-pa-xl">
          <q-icon name="search_off" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            No existen registros para los filtros seleccionados.
          </div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Intenta ajustar los criterios de búsqueda o selecciona otro período.
          </div>
          <q-btn
            outline
            color="primary"
            label="Ajustar Filtros"
            icon="tune"
            class="q-mt-lg"
            @click="scrollToTop"
          />
        </div>

        <!-- Tabla con datos -->
        <div v-else-if="!loading && hayDatos">
          <!-- Estadísticas resumidas -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="stat-mini-card">
                <q-card-section class="q-pa-md">
                  <div class="text-caption text-grey-7">Total Registros</div>
                  <div class="text-h5 text-weight-bold text-primary">
                    {{ estadisticas.total }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered class="stat-mini-card">
                <q-card-section class="q-pa-md">
                  <div class="text-caption text-grey-7">SLA Promedio</div>
                  <div class="text-h5 text-weight-bold text-positive">
                    {{ estadisticas.promedio }}%
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered class="stat-mini-card">
                <q-card-section class="q-pa-md">
                  <div class="text-caption text-grey-7">Roles Incluidos</div>
                  <div class="text-h5 text-weight-bold text-primary">
                    {{ estadisticas.roles }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tabla de resultados -->
          <q-table
            :rows="datosReporte"
            :columns="columnas"
            row-key="nombre"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-cumplimiento="props">
              <q-td :props="props">
                <q-linear-progress
                  :value="props.row.cumplimiento / 100"
                  :color="getColorByCumplimiento(props.row.cumplimiento)"
                  size="20px"
                  rounded
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="props.row.cumplimiento + '%'" />
                  </div>
                </q-linear-progress>
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  :color="getEstadoColor(props.row.cumplimiento)"
                  :label="getEstadoLabel(props.row.cumplimiento)"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

// Definir emit
const emit = defineEmits(['onFiltroChange'])

// Estados
const loading = ref(false)

const mesesDisponibles = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const filtros = ref({
  mes: mesesDisponibles[new Date().getMonth()],
  anio: new Date().getFullYear(),
  tipoSla: null,
  roles: []
})

const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([])
const rolesDisponibles = ref([])
const datosReporte = ref([])

const estadisticas = ref({
  total: 0,
  promedio: 0,
  roles: 0
})

const columnas = [
  {
    name: 'nombre',
    label: 'Rol/Área',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'total',
    label: 'Total Solicitudes',
    field: 'total',
    align: 'center',
    sortable: true
  },
  {
    name: 'cumplidos',
    label: 'Cumplidos',
    field: 'cumplidos',
    align: 'center',
    sortable: true
  },
  {
    name: 'cumplimiento',
    label: 'Cumplimiento',
    field: 'cumplimiento',
    align: 'center',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  }
]

// Computed
const hayDatos = computed(() => datosReporte.value.length > 0)

const filtrosActivos = computed(() => {
  const activos = []

  activos.push({
    key: 'periodo',
    label: `${filtros.value.mes} ${filtros.value.anio}`,
    icon: 'event',
    color: 'primary',
    removable: false
  })

  if (filtros.value.tipoSla) {
    activos.push({
      key: 'tipoSla',
      label: `Tipo: ${filtros.value.tipoSla}`,
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

// Métodos
const cargarConfiguracionesIniciales = async () => {
  try {
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/Solicitud'),
      api.get('/RolRegistro'),
      api.get('/ConfigSla')
    ])

    // Años
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [...new Set(solicitudesRes.data
        .filter(s => s.fechaSolicitud)
        .map(s => new Date(s.fechaSolicitud).getFullYear())
      )].sort((a, b) => b - a)
      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }

    // Roles
    if (rolesRes.data) {
      rolesDisponibles.value = rolesRes.data
        .filter(r => r.esActivo)
        .map(r => r.nombreRol)
    }

    // Tipos SLA
    if (configSlaRes.data) {
      tiposSlaDisponibles.value = [...new Set(configSlaRes.data
        .filter(c => c.esActivo)
        .map(c => c.tipoSolicitud)
      )]
    }
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
  }
}

const aplicarFiltros = async () => {
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
    const mesNumero = mesesDisponibles.indexOf(filtros.value.mes) + 1

    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/Solicitud'),
      api.get('/RolRegistro'),
      api.get('/ConfigSla')
    ])

    let solicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar por mes/año
    solicitudes = solicitudes.filter(s => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio &&
             (fecha.getMonth() + 1) === mesNumero
    })

    // Filtrar por tipo SLA
    if (filtros.value.tipoSla) {
      const configsFiltradas = configsSla.filter(c => c.tipoSolicitud === filtros.value.tipoSla)
      const idsSla = configsFiltradas.map(c => c.idSla)
      solicitudes = solicitudes.filter(s => idsSla.includes(s.idSla))
    }

    // Filtrar por roles
    if (filtros.value.roles && filtros.value.roles.length > 0) {
      const rolesIds = todosRoles
        .filter(r => filtros.value.roles.includes(r.nombreRol))
        .map(r => r.idRolRegistro)
      solicitudes = solicitudes.filter(s => rolesIds.includes(s.idRolRegistro))
    }

    // Calcular cumplimiento
    const solicitudesConSla = solicitudes.map(s => {
      const config = configsSla.find(c => c.idSla === s.idSla)
      const diasUmbral = config?.diasUmbral || 0

      let cumpleSla = false
      if (s.fechaSolicitud && s.fechaIngreso) {
        const fechaSol = new Date(s.fechaSolicitud)
        const fechaIng = new Date(s.fechaIngreso)
        const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
        cumpleSla = diasTranscurridos <= diasUmbral
      }

      return { ...s, cumpleSla }
    })

    // Preparar datos del reporte
    const cumplimientoPorRol = todosRoles
      .filter(r => r.esActivo)
      .map(rol => {
        const solicitudesRol = solicitudesConSla.filter(s => s.idRolRegistro === rol.idRolRegistro)
        const totalRol = solicitudesRol.length
        const cumplenRol = solicitudesRol.filter(s => s.cumpleSla).length
        const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

        return {
          nombre: rol.nombreRol,
          total: totalRol,
          cumplidos: cumplenRol,
          cumplimiento: parseFloat(porcentaje.toFixed(1))
        }
      })
      .filter(r => r.total > 0)
      .sort((a, b) => b.cumplimiento - a.cumplimiento)

    datosReporte.value = cumplimientoPorRol

    // Estadísticas
    estadisticas.value.total = solicitudesConSla.length
    estadisticas.value.promedio = cumplimientoPorRol.length > 0
      ? parseFloat((cumplimientoPorRol.reduce((sum, r) => sum + r.cumplimiento, 0) / cumplimientoPorRol.length).toFixed(1))
      : 0
    estadisticas.value.roles = cumplimientoPorRol.length

    // Emitir evento
    emit('onFiltroChange', {
      filtros: filtros.value,
      datos: datosReporte.value,
      estadisticas: estadisticas.value
    })

    $q.notify({
      type: 'positive',
      message: `${cumplimientoPorRol.length} roles encontrados`,
      position: 'top-right',
      timeout: 2000
    })

  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el reporte',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const restablecerFiltros = () => {
  filtros.value = {
    mes: mesesDisponibles[new Date().getMonth()],
    anio: new Date().getFullYear(),
    tipoSla: null,
    roles: []
  }
  datosReporte.value = []
  estadisticas.value = { total: 0, promedio: 0, roles: 0 }

  $q.notify({
    type: 'info',
    message: 'Filtros restablecidos',
    position: 'top-right'
  })
}

const removerFiltro = (key) => {
  if (key === 'tipoSla') {
    filtros.value.tipoSla = null
  } else if (key === 'roles') {
    filtros.value.roles = []
  }
}

const exportarReporte = () => {
  if (!hayDatos.value) return

  // Convertir a CSV
  const headers = ['Rol/Área', 'Total Solicitudes', 'Cumplidos', 'Cumplimiento (%)', 'Estado']
  const rows = datosReporte.value.map(row => [
    row.nombre,
    row.total,
    row.cumplidos,
    row.cumplimiento,
    getEstadoLabel(row.cumplimiento)
  ])

  let csv = headers.join(',') + '\n'
  csv += rows.map(row => row.join(',')).join('\n')

  // Descargar
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Reporte_SLA_${filtros.value.mes}_${filtros.value.anio}.csv`
  a.click()

  $q.notify({
    type: 'positive',
    message: 'Reporte exportado correctamente',
    position: 'top-right'
  })
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getColorByCumplimiento = (cumplimiento) => {
  if (cumplimiento >= 90) return 'positive'
  if (cumplimiento >= 70) return 'orange'
  return 'negative'
}

const getEstadoColor = (cumplimiento) => {
  if (cumplimiento >= 90) return 'positive'
  if (cumplimiento >= 70) return 'warning'
  return 'negative'
}

const getEstadoLabel = (cumplimiento) => {
  if (cumplimiento >= 90) return 'Excelente'
  if (cumplimiento >= 70) return 'Aceptable'
  return 'Bajo'
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionesIniciales()
  await aplicarFiltros()
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

.stat-mini-card {
  background: white;
  border-radius: 8px;
}
</style>
