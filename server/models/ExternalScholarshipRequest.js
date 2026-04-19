const mongoose = require('mongoose');

const verificationLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true }
});

const externalScholarshipRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarshipName: { type: String, required: true },
  provider: { type: String },
  amount: { type: Number, default: 0 },
  requiredDocuments: [{ type: String }],
  verificationLinks: [verificationLinkSchema],
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminRemarks: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

externalScholarshipRequestSchema.index({ status: 1 });
externalScholarshipRequestSchema.index({ student: 1 });

module.exports = mongoose.model('ExternalScholarshipRequest', externalScholarshipRequestSchema);
