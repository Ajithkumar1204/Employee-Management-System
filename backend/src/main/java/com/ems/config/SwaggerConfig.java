package com.ems.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SwaggerConfig sets up OpenAPI 3.0 documentation.
 * Configures JWT bearer auth so Swagger UI can be used to test protected endpoints.
 *
 * Access at: http://localhost:8080/api/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Employee Management System API")
                        .description("Enterprise-grade Employee Management System REST API.\n\n" +
                                "## Authentication\n" +
                                "1. Use `/api/auth/login` to get your JWT token\n" +
                                "2. Click 'Authorize' button and enter: `Bearer <your-token>`\n" +
                                "3. All protected endpoints will now work")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("EMS Support")
                                .email("support@ems.com"))
                        .license(new License()
                                .name("MIT License")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT Bearer token")));
    }
}
