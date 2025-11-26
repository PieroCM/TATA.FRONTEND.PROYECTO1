<!--
  Input de búsqueda con icono de lupa.
  Soporta v-model mediante modelValue y update:modelValue.
-->
<template>
  <div class="sla-search-input">
    <span class="sla-search-input__icon">🔍</span>
    <input
      type="text"
      class="sla-search-input__field"
      :value="modelValue"
      @input="handleInput"
      placeholder="Buscar por rol, estado o SLA..."
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.sla-search-input {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
}

.sla-search-input__icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  color: #999;
  pointer-events: none;
}

.sla-search-input__field {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.sla-search-input__field:focus {
  border-color: #1976d2;
}

.sla-search-input__field::placeholder {
  color: #999;
}
</style>
