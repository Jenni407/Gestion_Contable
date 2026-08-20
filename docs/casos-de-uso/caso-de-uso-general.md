# Caso de Uso General — Sistema de Gestión Contable

## Actores

| Actor | Descripción |
| --- | --- |
| **Administrador** | Usuario con rol `ADMINISTRADOR`. Gestiona usuarios del sistema y accede a todos los módulos. |
| **Contador** | Usuario con rol `CONTADOR`. Gestiona clientes y declaraciones. |
| **Invitado / visitante** | Persona sin sesión: registra cuenta o inicia sesión (login público). |
| **Sistema de correo (SMTP)** | Servicio externo que envía los códigos de recuperación de contraseña. |

## Diagrama de casos de uso

```mermaid
%%{init: {"flowchart": {"curve": "basis", "nodeSpacing": 50, "rankSpacing": 60, "useMaxWidth": true, "htmlLabels": true}, "theme": "default"}}%%
flowchart LR
    Admin["🛠 Administrador"]
    Contador["🧮 Contador"]
    Invitado["👤 Invitado"]
    SMTP["✉️ Sistema SMTP"]

    subgraph Sistema["Sistema de Gestión Contable"]
        CU1(Login / Autenticación)
        CU2(Recuperar Contraseña)
        CU3(Gestionar Clientes)
        CU4(Gestionar Declaraciones)
        CU5(Registrar Usuarios)
        CU6(Editar Usuarios)
        CU7(Consultar Credenciales de Cliente)
    end

    Invitado --> CU1
    Invitado --> CU5
    Invitado --> CU2
    Contador --> CU1
    Contador --> CU3
    Contador --> CU4
    Contador --> CU7
    Admin --> CU1
    Admin --> CU3
    Admin --> CU4
    Admin --> CU6
    Admin --> CU7
    CU2 --> SMTP

    style Admin fill:#ede9fe,stroke:#7c3aed,stroke-width:2px
    style Contador fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style Invitado fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style SMTP fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style Sistema fill:#f8fafc,stroke:#334155,stroke-width:2px,stroke-dasharray: 6 4
```

## Matriz actor ↔ caso de uso

| Caso de uso | Administrador | Contador | Invitado |
| --- | --- | --- | --- |
| Login / Autenticación | ✔ | ✔ | ✔ (crear cuenta) |
| Recuperar contraseña | ✔ | ✔ | ✔ |
| Gestionar clientes | ✔ | ✔ | — |
| Gestionar declaraciones | ✔ | ✔ | — |
| Consultar credenciales de cliente | ✔ | ✔ | — |
| Registrar usuarios | ✔ (via POST público) | — | ✔ (registro propio) |
| Editar usuarios | ✔ | — | — |

## Relación con los módulos

- **Autenticación:** emisión y validación de tokens JWT (`JwtAuthenticationFilter` protege todas las rutas menos las públicas).
- **Módulo de usuarios:** CRUD restringido a `ADMINISTRADOR`; registro y recuperación abiertos.
- **Módulo de clientes:** incluye bóveda de credenciales cifradas.
- **Módulo de declaraciones:** upsert mensual por cliente/año/mes/tipo de impuesto.

> Cada caso de uso tiene su ficha detallada en este directorio (`caso-de-uso-login.md`, `caso-de-uso-gestion-clientes.md`, `caso-de-uso-gestion-declaraciones.md`, `caso-de-uso-recuperacion-contrasena.md`).