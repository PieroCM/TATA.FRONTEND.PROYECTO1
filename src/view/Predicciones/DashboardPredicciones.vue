<template>
  <q-page padding>
    <!-- Toolbar con Título y Acciones -->
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="col-12 col-md-6">
        <div class="text-h4 text-h5-sm text-weight-bold">
          <q-icon
            name="analytics"
            color="primary"
            :size="$q.screen.gt.xs ? '36px' : '28px'"
            class="q-mr-sm"
          />
          <span :class="$q.screen.gt.xs ? '' : 'text-h6'">Predicciones de SLA</span>
        </div>
        <div class="text-subtitle2 text-caption-sm text-grey-7 q-mt-xs">
          📊 Predicción de solicitudes <strong>EN PROCESO</strong>: cuáles cumplirán y cuáles no
          cumplirán el SLA
        </div>
      </div>

      <div class="col-12 col-md-6" :class="$q.screen.gt.sm ? 'text-right' : 'text-left'">
        <div class="row q-col-gutter-xs" :class="$q.screen.gt.sm ? 'justify-end' : 'justify-start'">
          <div class="col-12 col-sm-auto">
            <q-btn
              :label="$q.screen.gt.xs ? 'Exportar PDF' : 'PDF'"
              icon="picture_as_pdf"
              color="secondary"
              @click="exportarPDF"
              :loading="exportando"
              :disable="loading || exportando || predicciones.length === 0"
              :size="$q.screen.gt.xs ? 'md' : 'sm'"
              class="full-width"
              unelevated
            >
              <q-tooltip>Exportar reporte completo a PDF</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              :label="$q.screen.gt.xs ? 'Actualizar' : 'Actualizar'"
              icon="refresh"
              color="primary"
              @click="actualizarDatos"
              :loading="loading"
              :disable="loading"
              :size="$q.screen.gt.xs ? 'md' : 'sm'"
              class="full-width"
              unelevated
            >
              <q-tooltip>Recargar predicciones desde el servidor</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicadores Clave (KPIs) - Predicción Clara -->
    <div
      class="row q-col-gutter-sm q-col-gutter-md-md q-mb-lg"
      v-if="!loading && predicciones.length > 0"
    >
      <!-- Total EN PROCESO -->
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="kpi-card bg-blue-grey-7 text-white">
          <q-card-section :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row items-center no-wrap">
              <q-icon
                name="hourglass_empty"
                :size="$q.screen.gt.xs ? 'md' : 'sm'"
                class="q-mr-sm"
              />
              <div class="col">
                <div :class="$q.screen.gt.xs ? 'text-h4' : 'text-h5'" class="text-weight-bold">
                  {{ predicciones.length }}
                </div>
                <div
                  :class="$q.screen.gt.xs ? 'text-subtitle2' : 'text-caption'"
                  class="text-weight-bold"
                >
                  EN PROCESO
                </div>
                <div class="text-caption" v-if="$q.screen.gt.xs">Solicitudes activas</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- NO VAN A CUMPLIR -->
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="kpi-card bg-negative text-white">
          <q-card-section :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row items-center no-wrap">
              <q-icon name="cancel" :size="$q.screen.gt.xs ? 'md' : 'sm'" class="q-mr-sm" />
              <div class="col">
                <div :class="$q.screen.gt.xs ? 'text-h4' : 'text-h5'" class="text-weight-bold">
                  {{ contadorNoCumpliran }}
                </div>
                <div
                  :class="$q.screen.gt.xs ? 'text-subtitle2' : 'text-caption'"
                  class="text-weight-bold"
                >
                  NO VAN A CUMPLIR
                </div>
                <div class="text-caption" v-if="$q.screen.gt.xs">Probabilidad ≥ 50%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- VAN A CUMPLIR -->
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="kpi-card bg-positive text-white">
          <q-card-section :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row items-center no-wrap">
              <q-icon name="check_circle" :size="$q.screen.gt.xs ? 'md' : 'sm'" class="q-mr-sm" />
              <div class="col">
                <div :class="$q.screen.gt.xs ? 'text-h4' : 'text-h5'" class="text-weight-bold">
                  {{ contadorCumpliran }}
                </div>
                <div
                  :class="$q.screen.gt.xs ? 'text-subtitle2' : 'text-caption'"
                  class="text-weight-bold"
                >
                  VAN A CUMPLIR
                </div>
                <div class="text-caption" v-if="$q.screen.gt.xs">Probabilidad &lt; 50%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Promedio Riesgo -->
      <div class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="kpi-card bg-orange text-white">
          <q-card-section :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row items-center no-wrap">
              <q-icon name="trending_up" :size="$q.screen.gt.xs ? 'md' : 'sm'" class="q-mr-sm" />
              <div class="col">
                <div :class="$q.screen.gt.xs ? 'text-h4' : 'text-h5'" class="text-weight-bold">
                  {{ promedioRiesgo }}%
                </div>
                <div :class="$q.screen.gt.xs ? 'text-subtitle2' : 'text-caption'">
                  Riesgo Promedio
                </div>
                <div class="text-caption" v-if="$q.screen.gt.xs">De incumplimiento</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Predicciones -->
    <q-card flat bordered>
      <q-card-section>
        <!-- Estado de Carga -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-dots color="primary" size="50px" />
          <div class="text-subtitle1 text-grey-7 q-mt-md">Cargando predicciones...</div>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="text-center q-pa-xl">
          <q-icon name="error_outline" size="64px" color="negative" />
          <div class="text-h6 text-negative q-mt-md">Error al cargar las predicciones</div>
          <div class="text-body2 text-grey-7 q-mt-sm">{{ error }}</div>
          <q-btn
            label="Reintentar"
            icon="refresh"
            color="primary"
            @click="cargarPredicciones"
            class="q-mt-md"
            unelevated
          />
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="predicciones.length === 0" class="text-center q-pa-xl">
          <q-icon name="info_outline" size="64px" color="info" />
          <div class="text-h6 text-grey-7 q-mt-md">No hay predicciones disponibles</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            No se encontraron predicciones actuales. Intente actualizar los datos o verificar que el
            servicio de ML esté activo.
          </div>
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="primary"
            @click="cargarPredicciones"
            class="q-mt-md"
            unelevated
          />
        </div>

        <!-- Componente de Tabla con Predicciones -->
        <PrediccionTable
          v-if="!loading && !error && predicciones.length > 0"
          :predicciones="predicciones"
          :loading="loading"
          @filtros-cambiados="manejarFiltrosCambiados"
        />
      </q-card-section>
    </q-card>

    <!-- Información del Sistema y Modelo -->
    <q-card flat bordered class="q-mt-md" v-if="!loading && predicciones.length > 0">
      <q-card-section>
        <div :class="$q.screen.gt.xs ? 'text-h6' : 'text-subtitle1'" class="q-mb-md">
          <q-icon name="info" color="info" class="q-mr-sm" />
          Información del Sistema
        </div>

        <div class="row q-col-gutter-sm q-col-gutter-md-md">
          <!-- Columna 1: Predicciones -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="text-caption text-grey-7">Total de Predicciones:</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              {{ predicciones.length }} solicitudes analizadas
            </div>
          </div>

          <!-- Columna 2: Última actualización -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="text-caption text-grey-7">Última actualización:</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              {{ formatearFechaActualizacion() }}
            </div>
          </div>

          <!-- Columna 3: Estado -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="text-caption text-grey-7">Estado del servicio:</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              <q-badge color="positive" label="Operativo" />
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Información del Modelo -->
        <div
          :class="$q.screen.gt.xs ? 'text-subtitle1' : 'text-subtitle2'"
          class="q-mb-sm text-weight-medium"
        >
          <q-icon name="psychology" color="primary" class="q-mr-xs" />
          Modelo de Machine Learning
        </div>

        <div v-if="modeloInfo" class="row q-col-gutter-sm q-col-gutter-md-md">
          <!-- Registros de Entrenamiento -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="text-caption text-grey-7">Registros de Entrenamiento:</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              {{ modeloInfo.registros ? modeloInfo.registros.toLocaleString() : 'N/A' }}
            </div>
          </div>

          <!-- Precisión -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="text-caption text-grey-7">Precisión (Accuracy):</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              {{ modeloInfo.accuracy ? (modeloInfo.accuracy * 100).toFixed(1) + '%' : 'N/A' }}
            </div>
          </div>

          <!-- Rango de Fechas -->
          <div class="col-12 col-sm-12 col-md-4">
            <div class="text-caption text-grey-7">Rango de Datos de Entrenamiento:</div>
            <div :class="$q.screen.gt.xs ? 'text-body1' : 'text-body2'" class="text-weight-medium">
              <span v-if="modeloInfo.fecha_inicio && modeloInfo.fecha_fin">
                {{ modeloInfo.fecha_inicio }} a {{ modeloInfo.fecha_fin }}
              </span>
              <span v-else class="text-primary">
                <q-icon name="all_inclusive" /> Todos los datos históricos
              </span>
            </div>
          </div>
        </div>

        <div v-else class="text-caption text-grey-6">
          <q-icon name="info_outline" size="sm" />
          Cargando información del modelo...
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PrediccionTable from 'src/components/SLA/PrediccionTable.vue'
import { getPrediccionesActuales } from 'src/api/slaML.api'

