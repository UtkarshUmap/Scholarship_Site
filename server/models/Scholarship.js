const mongoose = require('mongoose');

const documentFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['file', 'text', 'number'], 
    default: 'file' 
  },
  required: { type: Boolean, default: true },
  placeholder: { type: String },
  description: { type: String }
});

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String },
  type: { 
    type: String, 
    enum: ['internal', 'external'], 
    default: 'internal' 
  },
  amount: { type: Number, default: 0 },
  eligibility: { type: String },
  deadline: { type: Date },
  maxRecipients: { type: Number, default: 0 },
  requiredDocuments: [documentFieldSchema],
  documentPresets: [{ type: String }],
  isActive: { type: Boolean, default: true },
  financialYears: [{ type: String }],
  description: { type: String },
  googleFormLink: { type: String },
  eligibilityCriteria: {
    minIncome: { type: Number, default: 0 },
    maxIncome: { type: Number, default: null },
    gender: { type: String },
    programs: [{ type: String }],
    branches: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

scholarshipSchema.index({ name: 'text' });
scholarshipSchema.index({ isActive: 1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
