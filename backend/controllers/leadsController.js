const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const { triggerWorkflow } = require('../workflow/workflowRunner');

/**
 * Create a new lead
 */
const createLead = async (req, res) => {
  try {
    const { name, company, email, phone, status, source, assigned_to } = req.body;

    if (!name || !email) {
      return sendError(res, 'Name and email are required', 400);
    }

    const [result] = await db.query(
      'INSERT INTO leads (name, company, email, phone, status, source, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, company || null, email, phone || null, status || 'new', source || null, assigned_to || null]
    );

    const [newLead] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [result.insertId]);

    // Trigger workflow
    await triggerWorkflow('lead_created', newLead[0]);

    sendSuccess(res, newLead[0], 'Lead created successfully', 201);
  } catch (error) {
    console.error('Create lead error:', error);
    sendError(res, 'Failed to create lead', 500, error.message);
  }
};

/**
 * Get all leads with filtering
 */
const getAllLeads = async (req, res) => {
  try {
    const { status, source, search } = req.query;
    let query = 'SELECT * FROM leads WHERE deleted_at IS NULL';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }

    if (search) {
      query += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [leads] = await db.query(query, params);
    sendSuccess(res, leads, 'Leads retrieved successfully');
  } catch (error) {
    console.error('Get leads error:', error);
    sendError(res, 'Failed to retrieve leads', 500, error.message);
  }
};

/**
 * Get single lead by ID
 */
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const [leads] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [id]);

    if (leads.length === 0) {
      return sendError(res, 'Lead not found', 404);
    }

    sendSuccess(res, leads[0], 'Lead retrieved successfully');
  } catch (error) {
    console.error('Get lead error:', error);
    sendError(res, 'Failed to retrieve lead', 500, error.message);
  }
};

/**
 * Update lead
 */
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, status, source, assigned_to } = req.body;

    // Check if lead exists
    const [existingLead] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existingLead.length === 0) {
      return sendError(res, 'Lead not found', 404);
    }

    const oldStatus = existingLead[0].status;

    await db.query(
      'UPDATE leads SET name = ?, company = ?, email = ?, phone = ?, status = ?, source = ?, assigned_to = ? WHERE id = ?',
      [name, company || null, email, phone, status, source, assigned_to || null, id]
    );

    const [updatedLead] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [id]);

    // Trigger workflow if status changed
    if (oldStatus !== status) {
      await triggerWorkflow('status_updated', updatedLead[0]);
    }

    sendSuccess(res, updatedLead[0], 'Lead updated successfully');
  } catch (error) {
    console.error('Update lead error:', error);
    sendError(res, 'Failed to update lead', 500, error.message);
  }
};

/**
 * Soft delete lead
 */
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingLead] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existingLead.length === 0) {
      return sendError(res, 'Lead not found', 404);
    }

    await db.query('UPDATE leads SET deleted_at = NOW() WHERE id = ?', [id]);

    sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    console.error('Delete lead error:', error);
    sendError(res, 'Failed to delete lead', 500, error.message);
  }
};

/**
 * Convert lead to client
 */
const convertLeadToClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Get lead
    const [leads] = await db.query('SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL', [id]);
    if (leads.length === 0) {
      return sendError(res, 'Lead not found', 404);
    }

    const lead = leads[0];

    // Check if already converted
    if (lead.converted_to_client_id) {
      return sendError(res, 'Lead already converted to client', 400);
    }

    // Create client
    const [clientResult] = await db.query(
      'INSERT INTO clients (name, company, email, phone, converted_from_lead_id) VALUES (?, ?, ?, ?, ?)',
      [lead.name, lead.company, lead.email, lead.phone, lead.id]
    );

    const clientId = clientResult.insertId;

    // Update lead with client ID
    await db.query('UPDATE leads SET converted_to_client_id = ?, status = ? WHERE id = ?', [clientId, 'converted', id]);

    const [newClient] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [clientId]);

    // Trigger workflow
    await triggerWorkflow('lead_converted', lead);

    sendSuccess(res, newClient[0], 'Lead converted to client successfully', 201);
  } catch (error) {
    console.error('Convert lead error:', error);
    sendError(res, 'Failed to convert lead', 500, error.message);
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToClient
};
