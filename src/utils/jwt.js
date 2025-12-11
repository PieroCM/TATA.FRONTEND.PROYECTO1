/**
 * Utilidades para trabajar con JWT (JSON Web Tokens)
 */

/**
 * Decodifica un token JWT y extrae su payload
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado o null si falla
 */
export function decodeJwt(token) {
  if (!token) return null

  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Decodificar la segunda parte (payload) desde base64url
    const payload = parts[1]

    // Convertir de base64url a base64 estándar
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    // Decodificar base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decodificando JWT:', error)
    return null
  }
}

/**
 * Obtiene el ID del usuario autenticado desde el token JWT almacenado
 * @returns {number|null} - ID del usuario o null si no se encuentra
 */
export function getUserIdFromToken() {
  const token = localStorage.getItem('authToken')
  if (!token) return null

  const payload = decodeJwt(token)
  if (!payload) return null

  // Intentar diferentes claims comunes para el ID de usuario
  // ⭐ IMPORTANTE: Agregar 'idUsuario' como primera opción
  const idValue =
    payload.idUsuario || // ⭐ NUEVO: Backend puede incluir idUsuario
    payload.UserId ||
    payload.sub ||
    payload.nameid ||
    payload.id ||
    payload.Id ||
    null

  // Convertir a número si es string
  if (idValue === null) return null

  const userId = typeof idValue === 'string' ? parseInt(idValue, 10) : idValue

  return isNaN(userId) ? null : userId
}

/**
 * Obtiene el ID del usuario desde authUser en localStorage
 * (Más confiable que decodificar el token cuando el JWT no contiene el ID)
 * @returns {number|null} - ID del usuario o null si no se encuentra
 */
export function getUserIdFromLocalStorage() {
  try {
    const authUserJson = localStorage.getItem('authUser')
    if (!authUserJson) return null

    const authUser = JSON.parse(authUserJson)
    if (!authUser?.idUsuario) return null

    const userId =
      typeof authUser.idUsuario === 'string' ? parseInt(authUser.idUsuario, 10) : authUser.idUsuario

    return isNaN(userId) ? null : userId
  } catch (error) {
    console.error('❌ Error al obtener idUsuario de localStorage:', error)
    return null
  }
}

/**
 * Obtiene el ID del usuario autenticado
 * Prioriza localStorage (confiable y rápido) antes que decodificar el JWT
 *
 * @returns {number|null} - ID del usuario o null si no se encuentra
 *
 * @example
 * const userId = getUserId()
 * if (!userId) {
 *   console.error('Usuario no autenticado')
 *   return
 * }
 */
export function getUserId() {
  // PRIORIDAD 1: localStorage.authUser (más confiable y rápido)
  const userId = getUserIdFromLocalStorage()
  if (userId) {
    return userId
  }

  // PRIORIDAD 2: Fallback - decodificar token JWT (por si acaso)
  const tokenId = getUserIdFromToken()
  if (tokenId) {
    console.warn('⚠️ ID de usuario obtenido desde JWT (considera revisar localStorage)')
    return tokenId
  }

  console.error('❌ No se pudo obtener el ID del usuario')
  return null
}
