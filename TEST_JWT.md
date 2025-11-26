# Test JWT Decoding

## Para probar la decodificación del token:

1. Abre la consola del navegador (F12)
2. Ejecuta este código:

```javascript
import { decodeJwt, getUserIdFromToken } from 'src/utils/jwt'

// Ver el payload completo del token
const token = localStorage.getItem('authToken')
console.log('Token:', token)

const payload = decodeJwt(token)
console.log('Payload decodificado:', payload)

const userId = getUserIdFromToken()
console.log('User ID:', userId)
console.log('Tipo:', typeof userId)
```

## O simplemente en la consola del navegador:

```javascript
const token = localStorage.getItem('authToken')
const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
console.log('Payload JWT:', payload)
```

## Claims comunes de backend ASP.NET Core:

- `nameid` - ClaimTypes.NameIdentifier (ID del usuario)
- `unique_name` - ClaimTypes.Name (nombre de usuario)
- `email` - ClaimTypes.Email
- `role` - ClaimTypes.Role

Si el backend usa `nameid` para el ID, la función `getUserIdFromToken()` lo extraerá correctamente.
