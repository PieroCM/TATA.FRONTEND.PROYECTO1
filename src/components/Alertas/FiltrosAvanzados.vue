<template>
  <q-card flat bordered class="filtros-card">
    <q-card-section>
      <!-- Encabezado -->
      <div class="card-header q-mb-md">
        <q-icon name="filter_list" color="primary" size="24px" class="q-mr-sm" />
        <h2 class="text-h6 text-weight-semibold text-primary q-ma-none">Filtros Avanzados</h2>
      </div>

      <!-- Fila 1: Búsqueda y Acciones -->
      <div class="filtros-fila-1 q-mb-lg">
        <!-- Búsqueda -->
        <q-input
          outlined
          v-model="filtros.busqueda"
          placeholder="Buscar por Solicitud, Mensaje, Responsable..."
          dense
          clearable
          class="search-input-expandible"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>

        <!-- Botones de Acción -->
        <div class="acciones-buttons">
          <q-btn
            unelevated
            color="grey-8"
            text-color="white"
            icon="clear"
            label="Limpiar Filtros"
            @click="limpiarFiltros"
            no-caps
            class="btn-limpiar"
          />
          <q-btn
            outline
            color="primary"
            icon="file_download"
            label="Exportar"
            @click="exportarDatos"
            no-caps
            class="btn-exportar"
          />
        </div>
      </div>

      <!-- Fila 2: Grid de Selectores -->
      <div class="filtros-fila-2">
        <!-- Filtro SLA (Dinámico) -->
        <q-select
          outlined
          v-model="filtros.idSla"
          :options="opcionesSlas"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Tipo SLA"
          dense
          clearable
          class="filtro-select"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="category" color="grey-6" size="20px" />
          </template>
        </q-select>

        <!-- Filtro Rol (Dinámico) -->
        <q-select
          outlined
          v-model="filtros.idRol"
          :options="opcionesRoles"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          label="Roles/Áreas"
          dense
          clearable
          class="filtro-select"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="groups" color="grey-6" size="20px" />
          </template>
        </q-select>

        <!-- Filtro Nivel (Estático con Badges) -->
        <q-select
          outlined
          v-model="filtros.nivel"
          :options="opcionesNivel"
          label="Nivel de Criticidad"
          dense
          clearable
          class="filtro-select"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="priority_high" color="grey-6" size="20px" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-badge :color="getNivelColor(scope.opt)" :label="scope.opt" class="badge-nivel" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Filtro Estado Tiempo (Estático) -->
        <q-select
          outlined
          v-model="filtros.estadoTiempo"
          :options="opcionesEstadoTiempo"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Estado Temporal"
          dense
          clearable
          class="filtro-select"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="schedule" color="grey-6" size="20px" />
          </template>
        </q-select>

        <!-- Filtro Estado Lectura (Estático) -->
        <q-select
          outlined
          v-model="filtros.esLeida"
          :options="opcionesEstadoLectura"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Estado de Lectura"
          dense
          clearable
          class="filtro-select"
          @update:model-value="cargarDashboard"
        >
          <template v-slot:prepend>
            <q-icon name="visibility" color="grey-6" size="20px" />
          </template>
        </q-select>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

// ========================================
// PROPS Y EMITS
// ========================================
const emit = defineEmits(['alertas-cargadas', 'exportar'])

// ========================================
// QUASAR COMPOSABLE
// ========================================
const $q = useQuasar()

// ========================================
// ESTADO REACTIVO - FILTROS
// ========================================
const filtros = ref({
  busqueda: '',
  idSla: null,
  idRol: null,
  nivel: null,
  estadoTiempo: 'VIGENTE', // ✅ Default: Ver vigentes
  esLeida: false, // ✅ Default: Ver NO leídas
})

// ========================================
// OPCIONES DINÁMICAS (SLA Y ROLES)
// ========================================
const opcionesSlas = ref([])
const opcionesRoles = ref([])

// ========================================
// OPCIONES ESTÁTICAS
// ========================================
const opcionesNivel = ['CRITICO', 'MEDIO', 'BAJO']

const opcionesEstadoTiempo = [
  { label: '✅ Solo Vigentes', value: 'VIGENTE' },
  { label: '❌ Solo Vencidas', value: 'VENCIDO' },
  { label: '📋 Todas', value: null },
]

const opcionesEstadoLectura = [
  { label: '📩 No Leídas', value: false },
  { label: '📂 Leídas', value: true },
  { label: '📋 Todas', value: null },
]

// ========================================
// ESTADO DE CARGA
// ========================================
const isLoading = ref(false)

// ========================================
// FUNCIÓN: Obtener color del badge de nivel
// ========================================
const getNivelColor = (nivel) => {
  const colores = {
    CRITICO: 'red',
    MEDIO: 'orange',
    BAJO: 'green',
  }
  return colores[nivel] || 'grey'
}

