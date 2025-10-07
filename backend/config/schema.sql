-- Create Database
CREATE DATABASE IF NOT EXISTS traffic_optimization;
USE traffic_optimization;

-- Table: parking_zones
CREATE TABLE IF NOT EXISTS parking_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  total_slots INT NOT NULL CHECK (total_slots > 0),
  occupied_slots INT DEFAULT 0 CHECK (occupied_slots >= 0),
  location VARCHAR(255) DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Table: vehicle_logs
CREATE TABLE IF NOT EXISTS vehicle_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number_plate VARCHAR(50) NOT NULL,
  fuel_type ENUM('Petrol', 'Diesel', 'EV', 'CNG') NOT NULL,
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP NULL DEFAULT NULL,
  decision ENUM('Allow', 'Warn', 'Deny') NOT NULL,
  parking_zone_id INT,
  pollution_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(id) ON DELETE SET NULL,
  INDEX idx_number_plate (number_plate),
  INDEX idx_entry_time (entry_time),
  INDEX idx_exit_time (exit_time),
  INDEX idx_parking_zone (parking_zone_id)
);

-- Insert sample parking zones
INSERT INTO parking_zones (name, total_slots, occupied_slots, location) VALUES
('Zone A', 100, 0, 'North Wing'),
('Zone B', 80, 0, 'South Wing'),
('Zone C', 120, 0, 'East Wing');