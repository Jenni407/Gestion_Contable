 #Sistema de Gestión de clientes

Tecnologías Utilizadas
Frontend: React 

Backend: Java Spring Boot (REST API), JPA / Hibernate, Maven.

Base de Datos: SQLite (desarrollo/local).

 Estructura General del Proyecto
Plaintext
├── backend/                  # Proyecto Java con Spring Boot
│   ├── src/main/java/        # Controladores, Entidades, Servicios y Repositorios
│   ├── src/main/resources/   # application.properties / database.db
│   └── pom.xml               # Configuración de dependencias Maven
│
└── frontend/                 # Proyecto React
    ├── src/
    │   ├── api/              # Configuración de Axios/Rutas de API
    │   ├── componentes/      # Modales, Formularios y UI (ej. Boton, DeclaracionRegimenGeneralForm)
    │   ├── vistas/           # Pantallas principales (Declaraciones, Clientes, etc.)
    │   └── icons/            # Íconos SVG personalizados
    ├── package.json          # Dependencias de npm
    └── vite.config.js        # Configuración de Vite / React
Requisitos Previos
asegúrate de tener instalado en tu máquina:

Java Development Kit (JDK 17 o superior)

Node.js (versión 18+ recomendada) y npm

Maven 3.8+ (o usar el wrapper ./mvnw incluido en el backend)

BD.

Configuración y Compilación del Proyecto
Clonar el Repositorio
Bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
Backend (Spring Boot)
Ve a la carpeta del servidor:

Bash
cd backend
Configura las propiedades (src/main/resources/application.properties):
Asegúrate de que la conexión a SQLite apunta a tu archivo .db o crea uno automáticamente:

Properties
spring.datasource.url=jdbc:sqlite:declaraciones.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
server.port=8080
Compilar el proyecto con Maven:

Bash
mvn clean compile
Ejecutar el backend:

Bash
mvn spring-boot:run
El servidor iniciará por defecto en: http://localhost:8080

Frontend (React)
Ve a la carpeta del cliente (en otra terminal):

Bash
cd frontend
Instalar dependencias de Node:

Bash
npm install
Ejecutar en entorno de desarrollo:

Bash
npm run dev
La aplicación estará disponible en: http://localhost:5173 o http://localhost:3000

CONTRASEÑA DE USUARIO: 123admin usuario Admin

## Variables de entorno (obligatorias en producción)

Los secretos ya no se almacenan en el código. Define estas variables antes de ejecutar (ver `.env.example`):

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `JWT_SECRET` | Clave para firmar tokens JWT | valor largo y aleatorio |
| `GMAIL_USER` | Correo emisor SMTP | `soporte.tecnico.gt058@gmail.com` |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail | `tu-app-password` |
| `APP_ENCRYPTION_KEY` | Clave AES para credenciales (debe coincidir con la de los datos existentes) | `OficinaSecret123` |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS permitidos (coma) | `http://localhost:5173` |
| `PORTAL_URL` | URL pública del portal (enlaces de correos) | `http://localhost:5173` |
| `DB_URL` | Cadena JDBC | `jdbc:sqlite:BD/servicio_contable.db` |
| `VITE_API_URL` | URL base del backend (frontend) | `http://localhost:8080/api` |

Ejemplo en PowerShell:

```powershell
$env:JWT_SECRET="valor-largo-y-aleatorio"
$env:GMAIL_APP_PASSWORD="tu-app-password"
.\mvnw.cmd spring-boot:run
```

## Despliegue con Docker (producción)

La aplicación está containerizada con **Docker Compose**: el backend (Spring Boot) y el frontend (React servido por **nginx**, que además hace de proxy `/api` y `/uploads` hacia el backend).

### 1. Configurar variables

```powershell
Copy-Item .env.example .env
# Edita .env y define JWT_SECRET, GMAIL_APP_PASSWORD, etc.
```

### 2. Construir y levantar

```powershell
docker compose up -d --build
```

- nginx queda expuesto en `http://localhost:8081` (solo para que Caddy lo alcance).
- La base SQLite persiste en `./data/db` y los comprobantes PDF en `./data/uploads`.

### 3. Integrar con Caddy centralizado

Tu Caddy (contenedor centralizado que ya sirve otra app) debe enrutar el dominio de esta aplicación hacia `localhost:8081`. Caddy se encarga de los certificados HTTPS automáticamente. Ver el archivo `Caddyfile` de ejemplo:

```
contabilidad.tu-dominio.com {
    encode gzip zstd
    reverse_proxy localhost:8081
}
```

> Nota: si Caddy corre en un contenedor, usa la IP del host o una red docker compartida en lugar de `localhost`.

### 4. Primer usuario administrador

Al desplegar una BD nueva, crea el usuario administrador con:

```powershell
$body = '{"nombre":"Admin","correo":"admin@correo.com","passwordHash":"123admin","rol":"ADMINISTRADOR","estado":"ACTIVO"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/usuarios" -ContentType "application/json" -Body $body
```
