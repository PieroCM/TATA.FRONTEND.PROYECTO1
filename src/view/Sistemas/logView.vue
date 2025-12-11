<template>
  <div class="logs-container">
    <!-- CABECERA -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">Logs del Sistema</h1>
        <p class="page-subtitle">Registro de eventos y errores de la aplicación</p>
      </div>

      <q-btn-dropdown
        unelevated
        class="export-btn"
        no-caps
        label="Exportar Logs"
        icon="download"
        dropdown-icon="expand_more"
      >
        <q-list>
          <q-item clickable v-close-popup @click="exportPDF">
            <q-item-section avatar>
              <q-icon name="picture_as_pdf" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Exportar como PDF</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- RESUMEN -->
    <div class="summary-row">
      <SummaryCard type="info" :count="counts.info" />
      <!--<SummaryCard type="success" :count="counts.success" />-->
      <SummaryCard type="warning" :count="counts.warning" />
      <!-- <SummaryCard type="error" :count="counts.error" />-->
    </div>

    <!-- FILTROS -->
    <div class="filter-bar">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Buscar en mensajes o detalles..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>

      <q-select
        v-model="selectedLevel"
        outlined
        dense
        :options="levelOptions"
        class="filter-select"
      >
        <template v-slot:prepend>
          <q-icon name="filter_list" color="grey-6" />
        </template>
      </q-select>

      <q-select
        v-model="selectedRole"
        :options="rolesOptions"
        outlined
        dense
        label="Filtrar por rol"
        clearable
        class="role-input"
      >
        <template v-slot:prepend>
          <q-icon name="badge" color="grey-6" />
        </template>
      </q-select>

      <q-input
        v-model="fechaInicio"
        outlined
        dense
        type="date"
        label="Desde"
        clearable
        class="date-input"
      >
        <template v-slot:prepend>
          <q-icon name="event" color="grey-6" />
        </template>
      </q-input>

      <q-input
        v-model="fechaFin"
        outlined
        dense
        type="date"
        label="Hasta"
        clearable
        class="date-input"
      >
        <template v-slot:prepend>
          <q-icon name="event" color="grey-6" />
        </template>
      </q-input>
    </div>

    <!-- TABLA DE LOGS -->
    <LogItem :logs="paginatedLogs" :loading="loading" />

    <!-- PAGINACIÓN -->
    <div v-if="filteredLogs.length > 0" class="pagination-container">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="7"
        boundary-numbers
        direction-links
        color="primary"
        active-design="unelevated"
        active-color="primary"
        active-text-color="white"
      />
      <p class="pagination-info">
        Mostrando {{ startRecord }} - {{ endRecord }} de {{ filteredLogs.length }} registros
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SummaryCard from '../../components/compLogView/SummaryCard.vue'
import LogItem from '../../components/compLogView/LogItem.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import tataLogo from 'src/assets/Tata_logo.png?base64'
import { api } from 'src/boot/axios'

/* ------------------------------
    VARIABLES REACTIVAS
--------------------------------*/
const logs = ref([])
const enrichedLogs = ref([])
const loading = ref(false)

// Datos para enriquecimiento
const usuarios = ref([])
const personales = ref([])
const rolesSistema = ref([])
const rolesOptions = ref([])

const counts = ref({
  info: 0,
  success: 0,
  warning: 0,
  error: 0,
})

/* FILTROS */
const searchQuery = ref('')
const selectedLevel = ref('Todos los niveles')
const selectedRole = ref(null)
const fechaInicio = ref('')
const fechaFin = ref('')

const levelOptions = ['Todos los niveles', 'INFO', 'WARN']

/* PAGINACIÓN */
const currentPage = ref(1)
const itemsPerPage = 10

/* const serviceOptions = [
  'Todos los servicios',
  'API',
  'SLA Calculator',
  'Email Service',
  'Data Validation',
  'Alert System',
  'Database',
  'Performance',
  'Report Generator',
  'File Upload',
  'Auth',
] */

/* ------------------------------
     FUNCIONES SEGURAS
--------------------------------*/
const countByLevel = (level) => {
  if (!Array.isArray(logs.value)) return 0
  return logs.value.filter((l) => l.nivel === level).length
}

const updateCounts = () => {
  counts.value.info = countByLevel('INFO')
  counts.value.success = countByLevel('SUCCESS')
  counts.value.warning = countByLevel('WARN')
  counts.value.error = countByLevel('ERROR')
}

