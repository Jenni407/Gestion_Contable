# Diagrama de Flujo — Cierre de Sesión

Flujo para cerrar la sesión del usuario: elimina el token JWT y los datos de sesión del `localStorage` y regresa a la pantalla de login.

## Flujo

```mermaid
flowchart TD
    A([Usuario autenticado en el Dashboard]) --> B[Pulsa el botón Cerrar Sesión]
    B --> C["setAuthToken(null)<br/>elimina token de localStorage"]
    C --> D["localStorage.removeItem('usuario')<br/>borra los datos del usuario"]
    D --> E["setUsuario(null)"]
    E --> F([Regresa a la pantalla de login])
    F --> G([Permite iniciar sesión de nuevo])

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style F fill:#d1fae5,stroke:#059669,stroke-width:2px
    style G fill:#d1fae5,stroke:#059669,stroke-width:2px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Cierre de sesión | `App.jsx` (`handleLogout`) llama `setAuthToken(null)`, `localStorage.removeItem('usuario')` y `setUsuario(null)`. |
| Resultado | El interceptor de Axios deja de adjuntar `Authorization: Bearer <token>` porque el token ya no existe en `localStorage`. |
| Pantalla de login | Al quedar `usuario = null`, `App.jsx` renderiza la vista `Auth` (`Login.jsx`). |

## Layout

- Flujo lineal **TD (top-down)**; inicio en azul y fin en verde, coherente con el resto de la documentación.
