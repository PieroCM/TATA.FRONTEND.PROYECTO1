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
          <div class="col-xs-12 col-sm-4">
            <q-input
              v-model="filtro.busqueda"
              outlined
              dense
              label="Búsqueda General"
              placeholder="Usuario, correo, nombre..."
              @update:model-value="filtrarUsuarios"
              ><template #prepend><q-icon name="search" /></template
            ></q-input>
          </div>
          <div class="col-xs-12 col-sm-3">
            <q-select
              v-model="filtro.estadoCuenta"
              outlined
              dense
              label="Estado de Cuenta de Acceso"
              placeholder="Seleccionar estado..."
              :options="['ACTIVO', 'INACTIVO']"
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
          <div class="col-xs-12 col-sm-2">
            <q-select
              v-model="filtro.rol"
              outlined
              dense
              label="Rol del Sistema"
              placeholder="Seleccionar rol..."
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
          <div class="col-xs-12 col-sm-3">
            <q-select
              v-model="filtro.estadoPersonal"
              outlined
              dense
              label="Estado Personal"
              placeholder="Seleccionar estado..."
              :options="['ACTIVO', 'INACTIVO']"
              clearable
              @update:model-value="filtrarUsuarios"
            />
          </div>
        </div>
        <div class="row q-mt-sm">
          <div class="col-12">
            <q-btn
              color="teal-8"
              text-color="white"
              icon="refresh"
              label="RECARGAR"
              unelevated
              :loading="loading"
              @click="cargarListadoPersonal"
              ><q-tooltip>Recargar lista de usuarios</q-tooltip></q-btn
            >
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
        :row-class="getRowClass"
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
                  ? 'purple' // Color para Administrador
                  : props.row.nombreRol === 'Super Administrador'
                    ? 'indigo-9' // Color para Super Administrador
                    : props.row.nombreRol === 'Especialista SLA'
                      ? 'teal' // Color para Especialista SLA
                      : props.row.nombreRol === 'Analista SLA'
                        ? 'light-blue' // Color para Analista SLA
                        : 'grey' // Color por defecto si el rol es nuevo o no coincide
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
        <template #body-cell-estadoPersonal="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estadoPersonal === 'ACTIVO' ? 'green-6' : 'grey-5'"
              :text-color="props.row.estadoPersonal === 'ACTIVO' ? 'white' : 'grey-9'"
            >
              {{ props.row.estadoPersonal }}
            </q-badge>
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
              :icon="props.row.estadoPersonal === 'ACTIVO' ? 'archive' : 'unarchive'"
              :color="props.row.estadoPersonal === 'ACTIVO' ? 'warning' : 'positive'"
              size="sm"
              @click="
                confirmTogglePersonalStatus(
                  props.row,
                  props.row.estadoPersonal === 'ACTIVO' ? 'deshabilitar' : 'habilitar',
                )
              "
              ><q-tooltip>{{
                props.row.estadoPersonal === 'ACTIVO'
                  ? 'Desactivar Personal (Baja Administrativa)'
                  : 'Reactivar Personal'
              }}</q-tooltip></q-btn
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
              @blur="verificarCorreoCorporativoDisponible"
              hint="Correo electrónico corporativo"
              ><template #prepend><q-icon name="mail" /></template
              ><template #append v-if="verificandoCorreo"
                ><q-spinner color="primary" size="20px" /></template
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
                :options="rolesSistema"
                option-label="nombre"
                option-value="idRolSistema"
                emit-value
                map-options
                class="q-mb-md"
                hint="Puedes cambiar el rol del usuario"
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
const loadingCrearCuenta = ref(false)
const verificandoDoc = ref(false)
const verificandoCorreo = ref(false)
const loadingRoles = ref(false)
const rolesSistema = ref([])
const dialogUsuario = ref(false)
const dialogCrearCuenta = ref(false)
const modoEdicion = ref(false)
const usuarioSeleccionado = ref(null)
const personalParaCuenta = ref(null)
const filtro = ref({ busqueda: '', estadoCuenta: null, rol: null, estadoPersonal: null })

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
  {
    name: 'estadoPersonal',
    label: 'Estado Personal',
    field: 'estadoPersonal',
    align: 'center',
    sortable: true,
  },
  { name: 'acciones', label: 'Acciones', align: 'center' },
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

