package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Role entity represents an access role in the system (ADMIN, HR, MANAGER).
 *
 * Relationships:
 * - ManyToMany with User: a user can have multiple roles; a role can belong to many users
 * - OneToMany with Employee: each employee is assigned one role
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Role name stored as string (e.g., "ROLE_ADMIN").
     * Spring Security requires the "ROLE_" prefix for authority-based checks.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "name", unique = true, nullable = false, length = 30)
    private ERole name;

    @Column(name = "description", length = 255)
    private String description;

    /**
     * ManyToMany with User - mapped in User entity (owning side).
     * mappedBy = "roles" points to the 'roles' field in User entity.
     */
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();

    public enum ERole {
        ROLE_ADMIN,
        ROLE_HR,
        ROLE_MANAGER,
        ROLE_EMPLOYEE
    }
}
