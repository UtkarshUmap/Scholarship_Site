const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  email: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'M', 'F', 'O'] },
  program: { type: String, enum: ['BTech', 'MTech', 'MSc', 'BS', 'MS', 'PhD', ''] },
  branch: { type: String },
  batch: { type: String },
  year: { type: String },
  financialYear: { type: String },
  income: { type: Number, default: 0 },
  fatherIncome: { type: Number, default: 0 },
  phone: { type: String },
  appliedScholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

studentSchema.index({ name: 'text' });
studentSchema.index({ branch: 1 });
studentSchema.index({ program: 1 });
studentSchema.index({ financialYear: 1 });

module.exports = mongoose.model('Student', studentSchema);
