-- =============================================
-- INDIAN MOCK DATA FOR LEAD CLIENT CRM
-- =============================================
-- This file adds a company column to clients table and inserts realistic Indian data
-- Run this after schema.sql has been executed

-- =============================================
-- ALTER TABLES - ADD COMPANY COLUMN
-- =============================================
ALTER TABLE leads 
ADD COLUMN company VARCHAR(255) DEFAULT NULL AFTER name;

ALTER TABLE clients 
ADD COLUMN company VARCHAR(255) DEFAULT NULL AFTER name;

-- =============================================
-- CLEAR EXISTING SAMPLE DATA (Optional)
-- =============================================
-- Uncomment if you want to clear existing data first
-- DELETE FROM activities;
-- DELETE FROM workflows WHERE id IN (1, 2, 3);
-- DELETE FROM clients WHERE id IN (1, 2);
-- DELETE FROM leads WHERE id IN (1, 2, 3, 4);
-- ALTER TABLE leads AUTO_INCREMENT = 1;
-- ALTER TABLE clients AUTO_INCREMENT = 1;
-- ALTER TABLE activities AUTO_INCREMENT = 1;

-- =============================================
-- INSERT INDIAN LEADS DATA (15 Leads)
-- =============================================
INSERT INTO leads (name, company, email, phone, status, source, assigned_to, created_at) VALUES
-- New Leads
('Rajesh Kumar', 'Infosys Technologies', 'rajesh.kumar@gmail.com', '+91 98765 43210', 'new', 'website', 1, '2025-11-20 10:30:00'),
('Priya Sharma', 'Wipro Digital', 'priya.sharma@yahoo.com', '+91 87654 32109', 'new', 'social', 2, '2025-11-20 14:15:00'),
('Amit Patel', 'Tata Consultancy Services', 'amit.patel@hotmail.com', '+91 76543 21098', 'new', 'referral', 1, '2025-11-19 16:45:00'),

-- Contacted Leads
('Sneha Reddy', 'Tech Mahindra', 'sneha.reddy@gmail.com', '+91 98234 56789', 'contacted', 'email', 1, '2025-11-18 09:20:00'),
('Vikram Singh', 'HCL Technologies', 'vikram.singh@outlook.com', '+91 99876 54321', 'contacted', 'website', 2, '2025-11-18 11:30:00'),
('Anjali Gupta', 'Mindtree Ltd', 'anjali.gupta@gmail.com', '+91 98123 45678', 'contacted', 'social', 1, '2025-11-17 13:40:00'),
('Rahul Verma', 'Cognizant India', 'rahul.verma@yahoo.in', '+91 97654 32108', 'contacted', 'referral', 2, '2025-11-17 15:50:00'),

-- Qualified Leads
('Kavita Iyer', 'Accenture Solutions', 'kavita.iyer@gmail.com', '+91 96543 21087', 'qualified', 'website', 1, '2025-11-16 10:00:00'),
('Arjun Nair', 'Capgemini India', 'arjun.nair@rediffmail.com', '+91 95432 10976', 'qualified', 'email', 2, '2025-11-15 14:30:00'),
('Deepika Mehta', 'Oracle Financial Services', 'deepika.mehta@gmail.com', '+91 94321 09865', 'qualified', 'social', 1, '2025-11-15 16:20:00'),

-- Negotiation Leads
('Suresh Desai', 'IBM India Pvt Ltd', 'suresh.desai@yahoo.com', '+91 93210 98754', 'negotiation', 'referral', 2, '2025-11-14 11:15:00'),
('Pooja Joshi', 'Mphasis Corporation', 'pooja.joshi@hotmail.com', '+91 92109 87643', 'negotiation', 'website', 1, '2025-11-13 09:45:00'),

-- Lost Leads
('Manish Agarwal', 'L&T Infotech', 'manish.agarwal@gmail.com', '+91 91098 76532', 'lost', 'email', 2, '2025-11-10 13:00:00'),
('Ritu Kapoor', 'Persistent Systems', 'ritu.kapoor@yahoo.in', '+91 90987 65421', 'lost', 'social', 1, '2025-11-08 10:30:00'),

-- Won Lead (will convert to client)
('Naveen Krishnan', 'Zensar Technologies', 'naveen.krishnan@gmail.com', '+91 89876 54310', 'won', 'referral', 1, '2025-11-12 15:30:00');

-- =============================================
-- INSERT INDIAN CLIENTS DATA (5 Clients)
-- =============================================
INSERT INTO clients (name, company, email, phone, converted_from_lead_id, created_at) VALUES
-- Existing Clients
('Sanjay Malhotra', 'TechVista Solutions Pvt Ltd', 'sanjay.malhotra@techvista.in', '+91 98456 12345', NULL, '2025-10-15 09:00:00'),
('Meera Chandran', 'Digital Nexus India', 'meera.chandran@digitalnexus.co.in', '+91 97345 23456', NULL, '2025-10-20 11:30:00'),
('Karan Bhatia', 'SmartBiz Consulting', 'karan.bhatia@smartbiz.com', '+91 96234 34567', NULL, '2025-10-25 14:15:00'),

