<template>
  <q-page class="predicciones-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando predicciones ML...</div>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="psychology" size="48px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold">Predicciones ML - Riesgo SLA</div>
              <div class="text-subtitle1 text-grey-7">
                Análisis predictivo con Machine Learning | Modelo: <span class="text-primary text-weight-medium">{{ modeloActual || 'Sin entrenar' }}</span>
              </div>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="primary"
              icon="refresh"
              label="Actualizar"
              :loading="loading"
              @click="recargarPredicciones"
            />
            <q-btn
              color="secondary"
              icon="model_training"
              label="Entrenar Modelo"
              :loading="reentrenando"
              @click="mostrarDialogoEntrenamiento"
            />
          </div>
        </div>
      </div>

      <!-- KPIs Resumen -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="analytics" size="36px" color="info" />
              <div class="text-h3 text-weight-bold text-primary q-mt-sm">
                {{ resumenPredicciones.totalAnalizadas }}
              </div>
              <div class="text-body2 text-grey-7">Solicitudes Analizadas</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card critical-card">
            <q-card-section class="text-center">
              <q-icon name="error" size="36px" color="negative" />
              <div class="text-h3 text-weight-bold text-negative q-mt-sm">
                {{ resumenPredicciones.criticas }}
              </div>
              <div class="text-body2 text-grey-7">Riesgo Crítico (≥80%)</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card warning-card">
            <q-card-section class="text-center">
              <q-icon name="warning" size="36px" color="warning" />
              <div class="text-h3 text-weight-bold text-warning q-mt-sm">
                {{ resumenPredicciones.altas }}
              </div>
              <div class="text-body2 text-grey-7">Riesgo Alto (60-80%)</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="info" size="36px" color="orange" />
              <div class="text-h3 text-weight-bold text-orange q-mt-sm">
                {{ resumenPredicciones.medias }}
              </div>
              <div class="text-body2 text-grey-7">Riesgo Medio (40-60%)</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card success-card">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="36px" color="positive" />
              <div class="text-h3 text-weight-bold text-positive q-mt-sm">
                {{ resumenPredicciones.bajas }}
              </div>
              <div class="text-body2 text-grey-7">Riesgo Bajo (&lt;40%)</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="speed" size="36px" color="info" />
              <div class="text-h3 text-weight-bold text-info q-mt-sm">
                {{ resumenPredicciones.promedioRiesgo.toFixed(0) }}%
              </div>
              <div class="text-body2 text-grey-7">Promedio Riesgo</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros de Búsqueda
          </div>

          <div class="row q-col-gutter-md">
            <!-- Nivel de Riesgo -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.nivelRiesgo"
                :options="nivelesRiesgoOptions"
                label="Nivel de Riesgo"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="warning" color="orange" />
                </template>
              </q-select>
            </div>

            <!-- Código SLA -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.codigoSla"
                :options="codigosSlaOptions"
                label="Tipo de SLA"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Rol -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.rol"
                :options="rolesOptions"
                label="Rol/Área"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="people" color="info" />
                </template>
              </q-select>
            </div>

            <!-- Búsqueda -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="filtros.busqueda"
                label="Buscar por ID"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              color="primary"
              label="Aplicar Filtros"
              icon="search"
              @click="aplicarFiltros"
            />
            <q-btn
              outline
              color="grey-7"
              label="Limpiar"
              icon="clear"
              @click="limpiarFiltros"
            />
          </div>

          <!-- Chips de filtros activos -->
          <div v-if="filtrosActivos.length > 0" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-xs">Filtros aplicados:</div>
            <q-chip
              v-for="chip in filtrosActivos"
              :key="chip.key"
              removable
              @remove="removerFiltro(chip.key)"
              color="primary"
              text-color="white"
              :icon="chip.icon"
            >
              {{ chip.label }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Predicciones -->
      <q-card flat bordered class="predicciones-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-medium">
              <q-icon name="table_chart" class="q-mr-sm" />
              Predicciones ML - Solicitudes en Riesgo
            </div>
            <div class="text-caption text-grey-7">
              Mostrando {{ prediccionesFiltradas.length }} registros
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Sin datos -->
          <div v-if="prediccionesFiltradas.length === 0 && !loading" class="text-center q-pa-xl">
            <q-icon name="psychology_alt" size="80px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">
              No hay predicciones disponibles
            </div>
            <div class="text-body2 text-grey-6 q-mt-sm">
              Entrene el modelo ML para generar predicciones de riesgo
            </div>
            <q-btn
              color="primary"
              label="Entrenar Modelo"
              icon="model_training"
              class="q-mt-md"
              @click="mostrarDialogoEntrenamiento"
            />
          </div>

          <!-- Tabla -->
          <q-table
            v-else
            :rows="prediccionesFiltradas"
            :columns="columnas"
            row-key="idSolicitud"
            flat
            bordered
            :loading="loading"
            :pagination="paginacion"
            binary-state-sort
            class="predicciones-table"
          >
            <!-- ID Solicitud -->
            <template v-slot:body-cell-idSolicitud="props">
              <q-td :props="props">
                <q-badge color="grey-7" :label="'#' + props.row.idSolicitud" />
              </q-td>
            </template>

            <!-- Código SLA -->
            <template v-slot:body-cell-codigoSla="props">
              <q-td :props="props">
                <q-badge color="primary" :label="props.row.codigoSla" />
              </q-td>
            </template>

            <!-- Probabilidad de Incumplimiento -->
            <template v-slot:body-cell-probNoCumple="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-sm">
                  <q-circular-progress
                    :value="props.row.probNoCumple * 100"
                    size="50px"
                    :color="obtenerColorRiesgo(props.row.probNoCumple)"
                    track-color="grey-3"
                    :thickness="0.2"
                    show-value
                  >
                    <span class="text-caption text-weight-bold">
                      {{ (props.row.probNoCumple * 100).toFixed(0) }}%
                    </span>
                  </q-circular-progress>
                  <div>
                    <div class="text-body2 text-weight-medium">
                      {{ (props.row.probNoCumple * 100).toFixed(1) }}%
                    </div>
                    <div class="text-caption text-grey-6">
                      Cumple: {{ ((1 - props.row.probNoCumple) * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Nivel de Riesgo -->
            <template v-slot:body-cell-riesgoNivel="props">
              <q-td :props="props">
                <q-badge
                  :color="obtenerColorRiesgo(props.row.probNoCumple)"
                  :label="props.row.riesgoNivel"
                  class="text-weight-bold"
                />
              </q-td>
            </template>

            <!-- Días Transcurridos/Umbral -->
            <template v-slot:body-cell-diasSla="props">
              <q-td :props="props">
                <div class="text-center">
                  <div class="text-body2">
                    <span class="text-weight-bold">{{ props.row.diasTranscurridos }}</span>
                    <span class="text-grey-7"> / </span>
                    <span>{{ props.row.diasUmbral }}</span>
                  </div>
                  <q-linear-progress
                    :value="props.row.diasTranscurridos / props.row.diasUmbral"
                    :color="obtenerColorProgreso(props.row.diasTranscurridos, props.row.diasUmbral)"
                    size="8px"
                    class="q-mt-xs"
                  />
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ props.row.porcentajeTiempo }}% usado
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Días Restantes -->
            <template v-slot:body-cell-diasRestantes="props">
              <q-td :props="props">
                <div :class="getClaseDiasRestantes(props.row.diasRestantes)">
                  <q-icon
                    :name="props.row.diasRestantes < 0 ? 'warning' : 'schedule'"
                    size="xs"
                    class="q-mr-xs"
                  />
                  {{ props.row.diasRestantes < 0 ? 'Vencido' : props.row.diasRestantes + ' días' }}
                </div>
              </q-td>
            </template>

            <!-- Predicción -->
            <template v-slot:body-cell-prediccion="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.prediccion === 'CUMPLE' ? 'positive' : 'negative'"
                  text-color="white"
                  :icon="props.row.prediccion === 'CUMPLE' ? 'check_circle' : 'cancel'"
                  dense
                >
                  {{ props.row.prediccion }}
                </q-chip>
              </q-td>
            </template>

            <!-- Acciones -->
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  color="primary"
                  @click="verDetalle(props.row)"
                >
                  <q-tooltip>Ver detalle</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de Entrenamiento -->
    <q-dialog v-model="dialogoEntrenamiento" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Entrenar Modelo ML</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-7 q-mb-md">
            El modelo se entrenará con solicitudes históricas cerradas. Puede especificar un rango de fechas opcional.
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="entrenamientoForm.fechaDesde"
                label="Fecha Desde (opcional)"
                type="date"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="entrenamientoForm.fechaHasta"
                label="Fecha Hasta (opcional)"
                type="date"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat v-close-popup />
          <q-btn
            label="Entrenar"
            color="primary"
            icon="model_training"
            :loading="reentrenando"
            @click="entrenarModelo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { usePrediccionStore } from 'stores/prediccion-store'
import { useAppStore } from 'stores/app-store'

const $q = useQuasar()
const prediccionStore = usePrediccionStore()
const appStore = useAppStore()

// Estado
const initialLoading = ref(true)
const loading = ref(false)
const reentrenando = ref(false)
const dialogoEntrenamiento = ref(false)

// Filtros
const filtros = ref({
  nivelRiesgo: null,
  codigoSla: null,
  rol: null,
  busqueda: null
})

// Formulario de entrenamiento
const entrenamientoForm = ref({
  fechaDesde: null,
  fechaHasta: null
})

// Paginación
const paginacion = ref({
  sortBy: 'probNoCumple',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

// Columnas de la tabla
const columnas = [
  {
    name: 'idSolicitud',
    label: 'ID',
    field: 'idSolicitud',
    align: 'center',
    sortable: true
  },
  {
    name: 'codigoSla',
    label: 'Tipo SLA',
    field: 'codigoSla',
    align: 'center',
    sortable: true
  },
  {
    name: 'rolRegistro',
    label: 'Rol/Área',
    field: 'rolRegistro',
    align: 'left',
    sortable: true
  },
  {
    name: 'probNoCumple',
    label: 'Probabilidad Incumplimiento',
    field: 'probNoCumple',
    align: 'center',
    sortable: true
  },
  {
    name: 'riesgoNivel',
    label: 'Nivel Riesgo',
    field: 'riesgoNivel',
    align: 'center',
    sortable: true
  },
  {
    name: 'diasSla',
    label: 'Días (Transcurridos/Umbral)',
    field: 'diasTranscurridos',
    align: 'center',
    sortable: true
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    field: 'diasRestantes',
    align: 'center',
    sortable: true
  },
  {
    name: 'prediccion',
    label: 'Predicción',
    field: 'prediccion',
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

// Opciones de filtros
const nivelesRiesgoOptions = [
  { label: 'Todos', value: null },
  { label: 'Crítico (≥80%)', value: 'CRÍTICO' },
  { label: 'Alto (60-80%)', value: 'ALTO' },
  { label: 'Medio (40-60%)', value: 'MEDIO' },
  { label: 'Bajo (<40%)', value: 'BAJO' }
]

// Computed
const modeloActual = computed(() => prediccionStore.modeloActual)
const resumenPredicciones = computed(() => prediccionStore.resumenPredicciones)

const codigosSlaOptions = computed(() => {
  const codigos = [...new Set(prediccionStore.predicciones.map(p => p.codigoSla))]
  return ['Todos', ...codigos]
})

const rolesOptions = computed(() => {
  const roles = [...new Set(prediccionStore.predicciones.map(p => p.rolRegistro))]
  return ['Todos', ...roles]
})

const prediccionesFiltradas = computed(() => {
  let resultado = [...prediccionStore.predicciones]

  if (filtros.value.nivelRiesgo) {
    resultado = resultado.filter(p => p.riesgoNivel === filtros.value.nivelRiesgo)
  }

  if (filtros.value.codigoSla && filtros.value.codigoSla !== 'Todos') {
    resultado = resultado.filter(p => p.codigoSla === filtros.value.codigoSla)
  }

  if (filtros.value.rol && filtros.value.rol !== 'Todos') {
    resultado = resultado.filter(p => p.rolRegistro === filtros.value.rol)
  }

  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(p =>
      p.idSolicitud.toString().includes(busqueda)
    )
  }

  return resultado
})

const filtrosActivos = computed(() => {
  const activos = []

  if (filtros.value.nivelRiesgo) {
    activos.push({
      key: 'nivelRiesgo',
      label: `Riesgo: ${filtros.value.nivelRiesgo}`,
      icon: 'warning'
    })
  }

  if (filtros.value.codigoSla && filtros.value.codigoSla !== 'Todos') {
    activos.push({
      key: 'codigoSla',
      label: `SLA: ${filtros.value.codigoSla}`,
      icon: 'category'
    })
  }

  if (filtros.value.rol && filtros.value.rol !== 'Todos') {
    activos.push({
      key: 'rol',
      label: `Rol: ${filtros.value.rol}`,
      icon: 'people'
    })
  }

  if (filtros.value.busqueda) {
    activos.push({
      key: 'busqueda',
      label: `ID: ${filtros.value.busqueda}`,
      icon: 'search'
    })
  }

  return activos
})

// Métodos
const cargarDatos = async () => {
  try {
    loading.value = true
    await prediccionStore.inicializar()

    $q.notify({
      type: 'positive',
      message: `Se cargaron ${prediccionStore.predicciones.length} predicciones`,
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar predicciones',
      caption: error.message || 'Error desconocido',
      position: 'top-right'
    })
  } finally {
    loading.value = false
    initialLoading.value = false
    appStore.markAsLoaded()
  }
}

const recargarPredicciones = async () => {
  try {
    loading.value = true
    await prediccionStore.obtenerPredicciones()

    $q.notify({
      type: 'positive',
      message: 'Predicciones actualizadas',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar predicciones',
      caption: error.message,
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

const mostrarDialogoEntrenamiento = () => {
  dialogoEntrenamiento.value = true
}

const entrenarModelo = async () => {
  try {
    reentrenando.value = true

    const resultado = await prediccionStore.entrenarModelo(
      entrenamientoForm.value.fechaDesde,
      entrenamientoForm.value.fechaHasta
    )

    $q.notify({
      type: 'positive',
      message: 'Modelo entrenado exitosamente',
      caption: `Versión: ${resultado.modelo_version} | Accuracy: ${(resultado.metricas.accuracy * 100).toFixed(1)}%`,
      position: 'top-right',
      timeout: 5000
    })

    dialogoEntrenamiento.value = false
    entrenamientoForm.value = { fechaDesde: null, fechaHasta: null }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al entrenar el modelo',
      caption: error.message,
      position: 'top-right'
    })
  } finally {
    reentrenando.value = false
  }
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente por computed
}

const limpiarFiltros = () => {
  filtros.value = {
    nivelRiesgo: null,
    codigoSla: null,
    rol: null,
    busqueda: null
  }
}

const removerFiltro = (key) => {
  filtros.value[key] = null
}

const obtenerColorRiesgo = (probabilidad) => {
  if (probabilidad >= 0.80) return 'negative'
  if (probabilidad >= 0.60) return 'warning'
  if (probabilidad >= 0.40) return 'orange'
  return 'positive'
}

const obtenerColorProgreso = (diasUsados, diasUmbral) => {
  const porcentaje = (diasUsados / diasUmbral) * 100
  if (porcentaje >= 90) return 'negative'
  if (porcentaje >= 70) return 'warning'
  if (porcentaje >= 50) return 'orange'
  return 'positive'
}

const getClaseDiasRestantes = (dias) => {
  if (dias < 0) return 'text-negative text-weight-bold'
  if (dias <= 3) return 'text-warning text-weight-bold'
  if (dias <= 7) return 'text-orange'
  return 'text-positive'
}

const verDetalle = (prediccion) => {
  $q.dialog({
    title: `Detalle Predicción #${prediccion.idSolicitud}`,
    message: `
      <strong>Código SLA:</strong> ${prediccion.codigoSla}<br>
      <strong>Rol:</strong> ${prediccion.rolRegistro}<br>
      <strong>Tipo:</strong> ${prediccion.tipoSolicitud}<br>
      <strong>Estado:</strong> ${prediccion.estadoSolicitud}<br>
      <strong>Probabilidad No Cumple:</strong> ${(prediccion.probNoCumple * 100).toFixed(2)}%<br>
      <strong>Predicción:</strong> ${prediccion.prediccion}<br>
      <strong>Modelo:</strong> ${prediccion.modeloVersion}<br>
      <strong>Días Transcurridos:</strong> ${prediccion.diasTranscurridos} / ${prediccion.diasUmbral}
    `,
    html: true
  })
}

// Lifecycle
onMounted(async () => {
  await cargarDatos()
})

// Limpiar store al salir del componente para forzar recarga en próxima visita
onBeforeUnmount(() => {
  prediccionStore.limpiar()
  console.log('🔄 Store limpiado - predicciones se recargarán en próxima visita')
})
</script>

<style scoped>
.predicciones-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 50px);
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.kpi-card {
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.critical-card {
  border-left: 4px solid #f44336;
}

.warning-card {
  border-left: 4px solid #ff9800;
}

.success-card {
  border-left: 4px solid #4caf50;
}

.filters-card,
.predicciones-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
}

:deep(.predicciones-table .q-table thead tr th) {
  background-color: #1976d2;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

:deep(.predicciones-table .q-table tbody td) {
  font-size: 13px;
}

:deep(.predicciones-table) {
  box-shadow: none;
}
</style>
