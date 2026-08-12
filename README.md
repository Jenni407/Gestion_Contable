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
