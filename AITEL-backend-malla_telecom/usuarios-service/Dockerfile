# Build context = raíz de AITEL-backend-malla_telecom (necesita el pom.xml padre
# y los pom.xml de los módulos hermanos para que Maven resuelva el reactor).
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

COPY pom.xml .
COPY usuarios-service/pom.xml usuarios-service/pom.xml
COPY cursos-service/pom.xml cursos-service/pom.xml
COPY semestres-service/pom.xml semestres-service/pom.xml
COPY comentarios-service/pom.xml comentarios-service/pom.xml
COPY gateway-service/pom.xml gateway-service/pom.xml

# Paso separado: resuelve dependencias solo a partir de los pom.xml. Esta capa
# solo se invalida si cambia un pom.xml, no cada vez que cambia el codigo -
# evita volver a descargar todo Maven Central en cada rebuild.
RUN mvn -q -pl usuarios-service -am dependency:go-offline

COPY usuarios-service/src usuarios-service/src
RUN mvn -q -pl usuarios-service package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/usuarios-service/target/*.jar app.jar
EXPOSE 8001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
