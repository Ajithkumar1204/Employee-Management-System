package com.ems.service.impl;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.request.PasswordDTOs;
import com.ems.dto.request.RegisterRequest;
import com.ems.dto.response.AuthResponse;
import com.ems.entity.RefreshToken;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.exception.BadRequestException;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.RoleRepository;
import com.ems.repository.UserRepository;
import com.ems.security.jwt.JwtUtils;
import com.ems.security.service.UserDetailsImpl;
import com.ems.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    /**
     * Authenticates the user and returns JWT tokens.
     * Steps:
     * 1. Delegate to AuthenticationManager (which calls UserDetailsService internally)
     * 2. On success, generate JWT access token and refresh token
     * 3. Return user info + tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        // Authenticate via Spring Security (throws exception on failure)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Generate JWT access token
        String accessToken = jwtUtils.generateJwtToken(authentication);

        // Generate refresh token (stored in DB)
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        // Update last login time
        userRepository.findById(userDetails.getId()).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        log.info("User logged in: {}", userDetails.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(userDetails.getId())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .roles(roles)
                .expiresIn(86400000L)
                .build();
    }

    /**
     * Registers a new user account.
     * Assigns default role ROLE_EMPLOYEE unless specific roles are provided.
     */
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check for duplicate email
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException(
                    "Email address is already registered: " + registerRequest.getEmail());
        }

        // Resolve roles
        Set<Role> roles = resolveRoles(registerRequest.getRoles());

        // Create User entity
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .isActive(true)
                .isEmailVerified(false)
                .emailVerificationToken(UUID.randomUUID().toString())
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        log.info("New user registered: {}", savedUser.getEmail());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = jwtUtils.generateJwtToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        List<String> roleNames = roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .roles(roleNames)
                .expiresIn(86400000L)
                .build();
    }

    /**
     * Invalidates the refresh token (logout).
     * Access tokens remain valid until expiry (stateless), but refresh tokens are deleted.
     */
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
        SecurityContextHolder.clearContext();
        log.info("User logged out, userId: {}", userId);
    }

    /**
     * Generates a new access token from a valid refresh token.
     */
    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Refresh token not found. Please login again."));

        refreshToken = refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtils.generateTokenFromEmail(user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .build();
    }

    /**
     * Initiates forgot password flow - generates a reset token and sends email.
     */
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + email));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // In production: send email with reset link
        // emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        log.info("Password reset token generated for: {} | Token: {}", email, resetToken);
    }

    /**
     * Resets the password using a valid reset token.
     */
    @Transactional
    public void resetPassword(PasswordDTOs.ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException(
                        "Invalid or expired password reset token."));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for: {}", user.getEmail());
    }

    /**
     * Changes password for authenticated user.
     */
    @Transactional
    public void changePassword(Long userId, PasswordDTOs.ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for userId: {}", userId);
    }

    // ---- Private helpers ----

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();

        if (roleNames == null || roleNames.isEmpty()) {
            // Default role
            Role employeeRole = roleRepository.findByName(Role.ERole.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("Default role ROLE_EMPLOYEE not found. Run data initializer."));
            roles.add(employeeRole);
        } else {
            roleNames.forEach(roleName -> {
                Role.ERole eRole = switch (roleName.toUpperCase()) {
                    case "ADMIN", "ROLE_ADMIN" -> Role.ERole.ROLE_ADMIN;
                    case "HR", "ROLE_HR" -> Role.ERole.ROLE_HR;
                    case "MANAGER", "ROLE_MANAGER" -> Role.ERole.ROLE_MANAGER;
                    default -> Role.ERole.ROLE_EMPLOYEE;
                };
                Role role = roleRepository.findByName(eRole)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + eRole));
                roles.add(role);
            });
        }

        return roles;
    }
}
