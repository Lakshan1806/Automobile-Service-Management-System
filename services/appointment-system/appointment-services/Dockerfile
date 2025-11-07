# FILE: Automobile_System/services/appointment-system/appointment-services/Dockerfile

# --- STAGE 1: Build the 'audit-spring-boot-starter' ---
# This stage builds the starter and installs it into the local Maven cache

FROM maven:3.9.6-eclipse-temurin-21 AS starter_build
WORKDIR /build

# Copy the starter's pom and source (paths are from the 'Automobile_System' root)
COPY ./services/audit-spring-boot-starter/pom.xml ./pom.xml
COPY ./services/audit-spring-boot-starter/src ./src

# Build and install it into the container's local .m2 repository
RUN mvn clean install -DskipTests

# --- STAGE 2: Build the 'appointment-service' ---

FROM maven:3.9.6-eclipse-temurin-21 AS app_build
WORKDIR /app

# Copy the .m2 cache from the 'starter_build' stage.
# This cache NOW CONTAINS your audit-spring-boot-starter.jar
COPY --from=starter_build /root/.m2 /root/.m2 

# Now, build the app. (Paths are from the 'Automobile_System' root)
COPY ./services/appointment-system/appointment-services/pom.xml .

# This command will now find the starter in the copied .m2 cache
RUN mvn dependency:go-offline 
COPY ./services/appointment-system/appointment-services/src ./src
RUN mvn clean install -DskipTests

# --- STAGE 3: Final runnable image (no changes here) ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the final .jar from the app_build stage
COPY --from=app_build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]