# Diagrama de Flujo — Gestión de Clientes

Flujo del módulo de clientes: listado, registro, edición, cambio de estado y consulta de credenciales (bóveda de contraseñas) con cifrado/descifrado en el backend.

## Flujo

```mermaid
flowchart TD
    A([Usuario navega a Clientes]) --> B[GET /api/clientes]
    B --> C[Backend: lista clientes sin credenciales expuestas]
    C --> D[Tabla con NIT, nombre, régimen, estado...]
    D --> E[Búsqueda por NIT o nombre]

    E --> F{Acción del usuario}
    F -->|Nuevo Cliente| G[Abre formulario de registro]
    F -->|Editar| H[Abre formulario con datos existentes]
    F -->|Ver credenciales| I[Abre bóveda de contraseñas]
    F -->|Activar / Inactivar| J[Alternar estado ACTIVO/INACTIVO]

    G --> K[Completa NIT, razón social, régimen fiscal y config fiscales]
    K --> L[Opcional: credenciales Agencia Virtual, FEL, Correo]
    L --> M[POST /api/clientes]
    M --> N[Backend cifra las credenciales con EncriptacionUtil]
    N --> O[Guardar cliente + credencial 1:1]

    H --> P["PUT /api/clientes/{id}"]
    P --> Q[Actualizar datos del cliente]
    Q --> R{¿Viene credencial nueva?}
    R -- Sí --> S[Cifrar y actualizar credenciales]
    R -- No --> T[Conservar credenciales actuales]
    S --> U[Guardar cambios]
    T --> U

    I --> V["GET /api/clientes/{id}/accesos"]
    V --> W[Backend descifra credenciales]
    W --> X[Muestra claves con opción de copiar]
    J --> Y["PUT /api/clientes/{id} con nuevo estado"]
    Y --> Z[Guardar estado]

    O --> AA([Lista actualizada])
    U --> AA
    X --> AA
    Z --> AA

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style AA fill:#d1fae5,stroke:#059669,stroke-width:2px
    style M fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style P fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style V fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style N fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px
    style W fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Listado | `GET /api/clientes` → `ClienteController.obtenerClientes()` anula las credenciales cifradas en la respuesta para no exponerlas. |
| Registro | `POST /api/clientes` cifra `pass_agencia_virtual`, `pass_fel`, `pass_correo` con `EncriptacionUtil.encriptar(...)` antes de guardar (casacade 1:1 con `CredencialCliente`). |
| Edición | `PUT /api/clientes/{id}` actualiza campos de negocio y **solo** cifra/actualiza credenciales cuando llegan nuevas y no vacías. |
| Estado | Se conmuta `ACTIVO` ↔ `INACTIVO` vía `PUT` enviando el objeto completo con el nuevo estado. |
| Bóveda de credenciales | `GET /api/clientes/{id}/accesos` descifra con `EncriptacionUtil.desencriptar(...)` y devuelve `claveAV`, `claveFEL`, `claveCorreo`. |

## Seguridad del módulo

- Las credenciales de clientes se almacenan cifradas (nunca en texto plano) y solo se descifran de forma puntual en el endpoint de accesos.
- El interceptor de Axios envía el token JWT (`Authorization: Bearer`) en cada petición a `ClientesAPI`.

## Layout

- Flujo de listado **TD (top-down)** con ramas laterales por acción del usuario.
- Las operaciones de cifrado/descifrado se resaltan en azul para distinguirlas de las acciones CRUD (ámbar).
- Sin directivas `%%{init}%%`: el editor (Zed) y las plataformas (GitHub/mermaid.live) aplican su configuración predeterminada.