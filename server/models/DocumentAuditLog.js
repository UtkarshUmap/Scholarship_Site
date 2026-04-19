const mongoose = require('mongoose');

const documentAuditLogSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  documentIndex: { type: Number },
  documentName: { type: String },
  action: { 
    type: String, 
    enum: ['upload', 'resubmit', 'verify', 'reject', 'request_changes', 'download', 'view', 'reply'] 
  },
  performedBy: {
    role: { type: String, enum: ['student', 'admin'] },
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String
  },
  fileDetails: {
    originalName: String,
    fileSize: Number,
    filePath: String,
    fileType: String
  },
  previousFilePath: String,
  metadata: {
    ipAddress: String,
    userAgent: String
  },
  remarks: String,
  timestamp: { type: Date, default: Date.now }
});

documentAuditLogSchema.index({ applicationId: 1, timestamp: -1 });
documentAuditLogSchema.index({ 'performedBy.userId': 1, timestamp: -1 });
documentAuditLogSchema.index({ action: 1, timestamp: -1 });
documentAuditLogSchema.index({ documentName: 1, timestamp: -1 });

module.exports = mongoose.model('DocumentAuditLog', documentAuditLogSchema);