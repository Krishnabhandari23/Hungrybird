const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Create a new client
 */
const createClient = async (req, res) => {
  try {
    const { name, company, email, phone, converted_from_lead_id } = req.body;

    if (!name || !email) {
      return sendError(res, 'Name and email are required', 400);
    }

    const [result] = await db.query(
      'INSERT INTO clients (name, company, email, phone, converted_from_lead_id) VALUES (?, ?, ?, ?, ?)',
      [name, company || null, email, phone || null, converted_from_lead_id || null]
    );

    const [newClient] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [result.insertId]);

    sendSuccess(res, newClient[0], 'Client created successfully', 201);
  } catch (error) {
    console.error('Create client error:', error);
    sendError(res, 'Failed to create client', 500, error.message);
  }
};

/**
 * Get all clients with filtering
 */
const getAllClients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM clients WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [clients] = await db.query(query, params);
    sendSuccess(res, clients, 'Clients retrieved successfully');
  } catch (error) {
    console.error('Get clients error:', error);
    sendError(res, 'Failed to retrieve clients', 500, error.message);
  }
};

/**
 * Get single client by ID
 */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [id]);

    if (clients.length === 0) {
      return sendError(res, 'Client not found', 404);
    }

    sendSuccess(res, clients[0], 'Client retrieved successfully');
  } catch (error) {
    console.error('Get client error:', error);
    sendError(res, 'Failed to retrieve client', 500, error.message);
  }
};

/**
 * Update client
 */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone } = req.body;

    // Check if client exists
    const [existingClient] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existingClient.length === 0) {
      return sendError(res, 'Client not found', 404);
    }

    await db.query(
      'UPDATE clients SET name = ?, company = ?, email = ?, phone = ? WHERE id = ?',
      [name, company || null, email, phone, id]
    );

    const [updatedClient] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [id]);

    sendSuccess(res, updatedClient[0], 'Client updated successfully');
  } catch (error) {
    console.error('Update client error:', error);
    sendError(res, 'Failed to update client', 500, error.message);
  }
};

/**
 * Soft delete client
 */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingClient] = await db.query('SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existingClient.length === 0) {
      return sendError(res, 'Client not found', 404);
    }

    await db.query('UPDATE clients SET deleted_at = NOW() WHERE id = ?', [id]);

    sendSuccess(res, null, 'Client deleted successfully');
  } catch (error) {
    console.error('Delete client error:', error);
    sendError(res, 'Failed to delete client', 500, error.message);
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
};
