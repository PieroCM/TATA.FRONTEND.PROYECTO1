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
          <div class="col-12 col-md-6">
            <q-input
              v-model="filtro.busqueda"
              outlined
              dense
              label="Buscar personal"
              placeholder="Nombre, email, documento..."
              @update:model-value="filtrarUsuarios"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
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
          <div class="col-12 col-md-3">
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
        row-key="idPersonal"
        :loading="loading"
        :pagination="pagination"
        flat
        bordered
      >
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
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ modoEdicion ? 'Editar Personal' : 'Nuevo Personal' }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- SECCIÓN 1: DATOS DE PERSONAL (Siempre visible) -->
          <div class="q-mb-lg">
            <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
              <q-icon name="person" class="q-mr-xs" />
              Datos de Personal
            </div>

            <q-input v-model="formUsuario.nombres" label="Nombres *" outlined dense class="q-mb-md"
              ><template #prepend><q-icon name="badge" /></template
            ></q-input>

            <q-input
              v-model="formUsuario.apellidos"
              label="Apellidos *"
              outlined
              dense
              class="q-mb-md"
              ><template #prepend><q-icon name="badge" /></template
            ></q-input>

            <q-input
              v-model="formUsuario.documento"
              label="Documento"
              outlined
              dense
              class="q-mb-md"
              @blur="verificarDocumentoDisponible"
              hint="Opcional - Número de identificación"
              ><template #prepend><q-icon name="credit_card" /></template
              ><template #append v-if="verificandoDoc"
                ><q-spinner color="primary" size="20px" /></template
            ></q-input>

            <q-input
              v-model="formUsuario.correoCorporativo"
              label="Correo Corporativo"
              type="email"
              outlined
              dense
              class="q-mb-md"
              :disable="modoEdicion"
              hint="Requerido si se crea cuenta de usuario"
              ><template #prepend><q-icon name="mail" /></template
            ></q-input>
          </div>

          <!-- SEPARADOR Y OPCIÓN DE CREAR CUENTA (Solo al crear nuevo) -->
          <template v-if="!modoEdicion">
            <q-separator class="q-mb-md" />

            <div class="q-mb-md">
              <q-toggle
                v-model="formUsuario.crearCuentaUsuario"
                label="Crear cuenta de usuario para acceso al sistema"
                color="primary"
                size="lg"
                icon="person_add"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7 q-ml-xl">
                Si se activa, el personal podrá iniciar sesión en el sistema
              </div>
            </div>

            <!-- SECCIÓN 2: CUENTA DE ACCESO (Condicional) -->
            <div v-if="formUsuario.crearCuentaUsuario" class="bg-blue-1 q-pa-md rounded-borders">
              <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                <q-icon name="lock" class="q-mr-xs" />
                Cuenta de Acceso
              </div>

              <q-banner class="bg-info text-white q-mb-md" rounded dense>
                <template #avatar>
                  <q-icon name="email" color="white" />
                </template>
                <strong>Seguridad:</strong> Se enviará un correo de activación al usuario con un
                enlace válido por 24 horas para que establezca su propia contraseña.
              </q-banner>

              <q-input
                v-model="formUsuario.username"
                label="Nombre de usuario (username) *"
                outlined
                dense
                class="q-mb-md bg-white"
                hint="Identificador único para iniciar sesión"
                ><template #prepend><q-icon name="account_circle" /></template
              ></q-input>

              <q-select
                v-model="formUsuario.idRolSistema"
                label="Rol del Sistema *"
                outlined
                dense
                :options="rolesOptions"
                emit-value
                map-options
                class="bg-white"
                hint="Define los permisos del usuario"
                ><template #prepend><q-icon name="admin_panel_settings" /></template
              ></q-select>
            </div>
          </template>

          <!-- SECCIÓN EDICIÓN: Solo estado -->
          <q-select
            v-if="modoEdicion"
            v-model="formUsuario.estado"
            label="Estado *"
            outlined
            dense
            :options="estadosOptions"
            emit-value
            map-options
            class="q-mt-md"
            ><template #prepend><q-icon name="toggle_on" /></template
          ></q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Actualizar' : 'Crear Personal'"
            color="primary"
            unelevated
            @click="guardarUsuario"
            :loading="loadingGuardar"
            :icon="modoEdicion ? 'save' : 'person_add'"
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
            <strong>Usuario:</strong> {{ usuarioSeleccionado.username }}<br />
            <strong>Nombre:</strong> {{ usuarioSeleccionado.nombres }}
            {{ usuarioSeleccionado.apellidos }}<br />
            <strong>Email:</strong> {{ usuarioSeleccionado.correoCorporativo }}
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
    const verificandoDoc = ref(false)
    const dialogUsuario = ref(false)
    const dialogEliminar = ref(false)
    const modoEdicion = ref(false)
    const usuarioSeleccionado = ref(null)
    const filtro = ref({ busqueda: '', estado: null })
    const formUsuario = ref({
      username: '',
      nombres: '',
      apellidos: '',
      documento: '',
      correoCorporativo: '',
      estado: 'ACTIVO',
      crearCuentaUsuario: false,
      idRolSistema: 3, // Rol por defecto: Operador
    })
    const columns = [
      { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
      {
        name: 'nombreCompleto',
        label: 'Nombre Completo',
        field: (row) => `${row.nombres} ${row.apellidos}`,
        align: 'left',
        sortable: true,
      },
      {
        name: 'documento',
        label: 'Documento',
        field: 'documento',
        align: 'center',
        sortable: true,
      },
      {
        name: 'correo',
        label: 'Correo Corporativo',
        field: 'correoCorporativo',
        align: 'left',
        sortable: true,
      },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
      {
        name: 'tieneCuenta',
        label: 'Tiene Cuenta',
        field: 'tieneCuentaUsuario',
        align: 'center',
        sortable: true,
        format: (val) => (val ? 'Sí' : 'No'),
      },
      { name: 'acciones', label: 'Acciones', align: 'center' },
    ]
    const rolesOptions = [
      { label: 'Administrador', value: 2 },
      { label: 'Operador', value: 3 },
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
            u.correoCorporativo?.toLowerCase().includes(busqueda) ||
            u.nombres?.toLowerCase().includes(busqueda) ||
            u.apellidos?.toLowerCase().includes(busqueda) ||
            u.documento?.toLowerCase().includes(busqueda),
        )
      }
      if (filtro.value.estado) resultado = resultado.filter((u) => u.estado === filtro.value.estado)
      usuariosFiltrados.value = resultado
    }

    const openCreateDialog = () => {
      modoEdicion.value = false
      formUsuario.value = {
        username: '',
        nombres: '',
        apellidos: '',
        documento: '',
        correoCorporativo: '',
        estado: 'ACTIVO',
        crearCuentaUsuario: false,
        idRolSistema: 3,
      }
      dialogUsuario.value = true
    }

    const verificarDocumentoDisponible = async () => {
      if (!formUsuario.value.documento || modoEdicion.value) return

      verificandoDoc.value = true
      try {
        const resultado = await usuarioStore.verificarDocumento(formUsuario.value.documento)
        if (resultado.existe) {
          $q.notify({
            type: 'warning',
            message: 'El documento ya está registrado',
            position: 'bottom',
          })
        }
      } catch (error) {
        console.error('Error al verificar documento:', error)
      } finally {
        verificandoDoc.value = false
      }
    }

    const openEditDialog = (personal) => {
      modoEdicion.value = true
      usuarioSeleccionado.value = personal
      formUsuario.value = {
        id: personal.idPersonal,
        username: personal.username,
        nombres: personal.nombres,
        apellidos: personal.apellidos,
        documento: personal.documento,
        correoCorporativo: personal.correoCorporativo,
        estado: personal.estado,
      }
      dialogUsuario.value = true
    }

    const guardarUsuario = async () => {
      // Validar campos básicos obligatorios
      if (!formUsuario.value.nombres || !formUsuario.value.apellidos) {
        return $q.notify({
          type: 'warning',
          message: 'Nombres y Apellidos son obligatorios',
          icon: 'warning',
          position: 'top',
        })
      }

      // Validaciones específicas cuando se crea cuenta de usuario
      if (!modoEdicion.value && formUsuario.value.crearCuentaUsuario) {
        if (!formUsuario.value.correoCorporativo) {
          return $q.notify({
            type: 'warning',
            message: 'El correo corporativo es obligatorio para crear cuenta de usuario',
            caption: 'Se necesita para enviar el enlace de activación',
            icon: 'email',
            position: 'top',
          })
        }

        if (!formUsuario.value.username) {
          return $q.notify({
            type: 'warning',
            message: 'El nombre de usuario es obligatorio para crear cuenta',
            icon: 'account_circle',
            position: 'top',
          })
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formUsuario.value.correoCorporativo)) {
          return $q.notify({
            type: 'warning',
            message: 'Formato de correo inválido',
            icon: 'error',
            position: 'top',
          })
        }
      }

      loadingGuardar.value = true
      try {
        let success
        if (modoEdicion.value) {
          // MODO EDICIÓN: Solo actualizar datos personales
          const datosActualizar = {
            nombres: formUsuario.value.nombres,
            apellidos: formUsuario.value.apellidos,
            documento: formUsuario.value.documento,
            correoCorporativo: formUsuario.value.correoCorporativo,
            estado: formUsuario.value.estado,
          }
          success = await usuarioStore.actualizarUsuario(formUsuario.value.id, datosActualizar)

          if (success) {
            $q.notify({
              type: 'positive',
              message: 'Personal actualizado exitosamente',
              icon: 'check_circle',
              position: 'top',
            })
          }
        } else {
          // MODO CREACIÓN: Usar endpoint transaccional
          const nuevoPersonal = {
            nombres: formUsuario.value.nombres,
            apellidos: formUsuario.value.apellidos,
            documento: formUsuario.value.documento || null,
            correoCorporativo: formUsuario.value.correoCorporativo || null,
            estado: formUsuario.value.estado,
            crearCuentaUsuario: formUsuario.value.crearCuentaUsuario,
            username: formUsuario.value.crearCuentaUsuario ? formUsuario.value.username : null,
            idRolSistema: formUsuario.value.crearCuentaUsuario
              ? formUsuario.value.idRolSistema
              : null,
          }

          const resultado = await usuarioStore.crearUsuario(nuevoPersonal)

          if (resultado) {
            if (resultado.conCuentaUsuario) {
              // Cuenta creada: Mostrar mensaje detallado
              $q.notify({
                type: 'positive',
                message: 'Personal y cuenta de usuario creados exitosamente',
                caption: `Se ha enviado un correo de activación a ${formUsuario.value.correoCorporativo}. El enlace es válido por 24 horas.`,
                icon: 'mark_email_read',
                position: 'top',
                timeout: 6000,
                actions: [{ icon: 'close', color: 'white' }],
              })
            } else {
              // Solo personal creado
              $q.notify({
                type: 'positive',
                message: 'Personal registrado exitosamente',
                caption: 'El personal ha sido agregado sin cuenta de acceso al sistema',
                icon: 'person_add',
                position: 'top',
                timeout: 3000,
              })
            }
            success = true
          }
        }

        if (success || success !== false) {
          dialogUsuario.value = false
          usuariosFiltrados.value = [...usuarioStore.usuarios]
        } else {
          $q.notify({
            type: 'negative',
            message: usuarioStore.error || 'Error al guardar personal',
            icon: 'error',
            position: 'top',
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Error al guardar personal',
          caption: 'Por favor verifica los datos e intenta nuevamente',
          icon: 'error',
          position: 'top',
        })
      } finally {
        loadingGuardar.value = false
      }
    }

    const toggleEstado = async (personal) => {
      const nuevoEstado = personal.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      const success = await usuarioStore.toggleEstado(personal.idPersonal, nuevoEstado)
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
      const success = await usuarioStore.eliminarUsuario(usuarioSeleccionado.value.idPersonal)
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

    onMounted(() => cargarUsuarios())

    return {
      usuariosFiltrados,
      loading,
      loadingGuardar,
      loadingEliminar,
      verificandoDoc,
      dialogUsuario,
      dialogEliminar,
      modoEdicion,
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
      verificarDocumentoDisponible,
      openEditDialog,
      guardarUsuario,
      toggleEstado,
      confirmarEliminar,
      eliminarUsuario,
    }
  },
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
