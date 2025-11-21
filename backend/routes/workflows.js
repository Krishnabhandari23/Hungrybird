const express = require('express');
const router = express.Router();
const {
  createWorkflow,
  getAllWorkflows,
  updateWorkflow,
  deleteWorkflow
} = require('../controllers/workflowsController');

// POST /workflows - Create a new workflow
router.post('/', createWorkflow);

// GET /workflows - Get all workflows
router.get('/', getAllWorkflows);

// PUT /workflows/:id - Update workflow
router.put('/:id', updateWorkflow);

// DELETE /workflows/:id - Delete workflow
router.delete('/:id', deleteWorkflow);

module.exports = router;
