package com.ems.mapper;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.entity.Employee;
import org.springframework.stereotype.Component;

/**
 * EmployeeMapper handles all conversions between Employee entity and DTOs.
 * Written manually (instead of MapStruct) for full control and readability.
 *
 * In enterprise projects, MapStruct is preferred for large-scale mapping,
 * but manual mappers make the logic explicit and easy to debug.
 */
@Component
public class EmployeeMapper {

    /**
     * Maps EmployeeRequest DTO to a new Employee entity.
     * Does NOT set department or employeeCode - those are set in the service layer.
     */
    public Employee toEntity(EmployeeRequest request) {
        if (request == null) return null;

        return Employee.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .pincode(request.getPincode())
                .joiningDate(request.getJoiningDate())
                .salary(request.getSalary())
                .designation(request.getDesignation())
                .status(request.getStatus() != null ?
                        request.getStatus() : Employee.EmployeeStatus.ACTIVE)
                .build();
    }

    /**
     * Updates an existing Employee entity with values from the request DTO.
     * Only updates non-null fields to support partial updates.
     */
    public void updateEntityFromRequest(EmployeeRequest request, Employee employee) {
        if (request == null || employee == null) return;

        if (request.getFirstName() != null)
            employee.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null)
            employee.setLastName(request.getLastName().trim());
        if (request.getGender() != null)
            employee.setGender(request.getGender());
        if (request.getDateOfBirth() != null)
            employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getBloodGroup() != null)
            employee.setBloodGroup(request.getBloodGroup());
        if (request.getEmail() != null)
            employee.setEmail(request.getEmail().toLowerCase().trim());
        if (request.getPhone() != null)
            employee.setPhone(request.getPhone());
        if (request.getEmergencyContactName() != null)
            employee.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null)
            employee.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getAddress() != null)
            employee.setAddress(request.getAddress());
        if (request.getCity() != null)
            employee.setCity(request.getCity());
        if (request.getState() != null)
            employee.setState(request.getState());
        if (request.getCountry() != null)
            employee.setCountry(request.getCountry());
        if (request.getPincode() != null)
            employee.setPincode(request.getPincode());
        if (request.getJoiningDate() != null)
            employee.setJoiningDate(request.getJoiningDate());
        if (request.getSalary() != null)
            employee.setSalary(request.getSalary());
        if (request.getDesignation() != null)
            employee.setDesignation(request.getDesignation());
        if (request.getStatus() != null)
            employee.setStatus(request.getStatus());
    }

    /**
     * Maps Employee entity to EmployeeResponse DTO for API output.
     * Flattens the nested Department object to avoid serialization issues.
     */
    public EmployeeResponse toResponse(Employee employee) {
        if (employee == null) return null;

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .gender(employee.getGender())
                .dateOfBirth(employee.getDateOfBirth())
                .bloodGroup(employee.getBloodGroup())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .emergencyContactName(employee.getEmergencyContactName())
                .emergencyContactPhone(employee.getEmergencyContactPhone())
                .address(employee.getAddress())
                .city(employee.getCity())
                .state(employee.getState())
                .country(employee.getCountry())
                .pincode(employee.getPincode())
                .joiningDate(employee.getJoiningDate())
                .salary(employee.getSalary())
                .designation(employee.getDesignation())
                .status(employee.getStatus())
                .profileImageUrl(employee.getProfileImageUrl())
                .departmentId(employee.getDepartment() != null ?
                        employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ?
                        employee.getDepartment().getName() : null)
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .createdBy(employee.getCreatedBy())
                .build();
    }
}
