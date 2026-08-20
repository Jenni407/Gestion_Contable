# Documentación del Sistema de Gestión Contable

Repositorio central de la documentación técnica y funcional del **Sistema de Gestión de Clientes y Declaraciones** (backend Spring Boot + frontend React).

## Estructura

```text
docs/
├── README.md                    # Este índice
├── fases-de-mejora.md           # Fases de mejora del sistema (roadmap)
├── diagramas/                   # Diagramas de flujo del funcionamiento (Mermaid)
│   ├── diagrama-login.md
│   ├── diagrama-recuperacion-contrasena.md
│   ├── diagrama-gestion-clientes.md
│   ├── diagrama-declaraciones.md
│   ├── diagrama-gestion-usuarios.md
│   └── diagrama-flujo-completo.md
├── casos-de-uso/                # Casos de uso del proyecto
│   ├── caso-de-uso-general.md
│   ├── caso-de-uso-login.md
│   ├── caso-de-uso-gestion-clientes.md
│   ├── caso-de-uso-gestion-declaraciones.md
│   └── caso-de-uso-recuperacion-contrasena.md
└── database/                    # Modelo de datos
    ├── diagrama-er.md           # Diagrama Entidad-Relación (Mermaid)
    └── script-creacion-bd.md    # Script SQL de creación de la base de datos
```

## Índice rápido

| Sección | Descripción |
| --- | --- |
| [Fases de mejora](./fases-de-mejora.md) | Roadmap de mejoras. La fase 1 propone separar el módulo de usuarios y credenciales. |
| [Diagramas de flujo](./diagramas/diagrama-login.md) | Flujo funcional del sistema por módulo, en Mermaid con layout adaptativo. |
| [Casos de uso](./casos-de-uso/caso-de-uso-general.md) | Actores, casos de uso y descripciones de flujo del proyecto. |
| [Base de datos](./database/diagrama-er.md) | Modelo entidad-relación y script de creación (SQLite). |

## Stack tecnológico

- **Backend:** Java 17, Spring Boot 3.2, Spring Security + JWT, JPA/Hibernate, Maven.
- **Frontend:** React 19, Vite, Axios.
- **Base de datos:** SQLite (desarrollo/local) — archivo `BD/servicio_contable.db`.