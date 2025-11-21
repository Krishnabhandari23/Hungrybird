const express = require('express');
const router = express.Router();
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} = require('../controllers/clientsController');

// POST /clients - Create a new client
router.post('/', createClient);

// GET /clients - Get all clients with filtering
router.get('/', getAllClients);

// GET /clients/:id - Get single client
router.get('/:id', getClientById);

// PUT /clients/:id - Update client
router.put('/:id', updateClient);

// DELETE /clients/:id - Soft delete client
router.delete('/:id', deleteClient);

module.exports = router;
