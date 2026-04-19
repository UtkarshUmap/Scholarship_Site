const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  rollNo: { type: String, unique: true, sparse: true, uppercase: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'academics'], 
    required: true 
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  program: { type: String },
  branch: { type: String },
  batch: { type: String },
  department: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  // Only hash if: 1) new document (no _id yet) OR password explicitly modified
  // AND 2) password is not already a bcrypt hash
  const isNewDoc = !this._id;
  if ((this.isModified('password') || isNewDoc) && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ rollNo: 1 });

module.exports = mongoose.model('User', userSchema);
