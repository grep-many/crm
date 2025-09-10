const Lead = require('../models/lead.model');
const Customer = require('../models/customer.model');
const { createLeadSchema, updateLeadSchema } = require('../validators/lead.validators');

/**
 * Create a new lead for a customer
 */
exports.createLead = async (req, res) => {
  try {
    const { error } = createLeadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { customerId } = req.params;
    const customer = await Customer.findOne(
      req.user.role === 'admin' ? { _id: customerId } : { _id: customerId, ownerId: req.user.id }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    const lead = new Lead({ ...req.body, customerId });
    await lead.save();
    const payload = { ...lead.toObject(), customerId: lead.customerId.toString() };

    // Emit to the customer owner's room
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (customer.ownerId || req.user.id).toString();
      io.to(ownerRoom).emit('leadCreated', payload);
      io.to('admin').emit('leadCreated', payload);
    }

    res.status(201).json(lead);
  } catch (err) {
    console.error('Create lead error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all leads for a customer
 */
exports.getLeads = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    let leads;

    if (customerId && customerId !== "undefined" && customerId !== "null") {
      // Scoped fetch: specific customer's leads
      const customer = await Customer.findOne(
        req.user.role === 'admin' ? { _id: customerId } : { _id: customerId, ownerId: req.user.id }
      );
      if (!customer) {
        return res.status(404).json({ error: "Customer not found or unauthorized" });
      }

      const query = { customerId };
      if (status) query.status = status;

      leads = await Lead.find(query).sort({ createdAt: -1 });
    } else {
      // Global fetch: all leads for all the user's customers
      const customerIds = req.user.role === 'admin'
        ? await Customer.find({}).distinct("_id")
        : await Customer.find({ ownerId: req.user.id }).distinct("_id");

      const query = { customerId: { $in: customerIds } };
      if (status) query.status = status;

      leads = await Lead.find(query).sort({ createdAt: -1 });
    }

    res.json(leads);
  } catch (err) {
    console.error("Get leads error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get a single lead
 */
exports.getLead = async (req, res) => {
  try {
    const { customerId, id } = req.params;

    const customer = await Customer.findOne(
      req.user.role === 'admin' ? { _id: customerId } : { _id: customerId, ownerId: req.user.id }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    const lead = await Lead.findOne({ _id: id, customerId });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // If admin, attach owner details for convenience
    if (req.user.role === 'admin') {
      const owner = await Customer.findById(customerId).populate('ownerId', 'name email');
      return res.json({ ...lead.toObject(), owner: owner?.ownerId ? { name: owner.ownerId.name, email: owner.ownerId.email, id: owner.ownerId._id } : undefined });
    }

    res.json(lead);
  } catch (err) {
    console.error('Get lead error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a lead
 */
exports.updateLead = async (req, res) => {
  try {
    const { error } = updateLeadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { customerId, id } = req.params;

    const customer = await Customer.findOne(
      req.user.role === 'admin' ? { _id: customerId } : { _id: customerId, ownerId: req.user.id }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    const lead = await Lead.findOneAndUpdate({ _id: id, customerId }, req.body, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Emit to the customer owner's room
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (customer.ownerId || req.user.id).toString();
      const payload = { ...lead.toObject(), customerId: lead.customerId.toString() };
      io.to(ownerRoom).emit('leadUpdated', payload);
      io.to('admin').emit('leadUpdated', payload);
    }

    res.json(lead);
  } catch (err) {
    console.error('Update lead error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a lead
 */
exports.deleteLead = async (req, res) => {
  try {
    const { customerId, id } = req.params;

    const customer = await Customer.findOne(
      req.user.role === 'admin' ? { _id: customerId } : { _id: customerId, ownerId: req.user.id }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found or unauthorized' });

    const lead = await Lead.findOneAndDelete({ _id: id, customerId });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Emit to the customer owner's room
    const io = req.app.get('io');
    if (io && typeof io.to === 'function') {
      const ownerRoom = (customer.ownerId || req.user.id).toString();
      const payload = { leadId: lead._id, customerId };
      io.to(ownerRoom).emit('leadDeleted', payload);
      io.to('admin').emit('leadDeleted', payload);
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Delete lead error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