const cargarListadoPersonal = async () => {
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
  if (filtro.value.estadoCuenta) {
    resultado = resultado.filter((u) => u.estadoCuentaAcceso === filtro.value.estadoCuenta)
  }
  if (filtro.value.rol) {
    // filtro.value.rol ya es el nombre del rol gracias a emit-value
    resultado = resultado.filter((u) => u.nombreRol === filtro.value.rol)
  }
  if (filtro.value.estadoPersonal) {
    resultado = resultado.filter((u) => u.estadoPersonal === filtro.value.estadoPersonal)
  }
  usuariosFiltrados.value = resultado
}

const getRowClass = (row) => {
  return row.estadoPersonal === 'INACTIVO' ? 'fila-archivada' : ''
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

const openEditDialog = async (personal) => {
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

  // Cargar roles si no están cargados
  if (rolesSistema.value.length === 0) {
    await cargarRolesSistema()
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

// Función utilitaria para normalizar correos (trim + lowercase)
const normalizarCorreo = (correo) => (correo || '').trim().toLowerCase()

const verificarCorreoCorporativoDisponible = async () => {
  // No verificar si no hay correo ingresado
  if (!formUsuario.value.correoCorporativo) {
    return
  }

  const correoTrimmed = formUsuario.value.correoCorporativo.trim()

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(correoTrimmed)) {
    return // No verificar si el formato es inválido
  }

  verificandoCorreo.value = true
  try {
    console.log('🔄 Verificando disponibilidad de correo corporativo...')

    // Verificar si el correo ya existe en la lista actual de usuarios
    // En modo edición, excluir el registro actual de la comparación
    const correoExiste = usuarios.value.some(
      (u) =>
        u.idPersonal !== formUsuario.value.id &&
        normalizarCorreo(u.correoCorporativo) === normalizarCorreo(correoTrimmed),
    )

    if (correoExiste) {
      $q.notify({
        type: 'warning',
        message: '⚠️ Este correo ya existe en el sistema',
        caption: `El correo ${correoTrimmed} ya está registrado`,
        icon: 'warning',
        position: 'top',
        timeout: 4000,
      })
    }
  } catch (error) {
    console.error('❌ Error al verificar correo:', error)
  } finally {
    verificandoCorreo.value = false
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

  // ✅ Validar que el correo corporativo no esté duplicado
  // NOTA: Esta validación también debe reforzarse en el backend con una restricción
  // UNIQUE sobre CorreoCorporativo en la tabla Personal. Si el backend devuelve 409 Conflict,
  // capturarlo en el catch y mostrar un mensaje claro al usuario.
  if (formUsuario.value.correoCorporativo) {
    const correoNormalizado = normalizarCorreo(formUsuario.value.correoCorporativo)

    // En modo creación: validar contra todos los usuarios
    // En modo edición: validar contra todos excepto el registro actual
    const correoExiste = usuarios.value.some((u) => {
      // En edición, ignorar el propio registro
      if (modoEdicion.value && u.idPersonal === formUsuario.value.id) {
        return false
      }
      return normalizarCorreo(u.correoCorporativo) === correoNormalizado
    })

    if (correoExiste) {
      return $q.notify({
        type: 'negative',
        message: '❌ Este correo ya existe en el sistema',
        caption: 'Usa otro correo corporativo.',
        icon: 'error',
        position: 'top',
        timeout: 5000,
      })
    }
  }

  // ✅ Validar que el documento no esté duplicado (solo en modo creación)
  if (
    !modoEdicion.value &&
    formUsuario.value.documento &&
    formUsuario.value.documento.trim().length >= 8
  ) {
    const documentoTrimmed = formUsuario.value.documento.trim()
    const documentoExiste = usuarios.value.some((u) => u.documento === documentoTrimmed)

    if (documentoExiste) {
      return $q.notify({
        type: 'negative',
        message: '❌ Este documento ya existe en el sistema',
        caption: `El documento ${formUsuario.value.documento} ya está registrado. Por favor, verifica el número de documento.`,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      })
    }
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
      }

      await axios.put(`${baseURL}/api/personal/${formUsuario.value.id}`, datosActualizar, {
        headers: getAuthHeaders(),
      })

      // 🔄 Recargar lista completa desde el backend
      await cargarListadoPersonal()
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
      await cargarListadoPersonal()
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

    await axios.put(
      `${baseURL}/api/usuario/${usuario.idUsuario}`,
      { estado: nuevoEstado },
      {
        headers: getAuthHeaders(),
      },
    )

    // 🔄 Recargar lista completa desde el backend
    await cargarListadoPersonal()

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

const confirmTogglePersonalStatus = async (personalRecord, action) => {
  const idPersonal = personalRecord.idPersonal

  if (action === 'deshabilitar') {
    // Mostrar diálogo con dos opciones para archivar
    if (personalRecord.idUsuario !== null) {
      // Si tiene cuenta de usuario, mostrar ambas opciones
      $q.dialog({
        title: '📁 Desactivar Personal',
        message: `Selecciona cómo deseas archivar a ${personalRecord.nombres} ${personalRecord.apellidos}:`,
        options: {
          type: 'radio',
          model: 'desactivar',
          items: [
            {
              label: '🅰️ Desactivar Cuenta de Usuario y personal (Reversible)',
              value: 'desactivar',
              color: 'warning',
            },
            {
              label: '🅱️ Eliminar Cuenta de Usuario y desactivar personal (Irreversible)',
              value: 'eliminar',
              color: 'negative',
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
          color: 'primary',
        },
        persistent: true,
      }).onOk(async (opcion) => {
        const eliminarUsuario = opcion === 'eliminar'
        await ejecutarDeshabilitarPersonal(personalRecord, eliminarUsuario)
      })
    } else {
      // Si no tiene cuenta de usuario, mostrar confirmación simple antes de archivar
      $q.dialog({
        title: '⚠️ Confirmar Desactivación',
        message: `¿Estás seguro que deseas desactivar a ${personalRecord.nombres} ${personalRecord.apellidos}?`,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey',
        },
        ok: {
          label: 'Sí, desactivar',
          color: 'warning',
        },
        persistent: true,
      }).onOk(async () => {
        await ejecutarDeshabilitarPersonal(personalRecord, false)
      })
    }
  } else if (action === 'habilitar') {
    // Reactivar personal
    $q.dialog({
      title: '🔄 Reactivar Personal',
      message: `¿Confirmas reactivar a ${personalRecord.nombres} ${personalRecord.apellidos}?\n\nNOTA DE SEGURIDAD: Si tiene cuenta de usuario, esta permanecerá INACTIVA y deberás habilitarla manualmente.`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await axios.patch(
          `${baseURL}/api/personal/habilitar/${idPersonal}`,
          {},
          {
            headers: getAuthHeaders(),
          },
        )

        $q.notify({
          type: 'positive',
          message: 'Personal reactivado exitosamente',
          icon: 'unarchive',
          position: 'top',
        })

        await cargarListadoPersonal()
      } catch (error) {
        console.error('❌ Error al reactivar personal:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Error al reactivar personal',
          position: 'top',
        })
      }
    })
  }
}

const ejecutarDeshabilitarPersonal = async (personalRecord, eliminarUsuario) => {
  const idPersonal = personalRecord.idPersonal

  try {
    await axios.patch(
      `${baseURL}/api/personal/deshabilitar/${idPersonal}`,
      { eliminarUsuario },
      {
        headers: getAuthHeaders(),
      },
    )

    const mensaje = eliminarUsuario
      ? 'Personal archivado y cuenta de usuario eliminada permanentemente'
      : 'Personal archivado y cuenta de usuario desactivada'

    $q.notify({
      type: 'positive',
      message: mensaje,
      caption: eliminarUsuario
        ? 'La cuenta de usuario fue eliminada de forma irreversible'
        : 'La cuenta de usuario puede reactivarse posteriormente',
      icon: 'archive',
      position: 'top',
      timeout: 5000,
    })

    await cargarListadoPersonal()
  } catch (error) {
    console.error('❌ Error al archivar personal:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al archivar personal',
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
    await cargarListadoPersonal()
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

onMounted(async () => {
  await Promise.all([cargarListadoPersonal(), cargarRolesSistema()])
})
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>

<style>
/* Estilos para filas archivadas (sin scoped para que afecte a Quasar) */
.fila-archivada {
  background-color: #e0e0e0 !important;
}

.fila-archivada td {
  background-color: #e0e0e0 !important;
}

.fila-archivada:hover {
  background-color: #d5d5d5 !important;
}

.fila-archivada:hover td {
  background-color: #d5d5d5 !important;
}
</style>
