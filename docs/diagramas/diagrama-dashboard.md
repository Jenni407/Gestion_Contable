# Diagrama de Flujo — Dashboard y Métricas

Flujo del panel principal: tras autenticarse, la aplicación carga clientes y declaraciones en paralelo, muestra las métricas y expone el menú lateral desde el que se accede a cada módulo del sistema.

## Flujo

```mermaid
flowchart TD
    A([Login exitoso]) --> B[Dashboard: métricas y menú lateral]
    B --> C[App carga datos en paralelo<br/>Promise.allSettled]
    C --> D{¿Respuestas del backend?}
    D -->|Clientes| E[GET /api/clientes<br/>lista de clientes]
    D -->|Declaraciones| F[GET /api/declaraciones<br/>todas las declaraciones]
    E --> G[Muestra métricas: clientes activos,<br/>declaraciones registradas y rol]
    F --> G
    G --> H{Sección seleccionada en el menú}
    H -->|Inicio| I([Métricas y bienvenida])
    H -->|Clientes / Crear Cliente| J[Módulo de clientes]
    H -->|Declaraciones| K[Matriz pequeño contribuyente / régimen general]
    H -->|Reportes| L[Reporte pequeño contribuyente / régimen general]
    H -->|Usuarios| M{¿Rol ADMINISTRADOR?}
    M -- Sí --> N[Módulo de usuarios]
    M -- No --> O[Acceso restringido]
    H -->|Cerrar sesión| P[Flujo de cierre de sesión]

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style I fill:#d1fae5,stroke:#059669,stroke-width:2px
    style E fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style F fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style M fill:#ede9fe,stroke:#7c3aed,stroke-width:1px
    style O fill:#fee2e2,stroke:#dc2626,stroke-width:1px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Carga en paralelo | `App.jsx` usa `Promise.allSettled` sobre `ClientesAPI.obtenerTodos()` y `DeclaracionesAPI.obtenerTodas()` al autenticarse. |
| Métricas | Tarjetas con `clientes.length`, `declaraciones.length` y `usuario.rol`. |
| Secciones del menú | `DashboardLayout` define: Inicio, Clientes, Crear Cliente, Declaraciones (Pequeño/Régimen General), Reportes (Pequeño/Régimen General) y Usuarios (solo administrador). |

## Layout

- Estructura **TD (top-down)**; inicio/fin en azul/verde, persistencia en ámbar, decisión de permisos en morado y error en rojo, coherente con el resto de la documentación.
