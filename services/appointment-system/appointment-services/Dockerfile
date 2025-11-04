# STAGE 1: Build the application using Maven and Java 21
# We use 'AS build' to name this stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
# This is a Docker optimization. Dependencies are only re-downloaded if pom.xml changes.
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of your source code and build the .jar file
COPY src ./src
RUN mvn clean install -DskipTests

# STAGE 2: Create the final, lightweight runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built .jar file from the 'build' stage
COPY --from=build /app/target/appointment-services-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 (the default port for Spring Boot)
EXPOSE 8080

# The command to run your application
ENTRYPOINT ["java", "-jar", "app.jar"]