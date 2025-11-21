-- Lead Client CRM Database Schema
-- This file creates all necessary tables with soft delete support

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS lead_client_crm;
-- USE lead_client_crm;

-- Drop tables if they exist (for fresh install)
-- DROP TABLE IF EXISTS activities;
-- DROP TABLE IF EXISTS workflows;
-- DROP TABLE IF EXISTS clients;
-- DROP TABLE IF EXISTS leads;

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(255) DEFAULT NULL,
  assigned_to INT DEFAULT NULL,
  converted_to_client_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_email (email)
);

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  converted_from_lead_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_converted_from_lead (converted_from_lead_id),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_email (email),
  FOREIGN KEY (converted_from_lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- =============================================
-- ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_type ENUM('lead', 'client') NOT NULL,
  parent_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  summary TEXT DEFAULT NULL,
  date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_parent (parent_type, parent_id),
  INDEX idx_type (type),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_date (date)
);

-- =============================================
-- WORKFLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trigger_event VARCHAR(255) NOT NULL,
  conditions JSON DEFAULT NULL,
  actions JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trigger_event (trigger_event),
  INDEX idx_is_active (is_active)
);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Sample leads
INSERT INTO leads (name, email, phone, status, source, assigned_to) VALUES
('John Doe', 'john.doe@example.com', '555-0101', 'new', 'website', 1),
('Jane Smith', 'jane.smith@example.com', '555-0102', 'contacted', 'referral', 1),
('Bob Johnson', 'bob.johnson@example.com', '555-0103', 'qualified', 'social', 2),
('Alice Brown', 'alice.brown@example.com', '555-0104', 'new', 'email', NULL);

-- Sample clients
INSERT INTO clients (name, email, phone, converted_from_lead_id) VALUES
('Tech Corp', 'contact@techcorp.com', '555-0201', NULL),
('Marketing Inc', 'info@marketinginc.com', '555-0202', NULL);

-- Sample activities for leads
INSERT INTO activities (parent_type, parent_id, type, summary, date) VALUES
('lead', 1, 'call', 'Initial contact call made', '2025-11-15'),
('lead', 1, 'email', 'Sent product information', '2025-11-16'),
('lead', 2, 'meeting', 'Product demo scheduled', '2025-11-18'),
('lead', 3, 'call', 'Follow-up call completed', '2025-11-19');

-- Sample activities for clients
INSERT INTO activities (parent_type, parent_id, type, summary, date) VALUES
('client', 1, 'meeting', 'Onboarding meeting', '2025-11-10'),
('client', 1, 'support', 'Technical support provided', '2025-11-12'),
('client', 2, 'call', 'Quarterly review call', '2025-11-14');

-- Sample workflows
INSERT INTO workflows (trigger_event, conditions, actions, is_active) VALUES
(
  'lead_created',
  '[{"field":"source","operator":"equals","value":"website"}]',
  '[{"type":"update_status","status":"contacted"},{"type":"create_activity","activity_type":"note","summary":"New website lead - auto-contacted"}]',
  TRUE
),
(
  'status_updated',
  '[{"field":"status","operator":"equals","value":"qualified"}]',
  '[{"type":"create_activity","activity_type":"note","summary":"Lead qualified - follow up required"},{"type":"assign_user","user_id":1}]',
  TRUE
),
(
  'lead_converted',
  NULL,
  '[{"type":"send_notification","message":"Lead successfully converted to client"}]',
  TRUE
);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count records in each table
-- SELECT 'leads' as table_name, COUNT(*) as count FROM leads WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'clients', COUNT(*) FROM clients WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'activities', COUNT(*) FROM activities WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'workflows', COUNT(*) FROM workflows;

-- =============================================
-- NOTES
-- =============================================
-- 1. Soft delete is implemented using the deleted_at column
-- 2. All queries should include "WHERE deleted_at IS NULL" to exclude deleted records
-- 3. Workflows table does not use soft delete (hard delete only)
-- 4. Foreign key constraint on clients.converted_from_lead_id allows tracking conversion
-- 5. Activities use parent_type and parent_id for polymorphic relationship with leads/clients
