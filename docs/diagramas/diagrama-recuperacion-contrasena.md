# Diagrama de Flujo — Recuperación de Contraseña

Flujo para restablecer la contraseña de un usuario del sistema mediante un código de verificación de 6 dígitos enviado por correo (servidor SMTP) y un token JWT de corta duración.

## Flujo

```mermaid
flowchart TD
    A([Usuario selecciona: ¿Olvidaste tu contraseña?]) --> B[Se muestra pantalla de recuperación]
    B --> C[Ingresa su correo electrónico]
    C --> D{Correo no vacío?}
    D -- No --> E[Mostrar: ingresa tu correo]
    E --> C
    D -- Sí --> F[POST /api/usuarios/recuperar-password]
    F --> G[Backend: busca usuario por correo]
    G --> H{¿Existe el usuario?}
    H -- No --> I[404 - No se encontró un usuario con este correo]
    I --> J[Error en pantalla]
    J --> C
    H -- Sí --> K[Generar código de 6 dígitos]
    K --> L[Generar token JWT de recuperación]
    L --> M[Enviar correo SMTP con el código]
    M --> N{¿Correo enviado?}
    N -- No --> O[500 - Error de configuración SMTP]
    O --> J
    N -- Sí --> P[Respuesta: token JWT de recuperación]
    P --> Q[Frontend avanza al paso 2]
    Q --> R[Usuario ingresa el código recibido y la nueva contraseña]
    R --> U[POST /api/usuarios/restablecer-password]
    U --> V[Backend: valida token JWT y código]
    V --> W{Código correcto?}
    W -- No --> X[400 - Código de verificación incorrecto]
    X --> R
    W -- Sí --> Y{¿Token vigente?}
    Y -- No --> Z[401 - Código expirado]
    Z --> Q
    Y -- Sí --> AA[Encriptar nueva contraseña BCrypt]
    AA --> AB[Guardar nuevo hash en el usuario]
    AB --> AC[/Éxito: contraseña actualizada/]
    AC --> AD[Regresa a la pantalla de login]

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style AC fill:#d1fae5,stroke:#059669,stroke-width:2px
    style F fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style L fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style U fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style I fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style O fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style X fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style Z fill:#fee2e2,stroke:#dc2626,stroke-width:1px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Búsqueda del correo | `UsuarioRepository.findByCorreo(correo)`. |
| Código de verificación | Aleatorio de 6 dígitos (`Math.random()` entre 100000 y 999999); viaja dentro del token JWT (`claims.codigo`) y como contenido del correo. |
| Token de recuperación | `JwtUtil.generarTokenRecuperacion(correo, codigo)` — expira en `app.jwt.expiracionRecuperacionMs` (15 min por defecto). |
| Envío de correo | `Email.enviarCodigoRecuperacion(...)` vía Gmail SMTP (config en `application.properties`). |
| Restablecimiento | Valida `codigo` contra el JWT y reencadena con `PasswordEncoder.encode(nuevaPassword)`. |

## Códigos de respuesta posibles

| Código | Significado |
| --- | --- |
| `200` | Código enviado / contraseña actualizada. |
| `400` | Faltan parámetros o el código de verificación es incorrecto. |
| `401` | El tiempo del código ha expirado o el token es inválido/alterado. |
| `404` | No se encontró un usuario con ese correo. |
| `500` | Error al enviar el correo (SMTP no configurado). |

## Layout

- Flujo principal **TD (top-down)**; los errores se ramifican a la derecha con color rojo.
- Sin directivas `%%{init}%%`: el editor (Zed) y las plataformas (GitHub/mermaid.live) aplican su configuración predeterminada.
- Misma paleta semántica que el diagrama de login para mantener coherencia visual.