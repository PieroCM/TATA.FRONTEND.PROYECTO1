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
.active-item {
  background-color: #e8f0fe !important; /* celestito del figma */
  color: #1a73e8 !important;
}

.active-item .menu-icon {
  color: #1a73e8 !important;
}
</style>
