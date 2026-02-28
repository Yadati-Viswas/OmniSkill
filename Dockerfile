# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend-quiz
COPY frontend-quiz/package*.json ./
RUN npm ci
COPY frontend-quiz/ ./
RUN npm run build

FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend-quiz/Backend
COPY backend-quiz/Backend/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY backend-quiz/Backend/src ./src
COPY --from=frontend-build /app/frontend-quiz/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql postgresql-contrib ca-certificates bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
COPY --from=backend-build /app/backend-quiz/Backend/target/Backend-1.0-SNAPSHOT.jar /opt/app/app.jar
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV POSTGRES_DB=omniquiz \
    POSTGRES_USER=omniquiz \
    POSTGRES_PASSWORD=omniquiz \
    JWT_SECRET_KEY=change-me-in-production \
    SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080 5432

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
