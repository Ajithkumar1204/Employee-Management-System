package com.ems.controller;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.request.PasswordDTOs;
import com.ems.dto.request.RefreshTokenRequest;
import com.ems.dto.request.RegisterRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.AuthResponse;
import com.ems.security.service.UserDetailsImpl;
import com.ems.service.impl.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles all authentication-related endpoints.
 * Base path: /api/auth (public - no JWT required)
 *
 * Endpoints:
 * POST /auth/login          - Authenticate user, return JWT tokens
 * POST /auth/register       - Create new user account
 * POST /auth/logout         - Invalidate refresh token
 * POST /auth/refresh-token  - Get new access token using refresh token
 * POST /auth/forgot-password - Send password reset email
 * POST /auth/reset-password  - Reset password using token from email
 * POST /auth/change-password - Change password (authenticated)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth management APIs - Register, Login, Logout, Token Refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate with email and password. Returns JWT access and refresh tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest) {

        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Create a new user account. Returns JWT tokens for immediate login.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest registerRequest) {

        AuthResponse authResponse = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Registration successful. Welcome!")
                        .data(authResponse)
                        .statusCode(201)
                        .build());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidates the refresh token. Access token remains valid until expiry.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        authService.logout(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh Token", description = "Get a new access token using a valid refresh token.")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse authResponse = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Send a password reset link to the provided email address.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody PasswordDTOs.ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());
        // Always return success to prevent email enumeration attacks
        return ResponseEntity.ok(ApiResponse.success(
                "If an account with that email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Reset password using the token received via email.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody PasswordDTOs.ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please login."));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Change password for the authenticated user.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody PasswordDTOs.ChangePasswordRequest request) {

        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User", description = "Returns info about the currently authenticated user.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailsImpl>> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        return ResponseEntity.ok(ApiResponse.success("Current user info", currentUser));
    }
}
