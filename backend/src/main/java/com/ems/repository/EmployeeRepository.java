package com.ems.repository;

import com.ems.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * EmployeeRepository extends both JpaRepository and JpaSpecificationExecutor.
 * JpaSpecificationExecutor enables dynamic search/filter queries using the Specification pattern.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>,
        JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Boolean existsByEmail(String email);

    Boolean existsByEmployeeCode(String employeeCode);

    // Dashboard Statistics
    long countByStatus(Employee.EmployeeStatus status);

    long countByDepartmentId(Long departmentId);

    long countByGender(Employee.Gender gender);

    // Search across multiple fields
    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Employee> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Monthly joining report for dashboard chart
    @Query("SELECT MONTH(e.joiningDate), COUNT(e) FROM Employee e " +
            "WHERE YEAR(e.joiningDate) = :year GROUP BY MONTH(e.joiningDate)")
    List<Object[]> countByMonthAndYear(@Param("year") int year);

    // Recent employees for dashboard
    List<Employee> findTop5ByOrderByCreatedAtDesc();

    // Employees by department for chart
    @Query("SELECT e.department.name, COUNT(e) FROM Employee e " +
            "WHERE e.department IS NOT NULL GROUP BY e.department.name")
    List<Object[]> countByDepartment();

    // Filter by department and/or status with pagination.
    // Either parameter may be null - the query treats a null filter as "match anything",
    // unlike a derived findByDepartmentIdAndStatus() method which would require both.
    @Query("SELECT e FROM Employee e WHERE " +
            "(:departmentId IS NULL OR e.department.id = :departmentId) AND " +
            "(:status IS NULL OR e.status = :status)")
    Page<Employee> filterByDepartmentAndStatus(@Param("departmentId") Long departmentId,
                                                @Param("status") Employee.EmployeeStatus status,
                                                Pageable pageable);

    // Employees joining between dates
    List<Employee> findByJoiningDateBetween(LocalDate startDate, LocalDate endDate);
}
