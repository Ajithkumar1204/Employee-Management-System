-- ============================================================
-- Employee Management System - Database Schema (MySQL 8)
-- ============================================================
-- Note: Spring Boot's `spring.jpa.hibernate.ddl-auto=update` will
-- auto-generate these tables on first run. This script is provided
-- for reference, manual setup, or documentation purposes.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ems_db;

-- ============================================================
-- ROLES TABLE
-- Stores the 4 system roles: ADMIN, HR, MANAGER, EMPLOYEE
-- ============================================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- USERS TABLE
-- Authentication accounts, separate from Employee profile data
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_token_expiry DATETIME(6),
    last_login DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- USER_ROLES (Join Table) - Many-to-Many: User <-> Role
-- A user can have multiple roles; a role belongs to many users
-- ============================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    head_employee_id BIGINT,  -- soft FK, resolved at app layer to avoid circular dependency
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- EMPLOYEES TABLE
-- Core entity. Many-to-One with Department. One-to-One with User.
-- ============================================================
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    blood_group VARCHAR(5),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    pincode VARCHAR(10),
    joining_date DATE NOT NULL,
    salary DECIMAL(12,2),
    designation VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    profile_image_url VARCHAR(500),
    department_id BIGINT,
    user_id BIGINT UNIQUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_employee_email (email),
    INDEX idx_employee_code (employee_code),
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- REFRESH_TOKENS TABLE
-- One-to-One with User. Stores JWT refresh tokens for revocable sessions.
-- ============================================================
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date DATETIME(6) NOT NULL,
    user_id BIGINT UNIQUE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- AUDIT_LOGS TABLE
-- Tracks every CREATE/UPDATE/DELETE/LOGIN action for compliance
-- ============================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    action VARCHAR(20) NOT NULL,
    performed_by VARCHAR(100),
    performed_at DATETIME(6) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(50),

    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_performed_by (performed_by),
    INDEX idx_audit_performed_at (performed_at)
) ENGINE=InnoDB;

-- ============================================================
-- ENTITY RELATIONSHIP SUMMARY
-- ============================================================
-- 1. User <-> Role        : Many-to-Many (via user_roles join table)
--    A user can have multiple roles (e.g. ADMIN + HR);
--    a role can be assigned to many users.
--
-- 2. User <-> Employee     : One-to-One
--    Each login account is optionally linked to one employee profile.
--    Allows separation between "system access" and "HR data".
--
-- 3. Department <-> Employee : One-to-Many / Many-to-One
--    One department has many employees;
--    each employee belongs to at most one department.
--
-- 4. User <-> RefreshToken : One-to-One
--    Each user has at most one active refresh token at a time
--    (enables single-session enforcement and explicit logout).
--
-- 5. AuditLog : Independent log table
--    Polymorphic reference via (entity_type, entity_id) to track
--    changes across Employee, Department, and other entities
--    without requiring a hard foreign key (keeps audit log
--    resilient even if the referenced row is later deleted).
-- ============================================================

-- ============================================================
-- SEED DATA NOTE
-- ============================================================
-- Roles and the default admin account (admin@ems.com / Admin@123)
-- are automatically created by DataInitializer.java on first
-- application startup. No manual INSERT statements are required.