// ========================================
// FUNCIÓN PRINCIPAL: cargarDashboard
// ========================================
const cargarDashboard = async () => {
  isLoading.value = true

  try {
    // 1. Construir parámetros limpios (sin valores null o vacíos)
    const params = {}

    // Búsqueda de texto
    if (filtros.value.busqueda && filtros.value.busqueda.trim()) {
      params.busqueda = filtros.value.busqueda.trim()
    }

    // Filtro SLA (ID)
    if (filtros.value.idSla !== null && filtros.value.idSla !== undefined) {
      params.idSla = filtros.value.idSla
    }

    // Filtro Rol (ID)
    if (filtros.value.idRol !== null && filtros.value.idRol !== undefined) {
      params.idRol = filtros.value.idRol
    }

    // Filtro Nivel
    if (filtros.value.nivel) {
      params.nivel = filtros.value.nivel
    }

    // Filtro Estado Tiempo
    if (filtros.value.estadoTiempo) {
      params.estadoTiempo = filtros.value.estadoTiempo
    }

    // Filtro Es Leída (booleano) - CRÍTICO: Enviar correctamente
    if (filtros.value.esLeida !== null && filtros.value.esLeida !== undefined) {
      // Convertir booleano a string para query params
      params.esLeida = String(filtros.value.esLeida)
    }

    // console.log('📊 Cargando dashboard con parámetros:', params)

    // 2. Llamada al API con parámetros limpios
    const response = await api.get('/api/alertas/dashboard', { params })

    // console.log(`✅ ${response.data?.length || 0} alertas cargadas`)

    // 3. Emitir datos a componente padre
    emit('alertas-cargadas', response.data || [])
  } catch (error) {
    // console.error('❌ Error al cargar dashboard:', error)

    // Notificación de error
    $q.notify({
      type: 'negative',
      message:
        error.response?.status === 404
          ? 'No se encontró el endpoint de alertas'
          : error.response?.status === 401
            ? 'No autorizado - verifica tu sesión'
            : 'Error al cargar las alertas',
      position: 'top-right',
      timeout: 3000,
    })

    // Emitir array vacío en caso de error
    emit('alertas-cargadas', [])
  } finally {
    isLoading.value = false
  }
}

// ========================================
// FUNCIÓN: limpiarFiltros
// ========================================
const limpiarFiltros = () => {
  // console.log('🧹 Limpiando filtros...')

  // Resetear a valores por defecto
  filtros.value = {
    busqueda: '',
    idSla: null,
    idRol: null,
    nivel: null,
    estadoTiempo: 'VIGENTE', // ✅ Restablecer a VIGENTE
    esLeida: false, // ✅ Restablecer a NO leídas
  }

  // Recargar dashboard con filtros por defecto
  cargarDashboard()

  $q.notify({
    type: 'info',
    message: 'Filtros restablecidos',
    position: 'top-right',
    timeout: 1500,
  })
}

// ========================================
// FUNCIÓN: exportarDatos
// ========================================
const exportarDatos = () => {
  // console.log('📤 Exportando datos...')
  emit('exportar')
}

// ========================================
// FUNCIÓN: Cargar opciones dinámicas (SLA y Roles)
// ========================================
const cargarSelectores = async () => {
  try {
    // console.log('📋 Cargando selectores dinámicos...')

    // Cargar SLAs y Roles en paralelo
    const [resSlas, resRoles] = await Promise.all([
      api.get('/api/email/slas'),
      api.get('/api/email/roles'),
    ])

    // Mapear respuestas
    const slas = resSlas.data.slas || []
    const roles = resRoles.data.roles || []

    opcionesSlas.value = slas.map((s) => ({
      id: s.id,
      nombre: s.descripcion || s.nombre,
    }))

    opcionesRoles.value = roles.map((r) => ({
      id: r.id,
      nombre: r.descripcion || r.nombre,
    }))

    // console.log('✅ Selectores cargados:', {
    //   slas: opcionesSlas.value.length,
    //   roles: opcionesRoles.value.length,
    // })
  } catch (error) {
    // console.error('❌ Error cargando selectores:', error)

    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los filtros de SLA y Roles',
      position: 'top-right',
    })

    // Fallback vacío
    opcionesSlas.value = []
    opcionesRoles.value = []
  }
}

// ========================================
// LIFECYCLE: onMounted
// ========================================
onMounted(async () => {
  // console.log('🚀 Componente FiltrosAvanzados montado')

  // 1. Cargar opciones dinámicas
  await cargarSelectores()

  // 2. Cargar dashboard con filtros por defecto
  await cargarDashboard()
})
</script>

<style scoped>
/* ===== TARJETA DE FILTROS ===== */
.filtros-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

/* ===== FILA 1: BÚSQUEDA Y ACCIONES ===== */
.filtros-fila-1 {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input-expandible {
  flex: 1;
}

.search-input-expandible :deep(.q-field__control) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.acciones-buttons {
  display: flex;
  gap: 12px;
}

.btn-limpiar,
.btn-exportar {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  padding: 0 20px;
}

.btn-exportar {
  border-width: 2px;
}

/* ===== FILA 2: GRID DE SELECTORES ===== */
.filtros-fila-2 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.filtro-select {
  min-width: 0;
}

.filtro-select :deep(.q-field__control) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  height: 40px;
}

.filtro-select :deep(.q-field__native) {
  color: #374151;
  font-size: 14px;
}

.filtro-select :deep(.q-field__label) {
  color: #6b7280;
  font-size: 13px;
}

/* ===== BADGE DE NIVEL ===== */
.badge-nivel {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1400px) {
  .filtros-fila-2 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .filtros-fila-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filtros-fila-1 {
    flex-direction: column;
  }

  .search-input-expandible,
  .acciones-buttons {
    width: 100%;
  }

  .acciones-buttons {
    flex-direction: column;
  }

  .filtros-fila-2 {
    grid-template-columns: 1fr;
  }
}
</style>
