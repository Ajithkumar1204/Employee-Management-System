FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw || true
RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java","-jar","target/employee-management-system-1.0.0.jar"]