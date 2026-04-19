const express = require('express');
const DocumentRequest = require('../models/DocumentRequest');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth, academicsAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/my', academicsAuth, async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ academics: req.user.id })
      .populate('student', 'name rollNo branch program')
      .populate('scholarship', 'name')
      .populate('requestedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', academicsAuth, async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id)
      .populate('student', 'name rollNo branch program email phone')
      .populate('scholarship', 'name')
      .populate('requestedBy', 'name');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/respond', academicsAuth, async (req, res) => {
  try {
    const { responseLink, responseNote } = req.body;
    const request = await DocumentRequest.findOne({ _id: req.params.id, academics: req.user.id });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ error: 'Request already completed' });
    }

    request.responseLink = responseLink;
    request.responseNote = responseNote;
    request.responseAt = new Date();
    request.status = 'submitted';
    await request.save();

    res.json({ message: 'Response submitted successfully', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status, academics } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if ( academics) filter.academics = academics;
    
    const requests = await DocumentRequest.find(filter)
      .populate('academics', 'name email department')
      .populate('student', 'name rollNo branch program')
      .populate('scholarship', 'name')
      .populate('requestedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/academics/list', auth, async (req, res) => {
  try {
    const academics = await User.find({ role: 'academics', isActive: true }).select('name email department');
    res.json(academics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/list', auth, async (req, res) => {
  try {
    const students = await Student.find().select('name rollNo branch program');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { academicsId, studentId, scholarshipId, applicationId, documents, description } = req.body;
    
    const request = new DocumentRequest({
      academics: academicsId,
      student: studentId,
      scholarship: scholarshipId,
      application: applicationId,
      documents,
      description,
      requestedBy: req.admin.id
    });
    await request.save();

    res.status(201).json({ message: 'Document request created', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    res.json({ message: 'Request marked as completed', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await DocumentRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
