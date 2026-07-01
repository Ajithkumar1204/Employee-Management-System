package com.ems.security.service;

import com.ems.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * UserDetailsImpl adapts our User entity to implement Spring Security's UserDetails interface.
 * Spring Security uses this object to perform authentication and authorization.
 *
 * Key methods:
 * - getAuthorities(): returns the user's roles as GrantedAuthority objects
 * - isEnabled(): Spring Security won't authenticate a disabled user
 */
@AllArgsConstructor
@Getter
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    @JsonIgnore  // Never serialize the password in JSON responses
    private String password;

    private Boolean isActive;

    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Factory method to build UserDetailsImpl from our User entity.
     * Converts each role (e.g., ROLE_ADMIN) to a SimpleGrantedAuthority.
     */
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getEmployee() != null ? user.getEmployee().getFirstName() : "",
                user.getEmployee() != null ? user.getEmployee().getLastName() : "",
                user.getPassword(),
                user.getIsActive(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    // Spring Security uses username as the principal identifier.
    // We use email as username since it's unique.
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive != null && isActive;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) obj;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
