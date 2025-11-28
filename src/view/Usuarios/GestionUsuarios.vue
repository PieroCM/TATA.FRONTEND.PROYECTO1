<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Gestión de Usuarios</div>
        <div class="text-subtitle2 text-grey-7">Administra usuarios, roles y permisos</div>
      </div>
      <q-btn
        color="primary"
        icon="person_add"
        label="Nuevo Usuario"
        unelevated
        @click="openCreateDialog"
      />
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtro.busqueda"
              outlined
              dense
              label="Buscar usuario"
              placeholder="Nombre, email..."
              @update:model-value="filtrarUsuarios"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtro.rol"
              outlined
              dense
              label="Filtrar por Rol"
              :options="rolesOptions"
              emit-value
              map-options
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtro.estado"
              outlined
              dense
              label="Filtrar por Estado"
              :options="estadosOptions"
              emit-value
              map-options
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              color="secondary"
              icon="refresh"
              label="Recargar"
              unelevated
              class="full-width"
              @click="cargarUsuarios"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <q-table
        :rows="usuariosFiltrados"
        :columns="columns"
        row-key="idUsuario"
        :loading="loading"
        :pagination="pagination"
        flat
        bordered
      >
        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="getRolColor(props.row.nombreRol)">{{
              getRolLabel(props.row.nombreRol)
            }}</q-badge>
          </q-td>
        </template>
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.estado === 'ACTIVO' ? 'positive' : 'negative'">{{
              props.row.estado
            }}</q-badge>
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="openEditDialog(props.row)"
              ><q-tooltip>Editar</q-tooltip></q-btn
            >
            <q-btn
              flat
              dense
              round
              :icon="props.row.estado === 'ACTIVO' ? 'block' : 'check_circle'"
              :color="props.row.estado === 'ACTIVO' ? 'orange' : 'positive'"
              size="sm"
              @click="toggleEstado(props.row)"
              ><q-tooltip>{{
                props.row.estado === 'ACTIVO' ? 'Inhabilitar' : 'Habilitar'
              }}</q-tooltip></q-btn
            >
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmarEliminar(props.row)"
              ><q-tooltip>Eliminar</q-tooltip></q-btn
            >
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogUsuario" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ modoEdicion ? 'Editar Usuario' : 'Crear Usuario' }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="column items-center q-mb-md">
            <q-avatar size="80px" color="primary" text-color="white"
              ><q-icon name="person_add" size="40px"
            /></q-avatar>
            <div class="text-caption text-grey-7 q-mt-sm">Datos del usuario</div>
          </div>
          <q-input
            v-model="formUsuario.username"
            label="Nombre de usuario *"
            outlined
            dense
            class="q-mb-md"
            ><template #prepend><q-icon name="person" /></template
          ></q-input>
          <q-input
            v-model="formUsuario.correo"
            label="Correo Electrónico *"
            type="email"
            outlined
            dense
            class="q-mb-md"
            :disable="modoEdicion"
            ><template #prepend><q-icon name="mail" /></template
          ></q-input>
          <q-input
            v-if="!modoEdicion"
            v-model="formUsuario.password"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña *"
            outlined
            dense
            class="q-mb-md"
            ><template #prepend><q-icon name="lock" /></template
            ><template #append
              ><q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword" /></template
          ></q-input>
          <q-input
            v-if="!modoEdicion"
            v-model="formUsuario.password_confirm"
            :type="showPassword ? 'text' : 'password'"
            label="Confirmar Contraseña *"
            outlined
            dense
            class="q-mb-md"
            ><template #prepend><q-icon name="lock" /></template
          ></q-input>
          <q-select
            v-model="formUsuario.idRolSistema"
            label="Rol *"
            outlined
            dense
            :options="rolesOptions"
            emit-value
            map-options
            class="q-mb-md"
            ><template #prepend><q-icon name="admin_panel_settings" /></template
          ></q-select>
          <q-select
            v-if="modoEdicion"
            v-model="formUsuario.estado"
            label="Estado *"
            outlined
            dense
            :options="estadosOptions"
            emit-value
            map-options
            class="q-mb-md"
            ><template #prepend><q-icon name="toggle_on" /></template
          ></q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Actualizar' : 'Crear'"
            color="primary"
            unelevated
            @click="guardarUsuario"
            :loading="loadingGuardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogEliminar" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de eliminar este usuario?</span>
        </q-card-section>
        <q-card-section v-if="usuarioSeleccionado">
          <div class="text-body2">
            <strong>Usuario:</strong> {{ usuarioSeleccionado.username }}<br /><strong
              >Email:</strong
            >
            {{ usuarioSeleccionado.correo }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            unelevated
            @click="eliminarUsuario"
            :loading="loadingEliminar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'GestionUsuarios',
  setup() {
    const usuarioStore = useUsuarioStore()
    const $q = useQuasar()
    const usuariosFiltrados = ref([])
    const loadingGuardar = ref(false)
    const loadingEliminar = ref(false)
    const dialogUsuario = ref(false)
    const dialogEliminar = ref(false)
    const modoEdicion = ref(false)
    const showPassword = ref(false)
    const usuarioSeleccionado = ref(null)
    const filtro = ref({ busqueda: '', rol: null, estado: null })
    const formUsuario = ref({
      username: '',
      correo: '',
      password: '',
      password_confirm: '',
      idRolSistema: 1,
      estado: 'ACTIVO',
    })
    const columns = [
      { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
      { name: 'correo', label: 'Correo', field: 'correo', align: 'left', sortable: true },
      { name: 'rol', label: 'Rol', field: 'nombreRol', align: 'center', sortable: true },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
      {
        name: 'ultimoLogin',
        label: 'Último Login',
        field: 'ultimoLogin',
        align: 'center',
        sortable: true,
        format: (val) => (val ? new Date(val).toLocaleString('es-ES') : 'Nunca'),
      },
      { name: 'acciones', label: 'Acciones', align: 'center' },
    ]
    const rolesOptions = [
      { label: 'Administrador', value: 1 },
      { label: 'Operador', value: 2 },
      { label: 'Usuario', value: 3 },
    ]
    const estadosOptions = [
      { label: 'Activo', value: 'ACTIVO' },
      { label: 'Inactivo', value: 'INACTIVO' },
    ]
    const pagination = ref({ rowsPerPage: 10 })
    const loading = computed(() => usuarioStore.loading)

    const cargarUsuarios = async () => {
      await usuarioStore.fetchUsuarios()
      usuariosFiltrados.value = [...usuarioStore.usuarios]
    }

    const filtrarUsuarios = () => {
      let resultado = [...usuarioStore.usuarios]
      if (filtro.value.busqueda) {
        const busqueda = filtro.value.busqueda.toLowerCase()
        resultado = resultado.filter(
          (u) =>
            u.username?.toLowerCase().includes(busqueda) ||
            u.correo?.toLowerCase().includes(busqueda),
        )
      }
      if (filtro.value.rol) resultado = resultado.filter((u) => u.idRolSistema === filtro.value.rol)
      if (filtro.value.estado) resultado = resultado.filter((u) => u.estado === filtro.value.estado)
      usuariosFiltrados.value = resultado
    }

    const openCreateDialog = () => {
      modoEdicion.value = false
      formUsuario.value = {
        username: '',
        correo: '',
        password: '',
        password_confirm: '',
        idRolSistema: 1,
        estado: 'ACTIVO',
      }
      dialogUsuario.value = true
    }

    const openEditDialog = (usuario) => {
      modoEdicion.value = true
      usuarioSeleccionado.value = usuario
      formUsuario.value = {
        id: usuario.idUsuario,
        username: usuario.username,
        correo: usuario.correo,
        idRolSistema: usuario.idRolSistema,
        estado: usuario.estado,
      }
      dialogUsuario.value = true
    }

    const guardarUsuario = async () => {
      if (!formUsuario.value.username || !formUsuario.value.correo)
        return $q.notify({
          type: 'warning',
          message: 'Completa todos los campos obligatorios',
          position: 'bottom',
        })
      if (!modoEdicion.value) {
        if (!formUsuario.value.password || !formUsuario.value.password_confirm)
          return $q.notify({
            type: 'warning',
            message: 'La contraseña es obligatoria',
            position: 'bottom',
          })
        if (formUsuario.value.password !== formUsuario.value.password_confirm)
          return $q.notify({
            type: 'negative',
            message: 'Las contraseñas no coinciden',
            position: 'bottom',
          })
        if (formUsuario.value.password.length < 6)
          return $q.notify({
            type: 'warning',
            message: 'La contraseña debe tener al menos 6 caracteres',
            position: 'bottom',
          })
      }
      loadingGuardar.value = true
      try {
        let success
        if (modoEdicion.value) {
          const datosActualizar = {
            username: formUsuario.value.username,
            idRolSistema: formUsuario.value.idRolSistema,
            estado: formUsuario.value.estado,
          }
          success = await usuarioStore.actualizarUsuario(formUsuario.value.id, datosActualizar)
          if (success)
            $q.notify({
              type: 'positive',
              message: 'Usuario actualizado exitosamente',
              position: 'bottom',
            })
        } else {
          const nuevoUsuario = {
            username: formUsuario.value.username,
            correo: formUsuario.value.correo,
            password: formUsuario.value.password,
            idRolSistema: formUsuario.value.idRolSistema,
            estado: formUsuario.value.estado,
          }
          success = await usuarioStore.crearUsuario(nuevoUsuario)
          if (success)
            $q.notify({
              type: 'positive',
              message: 'Usuario creado exitosamente',
              position: 'bottom',
            })
        }
        if (success || success !== false) {
          dialogUsuario.value = false
          usuariosFiltrados.value = [...usuarioStore.usuarios]
        } else
          $q.notify({
            type: 'negative',
            message: usuarioStore.error || 'Error al guardar usuario',
            position: 'bottom',
          })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Error al guardar usuario',
          position: 'bottom',
        })
      } finally {
        loadingGuardar.value = false
      }
    }

    const toggleEstado = async (usuario) => {
      const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      const success = await usuarioStore.toggleEstado(usuario.idUsuario, nuevoEstado)
      if (success) {
        $q.notify({
          type: 'positive',
          message: `Usuario ${nuevoEstado === 'ACTIVO' ? 'habilitado' : 'inhabilitado'} exitosamente`,
          position: 'bottom',
        })
        usuariosFiltrados.value = [...usuarioStore.usuarios]
      } else
        $q.notify({
          type: 'negative',
          message: usuarioStore.error || 'Error al cambiar estado',
          position: 'bottom',
        })
    }

    const confirmarEliminar = (usuario) => {
      usuarioSeleccionado.value = usuario
      dialogEliminar.value = true
    }

    const eliminarUsuario = async () => {
      loadingEliminar.value = true
      const success = await usuarioStore.eliminarUsuario(usuarioSeleccionado.value.idUsuario)
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Usuario eliminado exitosamente',
          position: 'bottom',
        })
        dialogEliminar.value = false
        usuariosFiltrados.value = [...usuarioStore.usuarios]
      } else
        $q.notify({
          type: 'negative',
          message: usuarioStore.error || 'Error al eliminar usuario',
          position: 'bottom',
        })
      loadingEliminar.value = false
    }

    const getRolColor = (rol) =>
      ({ Administrador: 'deep-purple', Operador: 'orange', Usuario: 'blue' })[rol] || 'grey'
    const getRolLabel = (rol) => rol || 'Sin Rol'

    onMounted(() => cargarUsuarios())

    return {
      usuariosFiltrados,
      loading,
      loadingGuardar,
      loadingEliminar,
      dialogUsuario,
      dialogEliminar,
      modoEdicion,
      showPassword,
      usuarioSeleccionado,
      filtro,
      formUsuario,
      columns,
      rolesOptions,
      estadosOptions,
      pagination,
      cargarUsuarios,
      filtrarUsuarios,
      openCreateDialog,
      openEditDialog,
      guardarUsuario,
      toggleEstado,
      confirmarEliminar,
      eliminarUsuario,
      getRolColor,
      getRolLabel,
    }
  },
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
