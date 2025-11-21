const express = require('express');
const router = express.Router();
const {
  createActivity,
  getAllActivities,
  deleteActivity
} = require('../controllers/activitiesController');

// POST /activities - Create a new activity
router.post('/', createActivity);

// GET /activities - Get all activities with filtering
router.get('/', getAllActivities);

// DELETE /activities/:id - Soft delete activity
router.delete('/:id', deleteActivity);

module.exports = router;
