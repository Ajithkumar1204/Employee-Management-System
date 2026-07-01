package com.ems.service.impl;

import com.ems.dto.request.DepartmentRequest;
import com.ems.dto.response.DepartmentResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: " + request.getName());
        }

        if (departmentRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException(
                    "Department already exists with code: " + request.getCode());
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .code(request.getCode().toUpperCase())
                .headEmployeeId(request.getHeadEmployeeId())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Department saved = departmentRepository.save(department);
        log.info("Department created: {}", saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = findOrThrow(id);

        // Check name conflict with other departments
        departmentRepository.findByName(request.getName())
                .filter(d -> !d.getId().equals(id))
                .ifPresent(d -> {
                    throw new DuplicateResourceException(
                            "Department name already in use: " + request.getName());
                });

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setCode(request.getCode().toUpperCase());
        department.setHeadEmployeeId(request.getHeadEmployeeId());
        if (request.getIsActive() != null) {
            department.setIsActive(request.getIsActive());
        }

        Department updated = departmentRepository.save(department);
        log.info("Department updated: {}", updated.getName());
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = findOrThrow(id);

        // Check if any employees belong to this department
        long employeeCount = employeeRepository.countByDepartmentId(id);
        if (employeeCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete department. " + employeeCount +
                    " employee(s) are assigned to this department. " +
                    "Reassign or remove employees first.");
        }

        departmentRepository.delete(department);
        log.info("Department deleted: {}", department.getName());
    }

    // ---- Private helpers ----

    private Department findOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
    }

    private DepartmentResponse toResponse(Department dept) {
        // Resolve department head name
        String headName = null;
        if (dept.getHeadEmployeeId() != null) {
            headName = employeeRepository.findById(dept.getHeadEmployeeId())
                    .map(Employee::getFullName)
                    .orElse(null);
        }

        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .code(dept.getCode())
                .isActive(dept.getIsActive())
                .headEmployeeId(dept.getHeadEmployeeId())
                .headEmployeeName(headName)
                .employeeCount(dept.getEmployees().size())
                .createdAt(dept.getCreatedAt())
                .updatedAt(dept.getUpdatedAt())
                .build();
    }
}
