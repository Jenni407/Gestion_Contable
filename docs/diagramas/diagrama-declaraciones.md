# Diagrama de Flujo — Gestión de Declaraciones

Flujo del módulo de declaraciones mensuales: el contador registra/actualiza el estado de cada declaración por cliente, mes y tipo de impuesto, y consulta un tablero anual por régimen fiscal.

## Flujo

```mermaid
flowchart TD
    A([Usuario autenticado en el Dashboard]) --> B[App carga clientes y declaraciones<br/>GET /api/clientes + GET /api/declaraciones]
    B --> C{Elige régimen en el menú}
    C -->|Pequeño Contribuyente| D[Matriz mensual IVA pequeño<br/>filtra por régimen y tipo de impuesto]
    C -->|Régimen General| E[Matriz mensual IVA general / ISR<br/>filtra por régimen y tipo de impuesto]

    D --> F[Selecciona una celda mes/cliente<br/>o pulsa Registrar Declaración]
    E --> F
    F --> G[Abre el formulario de la declaración]
    G --> H[Captura estado semáforo, nº formulario SAT,<br/>fecha presentación, ruta PDF, observaciones]
    H --> I[POST /api/declaraciones/guardar]
    I --> J[Backend: valida que el cliente exista]
    J --> K{¿Cliente presente?}
    K -- No --> L[400 - El cliente es obligatorio]
    L --> G
    K -- Sí --> M{Busca por cliente + año + mes + tipoImpuesto}
    M -- Existe --> N[Actualiza estado y datos de la declaración existente]
    M -- No existe --> O[Crea una nueva declaración]
    N --> P[Guardar en BD]
    O --> P
    P --> Q([Tablero actualizado vía recarga])

    style A fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    style Q fill:#d1fae5,stroke:#059669,stroke-width:2px
    style I fill:#fef3c7,stroke:#d97706,stroke-width:1px
    style L fill:#fee2e2,stroke:#dc2626,stroke-width:1px
```

## Detalle de decisiones

| Nodo | Lógica implementada |
| --- | --- |
| Carga de datos | El Dashboard (`App.jsx`) carga clientes y declaraciones en paralelo (`GET /api/clientes` + `GET /api/declaraciones`); las matrices filtran por régimen del cliente y tipo de impuesto en el frontend. |
| Guardado (upsert) | `POST /api/declaraciones/guardar` valida que el cliente exista; luego `findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(...)`: si existe, actualiza (estado, nº formulario, fechas, PDF, bitácora); si no, crea. |
| Tipo de impuesto | Default `IVA_PEQUENO`; valores: `IVA_PEQUENO`, `IVA_GENERAL`, `ISR_TRIMESTRAL`, `RETENCIONES_ISR`. |
| UNIQUE | `(id_cliente, anio, mes, tipo_impuesto)` garantiza una fila por combinación. |
| Semáforo | La matriz pinta la celda según `estadoSemaforo`: `PRESENTADO/PAGADO` = verde, `EN_PROCESO/PENDIENTE_DOCUMENTACION` = amarillo, `OMISO/PENDIENTE` = rojo, período futuro = blanco. |

## Reglas de negocio

- Una misma celda mes/cliente puede alojar declaraciones de **distinto tipo de impuesto**, por eso el `tipo_impuesto` forma parte de la clave de unicidad.
- El `estado_semaforo` (`FUTURO`, `PRESENTADO`, etc.) se actualiza sin duplicar registros (upsert).

## Layout

- Estructura **TD (top-down)** con dos ramas de entrada (regímenes) que convergen en el formulario de guardado.
- Respuestas de error en rojo, acciones de persistencia en ámbar, inicio/fin en azul/verde.
- Sin directivas `%%{init}%%`: el editor (Zed) y las plataformas (GitHub/mermaid.live) aplican su configuración predeterminada.
