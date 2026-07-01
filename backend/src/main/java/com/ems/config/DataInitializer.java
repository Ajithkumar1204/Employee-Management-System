package com.ems.config;

import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.RoleRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * DataInitializer runs once at application startup.
 * Seeds the database with:
 * 1. All 4 roles (ROLE_ADMIN, ROLE_HR, ROLE_MANAGER, ROLE_EMPLOYEE)
 * 2. A default admin user (admin@ems.com / Admin@123)
 *
 * This ensures the application is usable immediately after first boot.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initAdminUser();
    }

    private void initRoles() {
        List<Role.ERole> allRoles = Arrays.asList(
                Role.ERole.ROLE_ADMIN,
                Role.ERole.ROLE_HR,
                Role.ERole.ROLE_MANAGER,
                Role.ERole.ROLE_EMPLOYEE
        );

        allRoles.forEach(eRole -> {
            if (!roleRepository.existsByName(eRole)) {
                Role role = Role.builder()
                        .name(eRole)
                        .description(getDescription(eRole))
                        .build();
                roleRepository.save(role);
                log.info("Role created: {}", eRole);
            }
        });
    }

    private void initAdminUser() {
        String adminEmail = "admin@ems.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(roles)
                    .build();

            userRepository.save(adminUser);
            log.info("=================================================");
            log.info("Default admin created:");
            log.info("  Email   : {}", adminEmail);
            log.info("  Password: Admin@123");
            log.info("  *** Change this password immediately! ***");
            log.info("=================================================");
        }
    }

    private String getDescription(Role.ERole eRole) {
        return switch (eRole) {
            case ROLE_ADMIN    -> "Full system access. Manages all modules, users, and settings.";
            case ROLE_HR       -> "Human Resources. Manages employees, departments, and reports.";
            case ROLE_MANAGER  -> "Department Manager. View team data and reports.";
            case ROLE_EMPLOYEE -> "Regular employee. View own profile and limited data.";
        };
    }
}
