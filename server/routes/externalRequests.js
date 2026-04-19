const express = require('express');
const jwt = require('jsonwebtoken');
const ExternalScholarshipRequest = require('../models/ExternalScholarshipRequest');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const auth = require('../middleware/auth');
const { studentAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'scholarship_secret_key_2024';

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const requests = await ExternalScholarshipRequest.find({ student: decoded.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', studentAuth, async (req, res) => {
  try {
    const { scholarshipName, provider, amount, requiredDocuments, verificationLinks, description } = req.body;
    
    const request = new ExternalScholarshipRequest({
      student: req.user.id,
      scholarshipName,
      provider,
      amount,
      requiredDocuments,
      verificationLinks,
      description
    });
    await request.save();

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    const requests = await ExternalScholarshipRequest.find(filter)
      .populate('student', 'name email rollNo')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const request = await ExternalScholarshipRequest.findById(req.params.id)
      .populate('student', 'name email rollNo')
      .populate('reviewedBy', 'name');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const request = await ExternalScholarshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    const docFields = (request.requiredDocuments || []).map(doc => ({
      name: doc,
      type: 'file',
      required: true
    }));

    const scholarship = new Scholarship({
      name: request.scholarshipName,
      provider: request.provider,
      amount: request.amount || 0,
      type: 'external',
      requiredDocuments: docFields,
      description: request.description,
      isActive: true,
      financialYears: [new Date().getFullYear().toString()]
    });
    await scholarship.save();

    request.status = 'approved';
    request.reviewedBy = req.admin.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Scholarship created successfully', scholarship });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    const request = await ExternalScholarshipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    request.status = 'rejected';
    request.adminRemarks = adminRemarks;
    request.reviewedBy = req.admin.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await ExternalScholarshipRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