-- Recently Converted Clients
('Divya Rao', 'CloudCraft Technologies', 'divya.rao@cloudcraft.in', '+91 95123 45678', 9, '2025-11-05 10:20:00'),
('Rohit Saxena', 'InnoWeb Services', 'rohit.saxena@innoweb.co.in', '+91 94012 56789', 8, '2025-11-10 16:45:00');

-- =============================================
-- INSERT ACTIVITIES FOR LEADS
-- =============================================
INSERT INTO activities (parent_type, parent_id, type, summary, date, created_at) VALUES
-- Activities for Rajesh Kumar (Lead ID: 1)
('lead', 1, 'note', 'Lead submitted inquiry through website contact form', '2025-11-20', '2025-11-20 10:30:00'),

-- Activities for Priya Sharma (Lead ID: 2)
('lead', 2, 'note', 'Connected through LinkedIn, expressed interest in enterprise solutions', '2025-11-20', '2025-11-20 14:15:00'),

-- Activities for Sneha Reddy (Lead ID: 4)
('lead', 4, 'call', 'Initial discovery call - discussed business requirements', '2025-11-18', '2025-11-18 10:00:00'),
('lead', 4, 'email', 'Sent product brochure and pricing details', '2025-11-18', '2025-11-18 15:30:00'),

-- Activities for Vikram Singh (Lead ID: 5)
('lead', 5, 'call', 'Follow-up call to answer technical queries', '2025-11-18', '2025-11-18 14:00:00'),
('lead', 5, 'note', 'Requested demo for next week', '2025-11-18', '2025-11-18 14:15:00'),

-- Activities for Kavita Iyer (Lead ID: 8)
('lead', 8, 'meeting', 'Product demo conducted - positive feedback received', '2025-11-16', '2025-11-16 11:00:00'),
('lead', 8, 'email', 'Sent proposal document and implementation timeline', '2025-11-16', '2025-11-16 17:00:00'),

-- Activities for Arjun Nair (Lead ID: 9)
('lead', 9, 'call', 'Qualification call completed successfully', '2025-11-15', '2025-11-15 15:00:00'),
('lead', 9, 'meeting', 'Technical team meeting scheduled for next week', '2025-11-15', '2025-11-15 16:00:00'),

-- Activities for Suresh Desai (Lead ID: 11)
('lead', 11, 'meeting', 'Negotiation meeting - discussing contract terms', '2025-11-14', '2025-11-14 12:00:00'),
('lead', 11, 'email', 'Sent revised proposal with customized pricing', '2025-11-14', '2025-11-14 16:30:00'),

-- Activities for Pooja Joshi (Lead ID: 12)
('lead', 12, 'call', 'Price negotiation call - awaiting final approval', '2025-11-13', '2025-11-13 11:00:00'),

-- Activities for Manish Agarwal (Lead ID: 13)
('lead', 13, 'note', 'Lead went with competitor - budget constraints cited', '2025-11-10', '2025-11-10 15:00:00'),

-- Activities for Naveen Krishnan (Lead ID: 15)
('lead', 15, 'meeting', 'Final review meeting - all requirements approved', '2025-11-12', '2025-11-12 16:00:00'),
('lead', 15, 'note', 'Deal closed successfully - converting to client', '2025-11-12', '2025-11-12 17:00:00');

-- =============================================
-- INSERT ACTIVITIES FOR CLIENTS
-- =============================================
INSERT INTO activities (parent_type, parent_id, type, summary, date, created_at) VALUES
-- Activities for Sanjay Malhotra (Client ID: 1)
('client', 1, 'meeting', 'Onboarding session completed - account setup done', '2025-10-15', '2025-10-15 10:00:00'),
('client', 1, 'call', 'Training session conducted for team members', '2025-10-18', '2025-10-18 14:00:00'),
('client', 1, 'email', 'Monthly report shared - usage statistics looking good', '2025-11-01', '2025-11-01 09:00:00'),
('client', 1, 'support', 'Resolved integration issue with their CRM system', '2025-11-15', '2025-11-15 11:30:00'),

-- Activities for Meera Chandran (Client ID: 2)
('client', 2, 'meeting', 'Kickoff meeting - project timeline discussed', '2025-10-20', '2025-10-20 12:00:00'),
('client', 2, 'call', 'Weekly check-in call - all systems running smoothly', '2025-11-08', '2025-11-08 15:00:00'),
('client', 2, 'support', 'Provided additional user training via video call', '2025-11-18', '2025-11-18 10:00:00'),

-- Activities for Karan Bhatia (Client ID: 3)
('client', 3, 'meeting', 'Implementation review meeting', '2025-10-25', '2025-10-25 15:00:00'),
('client', 3, 'email', 'Sent upgrade options for premium features', '2025-11-12', '2025-11-12 13:00:00'),

