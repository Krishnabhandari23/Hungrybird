const db = require('../config/db');

/**
 * Evaluate conditions against data
 */
const evaluateConditions = (conditions, data) => {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions means always true
  }

  return conditions.every(condition => {
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
      case 'equals':
        return fieldValue == value;
      case 'not_equals':
        return fieldValue != value;
      case 'contains':
        return fieldValue && fieldValue.toString().includes(value);
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      default:
        return false;
    }
  });
};

/**
 * Execute workflow actions
 */
const executeActions = async (actions, data) => {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'update_status':
          if (data.id && action.status) {
            await db.query('UPDATE leads SET status = ? WHERE id = ?', [action.status, data.id]);
            console.log(`Workflow action: Updated lead ${data.id} status to ${action.status}`);
          }
          break;

        case 'assign_user':
          if (data.id && action.user_id) {
            await db.query('UPDATE leads SET assigned_to = ? WHERE id = ?', [action.user_id, data.id]);
            console.log(`Workflow action: Assigned lead ${data.id} to user ${action.user_id}`);
          }
          break;

        case 'create_activity':
          if (data.id && action.activity_type) {
            await db.query(
              'INSERT INTO activities (parent_type, parent_id, type, summary, date) VALUES (?, ?, ?, ?, NOW())',
              ['lead', data.id, action.activity_type, action.summary || 'Auto-generated activity']
            );
            console.log(`Workflow action: Created activity for lead ${data.id}`);
          }
          break;

        case 'auto_convert':
          if (data.id && !data.converted_to_client_id) {
            // Create client
            const [clientResult] = await db.query(
              'INSERT INTO clients (name, email, phone, converted_from_lead_id) VALUES (?, ?, ?, ?)',
              [data.name, data.email, data.phone, data.id]
            );
            // Update lead
            await db.query('UPDATE leads SET converted_to_client_id = ?, status = ? WHERE id = ?', 
              [clientResult.insertId, 'converted', data.id]
            );
            console.log(`Workflow action: Auto-converted lead ${data.id} to client`);
          }
          break;

        case 'send_notification':
          // Placeholder for notification logic
          console.log(`Workflow action: Send notification - ${action.message || 'Notification sent'}`);
          break;

        default:
          console.log(`Unknown workflow action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error executing workflow action ${action.type}:`, error);
    }
  }
};

/**
 * Trigger workflow based on event
 */
const triggerWorkflow = async (eventName, data) => {
  try {
    // Get all active workflows for this event
    const [workflows] = await db.query(
      'SELECT * FROM workflows WHERE trigger_event = ? AND is_active = TRUE',
      [eventName]
    );

    if (workflows.length === 0) {
      return;
    }

    console.log(`Triggering ${workflows.length} workflow(s) for event: ${eventName}`);

    for (const workflow of workflows) {
      try {
        // Parse JSON fields
        const conditions = workflow.conditions ? JSON.parse(workflow.conditions) : null;
        const actions = JSON.parse(workflow.actions);

        // Evaluate conditions
        if (evaluateConditions(conditions, data)) {
          console.log(`Workflow ${workflow.id} conditions met, executing actions...`);
          await executeActions(actions, data);
        } else {
          console.log(`Workflow ${workflow.id} conditions not met, skipping...`);
        }
      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error triggering workflows:', error);
  }
};

/**
 * Check for leads with no activity in the last 7 days
 * This should be run periodically (e.g., via cron job)
 */
const checkInactiveLeads = async () => {
  try {
    const [leads] = await db.query(`
      SELECT l.* FROM leads l
      LEFT JOIN activities a ON a.parent_type = 'lead' AND a.parent_id = l.id AND a.deleted_at IS NULL
      WHERE l.deleted_at IS NULL 
      AND l.converted_to_client_id IS NULL
      GROUP BY l.id
      HAVING MAX(a.created_at) < DATE_SUB(NOW(), INTERVAL 7 DAY) OR MAX(a.created_at) IS NULL
    `);

    console.log(`Found ${leads.length} inactive lead(s)`);

    for (const lead of leads) {
      await triggerWorkflow('no_activity_7_days', lead);
    }
  } catch (error) {
    console.error('Error checking inactive leads:', error);
  }
};

module.exports = {
  triggerWorkflow,
  checkInactiveLeads,
  evaluateConditions,
  executeActions
};
