<template>
  <div class="logs-table-container">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="48px" />
      <p class="loading-text">Cargando logs...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!loading && logs.length === 0" class="empty-state">
      <q-icon name="receipt_long" size="64px" color="grey-4" />
      <p class="empty-title">No hay logs registrados</p>
      <p class="empty-subtitle">Los registros del sistema aparecerán aquí</p>
    </div>

    <!-- Tabla de Logs -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-fecha">Fecha y Hora</th>
            <th class="th-nivel">Nivel</th>
            <th class="th-mensaje">Mensaje</th>
            <th class="th-detalles">Detalles</th>
            <th class="th-rol">Rol</th>
            <th class="th-nombre">Usuario</th>
            <th class="th-documento">Documento</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.idLog" class="table-row">
            <td class="td-fecha">{{ formatDate(log.fechaHora) }}</td>
            <td class="td-nivel">
              <span class="badge" :class="getBadgeClass(log.nivel)">
                {{ log.nivel }}
              </span>
            </td>
            <td class="td-mensaje">{{ log.mensaje }}</td>
            <td class="td-detalles">{{ log.detalles || '—' }}</td>
            <td class="td-rol">{{ log.rolNombre || '—' }}</td>
            <td class="td-nombre">{{ log.usuarioNombreCompleto || '—' }}</td>
            <td class="td-documento">{{ log.usuarioDocumento || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return '—'
  return dateString.replace('T', ' ').substring(0, 19)
}

const getBadgeClass = (nivel) => {
  const nivelMap = {
    'INFO': 'badge-info',
    'SUCCESS': 'badge-success',
    'WARN': 'badge-warning',
    'ERROR': 'badge-error'
  }
  return nivelMap[nivel] || 'badge-info'
}
</script>

<style scoped lang="scss">
.logs-table-container {
  background: #FFFFFF;
  min-height: 400px;
}

/* ========== ESTADOS ========== */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  min-height: 400px;
}

.loading-text {
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
}

.empty-title {
  margin: 16px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.empty-subtitle {
  margin: 8px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #9CA3AF;
}

/* ========== TABLA ========== */
.table-container {
  overflow-x: auto;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #FFFFFF;

  thead tr {
    background: #F9FAFB;
    border-bottom: 1px solid #E5E7EB;
  }

  th {
    padding: 14px 16px;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .th-fecha { width: 12%; }
  .th-nivel { width: 10%; }
  .th-mensaje { width: 22%; }
  .th-detalles { width: 25%; }
  .th-rol { width: 12%; }
  .th-nombre { width: 12%; }
  .th-documento { width: 7%; }

  tbody tr {
    border-bottom: 1px solid #F3F4F6;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #F9FAFB;
    }
  }

  td {
    padding: 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
    vertical-align: middle;
  }

  .td-fecha {
    font-weight: 500;
    color: #6B7280;
    white-space: nowrap;
  }

  .td-mensaje {
    color: #111827;
    line-height: 1.5;
  }

  .td-detalles {
    color: #6B7280;
    line-height: 1.5;
    font-size: 13px;
  }

  .td-rol {
    color: #2563EB;
    font-weight: 600;
  }

  .td-nombre {
    color: #111827;
    font-weight: 500;
  }

  .td-documento {
    color: #6B7280;
    font-weight: 500;
    font-family: 'Courier New', monospace;
  }
}

/* ========== BADGES ========== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
}

.badge-info {
  background-color: #EFF6FF;
  color: #2563EB;
}

.badge-success {
  background-color: #D1FAE5;
  color: #065F46;
}

.badge-warning {
  background-color: #FEF3C7;
  color: #92400E;
}

.badge-error {
  background-color: #FEE2E2;
  color: #991B1B;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 767px) {
  .table-container {
    border-radius: 12px;
  }

  .data-table {
    th {
      padding: 12px;
      font-size: 12px;
    }

    td {
      padding: 12px;
      font-size: 13px;
    }

    .th-detalles,
    .td-detalles,
    .th-rol,
    .td-rol,
    .th-documento,
    .td-documento {
      display: none;
    }
  }

  .badge {
    padding: 4px 8px;
    font-size: 11px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .data-table {
    .th-detalles,
    .td-detalles {
      width: 25%;
    }
  }
}
</style>
