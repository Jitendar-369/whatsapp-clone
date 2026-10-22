# --- Build: compile the Spring Boot jar ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Download dependencies first so they are cached between builds
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

# --- Run: small Java runtime image ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar

# Free hosting plans have ~512 MB of memory; keep the JVM well inside it
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"

# Hosts like Render pass the port in $PORT (application.properties reads it)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
