# Diagrama de Flujo — Sistema Completo

Vista general de todo el sistema de Gestión de Clientes y Declaraciones: autenticación (JWT), recuperación de contraseña, tablero principal, gestión de clientes, declaraciones (pequeño contribuyente / régimen general), usuarios (solo administrador) y cierre de sesión.

## Flujo
```mermaid
flowchart TD
    A([Inicio: abrir la aplicación]) --> B[Pantalla de login]

    subgraph S1["Acceso y autenticación"]
        B --> C[Ingresa correo y contraseña]
        C --> D{¿Campos completos?}
        D -- No --> E[Mostrar error de validación]
        E --> C
        D -- Sí --> F[POST /api/usuarios/login]
        F --> G{¿Usuario existe, ACTIVO<br/>y contraseña coincide?}
        G -- No --> H[401 / 403 - Mensaje de error]
        H --> C
        G -- Sí --> I[Backend genera token JWT<br/>JwtUtil.generarTokenLogin]
        I --> J[Frontend guarda token y usuario<br/>en localStorage]
    end

    B --> K[¿Olvidó su contraseña?]
    K --> L[POST /api/usuarios/recuperar-password]
    L --> M[Backend genera código de 6 dígitos<br/>y token JWT de recuperación]
    M --> N[Envía correo SMTP con el código]
    N --> O[Usuario ingresa código y nueva contraseña]
    O --> P[POST /api/usuarios/restablecer-password]
    P --> Q{¿Código válido y vigente?}
    Q -- No --> R[400 / 401 - Código incorrecto o expirado]
    R --> O
    Q -- Sí --> S[Actualizar password con BCrypt]
    S --> B

    J --> T([Dashboard: métricas y menú lateral])
    T --> U{Sección seleccionada}

    U -->|Inicio| V[Métricas: clientes activos,<br/>declaraciones registradas y rol]

    U -->|Clientes| W[GET /api/clientes]
    W --> X[Tabla con NIT, nombre, régimen, estado]
    X --> Y{Acción del usuario}
    Y -->|Nuevo / Editar| Z[POST o PUT /api/clientes]
    Y -->|Ver credenciales| AA["GET /api/clientes/{id}/accesos"]
    Y -->|Activar / Inactivar| AB["PUT /api/clientes/{id} estado"]
    Z --> AC[Backend cifra credenciales<br/>EncriptacionUtil]
    AC --> AD[Guardar cliente + credencial 1:1]
    AD --> AE([Lista de clientes actualizada])
    AA --> AF[Backend descifra credenciales]
    AF --> AE
    AB --> AE

    U -->|Declaraciones Pequeño| AG[Tablero mensual IVA pequeño<br/>filtra datos por régimen y tipo de impuesto]
    U -->|Declaraciones General| AH[Tablero mensual IVA general / ISR<br/>filtra datos por régimen y tipo de impuesto]
    AG --> AI[Selecciona celda mes/cliente]
    AH --> AI
    AI --> AJ[Formulario: estado, nº formulario SAT,<br/>fechas, PDF, observaciones]
    AJ --> AK[POST /api/declaraciones/guardar]
    AK --> AL{Busca cliente + año + mes<br/>+ tipo de impuesto}
    AL -- Existe --> AM[Actualizar declaración existente]
    AL -- No existe --> AN[Crear nueva declaración]
    AM --> AO([Tablero actualizado])
    AN --> AO

    U -->|Usuarios| AP{¿Rol ADMINISTRADOR?}
    AP -- No --> AQ[Acceso restringido<br/>el menú no se muestra]
    AP -- Sí --> AR[Gestión de usuarios<br/>GET/POST/PUT /api/usuarios]
    AR --> AS([Listado de usuarios actualizado])

    U -->|Cerrar sesión| AT[Eliminar token y usuario<br/>de localStorage]
    AT --> B

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style T fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style S fill:#d1fae5,stroke:#059669,stroke-width:2px
    style AE fill:#d1fae5,stroke:#059669,stroke-width:2px
    style AO fill:#d1fae5,stroke:#059669,stroke-width:2px
    style AS fill:#d1fae5,stroke:#059669,stroke-width:2px
    style F fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style L fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style W fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style Z fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style AA fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style AK fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style AR fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style AC fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px
    style AF fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px
    style AP fill:#ede9fe,stroke:#7c3aed,stroke-width:1px
    style H fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style R fill:#fee2e2,stroke:#dc2626,stroke-width:1px
    style AQ fill:#fee2e2,stroke:#dc2626,stroke-width:1px
```

