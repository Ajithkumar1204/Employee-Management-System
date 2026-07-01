package com.ems.dto.response;

import com.ems.entity.Employee;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * EmployeeResponse is the DTO returned in all employee API responses.
 * Never expose the entity directly - always use DTOs to control what data is sent.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeResponse {

    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private Employee.Gender gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String email;
    private String phone;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private LocalDate joiningDate;
    private BigDecimal salary;
    private String designation;
    private Employee.EmployeeStatus status;
    private String profileImageUrl;

    // Nested department info (avoid full department object to prevent infinite recursion)
    private Long departmentId;
    private String departmentName;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}
