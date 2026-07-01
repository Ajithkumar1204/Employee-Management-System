package com.ems.controller;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Employee;
import com.ems.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * EmployeeController exposes all employee-related REST endpoints.
 * Base path: /api/employees
 *
 * Role-based access:
 * - GET endpoints: all authenticated users
 * - POST/PUT/DELETE: ADMIN and HR only
 * - Export: ADMIN and HR only
 */
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "APIs for creating, reading, updating, deleting and exporting employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    // ==================== CREATE ====================

    @PostMapping
    @Operation(summary = "Create Employee", description = "Add a new employee to the system.")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Employee created successfully")
                        .data(response)
                        .statusCode(201)
                        .build());
    }

    // ==================== READ ====================

    @GetMapping
    @Operation(summary = "Get All Employees", description = "Retrieve all employees with pagination and sorting.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeResponse>>> getAllEmployees(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Results per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "firstName") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "asc") String sortDir) {

        PagedResponse<EmployeeResponse> employees =
                employeeService.getAllEmployees(page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", employees));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Employee by ID")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success("Employee retrieved", response));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Employee by Code")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeByCode(
            @PathVariable String code) {
        EmployeeResponse response = employeeService.getEmployeeByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Employee retrieved", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search Employees", description = "Search by name, email, or employee code.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeResponse>>> searchEmployees(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<EmployeeResponse> result =
                employeeService.searchEmployees(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search results", result));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter Employees", description = "Filter by department and/or status.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeResponse>>> filterEmployees(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Employee.EmployeeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<EmployeeResponse> result =
                employeeService.filterEmployees(departmentId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Filtered results", result));
    }

    // ==================== UPDATE ====================

    @PutMapping("/{id}")
    @Operation(summary = "Update Employee")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Employee Status", description = "Quickly toggle employee active/inactive status.")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestParam Employee.EmployeeStatus status) {

        EmployeeResponse current = employeeService.getEmployeeById(id);
        EmployeeRequest partialUpdate = new EmployeeRequest();
        partialUpdate.setStatus(status);
        // For patch, we need to re-set required fields
        partialUpdate.setFirstName(current.getFirstName());
        partialUpdate.setLastName(current.getLastName());
        partialUpdate.setEmail(current.getEmail());
        partialUpdate.setGender(current.getGender());
        partialUpdate.setJoiningDate(current.getJoiningDate());

        EmployeeResponse response = employeeService.updateEmployee(id, partialUpdate);
        return ResponseEntity.ok(ApiResponse.success("Employee status updated", response));
    }

    // ==================== PROFILE IMAGE ====================

    @PostMapping("/{id}/profile-image")
    @Operation(summary = "Upload Profile Image", description = "Upload a profile photo for the employee. Max 5MB, JPEG/PNG/GIF/WebP.")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        EmployeeResponse response = employeeService.uploadProfileImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded", response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
    }

    // ==================== EXPORT ====================

    @GetMapping("/export/excel")
    @Operation(summary = "Export to Excel", description = "Download all employees as an Excel (.xlsx) file.")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<byte[]> exportToExcel() {
        byte[] excelBytes = employeeService.exportToExcel();
        String filename = "employees_" +
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(excelBytes);
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export to PDF", description = "Download all employees as a PDF file.")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<byte[]> exportToPdf() {
        byte[] pdfBytes = employeeService.exportToPdf();
        String filename = "employees_" +
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }
}
