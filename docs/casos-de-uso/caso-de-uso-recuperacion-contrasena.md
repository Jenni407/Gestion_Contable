# Caso de Uso — Recuperación de Contraseña

## Metadatos

| Campo | Valor |
| --- | --- |
| **ID** | CU–02 |
| **Actor(es)** | Administrador, Contador (usuario con cuenta) y Sistema de correo SMTP. |
| **Precondición** | El usuario registró un correo válido en su cuenta y puede recibir mensajes en él. |
| **Postcondición de éxito** | El password del usuario es reemplazado por la nueva contraseña cifrada con BCrypt. |
| **Endpoints involucrados** | `POST /api/usuarios/recuperar-password` y `POST /api/usuarios/restablecer-password` |

## Flujo principal

1. Desde la pantalla de login, el usuario elige "¿Olvidaste tu contraseña?".
2. Ingresa su **correo electrónico** y solicita la recuperación.
3. El backend valida el correo, busca la cuenta y genera un **código de 6 dígitos**.
4. El backend emite un **token JWT de recuperación** (incorpora el código) y envía el código por SMTP.
5. El usuario introduce el código recibido y su nueva contraseña (con confirmación).
6. El frontend envía `POST /api/usuarios/restablecer-password` con `token`, `codigo` y `nuevaPassword`.
7. El backend valida el token y el código; si son correctos, cifra la nueva contraseña con BCrypt y la guarda.
8. El sistema regresa a la pantalla de login para ingresar con la nueva contraseña.

## Flujos alternos

- **A1. Correo inexistente:** responde `404` → "No se encontró un usuario con este correo".
- **A2. SMTP no configurado:** responde `500` → "Error al enviar el correo. Revisa la configuración del servidor SMTP".
- **A3. Código incorrecto:** responde `400` → "El código de verificación es incorrecto".
- **A4. Token expirado:** responde `401` → "El tiempo del código ha expirado. Solicita uno nuevo".
- **A5. Token alterado:** responde `400` → "Token de recuperación inválido o alterado".
- **A6. Contraseñas distintas al confirmar:** el frontend lo valida antes de enviar ("Las contraseñas no coinciden").

## Reglas de negocio

- El código de verificación viaja **dentro del token JWT**, por lo que el token y el código deben coincidir.
- La expiración del token de recuperación es de **15 minutos** por defecto (`app.jwt.expiracionRecuperacionMs=900000`).
- La nueva contraseña se guarda siempre cifrada con BCrypt.

## Validación adicional

| Código | Cuerpo |
| --- | --- |
| `200` (recuperar) | `{ "mensaje": "Código generado y enviado con éxito a tu correo.", "token": "<jwt_recuperacion>" }` |
| `200` (restablecer) | `{ "mensaje": "Contraseña actualizada exitosamente." }` |
| `400` | Faltan parámetros / código incorrecto / token inválido |
| `401` | Código o token expirado |
| `404` | Usuario no encontrado |
| `500` | Error SMTP |

## Diagrama relacionado

Ver [diagrama-recuperacion-contrasena.md](../diagramas/diagrama-recuperacion-contrasena.md) para el flujo gráfico.