-- Activities for Divya Rao (Client ID: 4)
('client', 4, 'meeting', 'Welcome meeting - introduced account manager', '2025-11-05', '2025-11-05 11:00:00'),
('client', 4, 'call', 'Technical support call - answered configuration questions', '2025-11-10', '2025-11-10 14:30:00'),

-- Activities for Rohit Saxena (Client ID: 5)
('client', 5, 'meeting', 'Onboarding complete - client very satisfied', '2025-11-10', '2025-11-10 17:30:00'),
('client', 5, 'email', 'Sent best practices guide and resources', '2025-11-12', '2025-11-12 09:00:00');

-- =============================================
-- INSERT REALISTIC WORKFLOWS
-- =============================================
DELETE FROM workflows;

INSERT INTO workflows (trigger_event, conditions, actions, is_active, created_at) VALUES
-- Workflow 1: Auto-assign new website leads
(
  'lead_created',
  '[{"field":"source","operator":"equals","value":"website"}]',
  '[{"type":"assign_user","user_id":1},{"type":"create_activity","activity_type":"note","summary":"New website lead - automatically assigned to sales team"}]',
  TRUE,
  '2025-11-01 09:00:00'
),

-- Workflow 2: Follow-up reminder for contacted leads
(
  'status_updated',
  '[{"field":"status","operator":"equals","value":"contacted"}]',
  '[{"type":"create_activity","activity_type":"note","summary":"Lead contacted - schedule follow-up within 48 hours"},{"type":"send_notification","message":"Remember to follow up with this lead"}]',
  TRUE,
  '2025-11-01 09:30:00'
),

-- Workflow 3: Qualified lead notification
(
  'status_updated',
  '[{"field":"status","operator":"equals","value":"qualified"}]',
  '[{"type":"send_notification","message":"Lead qualified - prepare proposal and demo"},{"type":"create_activity","activity_type":"meeting","summary":"Schedule product demo"}]',
  TRUE,
  '2025-11-01 10:00:00'
),

-- Workflow 4: Client conversion celebration
(
  'lead_converted',
  NULL,
  '[{"type":"send_notification","message":"Congratulations! Lead successfully converted to client"},{"type":"create_activity","activity_type":"meeting","summary":"Schedule onboarding meeting with new client"}]',
  TRUE,
  '2025-11-01 10:30:00'
),

-- Workflow 5: Lost lead follow-up
(
  'status_updated',
  '[{"field":"status","operator":"equals","value":"lost"}]',
  '[{"type":"create_activity","activity_type":"note","summary":"Lead marked as lost - schedule follow-up after 3 months"},{"type":"send_notification","message":"Document reason for loss in notes"}]',
  FALSE,
  '2025-11-01 11:00:00'
);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify data was inserted correctly

SELECT 'LEADS COUNT' as Info, COUNT(*) as Total FROM leads WHERE deleted_at IS NULL;
SELECT 'CLIENTS COUNT' as Info, COUNT(*) as Total FROM clients WHERE deleted_at IS NULL;
SELECT 'ACTIVITIES COUNT' as Info, COUNT(*) as Total FROM activities WHERE deleted_at IS NULL;
SELECT 'WORKFLOWS COUNT' as Info, COUNT(*) as Total FROM workflows;

-- Show lead status breakdown
SELECT status, COUNT(*) as count 
FROM leads 
WHERE deleted_at IS NULL 
GROUP BY status 
ORDER BY count DESC;

-- Show recent leads
SELECT id, name, email, phone, status, source, created_at 
FROM leads 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Show clients with company names
SELECT id, name, company, email, phone, created_at 
FROM clients 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;

-- Show recent activities
SELECT a.id, a.parent_type, a.type, a.summary, a.date,
  CASE 
    WHEN a.parent_type = 'lead' THEN l.name
    WHEN a.parent_type = 'client' THEN c.name
  END as related_to
FROM activities a
LEFT JOIN leads l ON a.parent_type = 'lead' AND a.parent_id = l.id
LEFT JOIN clients c ON a.parent_type = 'client' AND a.parent_id = c.id
WHERE a.deleted_at IS NULL
ORDER BY a.created_at DESC
LIMIT 10;

-- =============================================
-- NOTES
-- =============================================
-- 1. This script adds 15 realistic Indian leads with proper phone numbers (+91 format)
-- 2. Includes 5 clients with company names (new column added)
-- 3. All names, emails, and companies are Indian-style and realistic
-- 4. Activities are contextual and match the lead/client journey
-- 5. Workflows are practical and match real business scenarios
-- 6. Status distribution: 3 new, 4 contacted, 3 qualified, 2 negotiation, 2 lost, 1 won
-- 7. Phone numbers follow Indian mobile format: +91 XXXXX XXXXX
-- 8. Email domains include common Indian providers (gmail, yahoo.in, hotmail, rediffmail)
-- 9. Company names reflect Indian IT/business naming conventions
-- 10. All timestamps are realistic and in chronological order
