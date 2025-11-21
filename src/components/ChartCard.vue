<template>
  <div class="col-12 col-md-4">
    <q-card class="chart-card" :class="`bg-${color}`">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h6 text-white">{{ title }}</div>
            <div class="text-h3 text-white q-mt-sm">{{ value }}</div>
          </div>
          <div class="col-auto">
            <q-icon :name="icon" size="64px" color="white" class="opacity-30" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  color: {
    type: String,
    default: 'primary'
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.opacity-30 {
  opacity: 0.3;
}
</style>