// Composables
const $q = useQuasar()

// Estado
const predicciones = ref([])
const loading = ref(false)
const error = ref(null)
const fechaActualizacion = ref(null)
const modeloInfo = ref(null)
const exportando = ref(false)

// Computed - Predicciones claras y entendibles
const contadorNoCumpliran = computed(() => {
  // Predicción: NO VA A CUMPLIR (probabilidad >= 50%)
  return predicciones.value.filter((p) => p.probabilidadIncumplimiento >= 0.5).length
})

const contadorCumpliran = computed(() => {
  // Predicción: VA A CUMPLIR (probabilidad < 50%)
  return predicciones.value.filter((p) => p.probabilidadIncumplimiento < 0.5).length
})

const promedioRiesgo = computed(() => {
  if (predicciones.value.length === 0) return 0
  const suma = predicciones.value.reduce((acc, p) => acc + p.probabilidadIncumplimiento * 100, 0)
  return (suma / predicciones.value.length).toFixed(1)
}) // Métodos
const exportarPDF = async () => {
  exportando.value = true

  try {
    const jsPDF = (await import('jspdf')).jsPDF
    const autoTable = (await import('jspdf-autotable')).default

    $q.loading.show({
      message:
        'Generando PDF profesional...<br/><span class="text-caption">Por favor espera</span>',
      html: true,
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPos = 15

    // === ENCABEZADO ===
    // Logo o título principal
    pdf.setFillColor(41, 128, 185) // Azul corporativo
    pdf.rect(0, 0, pageWidth, 25, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('REPORTE DE PREDICCIONES SLA', pageWidth / 2, 12, { align: 'center' })

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    pdf.text(`Generado: ${fechaHoy}`, pageWidth / 2, 19, { align: 'center' })

    yPos = 32

    // === RESUMEN EJECUTIVO ===
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESUMEN EJECUTIVO', 14, yPos)

    yPos += 8

    // KPIs en recuadros
    const kpiWidth = (pageWidth - 40) / 4
    const kpiHeight = 20
    const kpiStartX = 14

    const kpis = [
      { label: 'EN PROCESO', value: predicciones.value.length, color: [96, 125, 139] },
      { label: 'NO VAN A CUMPLIR', value: contadorNoCumpliran.value, color: [244, 67, 54] },
      { label: 'VAN A CUMPLIR', value: contadorCumpliran.value, color: [76, 175, 80] },
      { label: 'RIESGO PROMEDIO', value: `${promedioRiesgo.value}%`, color: [255, 152, 0] },
    ]

    kpis.forEach((kpi, index) => {
      const x = kpiStartX + index * (kpiWidth + 2)

      // Fondo del KPI
      pdf.setFillColor(...kpi.color)
      pdf.roundedRect(x, yPos, kpiWidth, kpiHeight, 2, 2, 'F')

      // Valor
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(String(kpi.value), x + kpiWidth / 2, yPos + 9, { align: 'center' })

      // Label
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(kpi.label, x + kpiWidth / 2, yPos + 15, { align: 'center' })
    })

    yPos += 28

    // === INFORMACIÓN DEL MODELO ===
    if (modeloInfo.value) {
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('INFORMACIÓN DEL MODELO ML', 14, yPos)

      yPos += 6
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      const infoModelo = [
        `Registros de entrenamiento: ${modeloInfo.value.registros?.toLocaleString() || 'N/A'}`,
        `Precisión (Accuracy): ${modeloInfo.value.accuracy ? (modeloInfo.value.accuracy * 100).toFixed(1) + '%' : 'N/A'}`,
        `Rango de datos: ${
          modeloInfo.value.fecha_inicio && modeloInfo.value.fecha_fin
            ? `${modeloInfo.value.fecha_inicio} a ${modeloInfo.value.fecha_fin}`
            : 'Todos los datos históricos'
        }`,
      ]

      infoModelo.forEach((info) => {
        pdf.text(`• ${info}`, 16, yPos)
        yPos += 5
      })

      yPos += 3
    }

    // === TABLA DE PREDICCIONES ===
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DETALLE DE PREDICCIONES', 14, yPos)

    yPos += 5

    // Preparar datos de la tabla
    const tableData = predicciones.value.map((p) => [
      p.idSolicitud,
      p.codigoSla,
      p.estadoCumplimientoSla || 'N/A',
      p.nombreRol || 'N/A',
      p.diasRestantes,
      p.probabilidadIncumplimiento >= 0.5 ? 'NO VA A CUMPLIR' : 'VA A CUMPLIR',
      `${(p.probabilidadIncumplimiento * 100).toFixed(1)}%`,
      p.nivelRiesgo || 'N/A',
    ])

    autoTable(pdf, {
      startY: yPos,
      head: [['ID', 'Tipo SLA', 'Estado', 'Rol', 'Días Rest.', 'Predicción', 'Prob. %', 'Riesgo']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'center', cellWidth: 32 },
        3: { halign: 'left', cellWidth: 50 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 35 },
        6: { halign: 'center', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 20 },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didParseCell: (data) => {
        // Colorear predicción
        if (data.column.index === 5) {
          if (data.cell.raw === 'NO VA A CUMPLIR') {
            data.cell.styles.textColor = [244, 67, 54]
            data.cell.styles.fontStyle = 'bold'
          } else {
            data.cell.styles.textColor = [76, 175, 80]
            data.cell.styles.fontStyle = 'bold'
          }
        }

        // Colorear nivel de riesgo
        if (data.column.index === 7) {
          const riesgo = data.cell.raw
          if (riesgo === 'CRITICO') {
            data.cell.styles.fillColor = [244, 67, 54]
            data.cell.styles.textColor = [255, 255, 255]
            data.cell.styles.fontStyle = 'bold'
          } else if (riesgo === 'ALTO') {
            data.cell.styles.fillColor = [255, 152, 0]
            data.cell.styles.textColor = [255, 255, 255]
          } else if (riesgo === 'MEDIO') {
            data.cell.styles.fillColor = [255, 235, 59]
            data.cell.styles.textColor = [0, 0, 0]
          } else if (riesgo === 'BAJO') {
            data.cell.styles.fillColor = [76, 175, 80]
            data.cell.styles.textColor = [255, 255, 255]
          }
        }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        // Pie de página en cada página
        const pageCount = pdf.internal.getNumberOfPages()
        const pageCurrent = pdf.internal.getCurrentPageInfo().pageNumber

        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: 'center',
        })

        pdf.text('Sistema de Gestión SLA - Reporte Confidencial', 14, pageHeight - 10)
      },
    })

    // Generar nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0]
    const nombreArchivo = `Reporte_Predicciones_SLA_${fecha}.pdf`

    // Descargar PDF
    pdf.save(nombreArchivo)

    $q.notify({
      type: 'positive',
      message: 'PDF generado exitosamente',
      caption: `${nombreArchivo} - ${predicciones.value.length} registros`,
      position: 'top-right',
      timeout: 3000,
    })
  } catch (err) {
    // console.error('❌ Error al exportar PDF:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF',
      caption: err.message,
      position: 'top-right',
      timeout: 4000,
    })
  } finally {
    exportando.value = false
    $q.loading.hide()
  }
}