/* ------------------------------
     CARGAR API
--------------------------------*/
const fetchLogs = async () => {
  loading.value = true
  try {
    // Cargar logs
    const resLogs = await api.get('/api/logsistema')
    logs.value = resLogs.data.map((l) => ({
      ...l,
      nivel: l.nivel.toUpperCase(),
    }))

    // Cargar datos relacionados
    const [resUsuarios, resPersonales, resRoles] = await Promise.all([
      api.get('/api/usuario'),
      api.get('/api/personal'),
      api.get('/api/RolesSistema'),
    ])

    usuarios.value = resUsuarios.data
    personales.value = resPersonales.data
    rolesSistema.value = resRoles.data

    // Cargar opciones del select de roles
    rolesOptions.value = resRoles.data.map((rol) => ({
      label: rol.nombre,
      value: rol.idRolSistema,
    }))

    // Enriquecer logs con información de usuario
    enrichedLogs.value = logs.value.map((log) => {
      const usuario = usuarios.value.find((u) => u.idUsuario === log.idUsuario)

      if (usuario) {
        const personal = personales.value.find((p) => p.idPersonal === usuario.idPersonal)
        const rol = rolesSistema.value.find((r) => r.idRolSistema === usuario.idRolSistema)

        return {
          ...log,
          rolNombre: rol?.nombre || '—',
          usuarioNombreCompleto: personal
            ? `${personal.nombres} ${personal.apellidos}`.trim()
            : '—',
          usuarioDocumento: personal?.documento || '—',
        }
      }

      return {
        ...log,
        rolNombre: '—',
        usuarioNombreCompleto: '—',
        usuarioDocumento: '—',
      }
    })
  } catch (e) {
    // console.error('Error cargando logs:', e)
    logs.value = []
    enrichedLogs.value = []
  } finally {
    loading.value = false
  }

  updateCounts()
}
/* ------------------------------
     FILTROS DINÁMICOS
--------------------------------*/
const filteredLogs = computed(() => {
  return enrichedLogs.value.filter((l) => {
    const matchSearch =
      searchQuery.value === '' ||
      l.mensaje?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      l.detalles?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchLevel =
      selectedLevel.value === 'Todos los niveles' || l.nivel === selectedLevel.value

    const matchRole =
      !selectedRole.value ||
      usuarios.value.find((u) => u.idUsuario === l.idUsuario)?.idRolSistema ===
        selectedRole.value.value

    const matchFecha =
      (!fechaInicio.value || new Date(l.fechaHora) >= new Date(fechaInicio.value)) &&
      (!fechaFin.value || new Date(l.fechaHora) <= new Date(fechaFin.value + 'T23:59:59'))

    return matchSearch && matchLevel && matchRole && matchFecha
  })
})

/* ------------------------------
     PAGINACIÓN
--------------------------------*/
const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

const startRecord = computed(() => {
  return filteredLogs.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > filteredLogs.value.length ? filteredLogs.value.length : end
})

// Resetear a página 1 cuando cambian los filtros
watch([searchQuery, selectedLevel, selectedRole, fechaInicio, fechaFin], () => {
  currentPage.value = 1
})

onMounted(fetchLogs)

