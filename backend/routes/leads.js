const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToClient
} = require('../controllers/leadsController');

// POST /leads - Create a new lead
router.post('/', createLead);

// GET /leads - Get all leads with filtering
router.get('/', getAllLeads);

// GET /leads/:id - Get single lead
router.get('/:id', getLeadById);

// PUT /leads/:id - Update lead
router.put('/:id', updateLead);

// DELETE /leads/:id - Soft delete lead
router.delete('/:id', deleteLead);

// POST /leads/:id/convert - Convert lead to client
router.post('/:id/convert', convertLeadToClient);

module.exports = router;
