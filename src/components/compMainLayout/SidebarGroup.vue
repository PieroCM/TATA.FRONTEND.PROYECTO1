<template>
  <q-expansion-item dense-toggle expand-separator :label="label" :icon="icon" class="menu-group">
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
  border-radius: 0;
}

.menu-group :deep(.q-item) {
  min-height: 44px;
  padding: 8px 16px;
}

.menu-group :deep(.q-item__section--avatar) {
  min-width: 40px;
  padding-right: 12px;
}

.menu-group :deep(.q-item__label) {
  color: #374151;
  font-weight: 400;
  font-size: 14px;
}

.menu-group :deep(.q-icon) {
  color: #6b7280;
  font-size: 20px;
}

.menu-group :deep(.q-expansion-item__toggle-icon) {
  margin-left: auto;
}

/* Hover del grupo */
.menu-group :deep(.q-item:hover) {
  background: #f3f4f6 !important;
}

/* Cuando el grupo está expandido */
.menu-group :deep(.q-expansion-item--expanded > .q-expansion-item__container > .q-item) {
  background: transparent !important;
}
</style>
