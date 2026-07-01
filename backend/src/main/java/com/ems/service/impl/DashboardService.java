package com.ems.service.impl;

import com.ems.dto.response.DashboardResponse;
import com.ems.dto.response.EmployeeResponse;
import com.ems.entity.Employee;
import com.ems.mapper.EmployeeMapper;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DashboardService computes all summary statistics displayed on the admin dashboard.
 * Combines data from multiple repositories into a single response object.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats() {
        // Summary counts
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByStatus(Employee.EmployeeStatus.INACTIVE);
        long onLeaveEmployees = employeeRepository.countByStatus(Employee.EmployeeStatus.ON_LEAVE);
        long totalDepartments = departmentRepository.count();

        // Gender distribution
        long maleCount = employeeRepository.countByGender(Employee.Gender.MALE);
        long femaleCount = employeeRepository.countByGender(Employee.Gender.FEMALE);
        long otherGenderCount = employeeRepository.countByGender(Employee.Gender.OTHER);

        // Employees per department (for pie/bar chart)
        Map<String, Long> employeesByDepartment = new LinkedHashMap<>();
        employeeRepository.countByDepartment().forEach(row ->
                employeesByDepartment.put((String) row[0], (Long) row[1]));

        // Monthly joining trend for the current year (for line chart)
        Map<String, Long> monthlyJoiningData = buildMonthlyJoiningData(
                LocalDate.now().getYear());

        // Recent 5 employees
        List<EmployeeResponse> recentEmployees = employeeRepository
                .findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .onLeaveEmployees(onLeaveEmployees)
                .totalDepartments(totalDepartments)
                .maleCount(maleCount)
                .femaleCount(femaleCount)
                .otherGenderCount(otherGenderCount)
                .employeesByDepartment(employeesByDepartment)
                .monthlyJoiningData(monthlyJoiningData)
                .recentEmployees(recentEmployees)
                .build();
    }

    /**
     * Builds a map of month name -> count for all 12 months.
     * Months with no joins default to 0.
     */
    private Map<String, Long> buildMonthlyJoiningData(int year) {
        Map<String, Long> monthlyData = new LinkedHashMap<>();

        // Initialize all 12 months to 0
        for (Month month : Month.values()) {
            monthlyData.put(month.name().substring(0, 3), 0L);
        }

        // Fill in actual data from DB
        employeeRepository.countByMonthAndYear(year).forEach(row -> {
            int monthNumber = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            String monthName = Month.of(monthNumber).name().substring(0, 3);
            monthlyData.put(monthName, count);
        });

        return monthlyData;
    }
}
