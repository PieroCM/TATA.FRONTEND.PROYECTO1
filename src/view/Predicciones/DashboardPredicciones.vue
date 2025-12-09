<template>
  <q-page padding>
    <!-- Toolbar con Título y Acciones -->
    <div class="row items-center q-mb-md">
      <div class="col-12 col-sm-6">
        <div class="text-h4 text-weight-bold">
          <q-icon name="analytics" color="primary" size="36px" class="q-mr-sm" />
          Predicciones de SLA
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          Predicciones actuales de incumplimiento de SLA generadas por el modelo de Machine Learning
        </div>
      </div>

      <div class="col-12 col-sm-6 text-right">
        <q-btn
          label="Actualizar"
          icon="refresh"
          color="primary"
          @click="actualizarDatos"
          :loading="loading"
          :disable="loading"
          unelevated
        >
          <q-tooltip>Recargar predicciones desde el servidor</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Indicadores Clave (KPIs) -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="!loading && predicciones.length > 0">
      <!-- Total de Predicciones -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-primary text-white">
          <q-card-section>
            <div class="text-h3 text-weight-bold">{{ predicciones.length }}</div>
            <div class="text-subtitle2">Total de Predicciones</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alto Riesgo -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-negative text-white">
          <q-card-section>
            <div class="text-h3 text-weight-bold">{{ contadorAltoRiesgo }}</div>
            <div class="text-subtitle2">Alto Riesgo (&gt;70%)</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Riesgo Medio -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-warning text-white">
          <q-card-section>
            <div class="text-h3 text-weight-bold">{{ contadorRiesgoMedio }}</div>
            <div class="text-subtitle2">Riesgo Medio (40-70%)</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Bajo Riesgo -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card bg-positive text-white">
          <q-card-section>
            <div class="text-h3 text-weight-bold">{{ contadorBajoRiesgo }}</div>
            <div class="text-subtitle2">Bajo Riesgo (&lt;40%)</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Predicciones -->
    <q-card flat bordered>
      <q-card-section>
        <!-- Estado de Carga -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-dots color="primary" size="50px" />
          <div class="text-subtitle1 text-grey-7 q-mt-md">Cargando predicciones...</div>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="text-center q-pa-xl">
          <q-icon name="error_outline" size="64px" color="negative" />
          <div class="text-h6 text-negative q-mt-md">Error al cargar las predicciones</div>
          <div class="text-body2 text-grey-7 q-mt-sm">{{ error }}</div>
          <q-btn
            label="Reintentar"
            icon="refresh"
            color="primary"
            @click="cargarPredicciones"
            class="q-mt-md"
            unelevated
          />
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="predicciones.length === 0" class="text-center q-pa-xl">
          <q-icon name="info_outline" size="64px" color="info" />
          <div class="text-h6 text-grey-7 q-mt-md">No hay predicciones disponibles</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            No se encontraron predicciones actuales. Intente actualizar los datos o verificar que el servicio de ML esté activo.
          </div>
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="primary"
            @click="cargarPredicciones"
            class="q-mt-md"
            unelevated
          />
        </div>

        <!-- Componente de Tabla con Predicciones -->
        <PrediccionTable
          v-if="!loading && !error && predicciones.length > 0"
          :predicciones="predicciones"
          :loading="loading"
          @filtros-cambiados="manejarFiltrosCambiados"
        />
      </q-card-section>
    </q-card>

    <!-- Información del Modelo -->
    <q-card flat bordered class="q-mt-md" v-if="!loading && predicciones.length > 0">
      <q-card-section>
        <div class="text-h6 q-mb-sm">
          <q-icon name="info" color="info" class="q-mr-sm" />
          Información del Modelo
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">Versión del Modelo:</div>
            <div class="text-body1 text-weight-medium">
              {{ modeloVersion || 'No disponible' }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">Última actualización:</div>
            <div class="text-body1 text-weight-medium">
              {{ formatearFechaActualizacion() }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PrediccionTable from 'src/components/SLA/PrediccionTable.vue'
import { getPrediccionesActuales } from 'src/api/slaML.api'

// Composables
const $q = useQuasar()

// Estado
const predicciones = ref([])
const loading = ref(false)
const error = ref(null)
const fechaActualizacion = ref(null)

// Computed
const modeloVersion = computed(() => {
  if (predicciones.value.length === 0) return null
  // Asumimos que todas las predicciones tienen la misma versión de modelo
  return predicciones.value[0]?.modelo_version || null
})

// Computed adaptados a la respuesta de Python (campo: probabilidad_incumplimiento)
const contadorAltoRiesgo = computed(() => {
  return predicciones.value.filter(p =>
    p.nivel_riesgo === 'CRITICO' || p.nivel_riesgo === 'ALTO'
  ).length
})

const contadorRiesgoMedio = computed(() => {
  return predicciones.value.filter(p => p.nivel_riesgo === 'MEDIO').length
})

const contadorBajoRiesgo = computed(() => {
  return predicciones.value.filter(p => p.nivel_riesgo === 'BAJO').length
})

// Métodos
const cargarPredicciones = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await getPrediccionesActuales()
    console.log('📊 Datos recibidos:', data)
    console.log('📊 Tipo de datos:', typeof data)
    console.log('📊 Es array?:', Array.isArray(data))
    console.log('📊 Longitud:', data?.length)

    predicciones.value = data || []
    fechaActualizacion.value = new Date()

    if (predicciones.value.length > 0) {
      $q.notify({
        type: 'positive',
        message: `${predicciones.value.length} predicciones cargadas correctamente`,
        position: 'top-right',
        timeout: 2000
      })
    }
  } catch (err) {
    console.error('❌ Error completo:', err)
    error.value = err.message || 'Error desconocido al cargar predicciones'
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las predicciones',
      caption: error.value,
      position: 'top-right',
      timeout: 4000
    })
  } finally {
    loading.value = false
  }
}

const actualizarDatos = async () => {
  await cargarPredicciones()
}

const manejarFiltrosCambiados = (filtros) => {
  console.log('Filtros cambiados:', filtros)
  // Los filtros se manejan internamente en el componente PrediccionTable
  // Este evento se puede usar para logging o analytics
}

const formatearFechaActualizacion = () => {
  if (!fechaActualizacion.value) return 'N/A'

  const fecha = fechaActualizacion.value
  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  cargarPredicciones()
})
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
}
</style>
