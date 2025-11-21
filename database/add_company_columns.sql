-- =============================================
-- ADD COMPANY COLUMNS TO LEADS AND CLIENTS
-- =============================================
-- Run this script in phpMyAdmin to add company columns
-- Database: lead_client_crm

USE lead_client_crm;

-- Check if company column exists in leads table, if not add it
SET @dbname = 'lead_client_crm';
SET @tablename = 'leads';
SET @columnname = 'company';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " VARCHAR(255) DEFAULT NULL AFTER name")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check if company column exists in clients table, if not add it
SET @tablename = 'clients';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " VARCHAR(255) DEFAULT NULL AFTER name")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify columns were added
SELECT 
    'leads' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'lead_client_crm' 
    AND TABLE_NAME = 'leads'
    AND COLUMN_NAME = 'company'
UNION ALL
SELECT 
    'clients' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'lead_client_crm' 
    AND TABLE_NAME = 'clients'
    AND COLUMN_NAME = 'company';

-- Show current structure of both tables
DESCRIBE leads;
DESCRIBE clients;
