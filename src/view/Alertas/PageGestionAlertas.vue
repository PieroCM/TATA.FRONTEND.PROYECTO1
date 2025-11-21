<template>
  <q-page padding>
    <!-- Header -->
    <div class="q-mb-md">
      <h4 class="q-my-none text-weight-bold text-primary">Alertas SLA</h4>
      <div class="text-grey-7">
        Monitoreo de vencimientos y alertas de incumplimiento de tiempos de atención
      </div>
    </div>

    <!-- Tabla Principal -->
    <q-table
      flat
      bordered
      :rows="store.alertas"
      :columns="columns"
      row-key="idAlerta"
      :loading="store.loading"
      :pagination="pagination"
      class="alertas-table"
    >
      <!-- Columna Solicitud: Formato Sol-{id} -->
      <template v-slot:body-cell-solicitud="props">
        <q-td :props="props">
          <div class="text-weight-bold text-primary">
            {{ formatSolicitud(props.row.solicitud?.idSolicitud) }}
          </div>
        </q-td>
      </template>

      <!-- Columna Rol: Acceso a rolRegistro.nombreRol -->
      <template v-slot:body-cell-rol="props">
        <q-td :props="props">
          {{ props.row.solicitud?.rolRegistro?.nombreRol || 'Sin Asignar' }}
        </q-td>
      </template>

      <!-- Columna Tipo SLA: Badge Outline (Azul=SLA1, Verde=SLA2) -->
      <template v-slot:body-cell-tipoSla="props">
        <q-td :props="props">
          <q-badge
            outline
            :color="props.row.solicitud?.configSla?.codigoSla === 'SLA1' ? 'primary' : 'positive'"
            :label="props.row.solicitud?.configSla?.codigoSla || 'N/A'"
            class="q-px-sm"
          />
        </q-td>
      </template>

      <!-- Columna Fecha Solicitud: Formato DD/MM/YYYY -->
      <template v-slot:body-cell-fechaSolicitud="props">
        <q-td :props="props">
          {{ formatFecha(props.row.solicitud?.fechaSolicitud) }}
        </q-td>
      </template>

      <!-- Columna Umbral: Desde configSla.diasUmbral -->
      <template v-slot:body-cell-umbral="props">
        <q-td :props="props">
          <div class="text-center text-weight-medium">
            {{ props.row.solicitud?.configSla?.diasUmbral || 0 }}
          </div>
        </q-td>
      </template>

      <!-- Columna Días Transcurridos: Cálculo desde fechaSolicitud -->
      <template v-slot:body-cell-diasTranscurridos="props">
        <q-td :props="props">
          <div class="text-center">
            {{ calcularDiasTranscurridos(props.row.solicitud?.fechaSolicitud) }}
          </div>
        </q-td>
      </template>

      <!-- Columna Días Restantes: Umbral - Transcurridos (Rojo si < 0, Naranja si <= 2) -->
      <template v-slot:body-cell-diasRestantes="props">
        <q-td :props="props">
          <div class="text-center" :class="getColorDiasRestantes(calcularDiasRestantes(props.row))">
            {{ calcularDiasRestantes(props.row) }}
          </div>
        </q-td>
      </template>

      <!-- Columna Nivel: Chip Outline (Warning=Naranja, Critical=Rojo) -->
      <template v-slot:body-cell-nivel="props">
        <q-td :props="props">
          <q-chip
            outline
            dense
            :color="props.row.nivel === 'CRITICAL' ? 'negative' : 'warning'"
            :text-color="props.row.nivel === 'CRITICAL' ? 'negative' : 'warning'"
            class="text-capitalize"
          >
            {{ props.row.nivel }}
          </q-chip>
        </q-td>
      </template>

      <!-- Columna Estado: Badge simple -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.estado === 'NUEVA' ? 'blue' : 'grey'"
            :label="props.row.estado"
            class="text-capitalize"
          />
        </q-td>
      </template>

      <!-- Columna Mensaje: Texto truncado con ellipsis -->
      <template v-slot:body-cell-mensaje="props">
        <q-td :props="props">
          <div class="mensaje-truncado">
            {{ props.row.mensaje }}
          </div>
        </q-td>
      </template>

      <!-- Columna Acciones: Botones Ver y Eliminar alineados a la derecha -->
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <div class="row justify-end q-gutter-xs no-wrap">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              size="sm"
              @click.stop="verDetalle(props.row)"
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              size="sm"
              @click.stop="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Paginación Personalizada: "Mostrar [25] por página" -->
      <template v-slot:bottom="props">
        <div class="row full-width items-center justify-between q-pa-sm">
          <!-- Selector de items por página -->
          <div class="row items-center q-gutter-sm">
            <span class="text-body2">Mostrar</span>
            <q-select
              outlined
              dense
              v-model="pagination.rowsPerPage"
              :options="[10, 25, 50, 100]"
              style="width: 70px"
              @update:model-value="props.pagination.rowsPerPage = pagination.rowsPerPage"
            />
            <span class="text-body2">por página</span>
          </div>

          <!-- Controles de paginación -->
          <div class="row items-center q-gutter-sm">
            <span class="text-body2">
              {{ props.pagination.rowsPerPage * (props.pagination.page - 1) + 1 }}-{{
                Math.min(props.pagination.rowsPerPage * props.pagination.page, store.alertas.length)
              }}
              de {{ store.alertas.length }}
            </span>
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              :disable="props.isFirstPage"
              @click="props.prevPage"
            />
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              :disable="props.isLastPage"
              @click="props.nextPage"
            />
          </div>
        </div>
      </template>

      <!-- Sin datos -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-py-xl">
          <q-icon name="notifications_none" size="3em" class="q-mr-md" />
          <span class="text-subtitle1">No hay alertas registradas</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import { useAlertaStore } from 'stores/useAlertaStore'

