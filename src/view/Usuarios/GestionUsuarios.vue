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
          <div class="col-xs-12 col-sm-6">
            <q-input
              v-model="filtro.busqueda"
              outlined
              dense
              placeholder="Buscar por usuario, correo, nombre..."
              @update:model-value="filtrarUsuarios"
              ><template #prepend><q-icon name="search" /></template
            ></q-input>
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-select
              v-model="filtro.estado"
              outlined
              dense
              placeholder="Estado"
              :options="['ACTIVO', 'INACTIVO']"
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-select
              v-model="filtro.rol"
              outlined
              dense
              placeholder="Rol"
              :options="rolesSistema"
              option-value="nombre"
              option-label="nombre"
              emit-value
              map-options
              clearable
              :loading="loadingRoles"
              @update:model-value="filtrarUsuarios"
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
                :options="rolesSistema"
                option-label="nombre"
                option-value="idRolSistema"
                emit-value
                map-options
                class="bg-white"
                hint="Define los permisos del usuario"
                :loading="loadingRoles"
                :disable="loadingRoles"
              >
                <template #prepend>
                  <q-icon name="admin_panel_settings" />
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.descripcion }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </template>

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

    <q-dialog v-model="dialogCrearCuenta" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-primary">Crear Cuenta de Usuario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="personalParaCuenta">
          <div class="q-mb-lg">
            <div class="text-body1 q-mb-xs">Se creará una cuenta de acceso al sistema para:</div>
            <div class="text-h6 text-weight-bold text-grey-8 q-mb-sm">
              {{ personalParaCuenta.nombres }} {{ personalParaCuenta.apellidos }}
            </div>
            <div class="text-caption text-grey-7">
              <q-icon name="email" size="16px" class="q-mr-xs" />
              Se enviará un correo a: {{ personalParaCuenta.correoCorporativo }}
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <q-banner class="bg-info text-white q-mb-md" rounded dense>
            <template #avatar>
              <q-icon name="info" color="white" />
            </template>
            <strong>Seguridad:</strong> Se enviará un correo de activación con un enlace válido por
            24 horas para que establezca su contraseña.
          </q-banner>

          <div class="bg-blue-1 q-pa-md rounded-borders">
            <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
              <q-icon name="lock" class="q-mr-xs" />
              Datos de la Cuenta
            </div>

            <q-input
              v-model="cuentaForm.username"
              label="Nombre de usuario (username) *"
              outlined
              dense
              class="q-mb-md bg-white"
              hint="Identificador único para iniciar sesión. Ejemplo: jperez"
              :rules="[(val) => !!val || 'El username es obligatorio']"
            >
              <template #prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <q-select
              v-model="cuentaForm.idRolSistema"
              label="Rol del Sistema *"
              outlined
              dense
              :options="rolesSistema"
              option-label="nombre"
              option-value="idRolSistema"
              emit-value
              map-options
              class="bg-white"
              hint="Define los permisos del usuario"
              :loading="loadingRoles"
              :disable="loadingRoles"
              :rules="[(val) => !!val || 'El rol es obligatorio']"
            >
              <template #prepend>
                <q-icon name="admin_panel_settings" />
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.descripcion }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancelar" flat color="grey" v-close-popup />
          <q-btn
            label="Crear y Enviar Correo"
            color="primary"
            unelevated
            icon="mark_email_read"
            @click="confirmarCrearCuenta"
            :loading="loadingCrearCuenta"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const usuarios = ref([])
const usuariosFiltrados = ref([])
const loading = ref(false)
const error = ref(null)
const loadingGuardar = ref(false)
const loadingEliminar = ref(false)
const loadingCrearCuenta = ref(false)
const verificandoDoc = ref(false)
const loadingRoles = ref(false)
const rolesSistema = ref([])
const dialogUsuario = ref(false)
const dialogEliminar = ref(false)
const dialogCrearCuenta = ref(false)
const modoEdicion = ref(false)
const usuarioSeleccionado = ref(null)
const personalParaCuenta = ref(null)
const filtro = ref({ busqueda: '', estado: null, rol: null })

const baseURL = 'http://localhost:5260'

const getToken = () => localStorage.getItem('authToken')

