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
            <div class="text-grey-7">
              Consulta quién generó cada reporte y descarga el archivo.
            </div>
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
                <span v-if="props.row.filtrosJson">
                  <q-tooltip>
                    {{ props.row.filtrosJson }}
                  </q-tooltip>
                  <span class="text-caption text-grey-8 ellipsis">
                    {{ props.row.filtrosJson }}
                  </span>
                </span>
                <span v-else class="text-grey-6">Sin filtros</span>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="file_download"
                  @click="descargarReporte(props.row)"
                >
                  <q-tooltip>Descargar</q-tooltip>
                </q-btn>
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

const columnas = [
  {
    name: 'idReporte',
    label: 'ID',
    field: 'idReporte',
    align: 'left',
    sortable: true
  },
  {
    name: 'tipoReporte',
    label: 'Tipo',
    field: 'tipoReporte',
    align: 'left',
    sortable: true
  },
  {
    name: 'formato',
    label: 'Formato',
    field: 'formato',
    align: 'center',
    sortable: true
  },
  {
    name: 'filtrosJson',
    label: 'Filtros',
    field: 'filtrosJson',
    align: 'left'
  },
  {
    name: 'generadoPorNombre',
    label: 'Generado por',
    field: 'generadoPorNombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'fechaGeneracion',
    label: 'Fecha generación',
    field: 'fechaGeneracion',
    align: 'left',
    sortable: true
  },
  {
    name: 'totalSolicitudes',
    label: 'Total Solicitudes',
    field: 'totalSolicitudes',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center'
  }
]

const formatFecha = (valor) => {
  if (!valor) return ''
  const d = new Date(valor)
  return d.toLocaleString()
}

const cargarHistorial = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/reporte')
    reportes.value = res.data || []
  } catch (error) {
    console.error('Error al cargar historial de reportes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial de reportes',
      position: 'top-right'
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const descargarReporte = (row) => {
  if (!row.rutaArchivo) {
    $q.notify({
      type: 'warning',
      message: 'El reporte no tiene ruta de archivo asociada',
      position: 'top-right'
    })
    return
  }

  try {
    const baseUrl = api.defaults.baseURL || ''
    const normalizedPath = row.rutaArchivo.replace(/\\/g, '/')
    const urlDescarga = `${baseUrl}${normalizedPath}`

    window.open(urlDescarga, '_blank')
  } catch (error) {
    console.error('Error al descargar reporte:', error)
    $q.notify({
      type: 'negative',
      message:
        'No se pudo descargar el reporte. Verifica la publicación de la carpeta /reports en el backend.',
      position: 'top-right'
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
