# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn package -DskipTests -B -q

# Run stage
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl

WORKDIR /app
COPY --from=build /app/target/CaiseMayaGroup-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=12 --start-period=90s \
  CMD curl -f http://localhost:8080/api/categories || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
