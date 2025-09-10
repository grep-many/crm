const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to customerId from parent route
const auth = require('../middlewares/auth.middleware');
const leadController = require('../controllers/lead.controller');

// All routes are protected
router.use(auth());

// Create a new lead under a customer
router.post('/', leadController.createLead);

// Get all leads under a customer, optionally filter by status
router.get('/', leadController.getLeads);

// Get a single lead under a customer
router.get('/:id', leadController.getLead);

// Update a lead under a customer
router.put('/:id', leadController.updateLead);

// Delete a lead under a customer
router.delete('/:id', leadController.deleteLead);

module.exports = router;
