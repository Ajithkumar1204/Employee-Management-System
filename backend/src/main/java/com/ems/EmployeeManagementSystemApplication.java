package com.ems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for the Employee Management System.
 *
 * @EnableJpaAuditing  - enables automatic population of createdAt/updatedAt fields
 * @EnableAsync        - enables asynchronous method execution (used for email sending)
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class EmployeeManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagementSystemApplication.class, args);
    }
}
