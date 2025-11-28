<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  icon: String,
  label: String,
  to: String,
  mini: Boolean,
})

const route = useRoute()

const isActive = computed(() => {
  return route.path === props.to
})
</script>

<template>
  <q-item clickable v-ripple :to="to" :class="['menu-item', isActive ? 'active-item' : '']">
    <q-item-section avatar>
      <q-icon :name="icon" class="menu-icon" />
      <q-tooltip v-if="mini">{{ label }}</q-tooltip>
    </q-item-section>

    <q-item-section v-if="!mini">
      <span class="menu-label">{{ label }}</span>
    </q-item-section>
  </q-item>
</template>

<style scoped>
.menu-item {
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 0;
}

.menu-item :deep(.q-item__section--avatar) {
  min-width: 40px;
  padding-right: 12px;
}

.menu-icon {
  color: #6b7280;
  font-size: 20px;
}

.menu-label {
  color: #374151;
  font-size: 14px;
  font-weight: 400;
}

/* Hover */
.menu-item:hover {
  background: #f3f4f6 !important;
}

/* ACTIVO */
.active-item {
  background-color: #dbeafe !important;
  border-left: 3px solid #2563eb;
}

.active-item .menu-label {
  color: #2563eb !important;
  font-weight: 500;
}

.active-item .menu-icon {
  color: #2563eb !important;
}
</style>
