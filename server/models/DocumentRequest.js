const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  academics: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  documents: [{ type: String }],
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'completed'], 
    default: 'pending' 
  },
  responseLink: { type: String },
  responseNote: { type: String },
  responseAt: { type: Date },
  completedAt: { type: Date },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

documentRequestSchema.index({ academics: 1, status: 1 });
documentRequestSchema.index({ student: 1 });

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
