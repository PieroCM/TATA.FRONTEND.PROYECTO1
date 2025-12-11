<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando historial...</div>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center">
          <q-icon name="history" size="40px" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-medium">Historial de Reportes SLA</div>
            <div class="text-grey-7">Consulta quién generó cada reporte y descarga el archivo.</div>
          </div>
        </div>
      </div>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="list_alt" class="q-mr-sm" />
            Reportes generados
          </div>
          <q-separator class="q-mb-md" />

          <q-table
            :rows="reportes"
            :columns="columnas"
            row-key="idReporte"
            :loading="loading"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-fechaGeneracion="props">
              <q-td :props="props">
                {{ formatFecha(props.row.fechaGeneracion) }}
              </q-td>
            </template>

            <template v-slot:body-cell-filtrosJson="props">
              <q-td :props="props">
                <span class="text-body2">
                  {{ formatFiltros(props.row.filtrosJson) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-tipoReporte="props">
              <q-td :props="props">
                {{ props.row.tipoReporte }}
              </q-td>
            </template>

            <template v-slot:body-cell-formato="props">
              <q-td :props="props">
                {{ props.row.formato }}
              </q-td>
            </template>

            <template v-slot:body-cell-totalSolicitudes="props">
              <q-td :props="props">
                {{ props.row.totalSolicitudes }}
              </q-td>
            </template>

            <template v-slot:body-cell-generadoPorNombre="props">
              <q-td :props="props">
                {{ props.row.generadoPorNombre }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAppStore } from 'stores/app-store'

const $q = useQuasar()
const appStore = useAppStore()

const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)

const reportes = ref([])
const usuariosMap = ref({}) // Mapeo de ID usuario -> nombre

const columnas = [
  {
    name: 'fechaGeneracion',
    label: 'Fecha de generación',
    field: 'fechaGeneracion',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tipoReporte',
    label: 'Tipo',
    field: 'tipoReporte',
    align: 'left',
    sortable: true,
  },
  {
    name: 'formato',
    label: 'Formato',
    field: 'formato',
    align: 'center',
    sortable: true,
  },
  {
    name: 'filtrosJson',
    label: 'Filtros',
    field: 'filtrosJson',
    align: 'left',
  },
  {
    name: 'totalSolicitudes',
    label: 'Total solicitudes',
    field: 'totalSolicitudes',
    align: 'center',
    sortable: true,
  },
  {
    name: 'generadoPorNombre',
    label: 'Generado por',
    field: 'generadoPorNombre',
    align: 'left',
    sortable: true,
  },
]

const formatFecha = (valor) => {
  if (!valor) return ''
  // Si viene como ISO sin zona (ej: 2025-11-29T01:46:00) interpretarlo como UTC
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?/.exec(
    valor,
  )
  let dateObj
  if (isoMatch) {
    const [, y, m, d, hh, mm, ss = '00'] = isoMatch
    // Construimos como UTC para luego mostrarlo en America/Lima
    dateObj = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss))
  } else {
    // Fallback: crear Date normal
    dateObj = new Date(valor)
  }
  return dateObj.toLocaleString('es-PE', { timeZone: 'America/Lima' })
}

const formatFiltros = (filtrosJson) => {
  if (!filtrosJson) return 'Sin filtros'
  try {
    const filtros = typeof filtrosJson === 'string' ? JSON.parse(filtrosJson) : filtrosJson
    const partes = []

    if (filtros.mes) partes.push(filtros.mes)
    if (filtros.anio) partes.push(filtros.anio)
    if (filtros.codigoSla) partes.push(`SLA ${filtros.codigoSla.replace(/SLA/, '')}`)

    return partes.length > 0 ? partes.join(' - ') : 'Sin filtros'
  } catch (e) {
    return filtrosJson
  }
}

const cargarHistorial = async () => {
  loading.value = true
  try {
    // Cargar usuarios primero
    try {
      const usuariosRes = await api.get('/api/Usuario')
      if (usuariosRes.data && Array.isArray(usuariosRes.data)) {
        usuariosRes.data.forEach((usuario) => {
          usuariosMap.value[usuario.idUsuario] =
            usuario.username || usuario.nombreCompleto || `Usuario ${usuario.idUsuario}`
        })
      }
    } catch (usuarioError) {
      // console.warn('No se pudieron cargar los usuarios:', usuarioError)
    }

    const res = await api.get('/api/reporte')
    const datos = res.data || []
    // console.log('Datos del API:', datos)

    // Enriquecer datos con nombres de usuario
    const datosEnriquecidos = datos.map((reporte) => {
      let nombreUsuario = reporte.generadoPorNombre
      if (!nombreUsuario && reporte.generadoPor) {
        nombreUsuario = usuariosMap.value[reporte.generadoPor] || `Usuario ${reporte.generadoPor}`
      }
      return {
        ...reporte,
        generadoPorNombre: nombreUsuario || 'Sin nombre',
      }
    })

    // Ordenar por fecha de generación descendente (más recientes primero)
    reportes.value = datosEnriquecidos.sort((a, b) => {
      const fechaA = new Date(a.fechaGeneracion).getTime()
      const fechaB = new Date(b.fechaGeneracion).getTime()
      return fechaB - fechaA
    })
    // console.log('Reportes ordenados:', reportes.value)
  } catch (error) {
    // console.error('Error al cargar historial de reportes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial de reportes',
      position: 'top-right',
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const _descargarReporte = (row) => {
  if (!row.rutaArchivo) {
    $q.notify({
      type: 'warning',
      message: 'El reporte no tiene ruta de archivo asociada',
      position: 'top-right',
    })
    return
  }

  try {
    const baseUrl = api.defaults.baseURL || ''
    const normalizedPath = row.rutaArchivo.replace(/\\/g, '/')
    const urlDescarga = `${baseUrl}${normalizedPath}`

    window.open(urlDescarga, '_blank')
  } catch (error) {
    // console.error('Error al descargar reporte:', error)
    $q.notify({
      type: 'negative',
      message:
        'No se pudo descargar el reporte. Verifica que la carpeta /reports esté publicada y accesible.',
      position: 'top-right',
    })
  }
}

onMounted(async () => {
  await cargarHistorial()
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

.ellipsis {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
