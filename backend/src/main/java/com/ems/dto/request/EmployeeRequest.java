package com.ems.dto.request;

import com.ems.entity.Employee;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * EmployeeRequest DTO is used for both creating and updating employees.
 * All validation annotations are applied here, not in the entity,
 * keeping the entity clean and the validation at the API boundary.
 */
@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "First name must contain only letters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Last name must contain only letters")
    private String lastName;

    @NotNull(message = "Gender is required")
    private Employee.Gender gender;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 5, message = "Blood group cannot exceed 5 characters")
    private String bloodGroup;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100)
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Please provide a valid phone number")
    private String phone;

    @Size(max = 100)
    private String emergencyContactName;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid emergency contact phone")
    private String emergencyContactPhone;

    @Size(max = 255)
    private String address;

    @Size(max = 50)
    private String city;

    @Size(max = 50)
    private String state;

    @Size(max = 50)
    private String country;

    @Pattern(regexp = "^[0-9]{4,10}$", message = "Invalid pincode format")
    private String pincode;

    @NotNull(message = "Joining date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate joiningDate;

    @DecimalMin(value = "0.00", message = "Salary cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Invalid salary format")
    private BigDecimal salary;

    @Size(max = 100)
    private String designation;

    private Employee.EmployeeStatus status;

    private Long departmentId;
}
