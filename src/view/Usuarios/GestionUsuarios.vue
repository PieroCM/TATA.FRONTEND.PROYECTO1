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
              v-model="filtro.rol"
              outlined
              dense
              label="Filtrar por Rol"
              :options="rolesFilterOptions"
              emit-value
              map-options
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
          <div class="col-12 col-md-2">
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
        row-key="idPersonal"
        :loading="loading"
        :pagination="pagination"
        flat
        bordered
      >
        <template #body-cell-username="props">
          <q-td :props="props">
            <span v-if="props.row.username" class="text-weight-medium">{{
              props.row.username
            }}</span>
            <span v-else class="text-grey-6 text-italic">Sin cuenta</span>
          </q-td>
        </template>
        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row.nombreRol"
              :color="
                props.row.nombreRol === 'Administrador'
                  ? 'purple'
                  : props.row.nombreRol === 'Operador'
                    ? 'blue'
                    : 'grey'
              "
            >
              {{ props.row.nombreRol }}
            </q-badge>
            <span v-else class="text-grey-6">Sin rol</span>
          </q-td>
        </template>
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.estado === 'ACTIVO' ? 'positive' : 'negative'">{{
              props.row.estado
            }}</q-badge>
          </q-td>
        </template>
        <template #body-cell-estadoCuenta="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row.idUsuario !== null"
              :color="props.row.estadoCuentaAcceso === 'ACTIVO' ? 'positive' : 'negative'"
            >
              {{ props.row.estadoCuentaAcceso }}
            </q-badge>
            <span v-else class="text-grey-6">-</span>
          </q-td>
        </template>
        <template #body-cell-tieneCuenta="props">
          <q-td :props="props">
            <q-icon
              v-if="props.row.idUsuario !== null"
              name="check_circle"
              color="positive"
              size="sm"
            />
            <q-icon v-else name="cancel" color="grey-5" size="sm" />
          </q-td>
        </template>
        <template #body-cell-cuentaActivada="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row.idUsuario !== null"
              :color="props.row.cuentaActivada ? 'positive' : 'warning'"
            >
              {{ props.row.cuentaActivada ? 'Activada' : 'Pendiente' }}
            </q-badge>
            <span v-else class="text-grey-6">-</span>
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
              ><q-tooltip>Editar Personal</q-tooltip></q-btn
            >

            <!-- Botón Toggle Estado: Solo si tiene cuenta de usuario -->
            <q-btn
              v-if="props.row.idUsuario !== null"
              flat
              dense
              round
              :icon="props.row.estadoCuentaAcceso === 'ACTIVO' ? 'block' : 'check_circle'"
              :color="props.row.estadoCuentaAcceso === 'ACTIVO' ? 'orange' : 'positive'"
              size="sm"
              @click="toggleEstadoCuenta(props.row)"
              ><q-tooltip>{{
                props.row.estadoCuentaAcceso === 'ACTIVO'
                  ? 'Inhabilitar Acceso'
                  : 'Habilitar Acceso'
              }}</q-tooltip></q-btn
            >

            <!-- Botón Crear Cuenta: Solo si NO tiene cuenta -->
            <q-btn
              v-else
              flat
              dense
              round
              icon="person_add"
              color="green"
              size="sm"
              @click="crearCuentaParaPersonal(props.row)"
              ><q-tooltip>Crear Cuenta de Usuario</q-tooltip></q-btn
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
              hint="Correo electrónico corporativo"
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

          <!-- SECCIÓN EDICIÓN -->
          <template v-if="modoEdicion">
            <q-separator class="q-my-md" />

            <q-select
              v-model="formUsuario.estado"
              label="Estado del Personal *"
              outlined
              dense
              :options="estadosOptions"
              emit-value
              map-options
              class="q-mb-md"
              hint="Estado del registro de personal"
              ><template #prepend><q-icon name="toggle_on" /></template
            ></q-select>

            <!-- Si tiene cuenta de usuario, mostrar campos adicionales -->
            <template v-if="usuarioSeleccionado?.idUsuario">
              <div class="text-subtitle1 text-weight-bold text-primary q-mb-md q-mt-md">
                <q-icon name="lock" class="q-mr-xs" />
                Datos de Cuenta de Usuario
              </div>

              <q-input
                v-model="formUsuario.username"
                label="Nombre de usuario (username)"
                outlined
                dense
                class="q-mb-md"
                readonly
                hint="El username no puede ser modificado"
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
                class="q-mb-md"
                hint="Puedes cambiar el rol del usuario"
                ><template #prepend><q-icon name="admin_panel_settings" /></template
              ></q-select>
            </template>
          </template>
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
            <strong>Usuario:</strong> {{ usuarioSeleccionado.username || 'Sin cuenta' }}<br />
            <strong>Nombre:</strong> {{ usuarioSeleccionado.nombres }}
            {{ usuarioSeleccionado.apellidos }}<br />
            <strong>Email:</strong> {{ usuarioSeleccionado.correoCorporativo || 'N/A' }}
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
import { usuarioService } from 'src/services/usuarioService'
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
    const filtro = ref({ busqueda: '', estado: null, rol: null })
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
      {
        name: 'rol',
        label: 'Rol',
        field: 'nombreRol',
        align: 'center',
        sortable: true,
      },
      {
        name: 'estadoCuenta',
        label: 'Estado Cuenta',
        field: 'estadoCuentaAcceso',
        align: 'center',
        sortable: true,
      },
      {
        name: 'tieneCuenta',
        label: 'Tiene Cuenta',
        field: 'idUsuario',
        align: 'center',
        sortable: true,
      },
      {
        name: 'cuentaActivada',
        label: 'Cuenta Activada',
        field: 'cuentaActivada',
        align: 'center',
        sortable: true,
      },
      { name: 'acciones', label: 'Acciones', align: 'center' },
    ]
    const rolesOptions = [
      { label: 'ADMIN', value: 1 },
      { label: 'ANALISTA_SLA', value: 2 },
      { label: 'GESTOR_ALERTA', value: 3 },
      { label: 'TRABAJADOR', value: 4 },
      { label: 'CONSULTOR', value: 5 },
    ]
    const rolesFilterOptions = [
      { label: 'ADMIN', value: 'ADMIN' },
      { label: 'ANALISTA_SLA', value: 'ANALISTA_SLA' },
      { label: 'GESTOR_ALERTA', value: 'GESTOR_ALERTA' },
      { label: 'TRABAJADOR', value: 'TRABAJADOR' },
      { label: 'CONSULTOR', value: 'CONSULTOR' },
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
      if (filtro.value.estado) {
        resultado = resultado.filter((u) => u.estadoCuentaAcceso === filtro.value.estado)
      }
      if (filtro.value.rol) resultado = resultado.filter((u) => u.nombreRol === filtro.value.rol)
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
        idUsuario: personal.idUsuario, // ID del usuario si tiene cuenta
        username: personal.username,
        nombres: personal.nombres,
        apellidos: personal.apellidos,
        documento: personal.documento,
        correoCorporativo: personal.correoCorporativo,
        estado: personal.estado || personal.estadoCuentaAcceso || 'ACTIVO',
        idRolSistema: personal.idRolSistema || null, // Rol actual del usuario
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

    const toggleEstadoCuenta = async (usuario) => {
      if (!usuario.idUsuario) {
        $q.notify({
          type: 'warning',
          message: 'Este personal no tiene cuenta de usuario',
          position: 'top',
        })
        return
      }

      const nuevoEstado = usuario.estadoCuentaAcceso === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      const success = await usuarioStore.toggleEstado(usuario.idUsuario, nuevoEstado)
      if (success) {
        $q.notify({
          type: 'positive',
          message: `Acceso ${nuevoEstado === 'ACTIVO' ? 'habilitado' : 'inhabilitado'} exitosamente`,
          icon: 'check_circle',
          position: 'top',
        })
        // Recargar lista completa
        await cargarUsuarios()
      } else {
        $q.notify({
          type: 'negative',
          message: usuarioStore.error || 'Error al cambiar estado de acceso',
          position: 'top',
        })
      }
    }

    const crearCuentaParaPersonal = async (personal) => {
      // Mostrar diálogo de confirmación con inputs
      $q.dialog({
        title: 'Crear Cuenta de Usuario',
        message: `Crear cuenta de acceso al sistema para: ${personal.nombres} ${personal.apellidos}`,
        html: true,
        prompt: {
          model: '',
          type: 'text',
          label: 'Nombre de usuario *',
          outlined: true,
          hint: 'Ejemplo: jperez',
        },
        options: {
          type: 'radio',
          model: 3, // Por defecto Operador
          items: rolesOptions,
        },
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey',
        },
        ok: {
          label: 'Crear Cuenta',
          color: 'primary',
        },
        persistent: true,
      }).onOk(async (data) => {
        const username = data // El prompt retorna el string directamente
        const idRolSistema = data // Las options retornan el valor seleccionado

        // Validar username
        if (!username || username.trim() === '') {
          $q.notify({
            type: 'warning',
            message: 'Debes ingresar un nombre de usuario',
            position: 'top',
          })
          return
        }

        try {
          loading.value = true
          // Llamar al servicio de vincular personal
          const payload = {
            idPersonal: personal.idPersonal,
            username: username.trim(),
            idRolSistema: idRolSistema || 3,
          }

          await usuarioService.vincularPersonal(payload)

          $q.notify({
            type: 'positive',
            message: 'Cuenta de usuario creada exitosamente',
            caption: `Se ha vinculado la cuenta "${username}" al personal`,
            icon: 'person_add',
            position: 'top',
            timeout: 4000,
          })

          // Recargar la lista
          await cargarUsuarios()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Error al crear cuenta de usuario',
            caption: error.message || 'Intenta con otro nombre de usuario',
            icon: 'error',
            position: 'top',
          })
        } finally {
          loading.value = false
        }
      })
    }

    const confirmarEliminar = (usuario) => {
      usuarioSeleccionado.value = usuario

      // Si tiene cuenta de usuario, mostrar advertencia especial
      if (usuario.idUsuario !== null) {
        $q.dialog({
          title: 'Advertencia: Personal con Cuenta de Usuario',
          message: `<p>Este personal tiene una cuenta de usuario asociada: <strong>${usuario.username}</strong></p><p>¿Qué deseas hacer?</p>`,
          html: true,
          options: {
            type: 'radio',
            model: 'ambos',
            items: [
              {
                label: 'Eliminar personal Y su cuenta de usuario',
                value: 'ambos',
                color: 'negative',
              },
              {
                label: 'Solo eliminar el personal (mantener cuenta huérfana)',
                value: 'solo-personal',
                color: 'warning',
              },
            ],
          },
          cancel: {
            label: 'Cancelar',
            flat: true,
            color: 'grey',
          },
          ok: {
            label: 'Continuar',
            color: 'negative',
          },
          persistent: true,
        }).onOk(async (opcion) => {
          if (opcion === 'ambos') {
            await eliminarUsuarioYCuenta()
          } else {
            dialogEliminar.value = true
          }
        })
      } else {
        // Si NO tiene cuenta, eliminar directamente
        dialogEliminar.value = true
      }
    }

    const eliminarUsuarioYCuenta = async () => {
      loadingEliminar.value = true
      try {
        console.log(
          '🗑️ Paso 1: Eliminando cuenta de usuario con ID:',
          usuarioSeleccionado.value.idUsuario,
        )

        // PASO 1: Eliminar el usuario (cuenta de acceso) usando DELETE /api/usuario/{id}
        await usuarioStore.eliminarUsuario(usuarioSeleccionado.value.idUsuario)

        console.log(
          '✅ Usuario eliminado. Paso 2: Eliminando personal con ID:',
          usuarioSeleccionado.value.idPersonal,
        )

        // PASO 2: Eliminar el personal usando DELETE /api/personal/{id}
        await usuarioStore.eliminarPersonal(usuarioSeleccionado.value.idPersonal)

        $q.notify({
          type: 'positive',
          message: 'Personal y cuenta de usuario eliminados exitosamente',
          icon: 'delete_forever',
          position: 'top',
          timeout: 3000,
        })

        // Recargar la lista
        await cargarUsuarios()
      } catch (error) {
        console.error('❌ Error al eliminar:', error)

        $q.notify({
          type: 'negative',
          message: 'Error al eliminar',
          caption: error.response?.data?.message || error.message || 'Intenta nuevamente',
          icon: 'error',
          position: 'top',
          timeout: 5000,
        })
      } finally {
        loadingEliminar.value = false
      }
    }

    const eliminarUsuario = async () => {
      loadingEliminar.value = true
      try {
        console.log('🗑️ Eliminando personal con ID:', usuarioSeleccionado.value.idPersonal)

        // Eliminar personal usando DELETE /api/personal/{id}
        await usuarioStore.eliminarPersonal(usuarioSeleccionado.value.idPersonal)

        $q.notify({
          type: 'positive',
          message: 'Personal eliminado exitosamente',
          icon: 'check_circle',
          position: 'top',
        })

        dialogEliminar.value = false
        await cargarUsuarios()
      } catch (error) {
        console.error('❌ Error al eliminar personal:', error)

        let mensaje = 'Error al eliminar el personal'
        let caption = error.response?.data?.message || error.message || ''

        // Si tiene cuenta de usuario asociada y falla por FK constraint
        if (
          usuarioSeleccionado.value.idUsuario &&
          (caption.includes('FK_') ||
            caption.includes('foreign key') ||
            caption.includes('REFERENCE'))
        ) {
          mensaje = 'No se puede eliminar: El personal tiene una cuenta de usuario asociada'
          caption = 'Debes usar la opción "Eliminar personal Y su cuenta de usuario"'
        }

        $q.notify({
          type: 'negative',
          message: mensaje,
          caption: caption,
          icon: 'error',
          position: 'top',
          timeout: 6000,
        })
      } finally {
        loadingEliminar.value = false
      }
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
      rolesFilterOptions,
      estadosOptions,
      pagination,
      cargarUsuarios,
      filtrarUsuarios,
      openCreateDialog,
      verificarDocumentoDisponible,
      openEditDialog,
      guardarUsuario,
      toggleEstadoCuenta,
      crearCuentaParaPersonal,
      confirmarEliminar,
      eliminarUsuario,
      eliminarUsuarioYCuenta,
    }
  },
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
