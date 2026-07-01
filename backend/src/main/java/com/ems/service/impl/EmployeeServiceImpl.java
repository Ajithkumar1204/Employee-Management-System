package com.ems.service.impl;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.AuditLog;
import com.ems.exception.BadRequestException;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.mapper.EmployeeMapper;
import com.ems.repository.AuditLogRepository;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;
    private final AuditLogRepository auditLogRepository;

    // Used only to serialize EmployeeResponse snapshots for audit logging.
    // Configured with JavaTimeModule so LocalDate/LocalDateTime fields serialize correctly.
    private static final ObjectMapper AUDIT_JSON_MAPPER =
            new ObjectMapper().registerModule(new JavaTimeModule());

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        // Validate unique email
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Employee with email already exists: " + request.getEmail());
        }

        // Resolve department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
        }

        // Map DTO to entity
        Employee employee = employeeMapper.toEntity(request);
        employee.setEmployeeCode(generateNextEmployeeCode());
        employee.setDepartment(department);
        employee.setStatus(request.getStatus() != null ?
                request.getStatus() : Employee.EmployeeStatus.ACTIVE);

        Employee savedEmployee = employeeRepository.save(employee);

        // Persist audit log
        saveAuditLog("EMPLOYEE", savedEmployee.getId(), AuditLog.AuditAction.CREATE,
                null, toAuditJson(savedEmployee));

        log.info("Employee created: {} - {}", savedEmployee.getEmployeeCode(),
                savedEmployee.getFullName());

        return employeeMapper.toResponse(savedEmployee);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findEmployeeOrThrow(id);

        // Check if email is being changed to one that's already taken by another employee
        if (!employee.getEmail().equals(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use: " + request.getEmail());
        }

        String oldValues = toAuditJson(employee);

        // Update department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
            employee.setDepartment(department);
        }

        // Apply updates from DTO to existing entity
        employeeMapper.updateEntityFromRequest(request, employee);

        Employee updatedEmployee = employeeRepository.save(employee);

        saveAuditLog("EMPLOYEE", updatedEmployee.getId(), AuditLog.AuditAction.UPDATE,
                oldValues, toAuditJson(updatedEmployee));

        log.info("Employee updated: {}", updatedEmployee.getEmployeeCode());

        return employeeMapper.toResponse(updatedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        return employeeMapper.toResponse(findEmployeeOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByCode(String code) {
        Employee employee = employeeRepository.findByEmployeeCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "code", code));
        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getAllEmployees(int page, int size,
                                                           String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Employee> employeePage = employeeRepository.findAll(pageable);

        return buildPagedResponse(employeePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> searchEmployees(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<Employee> employeePage = employeeRepository.searchByKeyword(keyword, pageable);
        return buildPagedResponse(employeePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> filterEmployees(Long departmentId,
                                                            Employee.EmployeeStatus status,
                                                            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<Employee> employeePage = employeeRepository
                .filterByDepartmentAndStatus(departmentId, status, pageable);
        return buildPagedResponse(employeePage);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        saveAuditLog("EMPLOYEE", id, AuditLog.AuditAction.DELETE,
                toAuditJson(employee), null);
        employeeRepository.delete(employee);
        log.info("Employee deleted: {}", employee.getEmployeeCode());
    }

    @Override
    @Transactional
    public EmployeeResponse uploadProfileImage(Long id, MultipartFile file) {
        Employee employee = findEmployeeOrThrow(id);

        validateImageFile(file);

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename to prevent collisions
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = "emp_" + id + "_" + UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Delete old profile image if exists
            if (employee.getProfileImageUrl() != null) {
                deleteOldProfileImage(employee.getProfileImageUrl());
            }

            employee.setProfileImageUrl("/uploads/profile-images/" + filename);
            Employee updatedEmployee = employeeRepository.save(employee);

            log.info("Profile image uploaded for employee: {}", employee.getEmployeeCode());

            return employeeMapper.toResponse(updatedEmployee);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }
    }

    @Override
    public String generateNextEmployeeCode() {
        long count = employeeRepository.count() + 1;
        return String.format("EMP%05d", count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getRecentEmployees() {
        return employeeRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToExcel() {
        List<Employee> employees = employeeRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employees");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create header row
            String[] headers = {"#", "Employee Code", "Full Name", "Email", "Phone",
                    "Department", "Designation", "Status", "Joining Date", "Salary"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            // Data rows
            int rowNum = 1;
            for (Employee emp : employees) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(emp.getEmployeeCode());
                row.createCell(2).setCellValue(emp.getFullName());
                row.createCell(3).setCellValue(emp.getEmail());
                row.createCell(4).setCellValue(emp.getPhone() != null ? emp.getPhone() : "");
                row.createCell(5).setCellValue(emp.getDepartment() != null ?
                        emp.getDepartment().getName() : "");
                row.createCell(6).setCellValue(emp.getDesignation() != null ?
                        emp.getDesignation() : "");
                row.createCell(7).setCellValue(emp.getStatus().name());
                row.createCell(8).setCellValue(emp.getJoiningDate().toString());
                row.createCell(9).setCellValue(emp.getSalary() != null ?
                        emp.getSalary().doubleValue() : 0);
            }

            // Auto-size all columns after data is added
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToPdf() {
        // PDF export implementation would use iText library
        // Returning a placeholder - full implementation requires iText setup
        throw new UnsupportedOperationException("PDF export - implement with iText");
    }

    // ---- Private helper methods ----

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    private PagedResponse<EmployeeResponse> buildPagedResponse(Page<Employee> page) {
        List<EmployeeResponse> content = page.getContent()
                .stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());

        return PagedResponse.<EmployeeResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/png", "image/gif", "image/webp");

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException(
                    "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {  // 5MB
            throw new BadRequestException("File size exceeds the 5MB limit.");
        }
    }

    private void deleteOldProfileImage(String imageUrl) {
        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete old profile image: {}", e.getMessage());
        }
    }

    /**
     * Serializes an Employee entity to JSON for audit log storage.
     * Goes through EmployeeMapper.toResponse() first so we only serialize
     * flattened DTO fields (never the lazy department/user associations directly),
     * avoiding LazyInitializationException and producing genuinely readable audit data.
     */
    private String toAuditJson(Employee employee) {
        try {
            return AUDIT_JSON_MAPPER.writeValueAsString(employeeMapper.toResponse(employee));
        } catch (Exception e) {
            log.warn("Failed to serialize employee for audit log: {}", e.getMessage());
            return "{\"error\":\"serialization_failed\"}";
        }
    }

    private void saveAuditLog(String entityType, Long entityId,
                               AuditLog.AuditAction action,
                               String oldValues, String newValues) {
        String currentUser = "SYSTEM";
        try {
            currentUser = SecurityContextHolder.getContext()
                    .getAuthentication().getName();
        } catch (Exception ignored) {}

        AuditLog log = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .performedBy(currentUser)
                .performedAt(LocalDateTime.now())
                .oldValues(oldValues)
                .newValues(newValues)
                .build();

        auditLogRepository.save(log);
    }
}
