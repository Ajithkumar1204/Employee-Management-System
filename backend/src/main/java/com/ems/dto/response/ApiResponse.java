package com.ems.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Generic API response wrapper.
 * Every API endpoint returns this structure for consistency.
 *
 * Example success:
 * { "success": true, "message": "Employee created", "data": {...}, "timestamp": "..." }
 *
 * Example error:
 * { "success": false, "message": "Employee not found", "error": "NOT_FOUND", "timestamp": "..." }
 *
 * @param <T> The type of the data payload
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)  // Omit null fields from JSON output
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String error;
    private Integer statusCode;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Static factory methods for convenience
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .statusCode(200)
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .statusCode(200)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String error, Integer statusCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(error)
                .statusCode(statusCode)
                .build();
    }
}
