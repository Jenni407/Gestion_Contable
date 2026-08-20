# Caso de Uso — Login / Autenticación

## Metadatos

| Campo | Valor |
| --- | --- |
| **ID** | CU–01 |
| **Actor(es)** | Administrador, Contador e Invitado (registro). |
| **Precondición** | El usuario tiene una cuenta existente (o se registra antes). Backend y frontend en ejecución. |
| **Postcondición de éxito** | El sistema emite un token JWT válido y el usuario ingresa al panel principal. |
| **Endpoints involucrados** | `POST /api/usuarios/login` |

## Flujo principal

1. El usuario abre la aplicación y llega a la pantalla de login.
2. Ingresa su **correo** y su **contraseña**.
3. El sistema valida que los campos no estén vacíos (si están vacíos, muestra error y vuelve al paso 2).
4. El frontend envía `POST /api/usuarios/login` con `{ correo, password }`.
5. El backend busca al usuario por correo o nombre en la base de datos.
6. Si la cuenta está **inactiva**, responde `403`.
7. El sistema compara la contraseña (BCrypt, o migración automática si está en texto plano).
8. Si coincide, genera un **token JWT** con `correo` y `rol` y responde `{ token, usuario }`.
9. El frontend guarda el token en `localStorage` y navega al dashboard.
10. El interceptor de Axios adjunta `Authorization: Bearer <token>` en las siguientes peticiones.

## Flujos alternos

- **A1. Credenciales incorrectas:** responde `401` → se muestra "Credenciales incorrectas".
- **A2. Cuenta inactiva:** responde `403` → se muestra "La cuenta se encuentra inactiva".
- **A3. Parámetros incompletos:** responde `400` → "Debe ingresar un usuario/correo y contraseña".
- **A4. Backend apagado:** el frontend captura `ERR_NETWORK` y muestra "No se puede conectar con el backend (puerto 8080)".
- **A5. Servidor sin token en la respuesta:** el frontend bloquea el ingreso ("El servidor no devolvió el token JWT...") para evitar accesos inseguros.

## Reglas de negocio

- El hash puede comenzar con `$2a$/ $2b$/ $2y$` (BCrypt) o ser texto plano heredado; en este último caso se migra a BCrypt tras un login exitoso.
- El token de login expira según `app.jwt.expiracionLoginMs` (24 h por defecto).
- `password_hash` nunca se devuelve en las respuestas.

## Validación adicional

| Código | Cuerpo |
| --- | --- |
| `200` | `{ "token": "<jwt>", "usuario": { nombre, correo, rol, estado } }` |
| `400` | `{ "mensaje": "Debe ingresar un usuario/correo y contraseña." }` |
| `401` | `{ "mensaje": "Credenciales incorrectas" }` |
| `403` | `{ "mensaje": "La cuenta se encuentra inactiva." }` |

## Diagrama relacionado

Ver [diagrama-login.md](../diagramas/diagrama-login.md) para el flujo gráfico.