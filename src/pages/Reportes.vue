<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Reportes y Estadísticas</div>

    <!-- Filtros de fecha -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-input
              v-model="fechaInicio"
              label="Fecha Inicio"
              outlined
              dense
              type="date"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="fechaFin"
              label="Fecha Fin"
              outlined
              dense
              type="date"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="tipoReporte"
              :options="tiposReporte"
              label="Tipo de Reporte"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              color="primary"
              icon="search"
              label="Generar"
              @click="generarReporte"
              :loading="loading"
            />
            <q-btn
              flat
              color="secondary"
              icon="download"
              label="Exportar"
              @click="exportarReporte"
              class="q-ml-sm"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen ejecutivo -->
    <div class="row q-col-gutter-md q-mb-md">
      <chart-card
        title="Total Ventas"
        icon="shopping_cart"
        :value="`$${resumen.totalVentas.toLocaleString()}`"
        color="positive"
      />
      <chart-card
        title="Nuevos Clientes"
        icon="person_add"
        :value="resumen.nuevosClientes"
        color="primary"
      />
      <chart-card
        title="Productos Vendidos"
        icon="inventory"
        :value="resumen.productosVendidos"
        color="secondary"
      />
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Ventas por Mes</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <canvas ref="chartVentas" style="max-height: 300px;"></canvas>
            <div class="text-center text-grey q-mt-md">
              Instala Chart.js para visualizar: npm install chart.js
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Productos más Vendidos</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list>
              <q-item v-for="(producto, index) in topProductos" :key="index">
                <q-item-section avatar>
                  <q-avatar :color="getColorByIndex(index)" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ producto.nombre }}</q-item-label>
                  <q-item-label caption>{{ producto.categoria }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ producto.ventas }} ventas</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de reportes -->
    <data-table
      title="Detalle de Transacciones"
      :rows="transacciones"
      :columns="columnas"
      :loading="loading"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import DataTable from 'components/DataTable.vue'
import ChartCard from 'components/ChartCard.vue'

const $q = useQuasar()

// Estado
const loading = ref(false)
const fechaInicio = ref('')
const fechaFin = ref('')
const tipoReporte = ref('Ventas')
const transacciones = ref([])
const chartVentas = ref(null)

const tiposReporte = [
  'Ventas',
  'Productos',
  'Usuarios',
  'Inventario',
  'Financiero'
]

const resumen = reactive({
  totalVentas: 0,
  nuevosClientes: 0,
  productosVendidos: 0
})

const topProductos = ref([
  { nombre: 'Laptop HP', categoria: 'Electrónica', ventas: 145 },
  { nombre: 'Mouse Logitech', categoria: 'Accesorios', ventas: 98 },
  { nombre: 'Teclado Mecánico', categoria: 'Accesorios', ventas: 87 },
  { nombre: 'Monitor Samsung', categoria: 'Electrónica', ventas: 76 },
  { nombre: 'Webcam HD', categoria: 'Accesorios', ventas: 54 }
])

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right', sortable: true, format: (val) => `$${val?.toLocaleString() || 0}` },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true }
]

// Métodos
const generarReporte = async () => {
  loading.value = true
  try {
    const params = {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      tipo: tipoReporte.value
    }

    const res = await api.get('/reportes/transacciones', { params })
    transacciones.value = res.data

    // Calcular resumen
    resumen.totalVentas = transacciones.value.reduce((sum, t) => sum + (t.total || 0), 0)
    resumen.productosVendidos = transacciones.value.reduce((sum, t) => sum + (t.cantidad || 0), 0)
    resumen.nuevosClientes = new Set(transacciones.value.map(t => t.clienteId)).size

    $q.notify({
      type: 'positive',
      message: 'Reporte generado correctamente',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

const exportarReporte = () => {
  // Convertir a CSV
  const headers = columnas.map(c => c.label).join(',')
  const rows = transacciones.value.map(t =>
    columnas.map(c => t[c.field] || '').join(',')
  ).join('\n')

  const csv = `${headers}\n${rows}`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_${tipoReporte.value}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Reporte exportado correctamente',
    position: 'top-right'
  })
}

const getColorByIndex = (index) => {
  const colors = ['primary', 'secondary', 'positive', 'warning', 'info']
  return colors[index % colors.length]
}

const inicializarFechas = () => {
  const hoy = new Date()
  const hace30Dias = new Date()
  hace30Dias.setDate(hoy.getDate() - 30)

  fechaFin.value = hoy.toISOString().split('T')[0]
  fechaInicio.value = hace30Dias.toISOString().split('T')[0]
}

onMounted(() => {
  inicializarFechas()
  generarReporte()
})
</script>

<style scoped>
.q-page {
  background: #f5f5f5;
}
</style>