## Corrección aplicada — migración de esquema

Durante la compilación del backend se detectó que Hibernate no podía aplicar columnas nuevas sobre la base SQLite existente: SQLite **no permite agregar una columna `NOT NULL` sin valor por defecto**, por lo que el `ALTER TABLE` fallaba silenciosamente (solo generaba warnings) y la aplicación fallaba en ejecución con `no such column`.

| Tabla | Columna | Antes | Ahora (con `columnDefinition`) |
| --- | --- | --- | --- |
| `clientes` | `aplica_iva_general` | `boolean not null` | `boolean not null default true` |
| `clientes` | `aplica_isrt` | `boolean not null` | `boolean not null default false` |
| `clientes` | `aplica_retencion_isr` | `boolean not null` | `boolean not null default false` |
| `declaraciones_mensuales` | `tipo_impuesto` | `varchar(255) not null` | `varchar(255) not null default 'IVA_PEQUENO'` |

Este cambio se hizo en las entidades `Cliente.java` y `DeclaracionMensual.java` y quedan reflejadas en el script de creación de la BD (`docs/database/script-creacion-bd.md`). Con esto, `spring.jpa.hibernate.ddl-auto=update` aplica la migración correctamente en cualquier máquina con una BD antigua.

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Autenticación | `POST /api/usuarios/login` valida credenciales (BCrypt o hash en texto plano migrado) y emite JWT con expiración de 24 h. |
| Recuperación | `recuperar-password` genera código de 6 dígitos + token JWT (15 min) y lo envía por SMTP; `restablecer-password` valida código y token y actualiza el hash. |
| Dashboard | `App.jsx` carga clientes y declaraciones en paralelo (`Promise.allSettled`) al autenticarse. |
| Clientes | Las credenciales se almacenan cifradas; el listado anula los campos cifrados y solo `GET /{id}/accesos` los descifra puntualmente. |
| Declaraciones | Upsert por `cliente + año + mes + tipo_impuesto` (restricción UNIQUE) con semáforo de estado por celda. |
| Usuarios | Solo el rol `ADMINISTRADOR` ve y gestiona el módulo de usuarios; los demás ven "Acceso restringido". |

## Mapas a los diagramas por módulo

| Módulo | Diagrama detallado |
| --- | --- |
| Login | [diagrama-login.md](./diagrama-login.md) |
| Recuperación de contraseña | [diagrama-recuperacion-contrasena.md](./diagrama-recuperacion-contrasena.md) |
| Dashboard / Métricas | [diagrama-dashboard.md](./diagrama-dashboard.md) |
| Gestión de clientes | [diagrama-gestion-clientes.md](./diagrama-gestion-clientes.md) |
| Gestión de declaraciones | [diagrama-declaraciones.md](./diagrama-declaraciones.md) |
| Gestión de usuarios | [diagrama-gestion-usuarios.md](./diagrama-gestion-usuarios.md) |
| Cierre de sesión | [diagrama-cierre-sesion.md](./diagrama-cierre-sesion.md) |

## Layout

- Estructura **TD (top-down)** con `subgraph` para el bloque de acceso; el resto de módulos cuelgan del dashboard vía la decisión de sección.
- Misma paleta semántica del resto de la documentación: inicio/fin en azul/verde, persistencia en ámbar, cifrado en azul, decisión de permisos en morado y errores en rojo.
- Sin directivas `%%{init}%%`: el editor (Zed) y las plataformas (GitHub/mermaid.live) aplican su configuración predeterminada.
