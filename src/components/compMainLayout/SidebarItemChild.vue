<template>
  <q-item clickable v-ripple :to="to" :class="['menu-child', { 'menu-child--active': isActive }]">
    <q-item-section avatar>
      <q-icon :name="icon" class="menu-child-icon" />
    </q-item-section>

    <q-item-section>
      <span class="menu-child-label">{{ label }}</span>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  label: String,
  to: String,
  icon: String,
})

const route = useRoute()

const isActive = computed(() => route.path === props.to)
</script>

<style scoped>
.menu-child {
  padding: 8px 16px 8px 52px;
  min-height: 40px;
  border-radius: 0;
}

.menu-child :deep(.q-item__section--avatar) {
  min-width: 32px;
  padding-right: 12px;
}

.menu-child-icon {
  color: #6b7280;
  font-size: 18px;
}

.menu-child-label {
  color: #374151;
  font-size: 14px;
  font-weight: 400;
}

/* Hover */
.menu-child:hover {
  background: #f3f4f6 !important;
}

/* ACTIVO (HIJO SELECCIONADO) */
.menu-child--active {
  background: #dbeafe !important;
  border-left: 3px solid #2563eb;
}

.menu-child--active .menu-child-label {
  color: #2563eb !important;
  font-weight: 500;
}

.menu-child--active .menu-child-icon {
  color: #2563eb !important;
}
</style>
