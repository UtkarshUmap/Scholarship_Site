const express = require('express');
const { Settings, ColumnMapping } = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

const DEFAULT_DOCUMENT_PRESETS = [
  'Income Certificate',
  'Caste Certificate',
  'Bank Passbook Copy',
  'Aadhar Card',
  'Previous Year Marksheet',
  'Fee Receipt',
  'Bonafide Certificate',
  'Domicile Certificate',
  'Father Income Certificate',
  'Passport Size Photo',
  'Institute ID Card',
  'GAP Certificate (if any)',
  'Migration Certificate'
];

router.get('/', auth, async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingObj = {};
    settings.forEach(s => {
      settingObj[s.key] = s.value;
    });

    const mappings = await ColumnMapping.find().sort({ createdAt: -1 });

    let documentPresets = settingObj.documentPresets;
    if (!documentPresets) {
      documentPresets = DEFAULT_DOCUMENT_PRESETS;
      await Settings.findOneAndUpdate(
        { key: 'documentPresets' },
        { value: DEFAULT_DOCUMENT_PRESETS, updatedAt: new Date() },
        { upsert: true }
      );
    }

    res.json({
      ...settingObj,
      columnMappings: mappings,
      documentPresets: documentPresets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    for (const { key, value } of updates) {
      await Settings.findOneAndUpdate(
        { key },
        { value, updatedAt: new Date() },
        { upsert: true }
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/document-presets', auth, async (req, res) => {
  try {
    const { presets } = req.body;
    
    await Settings.findOneAndUpdate(
      { key: 'documentPresets' },
      { value: presets, updatedAt: new Date() },
      { upsert: true }
    );

    res.json({ message: 'Document presets updated', presets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/email', auth, async (req, res) => {
  try {
    const emailSetting = await Settings.findOne({ key: 'emailConfig' });
    const config = emailSetting?.value || {};
    res.json({
      host: config.host || '',
      port: config.port || 587,
      secure: config.secure || false,
      user: config.user || '',
      from: config.from || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/email', auth, async (req, res) => {
  try {
    const { host, port, secure, user, password, from } = req.body;
    
    await Settings.findOneAndUpdate(
      { key: 'emailConfig' },
      { 
        value: { host, port, secure, user, password, from },
        updatedAt: new Date()
      },
      { upsert: true }
    );

    res.json({ message: 'Email configuration updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/defaults', async (req, res) => {
  try {
    const defaults = await Settings.find({ key: { $in: ['maxApplications', 'deadline', 'defaultFinancialYear'] } });
    const result = {};
    defaults.forEach(d => { result[d.key] = d.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
