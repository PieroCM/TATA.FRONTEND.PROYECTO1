/**
 * API Client para el módulo de Predicción ML de SLA
 * Centraliza todas las llamadas al backend .NET
 */

import { api } from 'boot/axios'

/**
 * Obtiene las predicciones críticas (solicitudes en riesgo)
 * @param {number} limite - Número máximo de resultados (default: 50)
 * @returns {Promise} Lista de predicciones
 */
export const getPrediccionesActuales = async (limite = 50) => {
  try {
    const response = await api.get(`/api/Prediccion/criticas?limite=${limite}`)
    // La API retorna directamente el array de predicciones
    return response.data || []
  } catch (error) {
    console.error('Error al obtener predicciones actuales:', error)
    throw error
  }
}


