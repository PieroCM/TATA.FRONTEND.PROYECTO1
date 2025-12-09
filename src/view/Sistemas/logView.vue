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

const levelOptions = ['Todos los niveles', 'INFO', 'SUCCESS', 'WARN', 'ERROR']

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
      api.get('/api/RolesSistema')
    ])

    usuarios.value = resUsuarios.data
    personales.value = resPersonales.data
    rolesSistema.value = resRoles.data

    // Cargar opciones del select de roles
    rolesOptions.value = resRoles.data.map(rol => ({
      label: rol.nombre,
      value: rol.idRolSistema
    }))

    // Enriquecer logs con información de usuario
    enrichedLogs.value = logs.value.map(log => {
      const usuario = usuarios.value.find(u => u.idUsuario === log.idUsuario)
      
      if (usuario) {
        const personal = personales.value.find(p => p.idPersonal === usuario.idPersonal)
        const rol = rolesSistema.value.find(r => r.idRolSistema === usuario.idRolSistema)

        return {
          ...log,
          rolNombre: rol?.nombre || '—',
          usuarioNombreCompleto: personal 
            ? `${personal.nombres} ${personal.apellidos}`.trim() 
            : '—',
          usuarioDocumento: personal?.documento || '—'
        }
      }

      return {
        ...log,
        rolNombre: '—',
        usuarioNombreCompleto: '—',
        usuarioDocumento: '—'
      }
    })
  } catch (e) {
    console.error('Error cargando logs:', e)
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
      (usuarios.value.find(u => u.idUsuario === l.idUsuario)?.idRolSistema === selectedRole.value.value)

    return matchSearch && matchLevel && matchRole
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
watch([searchQuery, selectedLevel, selectedRole], () => {
  currentPage.value = 1
})

onMounted(fetchLogs)

/* ------EXPORTAR PDF-----------*/
//const logoTata =
//'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxMi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDUxNDQ4KSAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19zdmcgImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCgk8IUVOVElUWSBuc194bGluayAiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQpdPg0KPHN2ZyAgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9IiZuc19zdmc7IiB4bWxuczp4bGluaz0iJm5zX3hsaW5rOyIgd2lkdGg9IjQ1MS4zMTYiIGhlaWdodD0iNDE0LjQ3MyINCgkgdmlld0JveD0iMCAwIDQ1MS4zMTYgNDE0LjQ3MyIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQ1MS4zMTYgNDE0LjQ3MyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cG9seWdvbiBmaWxsPSIjNDg2QUFFIiBwb2ludHM9IjE0LjYxNiwyODYuNzMyIDExNi4yMywyODYuNzMyIDExNi4yMywzMTcuNjU0IDg3LjA3OSwzMTcuNjU0IDg3LjA3OSwzOTEuOTY5IDQ0LjczNywzOTEuOTY5IA0KCQk0NC43MzcsMzE3LjY1NCAxNC42MTYsMzE3LjY1NCAJIi8+DQoJPHBvbHlnb24gZmlsbD0iIzQ4NkFBRSIgcG9pbnRzPSIxNjcuNjkyLDMyOS4yNTIgMTQ2LjI5OCwzOTEuOTY5IDEwNS42MzUsMzkxLjk2OSAxNDUuNTE2LDI4Ni43MzIgMTg5LjY3NywyODYuNzMyIA0KCQkyMzAuNTE5LDM5MS45NjkgMTg5LjM1NiwzOTEuOTY5IAkiLz4NCgk8cG9seWdvbiBmaWxsPSIjNDg2QUFFIiBwb2ludHM9IjIyMC44MDUsMjg2LjczMiAzMjIuNDE1LDI4Ni43MzIgMzIyLjQxNSwzMTcuNjU0IDI5My4yNzMsMzE3LjY1NCAyOTMuMjczLDM5MS45NjkgDQoJCTI1MC45MzMsMzkxLjk2OSAyNTAuOTMzLDMxNy42NTQgMjIwLjgwNSwzMTcuNjU0IAkiLz4NCgk8cG9seWdvbiBmaWxsPSIjNDg2QUFFIiBwb2ludHM9IjM3My44OTUsMzI5LjI1MiAzNTIuNDkzLDM5MS45NjkgMzExLjgzLDM5MS45NjkgMzUxLjcyNCwyODYuNzMyIDM5NS44NzIsMjg2LjczMiA0MzYuNywzOTEuOTY5IA0KCQkzOTUuNTUyLDM5MS45NjkgCSIvPg0KCTxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjNDg2QUFFIiBkPSJNMzc1LjM5NCw5My40MzJjLTMuNzk0LTcuNDYxLTguNzkxLTE0LjYxMi0xNS4wMDctMjEuMzE4DQoJCWMtMTMuOTY5LTE1LjA3Ny0zMy42NzgtMjcuNjIzLTU3LjAwMi0zNi4yNzZjLTIzLjUxNi04LjcyLTUwLjMzOC0xMy4zMzQtNzcuNTk1LTEzLjMzNHMtNTQuMDc5LDQuNjE0LTc3LjU4MywxMy4zMzQNCgkJYy0yMy4zMzYsOC42NTQtNDMuMDQ2LDIxLjItNTcuMDE1LDM2LjI3NkM4NC45OCw3OC44MTksNzkuOTY3LDg1Ljk4LDc2LjE3NCw5My40NDVjMzAuMzY1LTcuMzQzLDgyLjMwNi0xNy4wMzgsMTMwLjUzNC0xOC4wNjMNCgkJYzQuNjUyLTAuMSw3Ljg1NSwxLjM5LDkuOTY0LDQuMDYzYzIuNTY5LDMuMjU1LDIuMzc2LDE0Ljg1OCwyLjMxMywyMC4wNDlsLTEuMzcxLDEzNC4xN2MyLjcxNiwwLjA5LDUuNDQ1LDAuMTQ4LDguMTc2LDAuMTQ4DQoJCWMyLjc1NCwwLDUuNDk4LTAuMDQ1LDguMjE0LTAuMTM1bC0xLjM3MS0xMzQuMTg0Yy0wLjA3MS01LjE5LTAuMjctMTYuNzk0LDIuMzA4LTIwLjA0OWMyLjExNC0yLjY3Miw1LjMwNi00LjE2Miw5Ljk1Ny00LjA2Mw0KCQlDMjkzLjEwNiw3Ni4zOTgsMzQ1LjAzNSw4Ni4wOTUsMzc1LjM5NCw5My40MzIiLz4NCgk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzQ4NkFBRSIgZD0iTTM4MS44NzcsMTEwLjg4Yy00NC40NDItMTAuMDQ3LTc0LjEyMS0xMS45MDUtMTAzLjQwNS0xMy41Mw0KCQljLTI1LjUyNi0xLjQxOS0yNS44NTksNy42OTYtMjMuMzExLDI1LjExNWMwLjE2NywxLjA2MywwLjM3MiwyLjQwMywwLjYxNSwzLjkzMWM4LjU2Miw1MC43MTIsMTkuMjI0LDk0LjM1MiwyMS4wNTYsMTAxLjc1OQ0KCQljNjIuMjMtMTQuMjI1LDEwNy4xMDktNTMuNjY0LDEwNy4xMDktOTkuOTk0QzM4My45NDEsMTIyLjMyNywzODMuMjM2LDExNi41NDcsMzgxLjg3NywxMTAuODgiLz4NCgk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzQ4NkFBRSIgZD0iTTE5Ni40NDMsMTIyLjQ2NWMyLjU1MS0xNy40MTgsMi4yMjQtMjYuNTM0LTIzLjI5OS0yNS4xMTUNCgkJYy0yOS4yOTQsMS42MjUtNTguOTgsMy40ODItMTAzLjQzOSwxMy41MzZjLTEuMzU4LDUuNjY3LTIuMDcyLDExLjQ0LTIuMDcyLDE3LjI3NGMwLDIwLjAyNCw4LjE0NiwzOS40LDIzLjU2LDU2LjA0Nw0KCQljMTMuOTY5LDE1LjA3NywzMy42NzksMjcuNjIzLDU3LjAxNSwzNi4yODJjOC40NDYsMy4xMjcsMTcuMzU5LDUuNjksMjYuNTQsNy43NGMxLjcyMy02LjkzOSwxMi42My01MS40ODcsMjEuMjg1LTEwMy4xMDYNCgkJQzE5Ni4xOTMsMTI0LjEzNCwxOTYuMzQxLDEyMy4yMjEsMTk2LjQ0MywxMjIuNDY1Ii8+DQo8L2c+DQo8L3N2Zz4NCg=='

const exportPDF = () => {
  console.log('🔥 SI ENTRA A exportPDF()')

  if (filteredLogs.value.length === 0) {
    alert('No hay registros filtrados para exportar.')
    return
  }

  const doc = new jsPDF()

  // LOGO
  doc.addImage(tataLogo, 'PNG', 150, 10, 40, 25)

  // TÍTULO
  doc.setFontSize(18)
  doc.text('Reporte de Logs del Sistema', 14, 15)

  doc.setFontSize(12)
  doc.text(`Registros exportados: ${filteredLogs.value.length}`, 14, 25)

  // TABLA
  const rows = filteredLogs.value.map((l) => [
    l.idLog,
    l.fechaHora?.substring(0, 19).replace('T', ' '),
    l.nivel,
    l.mensaje,
    l.detalles,
  ])

  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Fecha/Hora', 'Nivel', 'Mensaje', 'Detalles']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: '#fff',
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 35 },
      2: { cellWidth: 22 },
      3: { cellWidth: 50 },
      4: { cellWidth: 60 },
    },
  })

  // FOOTER EN CADA PÁGINA
  const addFooter = () => {
    const totalPages = doc.internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      const footerText = `Página ${i} de ${totalPages} — Proyecto TATA · Sistema de Logs 2025`

      doc.setFontSize(10)
      doc.setTextColor('#6B7280')

      doc.text(
        footerText,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
  }

  addFooter()

  // DESCARGAR PDF
  doc.save('logs_filtrados.pdf')
}
</script>

