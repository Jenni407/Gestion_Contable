# Caso de Uso — Gestión de Declaraciones

## Metadatos

| Campo | Valor |
| --- | --- |
| **ID** | CU–04 |
| **Actor(es)** | Administrador y Contador. |
| **Precondición** | Sesión iniciada; existen clientes registrados; se selecciona un año de trabajo. |
| **Postcondición de éxito** | La declaración del cliente/mes/tipo de impuesto queda creada o actualizada (sin duplicados). |
| **Endpoints involucrados** | `POST /api/declaraciones/guardar`, `GET /api/declaraciones/pequeno-contribuyente?anio`, `GET /api/declaraciones/regimen-general?anio`, `GET /api/declaraciones/tablero?anio` |

## Flujo principal

1. El usuario accede al menú **Declaraciones** y elige el régimen (**Pequeño Contribuyente** o **Régimen General**).
2. El sistema carga el tablero mensual del año seleccionado.
3. El usuario selecciona una celda (clinete + mes) y abre el formulario de la declaración.
4. Captura el estado del semáforo, nº de formulario SAT, fecha de presentación, ruta del comprobante PDF y observaciones de bitácora.
5. El sistema envía `POST /api/declaraciones/guardar` con cliente, año, mes y tipo de impuesto.
6. El backend valida que el cliente exista; si no, responde `400`.
7. El backend busca por `(idCliente, anio, mes, tipoImpuesto)`:
   - **Si existe** → actualiza la declaración.
   - **Si no existe** → crea una nueva.
8. Guarda en base de datos y el tablero se refresca.
9. Vista alternativa: el usuario consulta el **tablero general anual** (`GET /tablero?anio=X`).

## Flujos alternos

- **A1. Cliente obligatorio ausente:** responde `400` → "El cliente es obligatorio".
- **A2. Error interno al procesar:** responde `500` → "Error al procesar la declaración: ...".
- **A3.** Al no existir declaraciones para el año/régimen, el backend responde lista vacía.

## Reglas de negocio

- Clave de unicidad: `(id_cliente, anio, mes, tipo_impuesto)` — nunca hay dos declaraciones iguales para la misma celda y tipo.
- Valores de `tipo_impuesto`: `IVA_PEQUENO`, `IVA_GENERAL`, `ISR_TRIMESTRAL`, `RETENCIONES_ISR`; default `IVA_PEQUENO`.
- El `estado_semaforo` por defecto es `FUTURO`.
- Mismo endpoint de guardado actúa como **insert on conflict = update** (upsert).

## Diagrama relacionado

Ver [diagrama-declaraciones.md](../diagramas/diagrama-declaraciones.md) para el flujo gráfico.