<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Gestión de Usuarios</div>
      <q-btn
        color="primary"
        icon="person_add"
        label="Nuevo Usuario"
        @click="mostrarDialogoNuevo"
      />
    </div>

    <!-- Estadísticas de usuarios -->
    <div class="row q-col-gutter-md q-mb-md">
      <chart-card
        title="Total Usuarios"
        icon="people"
        :value="usuarios.length"
        color="primary"
      />
      <chart-card
        title="Usuarios Activos"
        icon="check_circle"
        :value="usuariosActivos"
        color="positive"
      />
      <chart-card
        title="Usuarios Inactivos"
        icon="cancel"
        :value="usuariosInactivos"
        color="negative"
      />
    </div>

    <!-- Tabla de usuarios -->
    <data-table
      title="Lista de Usuarios"
      :rows="usuarios"
      :columns="columnas"
      :loading="loading"
      @ver="verUsuario"
      @editar="editarUsuario"
      @eliminar="eliminarUsuario"
    />

    <!-- Diálogo para crear/editar usuario -->
    <q-dialog v-model="dialogoUsuario" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarUsuario" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre completo"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            />

            <q-input
              v-model="formulario.email"
              label="Email"
              outlined
              type="email"
              :rules="[
                val => !!val || 'Campo requerido',
                val => /.+@.+\..+/.test(val) || 'Email inválido'
              ]"
            />

            <q-input
              v-model="formulario.telefono"
              label="Teléfono"
              outlined
              mask="(###) ###-####"
            />

            <q-select
              v-model="formulario.rol"
              :options="roles"
              label="Rol"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            />

            <q-select
              v-model="formulario.estado"
              :options="estados"
              label="Estado"
              outlined
            />

            <q-input
              v-if="!modoEdicion"
              v-model="formulario.password"
              label="Contraseña"
              outlined
              type="password"
              :rules="[
                val => !!val || 'Campo requerido',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
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
import ChartCard from 'components/ChartCard.vue'

const $q = useQuasar()

// Estado
const usuarios = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoUsuario = ref(false)
const modoEdicion = ref(false)
const usuarioSeleccionado = ref(null)

// Opciones
const roles = ['Administrador', 'Supervisor', 'Usuario', 'Invitado']
const estados = ['Activo', 'Inactivo']

// Formulario
const formularioInicial = {
  nombre: '',
  email: '',
  telefono: '',
  rol: 'Usuario',
  estado: 'Activo',
  password: ''
}

const formulario = ref({ ...formularioInicial })

// Columnas
const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Computadas
const usuariosActivos = computed(() =>
  usuarios.value.filter(u => u.estado === 'Activo').length
)

const usuariosInactivos = computed(() =>
  usuarios.value.filter(u => u.estado === 'Inactivo').length
)

// Métodos
const cargarUsuarios = async () => {
  loading.value = true
  try {
    const res = await api.get('/usuarios')
    usuarios.value = res.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los usuarios',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

const mostrarDialogoNuevo = () => {
  modoEdicion.value = false
  formulario.value = { ...formularioInicial }
  dialogoUsuario.value = true
}

const verUsuario = (usuario) => {
  $q.dialog({
    title: usuario.nombre,
    message: `
      <div style="line-height: 1.8">
        <strong>Email:</strong> ${usuario.email}<br>
        <strong>Teléfono:</strong> ${usuario.telefono || 'N/A'}<br>
        <strong>Rol:</strong> ${usuario.rol}<br>
        <strong>Estado:</strong> ${usuario.estado}<br>
        <strong>Fecha de registro:</strong> ${usuario.fechaRegistro || 'N/A'}
      </div>
    `,
    html: true
  })
}

const editarUsuario = (usuario) => {
  modoEdicion.value = true
  usuarioSeleccionado.value = usuario
  formulario.value = { ...usuario }
  dialogoUsuario.value = true
}

const eliminarUsuario = (usuario) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/usuarios/${usuario.id}`)
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado correctamente',
        position: 'top-right'
      })
      await cargarUsuarios()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  })
}

const guardarUsuario = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await api.put(`/usuarios/${usuarioSeleccionado.value.id}`, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado correctamente',
        position: 'top-right'
      })
    } else {
      await api.post('/usuarios', formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Usuario creado correctamente',
        position: 'top-right'
      })
    }
    cerrarDialogo()
    await cargarUsuarios()
  } catch (error) {
    console.error('Error al guardar:', error)
  } finally {
    guardando.value = false
  }
}

const cerrarDialogo = () => {
  dialogoUsuario.value = false
  formulario.value = { ...formularioInicial }
  usuarioSeleccionado.value = null
}

onMounted(() => {
  cargarUsuarios()
})
</script>

<style scoped>
.q-page {
  background: #f5f5f5;
}
</style>
