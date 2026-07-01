package com.ems.service;

import com.ems.dto.request.EmployeeRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Employee;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * EmployeeService defines the contract for all employee business operations.
 * The implementation (EmployeeServiceImpl) provides the actual logic.
 * This separation allows easy mocking in tests.
 */
public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    EmployeeResponse getEmployeeByCode(String code);

    PagedResponse<EmployeeResponse> getAllEmployees(int page, int size, String sortBy,
                                                    String sortDir);

    PagedResponse<EmployeeResponse> searchEmployees(String keyword, int page, int size);

    PagedResponse<EmployeeResponse> filterEmployees(Long departmentId,
                                                     Employee.EmployeeStatus status,
                                                     int page, int size);

    void deleteEmployee(Long id);

    EmployeeResponse uploadProfileImage(Long id, MultipartFile file);

    String generateNextEmployeeCode();

    List<EmployeeResponse> getRecentEmployees();

    byte[] exportToExcel();

    byte[] exportToPdf();
}