const getAuthHeaders = () => ({
  Authorization: getToken() ? `Bearer ${getToken()}` : '',
  'Content-Type': 'application/json',
})

const formUsuario = ref({
  username: '',
  nombres: '',
  apellidos: '',
  documento: '',
  correoCorporativo: '',
  estado: 'ACTIVO',
  crearCuentaUsuario: false,
  idRolSistema: 3,
})

const cuentaForm = ref({
  username: '',
  idRolSistema: 3,
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
  { name: 'documento', label: 'Documento', field: 'documento', align: 'center', sortable: true },
  {
    name: 'correo',
    label: 'Correo Corporativo',
    field: 'correoCorporativo',
    align: 'left',
    sortable: true,
  },
  { name: 'rol', label: 'Rol', field: 'nombreRol', align: 'center', sortable: true },
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

const estadosOptions = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Inactivo', value: 'INACTIVO' },
]

const pagination = ref({ rowsPerPage: 10 })

const ordenarPorFechaCreacion = (lista) => {
  return [...lista].sort((a, b) => {
    // ajusta 'creadoEn' al nombre real del campo que te llega del backend
    const fechaA = new Date(a.creadoEn || a.fechaCreacion || 0)
    const fechaB = new Date(b.creadoEn || b.fechaCreacion || 0)
    return fechaB - fechaA // DESC: más nuevo → más viejo
  })
}

const cargarRolesSistema = async () => {
  loadingRoles.value = true
  try {
    console.log('🔄 Cargando roles del sistema desde API...')
    const { data } = await axios.get(`${baseURL}/api/RolesSistema`, {
      headers: getAuthHeaders(),
    })
    // Filtrar solo roles activos
    rolesSistema.value = data.filter((rol) => rol.esActivo === true)
    console.log('✅ Roles cargados:', rolesSistema.value.length, 'roles activos')
  } catch (err) {
    console.error('❌ Error al cargar roles:', err.response?.status, err.message)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los roles del sistema',
      caption: err.message || 'Se mostrarán roles por defecto',
      position: 'top',
      timeout: 3000,
    })
    // Fallback a roles básicos si falla la carga
    rolesSistema.value = [
      { idRolSistema: 3, codigo: 'GESTOR_ALERTA', nombre: 'Gestor Alerta', esActivo: true },
      { idRolSistema: 4, codigo: 'TRABAJADOR', nombre: 'Trabajador', esActivo: true },
      { idRolSistema: 5, codigo: 'CONSULTOR', nombre: 'Consultor', esActivo: true },
    ]
  } finally {
    loadingRoles.value = false
  }
}

const cargarUsuarios = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('🔄 Cargando usuarios desde API...')
    const { data } = await axios.get(`${baseURL}/api/personal/gestion-usuarios`, {
      headers: getAuthHeaders(),
    })
    usuarios.value = ordenarPorFechaCreacion(data)
    usuariosFiltrados.value = [...usuarios.value]
    console.log('✅ Usuarios cargados:', usuarios.value.length, 'registros')
  } catch (err) {
    console.error('❌ Error al cargar usuarios:', err.response?.status, err.message)
    error.value = 'Error al cargar los usuarios: ' + (err.message || 'Error desconocido')

    if (err.response?.status === 401) {
      localStorage.removeItem('authToken')
      $q.notify({
        type: 'negative',
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        position: 'top-right',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar los usuarios',
        caption: err.message || 'Error desconocido',
        position: 'top-right',
      })
    }
  } finally {
    loading.value = false
  }
}

const filtrarUsuarios = () => {
  let resultado = [...usuarios.value]
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
  if (filtro.value.rol) {
    // filtro.value.rol ya es el nombre del rol gracias a emit-value
    resultado = resultado.filter((u) => u.nombreRol === filtro.value.rol)
  }
  usuariosFiltrados.value = resultado
}

const openCreateDialog = async () => {
  modoEdicion.value = false
  formUsuario.value = {
    username: '',
    nombres: '',
    apellidos: '',
    documento: '',
    correoCorporativo: '',
    estado: 'ACTIVO',
    crearCuentaUsuario: false,
    idRolSistema: null,
  }

  // Cargar roles si no están cargados
  if (rolesSistema.value.length === 0) {
    await cargarRolesSistema()
  }

  dialogUsuario.value = true
}

