const Customer = require('../models/customer.model');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customer.validators');

/**
 * Get a single customer (including leads)
 */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Admins can fetch any customer; users only their own
    let customerQuery = Customer.findOne(
      req.user.role === 'admin'
        ? { _id: id }
        : { _id: id, ownerId: req.user.id }
    );
    if (req.user.role === 'admin') {
      customerQuery = customerQuery.populate('ownerId', 'name email');
    }
    const customer = await customerQuery;
    if (!customer) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    // Fetch leads linked to this customer
    const Lead = require('../models/lead.model');
    const leads = await Lead.find({ customerId: id }).sort({ createdAt: -1 });

    res.json({ ...customer.toObject(), leads });
  } catch (err) {
    console.error('Get customer by ID error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Add a new customer
 */
exports.createCustomer = async (req, res) => {
  try {
    const { error } = createCustomerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, phone, company } = req.body;

    // Check for duplicate email
    const existing = await Customer.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Customer with this email already exists' });

    const customer = new Customer({
      name,
      email,
      phone,
      company,
      ownerId: req.user.id,
    });

    await customer.save();

    // Reload with owner populated for broadcast consistency
    const populated = await Customer.findById(customer._id).populate('ownerId', 'name email');

    // Emit socket event to the owner's room only
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (populated.ownerId?._id || populated.ownerId || req.user.id).toString();
      io.to(ownerRoom).emit('customerCreated', populated);
      io.to('admin').emit('customerCreated', populated);
    }

    res.status(201).json(customer);
  } catch (err) {
    console.error('Create customer error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List all customers with search
 */
exports.getCustomers = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const baseMatch = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    };
    const query = req.user.role === 'admin'
      ? baseMatch
      : { ...baseMatch, ownerId: req.user.id };

    let findQuery = Customer.find(query);
    if (req.user.role === 'admin') {
      findQuery = findQuery.populate('ownerId', 'name email');
    }
    const customers = await findQuery;

    // Attach leadsCount for each customer
    const Lead = require('../models/lead.model');
    const counts = await Lead.aggregate([
      { $match: { customerId: { $in: customers.map((c) => c._id) } } },
      { $group: { _id: "$customerId", count: { $sum: 1 } } }
    ]);
    const idToCount = new Map(counts.map((c) => [c._id.toString(), c.count]));
    const withCounts = customers.map((c) => ({ ...c.toObject(), leadsCount: idToCount.get(c._id.toString()) || 0 }));

    res.json(withCounts);
  } catch (err) {
    console.error('Get customers error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a customer
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { error } = updateCustomerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const match = req.user.role === 'admin' ? { _id: id } : { _id: id, ownerId: req.user.id };
    const updated = await Customer.findOneAndUpdate(
      match,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    // Reload with owner populated for broadcast consistency
    const populated = await Customer.findById(updated._id).populate('ownerId', 'name email');

    // Emit socket event to the owner's room only
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (populated.ownerId?._id || populated.ownerId || req.user.id).toString();
      io.to(ownerRoom).emit('customerUpdated', populated);
      io.to('admin').emit('customerUpdated', populated);
    }

    res.json(updated);
  } catch (err) {
    console.error('Update customer error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a customer
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const match = req.user.role === 'admin' ? { _id: id } : { _id: id, ownerId: req.user.id };
    const deleted = await Customer.findOneAndDelete(match);

    if (!deleted) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    // Emit socket event to the customer's owner room (handles admin deleting others)
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (deleted.ownerId || req.user.id).toString();
      io.to(ownerRoom).emit('customerDeleted', deleted._id);
      io.to('admin').emit('customerDeleted', deleted._id);
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
