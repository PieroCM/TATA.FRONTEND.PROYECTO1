<!--
  Vista de Carga de Volumen de Solicitudes SLA.
  Permite cargar archivos Excel, realizar drag & drop, y previsualizar datos.
-->
<template>
  <q-page class="q-pa-xl bg-grey-1">
    <div class="max-width-page">
      <!-- Encabezado -->
      <div class="q-mb-lg">
        <div class="text-h5 text-weight-bold text-dark">Carga Datos SLA</div>
        <div class="text-body2 text-grey-7">
          Importa datos desde archivos Excel para procesamiento de SLA
        </div>
      </div>

      <!-- Card Plantilla Excel -->
      <q-card flat bordered class="q-pa-md q-mb-lg card-plantilla">
        <div class="row items-center q-col-gutter-md plantilla-content">
          <div class="col-auto plantilla-icon">
            <q-icon name="description" size="md" color="primary" />
          </div>
          <div class="col-12 col-sm plantilla-text">
            <div class="text-subtitle1 text-weight-medium">Plantilla Excel</div>
            <div class="text-body2 text-grey-7">
              Descarga la plantilla para asegurar que tu archivo tiene el formato correcto con todos
              los campos requeridos.
            </div>
          </div>
          <div class="col-12 col-sm-auto plantilla-button">
            <q-btn
              color="primary"
              unelevated
              icon="download"
              label="Descargar Plantilla"
              class="full-width-mobile"
              @click="handleDownloadTemplate"
            />
          </div>
        </div>
      </q-card>

      <!-- Card de carga / Archivo cargado -->
      <q-card flat bordered class="q-pa-xl q-mb-lg card-upload">
        <!-- Zona de carga (cuando NO hay archivo) -->
        <div
          v-if="!selectedFileName"
          class="upload-drop-area column items-center justify-center"
          :class="{ 'upload-drop-area--dragging': isDragging }"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop="onFileDrop"
        >
          <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-md" />
          <div class="text-subtitle2 q-mb-xs">
            Arrastra tu archivo aquí o haz clic para seleccionar
          </div>
          <div class="text-caption text-grey-7 q-mb-md">Formato soportado: .xlsx (Excel)</div>
          <q-btn flat color="primary" label="Seleccionar Archivo" @click="triggerFileSelect" />
          <input
            ref="fileInputRef"
            type="file"
            class="hidden-file-input"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @change="onFileSelected"
          />
        </div>

        <!-- Card de archivo cargado -->
        <div v-else class="file-loaded-card">
          <div class="row items-center q-mb-md">
            <q-icon name="insert_drive_file" size="36px" color="positive" class="q-mr-md" />
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ selectedFileName }}</div>
              <div class="text-caption text-grey-7">{{ totalRows }} filas detectadas</div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="grey-7"
              @click="limpiarArchivo"
              class="q-ml-sm"
            >
              <q-tooltip>Eliminar archivo</q-tooltip>
            </q-btn>
          </div>

          <!-- Botones de acción -->
          <div class="row q-col-gutter-sm action-buttons">
            <div class="col-12 col-sm-6">
              <q-btn
                unelevated
                :color="mostrarPreview ? 'grey-7' : 'secondary'"
                :icon="mostrarPreview ? 'visibility_off' : 'visibility'"
                :label="mostrarPreview ? 'Ocultar Previsualización' : 'Previsualizar Datos'"
                class="full-width"
                :disable="totalRows === 0"
                @click="togglePrevisualizacion"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-btn
                unelevated
                color="primary"
                icon="send"
                label="Procesar Archivo"
                class="full-width"
                :loading="isProcessing"
                :disable="isProcessing || totalRows === 0 || allRows.length === 0"
                @click="procesarArchivo"
              />
            </div>
          </div>

          <!-- Botón para seleccionar otro archivo -->
          <div class="text-center q-mt-md">
            <q-btn
              flat
              dense
              color="primary"
              label="Seleccionar otro archivo"
              icon="sync"
              size="sm"
              @click="triggerFileSelect"
            />
            <input
              ref="fileInputRef"
              type="file"
              class="hidden-file-input"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              @change="onFileSelected"
            />
          </div>
        </div>
      </q-card>

      <!-- Card de previsualización -->
      <q-card v-if="mostrarPreview && totalRows > 0" flat bordered class="q-pa-md card-preview">
        <div class="preview-header q-mb-md">
          <div class="row items-center justify-between">
            <div class="col-12 col-md-auto">
              <div class="text-h6 text-weight-bold text-dark">Previsualización de Datos</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                Archivo: <strong>{{ selectedFileName }}</strong>
              </div>
            </div>
            <div class="col-12 col-md-auto q-mt-sm q-mt-md-none">
              <q-chip color="primary" text-color="white" icon="table_chart">
                {{ previewRows.length }} de {{ totalRows }} filas
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Tabla responsive con scroll horizontal -->
        <div class="table-scroll-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in previewColumns" :key="col" class="table-header">
                  {{ formatColumnName(col) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
                <td v-for="col in previewColumns" :key="col">
                  {{ formatCellValue(row[col]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="q-mt-md text-caption text-grey-7 text-center">
          <q-icon name="info" size="16px" class="q-mr-xs" />
          Mostrando las primeras {{ previewRows.length }} filas. El archivo completo tiene
          {{ totalRows }} filas.
        </div>
      </q-card>

      <!-- Card de resultado de carga -->
      <q-card v-if="resultadoCarga" flat bordered class="q-pa-md q-mb-lg card-result">
        <div class="row items-center q-mb-md">
          <q-icon name="task_alt" size="md" color="positive" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-medium">Resultado de la última carga masiva</div>
        </div>

        <!-- Resumen estadístico -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <div class="result-stat">
              <div class="text-caption text-grey-7">Total de filas</div>
              <div class="text-h6 text-weight-bold text-dark">
                {{ resultadoCarga.totalFilas }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="result-stat">
              <div class="text-caption text-grey-7">Filas exitosas</div>
              <div class="text-h6 text-weight-bold text-positive">
                {{ resultadoCarga.filasExitosas }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="result-stat">
              <div class="text-caption text-grey-7">Filas con error</div>
              <div class="text-h6 text-weight-bold text-negative">
                {{ resultadoCarga.filasConError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de errores -->
        <div v-if="resultadoCarga.errores && resultadoCarga.errores.length > 0" class="q-mt-md">
          <div class="text-subtitle2 text-weight-medium q-mb-sm">Detalle de errores</div>
          <div class="error-table-wrapper">
            <table class="error-table">
              <thead>
                <tr>
                  <th style="width: 100px">Fila</th>
                  <th>Mensaje de error</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(error, index) in resultadoCarga.errores" :key="index">
                  <td class="text-center text-weight-medium">{{ error.rowIndex }}</td>
                  <td>{{ error.mensaje }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import * as XLSX from 'xlsx'
import { getUserIdFromToken } from 'src/utils/jwt'

const $q = useQuasar()

// Estado reactivo
const selectedFileName = ref('')
const totalRows = ref(0)
const previewRows = ref([])
const previewColumns = ref([])
const allRows = ref([]) // Todas las filas del Excel para enviar al backend
const isDragging = ref(false)
const fileInputRef = ref(null)
const isProcessing = ref(false)
const resultadoCarga = ref(null) // Resultado completo del backend
const mostrarPreview = ref(false) // Control de previsualización

// Disparar selector de archivo
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

// Limpiar archivo cargado
const limpiarArchivo = () => {
  selectedFileName.value = ''
  totalRows.value = 0
  previewRows.value = []
  previewColumns.value = []
  allRows.value = []
  mostrarPreview.value = false
  resultadoCarga.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Toggle previsualización (mostrar/ocultar)
const togglePrevisualizacion = () => {
  mostrarPreview.value = !mostrarPreview.value
}

// Formatear nombre de columna (capitalizar y reemplazar guiones bajos)
const formatColumnName = (columnName) => {
  if (!columnName) return ''
  return columnName
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Formatear valor de celda
const formatCellValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') {
    return value.toLocaleString('es-PE')
  }
  return value.toString()
}

// Manejar archivo seleccionado desde input
const onFileSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  handleFile(file)
}

// Eventos de drag & drop
const onDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onFileDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  handleFile(file)
}

// Lógica central para procesar archivo
const handleFile = (file) => {
  // Validar formato
  if (!file.name.endsWith('.xlsx')) {
    $q.notify({
      type: 'negative',
      message: 'Formato no soportado',
      caption: 'Solo se aceptan archivos .xlsx (Excel)',
      position: 'top-right',
    })
    return
  }

  selectedFileName.value = file.name

  // Limpiar resultado y preview anterior al cargar un nuevo archivo
  resultadoCarga.value = null
  mostrarPreview.value = false

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      // Tomar la primera hoja
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      totalRows.value = json.length

      if (json.length === 0) {
        allRows.value = []
        previewRows.value = []
        previewColumns.value = []
        $q.notify({
          type: 'warning',
          message: 'Archivo vacío',
          caption: 'El archivo no contiene datos para procesar',
          position: 'top-right',
        })
        return
      }

      // Guardar TODAS las filas para envío al backend
      allRows.value = json

      // Mostrar primeras 10 filas
      previewRows.value = json.slice(0, 10)

      // Las columnas serán las keys del primer objeto
      previewColumns.value = Object.keys(json[0] ?? {})

      $q.notify({
        type: 'positive',
        message: 'Archivo cargado correctamente',
        caption: `Se detectaron ${totalRows.value} filas de datos`,
        position: 'top-right',
      })
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al procesar el archivo',
        caption: error.message || 'Intenta con otro archivo',
        position: 'top-right',
      })
    }
  }

  reader.onerror = () => {
    $q.notify({
      type: 'negative',
      message: 'Error al leer el archivo',
      caption: 'No se pudo leer el archivo. Intenta de nuevo.',
      position: 'top-right',
    })
  }

  reader.readAsArrayBuffer(file)
}

// Descargar plantilla
const handleDownloadTemplate = () => {
  $q.notify({
    type: 'info',
    message: 'Descarga de plantilla',
    caption: 'La funcionalidad está en desarrollo',
    position: 'top-right',
  })
}

// Procesar archivo y enviar al backend
const procesarArchivo = async () => {
  if (!allRows.value || allRows.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para procesar',
      caption: 'Primero carga un archivo Excel válido.',
      position: 'top-right',
    })
    return
  }

  // Obtener ID del usuario logueado
  const idUsuario = getUserIdFromToken()
  if (!idUsuario) {
    $q.notify({
      type: 'negative',
      message: 'Error de autenticación',
      caption: 'No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.',
      position: 'top-right',
    })
    return
  }

  isProcessing.value = true
  try {
    console.log('📤 Enviando datos al backend:', {
      idUsuarioCreador: idUsuario,
      totalFilas: allRows.value.length,
      primeraFila: allRows.value[0],
      columnas: Object.keys(allRows.value[0] || {}),
    })

    // Llamar al backend con el nuevo endpoint que requiere idUsuarioCreador en query string
    const response = await api.post(
      `/api/SubidaVolumen/solicitudes?idUsuarioCreador=${idUsuario}`,
      allRows.value,
    )

    // La API devuelve un BulkUploadResultDto:
    // {
    //   totalFilas: number,
    //   filasExitosas: number,
    //   filasConError: number,
    //   errores: [{ rowIndex, mensaje }, ...]
    // }

    const data = response.data

    // Guardar resultado completo del backend
    resultadoCarga.value = data

    $q.notify({
      type: 'positive',
      message: 'Carga masiva procesada correctamente',
      caption: `Total: ${data.totalFilas} | Exitosas: ${data.filasExitosas} | Con error: ${data.filasConError}`,
      position: 'top-right',
      timeout: 6000,
    })
  } catch (error) {
    console.error('❌ Error al procesar carga masiva:', error)
    console.error('📋 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    })

    let caption = 'Revisa los datos del archivo o el log del servidor.'
    let detailMessage = ''

    if (error.response?.data) {
      const errorData = error.response.data

      // Si es un objeto con propiedades específicas
      if (typeof errorData === 'object') {
        detailMessage = errorData.message || errorData.title || JSON.stringify(errorData)

        // Si hay errores de validación (ModelState)
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
            )
            .join(' | ')
          caption = `Errores de validación: ${validationErrors}`
        } else {
          caption = detailMessage
        }
      } else {
        caption = String(errorData)
      }
    }

    $q.notify({
      type: 'negative',
      message: 'Error al procesar la carga masiva',
      caption: caption || 'Revisa la consola del navegador para más detalles',
      position: 'top-right',
      timeout: 10000,
      actions: [
        { label: 'Ver consola', color: 'white', handler: () => console.table(allRows.value) },
      ],
    })
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.max-width-page {
  max-width: 900px;
  margin: 0 auto;
}

.card-plantilla {
  background-color: #f5f7ff;
  border-color: #e0e6ff !important;
}

.card-upload {
  background-color: #fafbff;
  border-color: #e0e6ff !important;
}

.card-preview {
  background-color: #ffffff;
  border-color: #e0e6ff !important;
}

.card-result {
  background-color: #f0fdf4;
  border-color: #bbf7d0 !important;
}

.result-stat {
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.error-table-wrapper {
  overflow-x: auto;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background-color: #fef2f2;
}

.error-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.error-table thead {
  background-color: #fee2e2;
}

.error-table th {
  padding: 10px;
  border-bottom: 2px solid #fecaca;
  text-align: left;
  font-weight: 600;
  color: #991b1b;
}

.error-table td {
  padding: 10px;
  border-bottom: 1px solid #fecaca;
  color: #7f1d1d;
  background-color: white;
}

.error-table tbody tr:hover {
  background-color: #fef2f2;
}

.upload-drop-area {
  border: 2px dashed #d0d7e2;
  border-radius: 16px;
  padding: 40px 24px;
  min-height: 280px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  cursor: pointer;
}

.upload-drop-area--dragging {
  background-color: #eef2ff;
  border-color: #4f46e5;
}

.hidden-file-input {
  display: none;
}

/* Card de archivo cargado */
.file-loaded-card {
  padding: 16px;
  background-color: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
}

.action-buttons {
  margin-top: 16px;
}

/* Tabla de previsualización con scroll horizontal */
.table-scroll-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  -webkit-overflow-scrolling: touch;
}

.table-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.preview-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.preview-table .table-header {
  padding: 14px 12px;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  color: #1f2937;
  background-color: #ffffff;
}

.preview-table tbody tr:nth-child(even) td {
  background-color: #f9fafb;
}

.preview-table tbody tr:hover td {
  background-color: #f3f4f6;
}

.preview-header {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 16px;
}

.text-dark {
  color: #1a1a1a;
}

/* Card plantilla responsive */
.plantilla-content {
  align-items: center;
}

.plantilla-icon {
  display: none;
}

.full-width-mobile {
  width: auto;
}

/* Responsive */
@media (min-width: 769px) {
  .plantilla-icon {
    display: block;
  }
}

@media (max-width: 768px) {
  .max-width-page {
    padding: 16px;
  }

  .q-pa-xl {
    padding: 16px !important;
  }

  .upload-drop-area {
    min-height: 200px;
    padding: 24px 16px;
  }

  .file-loaded-card {
    padding: 12px;
  }

  .preview-table {
    min-width: 600px;
    font-size: 12px;
  }

  .preview-table .table-header {
    padding: 10px 8px;
    font-size: 11px;
  }

  .preview-table td {
    padding: 10px 8px;
  }

  .preview-header .text-h6 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .max-width-page {
    padding: 12px;
  }

  .card-plantilla,
  .card-upload,
  .card-preview,
  .card-result {
    padding: 12px !important;
  }

  .plantilla-button {
    margin-top: 8px;
  }

  .full-width-mobile {
    width: 100%;
  }

  .plantilla-text .text-subtitle1 {
    font-size: 15px;
  }

  .plantilla-text .text-body2 {
    font-size: 12px;
  }

  .upload-drop-area {
    min-height: 180px;
    padding: 20px 12px;
  }

  .preview-table {
    min-width: 500px;
    font-size: 11px;
  }

  .preview-table .table-header {
    padding: 8px 6px;
    font-size: 10px;
  }

  .preview-table td {
    padding: 8px 6px;
  }

  .action-buttons .q-btn {
    font-size: 13px;
    padding: 8px 12px;
  }

  .result-stat {
    padding: 8px;
  }
}
</style>
