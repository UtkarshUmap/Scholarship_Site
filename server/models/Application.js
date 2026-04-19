const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fieldType: { 
    type: String, 
    enum: ['file', 'text', 'number'], 
    default: 'file' 
  },
  value: { type: String },
  originalName: { type: String },
  filePath: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'needs_changes'], 
    default: 'pending' 
  },
  adminRemarks: { type: String },
  adminRemarksAt: { type: Date },
  googleFormLink: { type: String },
  studentReply: { type: String },
  studentReplyAt: { type: Date },
  studentResubmittedLink: { type: String },
  studentResubmittedLinkAt: { type: Date },
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: { type: Date },
  uploadedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  version: { type: Number, default: 1 },
  previousVersions: [{
    filePath: String,
    originalName: String,
    fileSize: Number,
    uploadedAt: Date,
    replacedAt: Date
  }],
  uploadHistory: [{
    action: { type: String, enum: ['upload', 'resubmit', 'review', 'download', 'reply'] },
    performedBy: { type: String, enum: ['student', 'admin'] },
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
});

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  applicationType: { type: String, enum: ['fresh', 'renewal', 'Fresh', 'Renewal'], default: 'fresh' },
  status: { 
    type: String, 
    enum: ['applied', 'accepted', 'rejected', 'pending', 'under_review', 'documents_pending'], 
    default: 'applied' 
  },
  amount: { type: Number, default: 0 },
  financialYear: { type: String },
  serialNo: { type: String },
  googleFormLink: { type: String },
  remarks: { type: String },
  adminComments: [{
    text: String,
    createdAt: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reply: String,
    replyAt: { type: Date }
  }],
  studentResponses: [{
    documentIndex: Number,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  documents: [documentSchema],
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: { type: Date },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: { type: Date }
});

applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ financialYear: 1 });
applicationSchema.index({ 'documents.status': 1 });
applicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
