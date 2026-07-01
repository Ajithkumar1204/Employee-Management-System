package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * RefreshToken entity stores JWT refresh tokens in the database.
 * This enables server-side invalidation of refresh tokens (true logout).
 *
 * Relationships:
 * - OneToOne with User: each user can have one active refresh token
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The actual token string. Must be unique to prevent collisions.
     */
    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    /**
     * When this token expires. Used to validate incoming refresh requests.
     */
    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    /**
     * OneToOne: Each refresh token belongs to exactly one user.
     * When user logs out, this record is deleted.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
