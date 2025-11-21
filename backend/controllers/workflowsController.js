const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Create a new workflow
 */
const createWorkflow = async (req, res) => {
  try {
    const { trigger_event, conditions, actions, is_active } = req.body;

    if (!trigger_event || !actions) {
      return sendError(res, 'trigger_event and actions are required', 400);
    }

    const conditionsJson = conditions ? JSON.stringify(conditions) : null;
    const actionsJson = JSON.stringify(actions);

    const [result] = await db.query(
      'INSERT INTO workflows (trigger_event, conditions, actions, is_active) VALUES (?, ?, ?, ?)',
      [trigger_event, conditionsJson, actionsJson, is_active !== undefined ? is_active : true]
    );

    const [newWorkflow] = await db.query('SELECT * FROM workflows WHERE id = ?', [result.insertId]);

    sendSuccess(res, newWorkflow[0], 'Workflow created successfully', 201);
  } catch (error) {
    console.error('Create workflow error:', error);
    sendError(res, 'Failed to create workflow', 500, error.message);
  }
};

/**
 * Get all workflows
 */
const getAllWorkflows = async (req, res) => {
  try {
    const [workflows] = await db.query('SELECT * FROM workflows ORDER BY created_at DESC');
    sendSuccess(res, workflows, 'Workflows retrieved successfully');
  } catch (error) {
    console.error('Get workflows error:', error);
    sendError(res, 'Failed to retrieve workflows', 500, error.message);
  }
};

/**
 * Update workflow
 */
const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { trigger_event, conditions, actions, is_active } = req.body;

    // Check if workflow exists
    const [existingWorkflow] = await db.query('SELECT * FROM workflows WHERE id = ?', [id]);
    if (existingWorkflow.length === 0) {
      return sendError(res, 'Workflow not found', 404);
    }

    const conditionsJson = conditions ? JSON.stringify(conditions) : null;
    const actionsJson = actions ? JSON.stringify(actions) : JSON.stringify(existingWorkflow[0].actions);

    await db.query(
      'UPDATE workflows SET trigger_event = ?, conditions = ?, actions = ?, is_active = ? WHERE id = ?',
      [trigger_event, conditionsJson, actionsJson, is_active !== undefined ? is_active : existingWorkflow[0].is_active, id]
    );

    const [updatedWorkflow] = await db.query('SELECT * FROM workflows WHERE id = ?', [id]);

    sendSuccess(res, updatedWorkflow[0], 'Workflow updated successfully');
  } catch (error) {
    console.error('Update workflow error:', error);
    sendError(res, 'Failed to update workflow', 500, error.message);
  }
};

/**
 * Delete workflow
 */
const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingWorkflow] = await db.query('SELECT * FROM workflows WHERE id = ?', [id]);
    if (existingWorkflow.length === 0) {
      return sendError(res, 'Workflow not found', 404);
    }

    await db.query('DELETE FROM workflows WHERE id = ?', [id]);

    sendSuccess(res, null, 'Workflow deleted successfully');
  } catch (error) {
    console.error('Delete workflow error:', error);
    sendError(res, 'Failed to delete workflow', 500, error.message);
  }
};

module.exports = {
  createWorkflow,
  getAllWorkflows,
  updateWorkflow,
  deleteWorkflow
};
