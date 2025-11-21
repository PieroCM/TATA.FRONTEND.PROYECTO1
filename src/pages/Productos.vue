<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Gestión de Productos</div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Producto"
        @click="mostrarDialogoNuevo"
      />
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroCategoria"
              :options="categorias"
              label="Categoría"
              outlined
              clearable
              dense
              @update:model-value="filtrarProductos"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroEstado"
              :options="estados"
              label="Estado"
              outlined
              clearable
              dense
              @update:model-value="filtrarProductos"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              color="secondary"
              icon="refresh"
              label="Actualizar"
              @click="cargarProductos"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de productos -->
    <data-table
      title="Lista de Productos"
      :rows="productosFiltrados"
      :columns="columnas"
      :loading="loading"
      @ver="verProducto"
      @editar="editarProducto"
      @eliminar="eliminarProducto"
    />

    <!-- Diálogo para crear/editar producto -->
    <q-dialog v-model="dialogoProducto" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ modoEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarProducto" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre del Producto"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            />

            <q-input
              v-model="formulario.descripcion"
              label="Descripción"
              outlined
              type="textarea"
              rows="3"
            />

            <q-select
              v-model="formulario.categoria"
              :options="categorias"
              label="Categoría"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            />

            <q-input
              v-model.number="formulario.precio"
              label="Precio"
              outlined
              type="number"
              prefix="$"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />

            <q-input
              v-model.number="formulario.stock"
              label="Stock"
              outlined
              type="number"
              :rules="[val => val >= 0 || 'No puede ser negativo']"
            />

            <q-select
              v-model="formulario.estado"
              :options="estados"
              label="Estado"
              outlined
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn
                label="Cancelar"
                color="negative"
                flat
                @click="cerrarDialogo"
              />
              <q-btn
                label="Guardar"
                type="submit"
                color="primary"
                :loading="guardando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import DataTable from 'components/DataTable.vue'

const $q = useQuasar()

// Estado
const productos = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoProducto = ref(false)
const modoEdicion = ref(false)
const productoSeleccionado = ref(null)

// Filtros
const filtroCategoria = ref(null)
const filtroEstado = ref(null)

// Opciones para los selects
const categorias = [
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Hogar',
  'Deportes',
  'Libros',
  'Juguetes'
]

const estados = [
  'Activo',
  'Inactivo',
  'Pendiente',
  'En Revisión',
  'Agotado'
]

// Formulario
const formularioInicial = {
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: 0,
  stock: 0,
  estado: 'Activo'
}

const formulario = ref({ ...formularioInicial })

// Columnas de la tabla
const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true, format: (val) => `$${val?.toLocaleString() || 0}` },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Productos filtrados
const productosFiltrados = computed(() => {
  let resultado = [...productos.value]

  if (filtroCategoria.value) {
    resultado = resultado.filter(p => p.categoria === filtroCategoria.value)
  }

  if (filtroEstado.value) {
    resultado = resultado.filter(p => p.estado === filtroEstado.value)
  }

  return resultado
})

// Métodos
const cargarProductos = async () => {
  loading.value = true
  try {
    const res = await api.get('/productos')
    productos.value = res.data
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los productos',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

const filtrarProductos = () => {
  // La reactividad de computed se encarga de esto
}

const mostrarDialogoNuevo = () => {
  modoEdicion.value = false
  formulario.value = { ...formularioInicial }
  dialogoProducto.value = true
}

const verProducto = (producto) => {
  $q.dialog({
    title: producto.nombre,
    message: `
      <div style="line-height: 1.8">
        <strong>Descripción:</strong> ${producto.descripcion || 'N/A'}<br>
        <strong>Categoría:</strong> ${producto.categoria}<br>
        <strong>Precio:</strong> $${producto.precio?.toLocaleString() || 0}<br>
        <strong>Stock:</strong> ${producto.stock} unidades<br>
        <strong>Estado:</strong> ${producto.estado}
      </div>
    `,
    html: true
  })
}

const editarProducto = (producto) => {
  modoEdicion.value = true
  productoSeleccionado.value = producto
  formulario.value = { ...producto }
  dialogoProducto.value = true
}

const eliminarProducto = (producto) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${producto.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/productos/${producto.id}`)
      $q.notify({
        type: 'positive',
        message: 'Producto eliminado correctamente',
        position: 'top-right'
      })
      await cargarProductos()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  })
}

const guardarProducto = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await api.put(`/productos/${productoSeleccionado.value.id}`, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Producto actualizado correctamente',
        position: 'top-right'
      })
    } else {
      await api.post('/productos', formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Producto creado correctamente',
        position: 'top-right'
      })
    }
    cerrarDialogo()
    await cargarProductos()
  } catch (error) {
    console.error('Error al guardar:', error)
  } finally {
    guardando.value = false
  }
}

const cerrarDialogo = () => {
  dialogoProducto.value = false
  formulario.value = { ...formularioInicial }
  productoSeleccionado.value = null
}

onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.q-page {
  background: #f5f5f5;
}
</style>
