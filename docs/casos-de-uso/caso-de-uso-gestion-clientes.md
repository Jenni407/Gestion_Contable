# Caso de Uso — Gestión de Clientes

## Metadatos

| Campo | Valor |
| --- | --- |
| **ID** | CU–03 |
| **Actor(es)** | Administrador y Contador. |
| **Precondición** | Sesión iniciada con token JWT válido. |
| **Postcondición de éxito** | Los datos del cliente y sus credenciales cifradas quedan persistidos en la base de datos. |
| **Endpoints involucrados** | `GET /api/clientes`, `POST /api/clientes`, `PUT /api/clientes/{id}`, `GET /api/clientes/{id}/accesos` |

## Flujo principal (listado y consulta)

1. El usuario accede al menú **Clientes**.
2. El sistema lista los clientes (`GET /api/clientes`) sin exponer credenciales.
3. El usuario puede **buscar** por NIT o nombre/filtrado local.
4. El usuario elige una acción: ver credenciales, editar, o activar/inactivar.

## Flujo principal (registro)

1. El usuario pulsa **Nuevo Cliente** y completa NIT, razón social, régimen fiscal y configuraciones fiscales (IVA general, ISRT, retención ISR).
2. Opcionalmente captura credenciales: Agencia Virtual, FEL y Correo.
3. El sistema envía `POST /api/clientes`.
4. El backend **cifra** cada credencial con `EncriptacionUtil.encriptar(...)` antes de persistir.
5. Se guarda el cliente junto con su `CredencialCliente` (relación 1:1).
6. La lista se refresca.

## Flujo principal (edición y bóveda de credenciales)

1. **Editar:** el usuario modifica datos; si envía credenciales nuevas (no vacías), el backend las cifra y actualiza; si no, conserva las existentes. `PUT /api/clientes/{id}`.
2. **Bóveda de credenciales:** el usuario abre el modal de accesos → `GET /api/clientes/{id}/accesos` → el backend descifra `claveAV`, `claveFEL`, `claveCorreo` y las muestra; opción de copiarlas al portapapeles.
3. **Activar/Inactivar:** el sistema alterna el estado `ACTIVO`/`INACTIVO` y lo persiste con `PUT`.

## Flujos alternos

- **A1.** Cliente no encontrado al consultar accesos → `404` "Cliente no encontrado".
- **A2.** Error al descifrar cargar credenciales → alerta genérica en pantalla.
- **A3.** Fallo de red en cualquier operación → error capturado y mostrado, sin corrupción de datos.

## Reglas de negocio

- `nit` es **único** y obligatorio.
- El `estado` por defecto es `ACTIVO`.
- Las credenciales del cliente **nunca** se devuelven en el listado general; solo en el endpoint de accesos y descifradas.
- En la edición, las credenciales se reemplazan solo si el valor enviado no es nulo ni vacío.

## Diagrama relacionado

Ver [diagrama-gestion-clientes.md](../diagramas/diagrama-gestion-clientes.md) para el flujo gráfico.