<template>
  <div class="panel-view">
    <!-- Header con botón volver -->
    <div class="panel-header">
      <div class="header-content">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="back-btn"
          @click="$emit('back')"
        >
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
            Volver
          </q-tooltip>
        </q-btn>
        <div class="header-text">
          <h2 class="panel-title">Configuración SLA</h2>
          <p class="panel-subtitle">Busca, visualiza y administra los registros desde esta vista.</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Buscar por nombre, código o descripción..."
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Tabla -->
    <div class="panel-body">
      <ConfigSLA :search-query="searchQuery" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConfigSLA from './ConfigSLA.vue'

defineEmits(['back'])

const searchQuery = ref('')
</script>

<style scoped lang="scss">
.panel-view {
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.panel-header {
  padding: 32px 48px 24px 48px;
  border-bottom: 1px solid #F1F5F9;
  background: #FFFFFF;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  width: 40px;
  height: 40px;
  color: #2563EB;
  border-radius: 50%;
  flex-shrink: 0;

  &:hover {
    background-color: #EFF6FF;
  }
}

.header-text {
  flex: 1;
}

.panel-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.panel-subtitle {
  margin: 6px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  line-height: 1.5;
}

.search-container {
  width: 100%;
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 9999px;
    background-color: #F9FAFB;
    height: 48px;
    border: 1px solid #E5E7EB;
    padding: 0 20px;

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
    color: #334155;
  }

  :deep(.q-field__prepend) {
    padding-left: 8px;
  }

  :deep(input::placeholder) {
    color: #9CA3AF;
  }
}

.panel-body {
  background: #FFFFFF;
}

@media (max-width: 767px) {
  .panel-header {
    padding: 24px 20px 20px 20px;
  }

  .header-content {
    gap: 12px;
  }

  .panel-title {
    font-size: 20px;
  }

  .panel-subtitle {
    font-size: 13px;
  }
}
</style>
