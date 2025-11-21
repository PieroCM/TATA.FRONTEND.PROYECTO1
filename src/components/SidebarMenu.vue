<template>
  <q-list padding>
    <template v-for="item in menuItems" :key="item.title">
      <!-- Items sin hijos -->
      <q-item
        v-if="!item.children"
        clickable
        v-ripple
        :to="item.link"
        active-class="bg-primary text-white"
        class="menu-item"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Items con hijos (expansibles) -->
      <q-expansion-item
        v-else
        :icon="item.icon"
        :label="item.title"
        class="menu-item"
      >
        <q-item
          v-for="child in item.children"
          :key="child.title"
          clickable
          v-ripple
          :to="child.link"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="child.icon" size="sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-caption">{{ child.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </template>
  </q-list>
</template>

<script setup>
const menuItems = [
  {
    title: 'Dashboard Ejecutivo',
    caption: null,
    icon: 'analytics',
    link: '/dashboard'
  },
  {
    title: 'Análisis Interactivo',
    caption: null,
    icon: 'insights',
    link: '/sla-analitica'
  },
  {
    title: 'Filtros y Reportes',
    caption: null,
    icon: 'filter_alt',
    link: '/sla-filtros'
  }
]
</script>

<style scoped>
.menu-item {
  margin: 2px 8px;
  border-radius: 8px;
}

.menu-item.q-item--active {
  background: #e3f2fd;
  color: #1976d2;
}

:deep(.q-expansion-item__container) {
  margin: 2px 8px;
}

:deep(.q-item__section--avatar) {
  min-width: 40px;
}
</style>
