# Levantar los servicios con Docker

Guía paso a paso para construir y ejecutar la aplicación con **Docker Compose**.

## 1. Requisitos

- Docker Engine + Docker Compose instalados (verificar con `docker --version` y `docker compose version`).
- Ejecutar los comandos desde la **raíz del repositorio** (la carpeta que contiene `docker-compose.yml`):

```powershell
# Asegúrate de estar ubicado aquí (debe listar docker-compose.yml)
Get-ChildItem docker-compose.yml
```

> Si ejecutas `docker compose` desde otra carpeta, no encontrará el archivo ni el `.env`.

## 2. Configurar variables de entorno

Compose lee las variables de un archivo llamado `.env` en la misma carpeta que `docker-compose.yml`.

```powershell
# Copia el ejemplo (solo la primera vez)
Copy-Item .env.example .env

# Edita .env y define al menos JWT_SECRET, GMAIL_APP_PASSWORD, etc.
notepad .env
```

### Error común: `required variable JWT_SECRET is missing a value`

Ocurre cuando no existe el archivo `.env` o le falta la variable `JWT_SECRET`.

```
error while interpolating services.backend.environment.JWT_SECRET:
required variable JWT_SECRET is missing a value: ...
```

Este error aparece en **cualquier** comando (`up`, `down`, `config`), porque Compose interpola las variables antes de actuar. Solución: crear el `.env` como se indica arriba y verificar que contiene `JWT_SECRET=...`.

Para comprobar que la configuración es válida sin levantar nada:

```powershell
docker compose config --quiet   # si no imprime nada, está bien
```

## 3. Construir y levantar

```powershell
docker compose up -d --build
```

Esto:
1. Construye la imagen del backend (Maven → JRE) y del frontend (Node → nginx).
2. Levanta dos contenedores: `gestion-backend` y `gestion-frontend`.

### Verificar el estado

```powershell
docker compose ps
docker compose logs -f backend    # logs del backend
docker compose logs -f frontend   # logs de nginx
```

La aplicación queda disponible en `http://localhost:8081` (nginx sirve el frontend y hace proxy de `/api` y `/uploads` hacia el backend).

## 4. Crear el usuario administrador

Con una base de datos nueva (vacía), crea el primer usuario administrador:

```powershell
$body = '{"nombre":"Admin","correo":"admin@correo.com","passwordHash":"123admin","rol":"ADMINISTRADOR","estado":"ACTIVO"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/usuarios" -ContentType "application/json" -Body $body
```

Luego inicia sesión en la app con ese correo y contraseña.

## 5. Persistencia

- Base de datos SQLite: `./data/db/servicio_contable.db`
- Comprobantes PDF subidos: `./data/uploads/`

Estos directorios se montan como volúmenes; los datos sobreviven al reinicio de los contenedores.

## 6. Detener y limpiar

```powershell
docker compose down          # detiene y elimina contenedores (conserva imágenes y datos)
docker compose down -v       # además elimina volúmenes (¡borra la base de datos!)
```

## 7. Integrar con Caddy (HTTPS)

Tu Caddy centralizado (que ya sirve otra app) debe enrutar el dominio hacia `localhost:8081`. Ver `Caddyfile` en la raíz:

```
contabilidad.tu-dominio.com {
    encode gzip zstd
    reverse_proxy localhost:8081
}
```

Caddy obtiene y renueva los certificados HTTPS automáticamente. No expongas `8081` al exterior; solo Caddy debe alcanzarlo.

## 8. Solución de problemas

| Problema | Causa probable | Solución |
| --- | --- | --- |
| `JWT_SECRET is missing a value` | Falta `.env` o la variable | Crear `.env` (paso 2) |
| `connection refused` al backend | Backend aún arrancando | Esperar y revisar `docker compose logs backend` |
| Error SMTP al recuperar contraseña | `GMAIL_APP_PASSWORD` vacío | Definir la contraseña de aplicación en `.env` |
| `data/` no se crea | Permisos | Asegurar permisos de escritura en la carpeta raíz |
