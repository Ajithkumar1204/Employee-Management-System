package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Department entity represents an organizational unit.
 *
 * Relationships:
 * - OneToMany with Employee: a department has many employees
 * - ManyToOne self-reference for department head (an employee)
 */
@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "code", unique = true, length = 20)
    private String code;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Self-referencing join: department head is an employee.
     * We use a simple Long FK here to avoid circular dependency with Employee.
     */
    @Column(name = "head_employee_id")
    private Long headEmployeeId;

    /**
     * OneToMany: One department has many employees.
     * mappedBy = "department" refers to the 'department' field in Employee.
     * FetchType.LAZY avoids loading all employees every time a department is fetched.
     */
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Employee> employees = new ArrayList<>();
}
