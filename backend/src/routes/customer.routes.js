const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const customerController = require('../controllers/customer.controller');
const leadRoutes = require("./lead.routes")

router.post('/', auth(), customerController.createCustomer);
router.get('/', auth(), customerController.getCustomers);
router.put('/:id', auth(), customerController.updateCustomer);
router.delete('/:id', auth(), customerController.deleteCustomer);
router.get('/:id', auth(), customerController.getCustomerById);

router.use('/:customerId/leads', leadRoutes);

module.exports = router;