/* ------EXPORTAR PDF-----------*/
const exportPDF = () => {
  if (filteredLogs.value.length === 0) {
    alert('No hay registros filtrados para exportar.')
    return
  }

  // Crear PDF en orientación horizontal (landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // ========== CABECERA PROFESIONAL ==========

  // Logo TATA (alineado a la derecha)
  doc.addImage(tataLogo, 'PNG', pageWidth - 54, 14, 40, 25)

  // Título principal
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210) // #1976D2
  doc.text('Reporte de Logs del Sistema', 14, 22)

  // Subtítulo con fecha actual
  const now = new Date()
  const dateString = now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeString = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128) // #6B7280
  doc.text(`Generado el: ${dateString} - ${timeString}`, 14, 30)

  // Línea separadora
  doc.setDrawColor(229, 231, 235) // #E5E7EB
  doc.setLineWidth(0.5)
  doc.line(14, 42, pageWidth - 14, 42)

  // ========== TABLA PROFESIONAL ==========

  // Preparar datos de la tabla
  const rows = filteredLogs.value.map((l) => [
    l.fechaHora?.substring(0, 19).replace('T', ' ') || '—',
    l.nivel || '—',
    l.mensaje || '—',
    l.detalles || '—',
    l.rolNombre || '—',
    l.usuarioNombreCompleto || '—',
    l.usuarioDocumento || '—',
  ])

  autoTable(doc, {
    startY: 48,
    head: [['Fecha/Hora', 'Nivel', 'Mensaje', 'Detalles', 'Rol', 'Usuario', 'Documento']],
    body: rows,

    // Estilos generales
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [209, 213, 219], // #D1D5DB
      lineWidth: 0.1,
      textColor: [17, 24, 39], // #111827
      font: 'helvetica',
    },

    // Estilo del encabezado
    headStyles: {
      fillColor: [25, 118, 210], // #1976D2 (azul corporativo)
      textColor: [255, 255, 255], // Blanco
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 10,
      cellPadding: 5,
    },

    // Filas alternadas
    alternateRowStyles: {
      fillColor: [243, 244, 246], // #F3F4F6
    },

    // Estilos de columnas específicas
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' }, // Fecha/Hora
      1: { cellWidth: 18, halign: 'center' }, // Nivel
      2: { cellWidth: 42, halign: 'left' }, // Mensaje
      3: { cellWidth: 46, halign: 'left' }, // Detalles
      4: { cellWidth: 32, halign: 'left' }, // Rol
      5: { cellWidth: 32, halign: 'left' }, // Usuario
      6: { cellWidth: 23, halign: 'center' }, // Documento
    },

    // Márgenes
    margin: { left: 14, right: 14, top: 20, bottom: 20 },

    // Callback para personalizar celdas
    didParseCell: function (data) {
      // Resaltar nivel según tipo
      if (data.column.index === 1 && data.section === 'body') {
        const nivel = data.cell.raw
        if (nivel === 'ERROR') {
          data.cell.styles.textColor = [153, 27, 27] // Rojo oscuro
          data.cell.styles.fontStyle = 'bold'
        } else if (nivel === 'WARN') {
          data.cell.styles.textColor = [146, 64, 14] // Naranja oscuro
          data.cell.styles.fontStyle = 'bold'
        } else if (nivel === 'SUCCESS') {
          data.cell.styles.textColor = [6, 95, 70] // Verde oscuro
          data.cell.styles.fontStyle = 'bold'
        } else if (nivel === 'INFO') {
          data.cell.styles.textColor = [25, 118, 210] // Azul #1976D2
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // ========== FOOTER ELEGANTE EN CADA PÁGINA ==========
  const totalPages = doc.internal.getNumberOfPages()

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // #6B7280

    const footerText = `Proyecto TATA – Sistema de Logs © 2025`
    const pageText = `Página ${i} de ${totalPages}`

    // Footer centrado
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })
    doc.text(pageText, pageWidth / 2, pageHeight - 6, { align: 'center' })
  }

  // ========== DESCARGAR PDF ==========
  const fileName = `Logs_TATA_${dateString.replace(/\//g, '-')}_${timeString.replace(/:/g, '-')}.pdf`
  doc.save(fileName)
}
</script>

<style scoped lang="scss">
.logs-container {
  padding: 24px 32px;
  background: #ffffff;
  min-height: 100vh;
}

/* ========== HEADER ========== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.page-subtitle {
  margin: 8px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.6;
}

.export-btn {
  height: 44px;
  padding: 0 24px;
  background: #2563eb;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1e40af;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  :deep(.q-icon) {
    font-size: 20px;
    margin-right: 6px;
  }
}

/* ========== SUMMARY CARDS ========== */
.summary-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
  width: 100%;
}

/* ========== FILTROS ========== */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 2;
  min-width: 280px;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #f9fafb;
    height: 48px;
    border: 1.5px solid #e5e7eb;

    &:hover {
      border-color: #cbd5e1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  :deep(input::placeholder) {
    color: #9ca3af;
  }
}

.filter-select {
  flex: 1;
  min-width: 200px;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #f9fafb;
    height: 48px;
    border: 1.5px solid #e5e7eb;

    &:hover {
      border-color: #cbd5e1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }
}

.role-input {
  flex: 1;
  min-width: 200px;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #f9fafb;
    height: 48px;
    border: 1.5px solid #e5e7eb;

    &:hover {
      border-color: #cbd5e1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  :deep(input::placeholder) {
    color: #9ca3af;
  }
}

.date-input {
  flex: 1;
  min-width: 180px;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #f9fafb;
    height: 48px;
    border: 1.5px solid #e5e7eb;

    &:hover {
      border-color: #cbd5e1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  :deep(input[type='date']) {
    color: #111827;
  }
}

/* ========== PAGINACIÓN ========== */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 767px) {
  .logs-container {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }

  .summary-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
  }

  .search-input,
  .filter-select,
  .role-input,
  .date-input {
    width: 100%;
    min-width: 100%;
  }

  .pagination-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .pagination-info {
    order: -1;
    margin-bottom: 12px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .logs-container {
    padding: 20px 24px;
  }

  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
