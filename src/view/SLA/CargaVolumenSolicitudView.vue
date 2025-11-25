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
        <div class="row items-center no-wrap">
          <div class="col-auto q-mr-md">
            <q-icon name="description" size="md" color="primary" />
          </div>
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">Plantilla Excel</div>
            <div class="text-body2 text-grey-7">
              Descarga la plantilla para asegurar que tu archivo tiene el formato correcto con todos
              los campos requeridos.
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              unelevated
              icon="download"
              label="Descargar Plantilla"
              @click="handleDownloadTemplate"
            />
          </div>
        </div>
      </q-card>

      <!-- Card de carga -->
      <q-card flat bordered class="q-pa-xl q-mb-lg card-upload">
        <div
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
      </q-card>

      <!-- Card de previsualización -->
      <q-card v-if="totalRows > 0" flat bordered class="q-pa-md card-preview">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle2 text-weight-medium">Previsualización de archivo</div>
          <div class="text-caption text-grey-7">
            Archivo: <strong>{{ selectedFileName }}</strong> · Filas totales:
            <strong>{{ totalRows }}</strong>
          </div>
        </div>

        <div class="q-mb-md text-caption text-grey-7">
          Mostrando las primeras {{ previewRows.length }} filas de {{ totalRows }}.
        </div>

        <!-- Botón de procesamiento -->
        <div class="row justify-end q-mb-md">
          <q-btn
            color="primary"
            unelevated
            icon="send"
            label="Procesar archivo"
            :loading="isProcessing"
            :disable="isProcessing || totalRows === 0 || allRows.length === 0"
            @click="procesarArchivo"
          />
        </div>

        <!-- Tabla simple -->
        <div class="preview-table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in previewColumns" :key="col">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
                <td v-for="col in previewColumns" :key="col">
                  {{ row[col] }}
                </td>
              </tr>
            </tbody>
          </table>
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

// Disparar selector de archivo
const triggerFileSelect = () => {
  fileInputRef.value?.click()
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

  // Limpiar resultado anterior al cargar un nuevo archivo
  resultadoCarga.value = null

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

  isProcessing.value = true
  try {
    // Llamar al backend
    const response = await api.post('/api/SubidaVolumen/solicitudes', allRows.value)

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
    console.error('Error al procesar carga masiva:', error)

    let caption = 'Revisa los datos del archivo o el log del servidor.'
    if (error.response && error.response.data) {
      caption =
        typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || caption
    }

    $q.notify({
      type: 'negative',
      message: 'Error al procesar la carga masiva',
      caption,
      position: 'top-right',
      timeout: 8000,
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

.preview-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table thead {
  background-color: #f3f4f6;
}

.preview-table th {
  padding: 10px;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.preview-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  color: #1f2937;
}

.preview-table tbody tr:hover {
  background-color: #f9fafb;
}

.text-dark {
  color: #1a1a1a;
}
</style>