const $q = useQuasar()
const store = useAlertaStore()

// Configuración de paginación inicial (25 items como en diseño Figma)
const pagination = ref({
  sortBy: 'fechaSolicitud',
  descending: true,
  page: 1,
  rowsPerPage: 25,
})

/**
 * Definición EXACTA de columnas según diseño Figma
 * Consume estructura anidada del Backend .NET
 */
const columns = [
  {
    name: 'solicitud',
    label: 'Solicitud',
    align: 'left',
    sortable: true,
  },
  {
    name: 'rol',
    label: 'Rol',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tipoSla',
    label: 'Tipo SLA',
    align: 'center',
    sortable: false,
  },
  {
    name: 'fechaSolicitud',
    label: 'Fecha Solicitud',
    align: 'center',
    sortable: true,
  },
  {
    name: 'umbral',
    label: 'Umbral (días)',
    align: 'center',
    sortable: true,
  },
  {
    name: 'diasTranscurridos',
    label: 'Días Transcurridos',
    align: 'center',
    sortable: false,
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    align: 'center',
    sortable: true,
  },
  {
    name: 'nivel',
    label: 'Nivel',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'mensaje',
    label: 'Mensaje',
    align: 'left',
    sortable: false,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'right',
  },
]

/**
 * Formatea ID de solicitud como Sol-{id}
 * Ejemplo: 102 → Sol-102
 */
const formatSolicitud = (id) => {
  return id ? `Sol-${id}` : 'N/A'
}

/**
 * Formatea fecha en formato DD/MM/YYYY
 */
const formatFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  return date.formatDate(fechaStr, 'DD/MM/YYYY')
}

/**
 * Calcula días transcurridos desde fechaSolicitud hasta hoy
 * Lógica: Diferencia en días entre new Date() y fechaSolicitud
 */
const calcularDiasTranscurridos = (fechaStr) => {
  if (!fechaStr) return 0
  const fechaSolicitud = new Date(fechaStr)
  const hoy = new Date()
  const diferenciaMilisegundos = hoy - fechaSolicitud
  const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24))
  return diasTranscurridos
}

/**
 * Calcula días restantes: Umbral - Días Transcurridos
 * CRÍTICO: Este valor determina el color condicional
 */
const calcularDiasRestantes = (row) => {
  const umbral = row.solicitud?.configSla?.diasUmbral || 0
  const transcurridos = calcularDiasTranscurridos(row.solicitud?.fechaSolicitud)
  return umbral - transcurridos
}

/**
 * Retorna clases CSS según días restantes
 * < 0: Rojo y negrita (text-negative text-weight-bold)
 * <= 2: Naranja y negrita (text-warning text-weight-bold)
 */
const getColorDiasRestantes = (dias) => {
  if (dias < 0) return 'text-negative text-weight-bold'
  if (dias <= 2) return 'text-warning text-weight-bold'
  return 'text-weight-medium'
}

/**
 * Acción Ver Detalle
 */
const verDetalle = (row) => {
  $q.notify({
    type: 'info',
    message: `Ver detalle de alerta ${row.idAlerta}`,
    position: 'top-right',
  })
  console.log('Ver detalle:', row)
}

/**
 * Acción Eliminar con confirmación
 * Muestra dialog de Quasar con botones personalizados
 */
const confirmarEliminar = (row) => {
  console.log('Click en eliminar, row:', row)

  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar esta alerta?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    persistent: true,
  })
    .onOk(async () => {
      console.log('Usuario confirmó eliminación')
      try {
        await store.eliminarAlerta(row.idAlerta)
        $q.notify({
          type: 'positive',
          message: 'Alerta eliminada',
          position: 'top-right',
        })
      } catch (error) {
        console.error('Error al eliminar:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar',
          position: 'top-right',
        })
      }
    })
    .onCancel(() => {
      console.log('Usuario canceló eliminación')
    })
}

// Cargar alertas al montar el componente
onMounted(() => {
  store.fetchAlertas()
})
</script>

<style scoped>
.alertas-table {
  border-radius: 8px;
}

/* Truncar texto del mensaje con ellipsis */
.mensaje-truncado {
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
