<template>
  <q-card flat bordered class="ejecuciones-card">
    <q-card-section>
      <div class="card-header q-mb-lg">
        <q-icon name="history" color="primary" size="24px" class="q-mr-sm" />
        <h2 class="text-h6 text-weight-semibold q-ma-none">Ejecuciones</h2>
      </div>

      <!-- Resumen (Caja Gris Superior) -->
      <div class="resumen-box q-pa-md q-mb-lg">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="resumen-item">
              <div class="text-caption text-grey-7 q-mb-xs">Último envío inmediato</div>
              <div class="text-body1 text-weight-medium">Enviado 12/11/2025 10:05</div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="resumen-item">
              <div class="text-caption text-grey-7 q-mb-xs">Último resumen diario</div>
              <div class="text-body1 text-weight-medium">
                Enviado 12/11/2025 06:00
                <span class="q-ml-sm">
                  <span class="text-orange-9">warning: 3</span>
                  <span class="q-mx-xs">/</span>
                  <span class="text-negative">critical: 2</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <div class="table-responsive">
        <q-table
          flat
          :rows="ejecuciones"
          :columns="columns"
          row-key="idEjecucion"
          :loading="loading"
          :pagination="pagination"
          class="ejecuciones-table-custom"
        >
          <!-- Columna Fecha -->
          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ formatFecha(props.row.fecha) }}</div>
              <div class="text-caption text-grey-7">{{ formatHora(props.row.fecha) }}</div>
            </q-td>
          </template>

          <!-- Columna Tipo -->
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.tipo === 'Resumen'"
                outline
                color="positive"
                label="Resumen"
                class="badge-tipo"
              />
              <q-badge v-else outline color="primary" label="Inmediato" class="badge-tipo" />
            </q-td>
          </template>

          <!-- Columna Cantidad -->
          <template v-slot:body-cell-cantidad="props">
            <q-td :props="props">
              <div class="text-center text-weight-bold text-h6">
                {{ props.row.cantidad }}
              </div>
            </q-td>
          </template>

          <!-- Columna Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.estado === 'Enviado'"
                color="positive"
                text-color="white"
                class="badge-estado"
              >
                <q-icon name="check_circle" size="16px" class="q-mr-xs" />
                Enviado
              </q-badge>
              <q-badge v-else color="negative" text-color="white" class="badge-estado">
                <q-icon name="cancel" size="16px" class="q-mr-xs" />
                Falló
              </q-badge>
            </q-td>
          </template>

          <!-- Columna Reintentos -->
          <template v-slot:body-cell-reintentos="props">
            <q-td :props="props">
              <div class="text-center text-grey-8">{{ props.row.reintentos }}</div>
            </q-td>
          </template>

          <!-- Sin datos -->
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="inbox" size="64px" color="grey-5" />
              <p class="text-h6 text-grey-6 q-mt-md">No hay ejecuciones registradas</p>
            </div>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'

const $q = useQuasar()

// Estado de carga
const loading = ref(false)

// Paginación
const pagination = ref({
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10,
})

// Columnas de la tabla
const columns = [
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'left',
    field: 'fecha',
    sortable: true,
  },
  {
    name: 'tipo',
    label: 'Tipo',
    align: 'center',
    field: 'tipo',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'center',
    field: 'cantidad',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'reintentos',
    label: 'Reintentos',
    align: 'center',
    field: 'reintentos',
    sortable: true,
  },
]

// Datos de ejemplo
const ejecuciones = ref([
  {
    idEjecucion: 1,
    fecha: '2025-11-12T10:05:00',
    tipo: 'Inmediato',
    cantidad: 5,
    estado: 'Enviado',
    reintentos: 0,
  },
  {
    idEjecucion: 2,
    fecha: '2025-11-12T06:00:00',
    tipo: 'Resumen',
    cantidad: 23,
    estado: 'Enviado',
    reintentos: 0,
  },
  {
    idEjecucion: 3,
    fecha: '2025-11-11T14:30:00',
    tipo: 'Inmediato',
    cantidad: 2,
    estado: 'Enviado',
    reintentos: 0,
  },
  {
    idEjecucion: 4,
    fecha: '2025-11-11T06:00:00',
    tipo: 'Resumen',
    cantidad: 18,
    estado: 'Enviado',
    reintentos: 0,
  },
  {
    idEjecucion: 5,
    fecha: '2025-11-10T09:15:00',
    tipo: 'Inmediato',
    cantidad: 3,
    estado: 'Falló',
    reintentos: 2,
  },
  {
    idEjecucion: 6,
    fecha: '2025-11-10T06:00:00',
    tipo: 'Resumen',
    cantidad: 15,
    estado: 'Enviado',
    reintentos: 0,
  },
])

/**
 * Formatea fecha
 */
const formatFecha = (fechaStr) => {
  return date.formatDate(fechaStr, 'DD/MM/YYYY')
}

/**
 * Formatea hora
 */
const formatHora = (fechaStr) => {
  return date.formatDate(fechaStr, 'HH:mm')
}

/**
 * Carga las ejecuciones
 */
const cargarEjecuciones = async () => {
  loading.value = true

  try {
    // Simular llamada API
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log('Ejecuciones cargadas')
  } catch (error) {
    console.error('Error al cargar ejecuciones:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial de ejecuciones',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarEjecuciones()
})
</script>

<style scoped>
.ejecuciones-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

/* ===== RESUMEN BOX ===== */
.resumen-box {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.resumen-item {
  padding: 8px 0;
}

/* ===== TABLA ===== */
.table-responsive {
  overflow-x: auto;
}

.ejecuciones-table-custom {
  border-radius: 8px;
}

.ejecuciones-table-custom :deep(thead tr) {
  background: #f8fafc;
}

.ejecuciones-table-custom :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ejecuciones-table-custom :deep(tbody tr) {
  border-bottom: 1px solid #f1f5f9;
}

.ejecuciones-table-custom :deep(tbody tr:hover) {
  background: #f8fafc;
}

/* ===== BADGES ===== */
.badge-tipo {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-estado {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

/* ===== ESTADO VACÍO ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}
</style>
