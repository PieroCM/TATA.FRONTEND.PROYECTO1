import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Estado para controlar si ya se cargó la aplicación por primera vez
  const hasInitiallyLoaded = ref(false)

  function markAsLoaded() {
    hasInitiallyLoaded.value = true
  }

  return {
    hasInitiallyLoaded,
    markAsLoaded
  }
})