const openEditDialog = (personal) => {
  modoEdicion.value = true
  usuarioSeleccionado.value = personal
  formUsuario.value = {
    id: personal.idPersonal,
    idUsuario: personal.idUsuario,
    username: personal.username,
    nombres: personal.nombres,
    apellidos: personal.apellidos,
    documento: personal.documento,
    correoCorporativo: personal.correoCorporativo,
    estado: personal.estado || personal.estadoCuentaAcceso || 'ACTIVO',
    idRolSistema: personal.idRolSistema || null,
  }
  dialogUsuario.value = true
}

const verificarDocumentoDisponible = async () => {
  // No verificar si:
  // - No hay documento ingresado
  // - El documento es muy corto (menos de 8 caracteres para DNI)
  // - Estamos en modo edición
  if (
    !formUsuario.value.documento ||
    formUsuario.value.documento.trim().length < 8 ||
    modoEdicion.value
  ) {
    return
  }

  verificandoDoc.value = true
  try {
    // ✅ Usar parámetro de ruta, NO query string
    const documentoLimpio = encodeURIComponent(formUsuario.value.documento.trim())
    const response = await axios.get(
      `${baseURL}/api/personal/verificar-documento/${documentoLimpio}`,
      { headers: getAuthHeaders() },
    )

    // ✅ Backend siempre responde 200 OK con { existe: true/false, documento, mensaje }
    console.log('✅ Verificación de documento:', response.data)

    if (response.data.existe === true) {
      $q.notify({
        type: 'warning',
        message: '⚠️ Documento ya registrado',
        caption: `El documento ${formUsuario.value.documento} ya existe en el sistema`,
        icon: 'warning',
        position: 'top',
        timeout: 4000,
      })
    }
    // Si existe === false, no hacer nada (documento disponible)
  } catch (error) {
    // Solo mostrar notify para errores de servidor (5xx)
    if (error.response?.status && error.response.status >= 500) {
      console.error('❌ Error del servidor al verificar documento:', error)
      $q.notify({
        type: 'negative',
        message: 'Error de servidor',
        caption: 'No se pudo verificar el documento. Intenta nuevamente.',
        position: 'top',
      })
    } else {
      // Errores 4xx solo se registran en consola (sin notify al usuario)
      console.warn('⚠️ Error al verificar documento:', error.response?.status, error.message)
    }
  } finally {
    verificandoDoc.value = false
  }
}

