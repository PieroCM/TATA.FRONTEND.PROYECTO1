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
  padding-left: 32px;
}

.menu-child-icon {
  color: #5a6473;
}

.menu-child-label {
  color: #4a5568;
  font-size: 14px;
}

/* ACTIVO (HIJO SELECCIONADO) */
.menu-child--active {
  background: #e5f0ff !important;
}

.menu-child--active .menu-child-label {
  color: #1976d2 !important;
  font-weight: 600;
}

.menu-child--active .menu-child-icon {
  color: #1976d2 !important;
}
</style>
