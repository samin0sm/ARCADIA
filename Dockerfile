# ==========================================
# Multi-Stage Dockerfile for Spring Boot 3
# ==========================================

# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy POM and dependencies first to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root system user for security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy compiled artifact from builder stage
COPY --from=builder /build/target/*.jar app.jar

# JVM memory and container optimization flags
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
