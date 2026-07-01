package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AuditLog entity tracks every create/update/delete action in the system.
 * This is an enterprise requirement for compliance and traceability.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;  // e.g. "EMPLOYEE", "DEPARTMENT"

    @Column(name = "entity_id")
    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private AuditAction action;  // CREATE, UPDATE, DELETE

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;  // JSON string of previous state

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;  // JSON string of new state

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    public enum AuditAction {
        CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PASSWORD_CHANGE
    }
}
