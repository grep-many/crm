const Joi = require('joi');

exports.createLeadSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').optional(),
  value: Joi.number().min(0).optional()
});

exports.updateLeadSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').optional(),
  value: Joi.number().min(0).optional()
});
