# ============ ETAPA DE COMPILACIÓN ============
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copia primero el pom para cachear dependencias
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Copia el código fuente y compila el jar
COPY src ./src
RUN mvn -q -B -DskipTests package

# ============ ETAPA DE EJECUCIÓN ============
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copia el jar generado
COPY --from=build /app/target/*.jar app.jar

# Directorios para la BD SQLite y los archivos subidos (montables como volúmenes)
RUN mkdir -p /app/BD /app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
