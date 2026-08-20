# Diagrama de Flujo — Login / Autenticación

Flujo de autenticación del sistema: el usuario inicia sesión, el backend valida las credenciales y, en caso de éxito, emite un token JWT que el frontend almacena para las peticiones posteriores.

## Flujo

```mermaid
flowchart TD
    A([Inicio: usuario abre la app]) --> B[Pantalla de login]
    B --> C[Ingresa correo y contraseña]
    C --> D{Campos válidos?}
    D -- No --> E[Mostrar error de validación]
    E --> C
    D -- Sí --> F[POST /api/usuarios/login]
    F --> G[Backend: busca usuario por correo o nombre]
    G --> H{¿Existe el usuario?}
    H -- No --> I[401 - Credenciales incorrectas]
    I --> J[Mostrar mensaje de error en pantalla]
    J --> C
    H -- Sí --> K{¿Estado ACTIVO?}
    K -- No --> L[403 - La cuenta se encuentra inactiva]
    L --> J
    K -- Sí --> M{¿Contraseña coincide?}
    M -- No --> I
    M -- Sí --> N[Generar token JWT con correo y rol]
    N --> O[Respuesta: token + usuario sin hash]
    O --> P[Frontend guarda token en localStorage]
    P --> Q([Dashboard / Panel principal])
    Q --> R[Axios adjunta el token en cada petición]

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style Q fill:#d1fae5,stroke:#059669,stroke-width:2px
    style F fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style N fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style I fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style L fill:#fee2e2,stroke:#dc2626,stroke-width:1px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Validación de campos | El frontend (`useLogin.js`) exige correo y contraseña no vacíos. |
| Búsqueda del usuario | `UsuarioRepository.findByCorreoOrNombre(...)`; el backend acepta `correo`, `nombre`, `usuario` o `identificador`. |
| Comparación de contraseña | BCrypt si el hash inicia con `$2a$/$2b$/$2y$`; si es texto plano, compara directo y migra a BCrypt. |
| Generación del token | `JwtUtil.generarTokenLogin(correo, rol)` — expiración configurada en `app.jwt.expiracionLoginMs` (24 h por defecto). |
| Almacenamiento del token | `setAuthToken(token)` guarda el token en `localStorage` para que el interceptor de Axios lo envíe como `Authorization: Bearer <token>`. |

## Códigos de respuesta posibles

| Código | Significado |
| --- | --- |
| `200` | Login exitoso: `{ token, usuario }`. |
| `400` | Faltan usuario/correo o contraseña (mensaje `Debe ingresar un usuario/correo y contraseña.`). |
| `401` | Credenciales incorrectas. |
| `403` | La cuenta se encuentra inactiva. |

## Layout

- Dirección del flujo: **TD (top-down)**, ramas secundarias a los lados.
- Sin directivas `%%{init}%%`: el editor (Zed) y las plataformas (GitHub/mermaid.live) aplican su configuración predeterminada.
- Formas: `([redondeada])` = inicio/fin, `{}` = decisión, `[]` = proceso, con colores semánticos (acción = ámbar, error = rojo, inicio/fin = azul/verde).