<style scoped lang="scss">
.logs-container {
  padding: 24px 32px;
  background: #FFFFFF;
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
  color: #6B7280;
  line-height: 1.6;
}

.export-btn {
  height: 44px;
  padding: 0 24px;
  background: #2563EB;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  text-transform: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1E40AF;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  :deep(.q-icon) {
    font-size: 20px;
    margin-right: 6px;
  }
}

/* ========== SUMMARY CARDS ========== */
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  max-width: 1000px;
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
    background-color: #F9FAFB;
    height: 48px;
    border: 1.5px solid #E5E7EB;

    &:hover {
      border-color: #CBD5E1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  :deep(input::placeholder) {
    color: #9CA3AF;
  }
}

.filter-select {
  flex: 1;
  min-width: 200px;

  :deep(.q-field__control) {
    border-radius: 12px;
    background-color: #F9FAFB;
    height: 48px;
    border: 1.5px solid #E5E7EB;

    &:hover {
      border-color: #CBD5E1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563EB;
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
    background-color: #F9FAFB;
    height: 48px;
    border: 1.5px solid #E5E7EB;

    &:hover {
      border-color: #CBD5E1;
    }
  }

  :deep(.q-field__control):focus-within {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  :deep(.q-field__native) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  :deep(input::placeholder) {
    color: #9CA3AF;
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
  color: #6B7280;
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
  .role-input {
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
