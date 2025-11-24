<template>
  <q-expansion-item
    dense-toggle
    expand-separator
    :label="label"
    :icon="icon"
    class="menu-group"
    switch-toggle-side
  >
    <slot />
  </q-expansion-item>
</template>

<script setup>
defineProps({
  label: String,
  icon: String,
})
</script>

<style scoped>
.menu-group {
  color: #4a5568 !important;
  font-weight: 500;
  font-size: 14px;
}

/* El grupo nunca se pondrá azul */
.menu-group.q-expansion-item--active {
  background: transparent !important;
}
</style>
