package com.ems.repository;

import com.ems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByName(String name);

    Boolean existsByName(String name);

    Boolean existsByCode(String code);

    List<Department> findByIsActiveTrue();

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees WHERE d.isActive = true")
    List<Department> findAllActiveWithEmployeeCount();
}
