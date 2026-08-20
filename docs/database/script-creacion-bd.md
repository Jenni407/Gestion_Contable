# Script de Creación de la Base de Datos

Script `SQLite` alineado con las entidades JPA del backend (Spring Boot + Hibernate con `ddl-auto=update`). Incluye las tablas, claves foráneas, unicidad y datos iniciales de ejemplo.

## Creación del esquema

```sql
-- ============================================================
-- Sistema de Gestión Contable — Esquema de base de datos (SQLite)
-- Motor: SQLite 3.x | Alineado a entidades JPA (Hibernate Community SQLiteDialect)
-- ============================================================
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Tabla: CLIENTES
-- Contribuyentes / clientes de la oficina contable
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente            INTEGER PRIMARY KEY AUTOINCREMENT,
    nit                   VARCHAR(255) NOT NULL UNIQUE,
    nombre_razon_social   VARCHAR(255) NOT NULL,
    regimen_fiscal        VARCHAR(255) NOT NULL,
    aplica_iva_general    BOOLEAN NOT NULL DEFAULT 1,
    aplica_isrt           BOOLEAN NOT NULL DEFAULT 0,
    aplica_retencion_isr  BOOLEAN NOT NULL DEFAULT 0,
    fecha_nacimiento      VARCHAR(255),
    correo_electronico    VARCHAR(255),
    estado                VARCHAR(255) NOT NULL DEFAULT 'ACTIVO',
    creado_en             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabla: CREDENCIALES_CLIENTES
-- Credenciales cifradas de cada cliente (bóveda de accesos)
-- Relación 1:1 con CLIENTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credenciales_clientes (
    id_credencial        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente           BIGINT NOT NULL UNIQUE,
    pass_agencia_virtual VARCHAR(255),
    pass_fel             VARCHAR(255),
    pass_correo          VARCHAR(255),
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
);

-- ------------------------------------------------------------
-- Tabla: DECLARACIONES_MENSUALES
-- Semáforo mensual de obligaciones por cliente/año/mes/tipo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS declaraciones_mensuales (
    id_declaracion          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente              BIGINT NOT NULL,
    anio                    INTEGER NOT NULL,
    mes                     INTEGER NOT NULL,
    tipo_impuesto           VARCHAR(255) NOT NULL DEFAULT 'IVA_PEQUENO',
    estado_semaforo         VARCHAR(255) NOT NULL DEFAULT 'FUTURO',
    fecha_vencimiento       VARCHAR(255),
    fecha_presentacion      VARCHAR(255),
    numero_formulario_sat   VARCHAR(255),
    ruta_comprobante_pdf    VARCHAR(255),
    observaciones_bitacora  VARCHAR(255),
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
    CONSTRAINT uq_declaracion UNIQUE (id_cliente, anio, mes, tipo_impuesto)
);

-- ------------------------------------------------------------
-- Tabla: USUARIOS
-- Cuentas de acceso al sistema (password con hash BCrypt)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre               VARCHAR(255),
    correo               VARCHAR(255),
    password_hash        VARCHAR(255),
    rol                  VARCHAR(255) DEFAULT 'CONTADOR',
    estado               VARCHAR(255) DEFAULT 'ACTIVO',
    creado_en            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_recuperacion  VARCHAR(255)
);

-- ------------------------------------------------------------
-- Índices de apoyo
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clientes_nit ON clientes (nit);
CREATE INDEX IF NOT EXISTS idx_declaraciones_cliente ON declaraciones_mensuales (id_cliente);
CREATE INDEX IF NOT EXISTS idx_declaraciones_anio ON declaraciones_mensuales (anio);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios (correo);
```

## Datos iniciales (desarrollo)

```sql
-- Usuario administrador por defecto (usuario: Admin, contraseña: 123admin)
-- El hash corresponde a BCrypt de "123admin" (el backend re-cifra en caso de texto plano).
INSERT INTO usuarios (nombre, correo, password_hash, rol, estado)
VALUES ('Admin', 'admin@oficina.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'ADMINISTRADOR', 'ACTIVO');

-- Cliente de ejemplo con credenciales cifradas (los valores son ilustrativos)
INSERT INTO clientes (nit, nombre_razon_social, regimen_fiscal, aplica_iva_general, estado)
VALUES ('CIF-0001', 'Cliente Ejemplo S.A.', 'Régimen General', 1, 'ACTIVO');

INSERT INTO credenciales_clientes (id_cliente, pass_agencia_virtual, pass_fel, pass_correo)
VALUES (1, '<valor cifrado>', '<valor cifrado>', '<valor cifrado>');
```

## Migración de una base existente

SQLite **no permite** `ALTER TABLE ... ADD COLUMN ... NOT NULL` sin un valor por defecto. Si la base existente carece de las columnas nuevas de las entidades, agréguelas manualmente:

```sql
ALTER TABLE clientes ADD COLUMN aplica_iva_general   BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE clientes ADD COLUMN aplica_isrt          BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE clientes ADD COLUMN aplica_retencion_isr BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE declaraciones_mensuales ADD COLUMN tipo_impuesto VARCHAR(255) NOT NULL DEFAULT 'IVA_PEQUENO';
```

## Ejecución

- **Ruta de la base de desarrollo:** `backend/gestionClientes/BD/servicio_contable.db`.
- Con el backend en ejecución, Hibernate (`ddl-auto=update`) crea el esquema automáticamente contra `jdbc:sqlite:BD/servicio_contable.db`.
- Para recargar desde cero: elimine el archivo `.db` y reinicie el backend (la tabla `declaraciones` con `tipo_impuesto` y las columnas fiscales se crearán con el esquema nuevo).

## Diagrama relacionado

Ver [diagrama-er.md](./diagrama-er.md) para el modelo entidad-relación.