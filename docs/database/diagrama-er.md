# Diagrama Entidad-Relación (ER)

Modelo de datos del Sistema de Gestión Contable (SQLite). Incluye las cuatro tablas del sistema y sus relaciones.

## Diagrama ER

```mermaid
erDiagram
    CLIENTES {
        integer id_cliente PK
        varchar nit UK "NIT único"
        varchar nombre_razon_social
        varchar regimen_fiscal
        boolean aplica_iva_general "default true"
        boolean aplica_isrt "default false"
        boolean aplica_retencion_isr "default false"
        varchar fecha_nacimiento
        varchar correo_electronico
        varchar estado "ACTIVO/INACTIVO"
        varchar creado_en
    }

    CREDENCIALES_CLIENTES {
        integer id_credencial PK
        integer id_cliente FK "relación 1:1"
        varchar pass_agencia_virtual "cifrada"
        varchar pass_fel "cifrada"
        varchar pass_correo "cifrada"
    }

    DECLARACIONES_MENSUALES {
        integer id_declaracion PK
        integer id_cliente FK
        integer anio
        integer mes
        varchar tipo_impuesto "IVA_PEQUENO / IVA_GENERAL / ISR_TRIMESTRAL / RETENCIONES_ISR"
        varchar estado_semaforo "FUTURO / PRESENTADO / ..."
        varchar fecha_vencimiento
        varchar fecha_presentacion
        varchar numero_formulario_sat
        varchar ruta_comprobante_pdf
        varchar observaciones_bitacora
    }

    USUARIOS {
        integer id_usuario PK
        varchar nombre
        varchar correo
        varchar password_hash "BCrypt"
        varchar rol "ADMINISTRADOR / CONTADOR"
        varchar estado "ACTIVO/INACTIVO"
        varchar creado_en
        varchar codigo_recuperacion
    }

    CLIENTES ||--o| CREDENCIALES_CLIENTES : "posee (1:1)"
    CLIENTES ||--o{ DECLARACIONES_MENSUALES : "genera (1:N)"
```

## Restricciones clave

| Tabla | Restricción |
| --- | --- |
| `clientes` | `nit` `UNIQUE NOT NULL` |
| `credenciales_clientes` | `id_cliente` `UNIQUE` (relación 1:1 con `clientes`) |
| `declaraciones_mensuales` | `UNIQUE (id_cliente, anio, mes, tipo_impuesto)` |
| `usuarios` | Sin restricciones adicionales en la implementación actual |

## Convenciones

- **PK** = clave primaria (`id_<tabla>` con autoincremento).
- **FK** = clave foránea por `id_cliente`.
- Los campos `creado_en` son mantenidos por la base de datos (`insertable = false, updatable = false`).
- Las credenciales del cliente se almacenan **cifradas** (`EncriptacionUtil`); `password_hash` de usuarios se almacena con **BCrypt**.

## Nota de alineación

La base de datos existente (`BD/servicio_contable.db`) puede **no** contener aún las columnas nuevas de las entidades (`aplica_iva_general`, `aplica_isrt`, `aplica_retencion_isr` en `clientes`; `tipo_impuesto` en `declaraciones_mensuales`). Para una base nueva use el script de creación. Para migrar una existente, SQLite exige agregar columnas `NOT NULL` con valor por defecto (ver [script-creacion-bd.md](./script-creacion-bd.md), sección *Migración*).

## Script relacionado

Ver [script-creacion-bd.md](./script-creacion-bd.md) para el DDL completo de creación.