const guardarUsuario = async () => {
  if (!formUsuario.value.nombres || !formUsuario.value.apellidos) {
    return $q.notify({
      type: 'warning',
      message: 'Los nombres y apellidos son obligatorios',
      position: 'top',
    })
  }

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
    if (modoEdicion.value) {
      const datosActualizar = {
        nombres: formUsuario.value.nombres,
        apellidos: formUsuario.value.apellidos,
        documento: formUsuario.value.documento,
        correoCorporativo: formUsuario.value.correoCorporativo,
        estado: formUsuario.value.estado,
      }

      await axios.put(`${baseURL}/api/personal/${formUsuario.value.id}`, datosActualizar, {
        headers: getAuthHeaders(),
      })

      const index = usuarios.value.findIndex((u) => u.idPersonal === formUsuario.value.id)
      if (index !== -1) {
        usuarios.value[index] = { ...usuarios.value[index], ...datosActualizar }
        // 👇 volvemos a ordenar por fecha de creación
        usuarios.value = ordenarPorFechaCreacion(usuarios.value)
      }
      filtrarUsuarios()

      $q.notify({
        type: 'positive',
        message: 'Personal actualizado exitosamente',
        icon: 'check_circle',
        position: 'top',
      })
    } else {
      const nuevoPersonal = {
        nombres: formUsuario.value.nombres,
        apellidos: formUsuario.value.apellidos,
        documento: formUsuario.value.documento || null,
        correoCorporativo: formUsuario.value.correoCorporativo || null,
        estado: formUsuario.value.estado,
        crearCuentaUsuario: formUsuario.value.crearCuentaUsuario,
        username: formUsuario.value.crearCuentaUsuario ? formUsuario.value.username : null,
        idRolSistema: formUsuario.value.crearCuentaUsuario ? formUsuario.value.idRolSistema : null,
      }

      // 🔄 Usar endpoint transaccional para crear personal con/sin cuenta
      const response = await axios.post(`${baseURL}/api/personal/with-account`, nuevoPersonal, {
        headers: getAuthHeaders(),
      })

      console.log('[GestionUsuarios] Respuesta CreateWithAccount:', response.data)

      // 🔄 Recargar lista completa desde el backend
      await cargarUsuarios()
      filtrarUsuarios()

      // 📩 Mostrar notificación según si se creó cuenta o no
      if (response.data.conCuentaUsuario) {
        $q.notify({
          type: 'positive',
          message: response.data.message || 'Personal y cuenta de usuario creados exitosamente',
          caption:
            response.data.instrucciones ||
            `Se ha enviado un correo de activación a ${formUsuario.value.correoCorporativo}. El enlace es válido por 24 horas.`,
          icon: 'mark_email_read',
          position: 'top',
          timeout: 6000,
          actions: [{ icon: 'close', color: 'white' }],
        })
      } else {
        $q.notify({
          type: 'positive',
          message: response.data.message || 'Personal registrado exitosamente',
          caption: 'El personal ha sido agregado sin cuenta de acceso al sistema',
          icon: 'person_add',
          position: 'top',
          timeout: 3000,
        })
      }
    }

    dialogUsuario.value = false
    //usuariosFiltrados.value = [...usuarios.value]
  } catch (error) {
    console.error('❌ Error al guardar:', error.response?.status, error.message)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar personal',
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

  try {
    const nuevoEstado = usuario.estadoCuentaAcceso === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'

    await axios.patch(`${baseURL}/api/usuario/${usuario.idUsuario}/toggle-estado`, null, {
      headers: getAuthHeaders(),
    })

    const index = usuarios.value.findIndex((u) => u.idUsuario === usuario.idUsuario)
    if (index !== -1) {
      usuarios.value[index].estadoCuentaAcceso = nuevoEstado
      usuariosFiltrados.value = [...usuarios.value]
    }

    $q.notify({
      type: 'positive',
      message: `Acceso ${nuevoEstado === 'ACTIVO' ? 'habilitado' : 'inhabilitado'} exitosamente`,
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    console.error('❌ Error al cambiar estado:', error.response?.status)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cambiar estado de acceso',
      position: 'top',
    })
  }
}

const crearCuentaParaPersonal = async (personal) => {
  if (!personal.correoCorporativo) {
    $q.notify({
      type: 'warning',
      message: 'No se puede crear cuenta',
      caption:
        'El personal debe tener un correo corporativo registrado para recibir el enlace de activación',
      icon: 'email',
      position: 'top',
      timeout: 5000,
    })
    return
  }

  personalParaCuenta.value = personal
  cuentaForm.value = {
    username: '',
    idRolSistema: null,
  }

  // Cargar roles antes de mostrar el modal
  if (rolesSistema.value.length === 0) {
    await cargarRolesSistema()
  }

  dialogCrearCuenta.value = true
}

