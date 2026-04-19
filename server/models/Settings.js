const mongoose = require('mongoose');

const columnMappingSchema = new mongoose.Schema({
  csvColumn: { type: String, required: true },
  dbField: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

const columnMapping = new mongoose.Schema({
  name: { type: String, required: true },
  mappings: [{
    csvColumn: String,
    dbField: String,
    sampleValue: String
  }],
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);
const ColumnMapping = mongoose.model('ColumnMapping', columnMapping);

module.exports = { Settings, ColumnMapping };
