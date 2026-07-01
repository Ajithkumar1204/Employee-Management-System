package com.ems.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DashboardResponse aggregates all statistics needed by the frontend dashboard.
 * Returned in a single API call to minimize frontend round trips.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // Summary cards
    private Long totalEmployees;
    private Long activeEmployees;
    private Long inactiveEmployees;
    private Long totalDepartments;
    private Long onLeaveEmployees;

    // Gender ratio chart data
    private Long maleCount;
    private Long femaleCount;
    private Long otherGenderCount;

    // Department distribution for pie/bar chart
    // Key = Department name, Value = employee count
    private Map<String, Long> employeesByDepartment;

    // Monthly joining trend for line chart
    // Key = month name (Jan, Feb...), Value = count
    private Map<String, Long> monthlyJoiningData;

    // Recent employees list
    private List<EmployeeResponse> recentEmployees;
}
