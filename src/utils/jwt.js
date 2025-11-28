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
  // Ajusta según lo que use tu backend
  const idValue =
    payload.userId ||
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