const confirmarCrearCuenta = async () => {
  if (!cuentaForm.value.username || cuentaForm.value.username.trim() === '') {
    return $q.notify({
      type: 'warning',
      message: 'El nombre de usuario es obligatorio',
      icon: 'account_circle',
      position: 'top',
    })
  }

  if (!cuentaForm.value.idRolSistema) {
    return $q.notify({
      type: 'warning',
      message: 'El rol del sistema es obligatorio',
      icon: 'admin_panel_settings',
      position: 'top',
    })
  }

  loadingCrearCuenta.value = true
  try {
    const payload = {
      idPersonal: personalParaCuenta.value.idPersonal,
      username: cuentaForm.value.username,
      idRolSistema: cuentaForm.value.idRolSistema,
    }

    await axios.post(`${baseURL}/api/usuario/vincular-personal`, payload, {
      headers: getAuthHeaders(),
    })

    $q.notify({
      type: 'positive',
      message: 'Cuenta de usuario creada y correo enviado exitosamente',
      caption: `Se ha enviado un correo a ${personalParaCuenta.value.correoCorporativo} con el enlace de activación (válido por 24 horas)`,
      icon: 'mark_email_read',
      position: 'top',
      timeout: 6000,
      actions: [{ icon: 'close', color: 'white' }],
    })

    dialogCrearCuenta.value = false
    await cargarUsuarios()
  } catch (error) {
    console.error('❌ Error al crear cuenta:', error.response?.status)

    let mensaje = 'Error al crear la cuenta de usuario'
    let caption = error.response?.data?.message || error.message

    if (error.response?.status === 401) {
      mensaje = 'Sesión expirada'
      caption = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      localStorage.removeItem('authToken')
    } else if (error.response?.status === 403) {
      mensaje = 'Permisos insuficientes'
      caption = 'No tienes permisos para crear cuentas de usuario.'
    } else if (error.response?.status === 409) {
      mensaje = 'El nombre de usuario ya existe'
      caption = 'Por favor elige otro nombre de usuario'
    } else if (error.response?.status === 400) {
      mensaje = 'Datos inválidos'
      caption = caption || 'Por favor verifica los datos ingresados'
    }

    $q.notify({
      type: 'negative',
      message: mensaje,
      caption: caption,
      icon: 'error',
      position: 'top',
      timeout: 5000,
    })
  } finally {
    loadingCrearCuenta.value = false
  }
}

const confirmarEliminar = (usuario) => {
  usuarioSeleccionado.value = usuario

  if (usuario.idUsuario !== null) {
    $q.dialog({
      title: '⚠️ Advertencia: Cuenta de Usuario Asociada',
      message: `El usuario <strong>${usuario.username}</strong> tiene una cuenta de acceso al sistema. ¿Qué deseas hacer?`,
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
    }).onOk((opcion) => {
      if (opcion === 'ambos') {
        eliminarUsuarioYCuenta()
      } else {
        dialogEliminar.value = true
      }
    })
  } else {
    dialogEliminar.value = true
  }
}

const eliminarUsuarioYCuenta = async () => {
  loadingEliminar.value = true
  try {
    console.log('🗑️ Eliminando cuenta y personal...')

    await axios.delete(`${baseURL}/api/usuario/${usuarioSeleccionado.value.idUsuario}`, {
      headers: getAuthHeaders(),
    })

    console.log('✅ Usuario eliminado. Eliminando personal...')

    await axios.delete(`${baseURL}/api/personal/${usuarioSeleccionado.value.idPersonal}`, {
      headers: getAuthHeaders(),
    })

    usuarios.value = usuarios.value.filter(
      (u) => u.idPersonal !== usuarioSeleccionado.value.idPersonal,
    )
    usuariosFiltrados.value = [...usuarios.value]

    $q.notify({
      type: 'positive',
      message: 'Personal y cuenta de usuario eliminados exitosamente',
      icon: 'delete_forever',
      position: 'top',
      timeout: 3000,
    })

    dialogEliminar.value = false
  } catch (error) {
    console.error('❌ Error al eliminar:', error.response?.status)

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
    console.log('🗑️ Eliminando personal...')

    await axios.delete(`${baseURL}/api/personal/${usuarioSeleccionado.value.idPersonal}`, {
      headers: getAuthHeaders(),
    })

    usuarios.value = usuarios.value.filter(
      (u) => u.idPersonal !== usuarioSeleccionado.value.idPersonal,
    )
    usuariosFiltrados.value = [...usuarios.value]

    $q.notify({
      type: 'positive',
      message: 'Personal eliminado exitosamente',
      icon: 'check_circle',
      position: 'top',
    })

    dialogEliminar.value = false
  } catch (error) {
    console.error('❌ Error al eliminar personal:', error.response?.status)

    let mensaje = 'Error al eliminar el personal'
    let caption = error.response?.data?.message || error.message || ''

    if (
      usuarioSeleccionado.value.idUsuario &&
      (caption.includes('FK_') || caption.includes('foreign key') || caption.includes('REFERENCE'))
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

onMounted(async () => {
  await Promise.all([cargarUsuarios(), cargarRolesSistema()])
})
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