const cargarInfoModelo = async () => {
  try {
    const axios = (await import('axios')).default
    const response = await axios.get('http://localhost:8000/modelo/info')
    modeloInfo.value = response.data
    // console.log('🤖 Info del modelo:', modeloInfo.value)
  } catch (err) {
    // console.error('❌ Error al cargar info del modelo:', err)
    modeloInfo.value = null
  }
}

const cargarPredicciones = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await getPrediccionesActuales()
    // console.log('📊 Datos recibidos:', data)
    // console.log('📊 Tipo de datos:', typeof data)
    // console.log('📊 Es array?:', Array.isArray(data))
    // console.log('📊 Longitud:', data?.length)
    if (data && data.length > 0) {
      // console.log('📊 Primer elemento:', data[0])
      // console.log('📊 Campos disponibles:', Object.keys(data[0]))
      // console.log('📊 Estado Cumplimiento:', data[0].estadoCumplimientoSla)
    }

    predicciones.value = data || []
    fechaActualizacion.value = new Date()

    // Cargar info del modelo
    await cargarInfoModelo()

    if (predicciones.value.length > 0) {
      $q.notify({
        type: 'positive',
        message: `${predicciones.value.length} predicciones cargadas correctamente`,
        position: 'top-right',
        timeout: 2000,
      })
    }
  } catch (err) {
    // console.error('❌ Error completo:', err)
    error.value = err.message || 'Error desconocido al cargar predicciones'
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las predicciones',
      caption: error.value,
      position: 'top-right',
      timeout: 4000,
    })
  } finally {
    loading.value = false
  }
}

const actualizarDatos = async () => {
  await cargarPredicciones()
}

const manejarFiltrosCambiados = (_filtros) => {
  // console.log('Filtros cambiados:', _filtros)
  // Los filtros se manejan internamente en el componente PrediccionTable
  // Este evento se puede usar para logging o analytics
}

const formatearFechaActualizacion = () => {
  if (!fechaActualizacion.value) return 'N/A'

  const fecha = fechaActualizacion.value
  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  cargarPredicciones()
})
</script>

<style scoped>
.kpi-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  height: 100%;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Responsive text sizes */
@media (max-width: 599px) {
  .text-h5-sm {
    font-size: 1.25rem !important;
  }

  .text-caption-sm {
    font-size: 0.75rem !important;
  }
}

/* Ensure cards have consistent height in grid */
.kpi-card .q-card__section {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
