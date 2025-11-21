const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Create a new activity
 */
const createActivity = async (req, res) => {
  try {
    const { parent_type, parent_id, type, summary, date } = req.body;

    if (!parent_type || !parent_id || !type) {
      return sendError(res, 'parent_type, parent_id, and type are required', 400);
    }

    if (!['lead', 'client'].includes(parent_type)) {
      return sendError(res, 'parent_type must be either "lead" or "client"', 400);
    }

    const [result] = await db.query(
      'INSERT INTO activities (parent_type, parent_id, type, summary, date) VALUES (?, ?, ?, ?, ?)',
      [parent_type, parent_id, type, summary || null, date || null]
    );

    const [newActivity] = await db.query('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL', [result.insertId]);

    sendSuccess(res, newActivity[0], 'Activity created successfully', 201);
  } catch (error) {
    console.error('Create activity error:', error);
    sendError(res, 'Failed to create activity', 500, error.message);
  }
};

/**
 * Get all activities with filtering
 */
const getAllActivities = async (req, res) => {
  try {
    const { parent_type, parent_id, type } = req.query;
    let query = 'SELECT * FROM activities WHERE deleted_at IS NULL';
    const params = [];

    if (parent_type) {
      query += ' AND parent_type = ?';
      params.push(parent_type);
    }

    if (parent_id) {
      query += ' AND parent_id = ?';
      params.push(parent_id);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [activities] = await db.query(query, params);
    sendSuccess(res, activities, 'Activities retrieved successfully');
  } catch (error) {
    console.error('Get activities error:', error);
    sendError(res, 'Failed to retrieve activities', 500, error.message);
  }
};

/**
 * Soft delete activity
 */
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingActivity] = await db.query('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existingActivity.length === 0) {
      return sendError(res, 'Activity not found', 404);
    }

    await db.query('UPDATE activities SET deleted_at = NOW() WHERE id = ?', [id]);

    sendSuccess(res, null, 'Activity deleted successfully');
  } catch (error) {
    console.error('Delete activity error:', error);
    sendError(res, 'Failed to delete activity', 500, error.message);
  }
};

module.exports = {
  createActivity,
  getAllActivities,
  deleteActivity
};
