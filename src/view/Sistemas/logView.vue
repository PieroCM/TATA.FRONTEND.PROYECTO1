<template>
  <div class="logs-container">
    <!-- CABECERA -->
    <div class="header-row">
      <div>
        <h2 class="title">Logs del Sistema</h2>
        <p class="subtitle">Registro de eventos y errores de la aplicación</p>
      </div>

      <!--<q-btn color="white" flat class="export-btn" no-caps>
        <q-icon name="download" color="primary" size="20px" />
        <span class="export-text">Exportar Logs</span>
      </q-btn>-->

      <!-- 🔽 EXPORTAR LOGS (MENÚ DESPLEGABLE) -->
      <q-btn-dropdown
        flat
        class="export-btn"
        no-caps
        dropdown-icon="expand_more"
        label="Exportar Logs"
      >
        <q-list bordered padding>
          <q-item clickable v-ripple @click="exportPDF" v-close-popup>
            <q-item-section avatar>
              <q-icon name="picture_as_pdf" color="red" />
            </q-item-section>

            <q-item-section>Exportar PDF</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- RESUMEN -->
    <div class="summary-row">
      <SummaryCard type="info" :count="counts.info" />
      <SummaryCard type="success" :count="counts.success" />
      <SummaryCard type="warning" :count="counts.warning" />
      <SummaryCard type="error" :count="counts.error" />
    </div>

    <!-- FILTROS -->
    <div class="filter-panel">
      <q-input
        v-model="search"
        dense
        rounded
        outlined
        placeholder="Buscar en mensajes..."
        class="filter-input"
      >
        <template #prepend>
          <q-icon name="filter_alt" />
        </template>
      </q-input>

      <q-select
        v-model="selectedLevel"
        :options="levelOptions"
        dense
        outlined
        rounded
        class="filter-select"
      />
      <!--
       <q-select
        v-model="selectedService"
        :options="serviceOptions"
        dense
        outlined
        rounded
        class="filter-select"
      /> -->
    </div>

    <!-- LISTA DE LOGS -->
    <div v-if="filteredLogs.length === 0" class="no-results">No se encontraron registros...</div>

    <div v-else class="log-list">
      <LogItem v-for="(l, idx) in filteredLogs" :key="idx" :log="l" />
    </div>
  </div>
</template>
<script setup>
import { QIcon, QInput, QSelect, QBtnDropdown } from 'quasar'
import { ref, computed, onMounted } from 'vue'
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

const counts = ref({
  info: 0,
  success: 0,
  warning: 0,
  error: 0,
})

/* FILTROS */
const search = ref('')
const selectedLevel = ref('Todos los niveles')
/*const selectedService = ref('Todos los servicios')*/

const levelOptions = ['Todos los niveles', 'INFO', 'SUCCESS', 'WARN', 'ERROR']

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
  try {
    const res = await api.get('/api/logsistema')
    logs.value = res.data
    // Normalizamos los niveles para que siempre sean MAYÚSCULAS
    logs.value = logs.value.map((l) => ({
      ...l,
      nivel: l.nivel.toUpperCase(),
    }))
  } catch (e) {
    console.error('Error cargando logs:', e)
    logs.value = []
  }

  updateCounts()
}

onMounted(fetchLogs)

/* ------------------------------
     FILTROS DINÁMICOS
--------------------------------*/
const filteredLogs = computed(() => {
  return logs.value.filter((l) => {
    const matchSearch =
      l.mensaje.toLowerCase().includes(search.value.toLowerCase()) ||
      l.detalles.toLowerCase().includes(search.value.toLowerCase())

    const matchLevel =
      selectedLevel.value === 'Todos los niveles' || l.nivel === selectedLevel.value

    /* const matchService =
      selectedService.value === 'Todos los servicios' || l.servicio === selectedService.value */

    return matchSearch && matchLevel /* && matchService*/
  })
})

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
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 12,
        { align: 'center' },
      )
    }
  }

  addFooter()

  // DESCARGAR PDF
  doc.save('logs_filtrados.pdf')
}
</script>

<style scoped>
.logs-container {
  padding: 20px 30px;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

/* Header */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin-top: -5px;
  font-size: 14px;
  color: #6b7280;
}

.export-btn {
  border: 1px solid #d0d7e3;
  border-radius: 10px;
  padding: 6px 14px;
  background: white;
}

.export-text {
  font-size: 14px;
  color: #2f80ed;
  font-weight: 600;
  margin-left: 5px;
}

/* Summary cards */
.summary-row {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

/* Filter panel */
.filter-panel {
  margin-top: 25px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-input {
  width: 350px;
}

.filter-select {
  width: 190px;
}

/* Log list */
.log-list {
  margin-top: 30px;
}

/* No results */
.no-results {
  margin-top: 50px;
  text-align: center;
  color: #777;
}
.export-btn {
  border: 1px solid #d0d7e3;
  border-radius: 10px;
  background: white;
  padding: 6px 14px;
  font-weight: 600;
}
</style>
