-- SQL schema for Smart QR-Based Access Control and Attendance Management System

CREATE DATABASE IF NOT EXISTS smartgate;
USE smartgate;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  job_title VARCHAR(100),
  date_of_birth DATE,
  blood_type VARCHAR(10),
  photo VARCHAR(255),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  notification_frequency ENUM('daily','weekly','monthly') DEFAULT 'daily',
  qr_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action ENUM('entry','exit') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
