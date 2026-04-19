const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'scholarship_secret_key_2024';

router.get('/profile', studentAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/profile', studentAuth, async (req, res) => {
  try {
    const { rollNo, name, email, phone, program, branch, batch } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (rollNo) {
      const upperRollNo = rollNo.toUpperCase();
      
      // Find or create Student record
      let student = await Student.findOne({ rollNo: upperRollNo });
      
      if (!student) {
        // Create new student record with roll number
        student = new Student({
          rollNo: upperRollNo,
          name: name || user.name,
          email: email || user.email,
          phone,
          program,
          branch,
          batch,
          year: new Date().getFullYear().toString()
        });
        await student.save();
      } else {
        // Update existing student record with latest profile info
        if (name) student.name = name;
        if (email) student.email = email;
        if (phone) student.phone = phone;
        if (program) student.program = program;
        if (branch) student.branch = branch;
        if (batch) student.batch = batch;
        await student.save();
      }
      
      // Link roll number to user
      user.rollNo = upperRollNo;
      user.isVerified = true;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (program) user.program = program;
    if (branch) user.branch = branch;
    if (batch) user.batch = batch;
    
    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/applications', studentAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.rollNo) {
      return res.status(400).json({ error: 'Please complete your profile with roll number first', code: 'PROFILE_INCOMPLETE' });
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    
    // If student record doesn't exist, create it
    let studentRecord = student;
    if (!studentRecord) {
      studentRecord = new Student({
        rollNo: user.rollNo,
        name: user.name,
        email: user.email,
        phone: user.phone,
        program: user.program,
        branch: user.branch,
        batch: user.batch,
        year: new Date().getFullYear().toString()
      });
      await studentRecord.save();
    }

    const Application = require('../models/Application');
    const applications = await Application.find({ student: studentRecord._id })
      .populate('scholarship')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/apply', studentAuth, async (req, res) => {
  try {
    const { scholarshipId, applicationType, documents } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.rollNo) {
      return res.status(400).json({ 
        error: 'Please complete your profile with roll number before applying', 
        code: 'PROFILE_INCOMPLETE' 
      });
    }

    // Find or create Student record
    let student = await Student.findOne({ rollNo: user.rollNo });
    
    if (!student) {
      student = new Student({
        rollNo: user.rollNo,
        name: user.name,
        email: user.email,
        phone: user.phone,
        program: user.program,
        branch: user.branch,
        batch: user.batch,
        year: new Date().getFullYear().toString()
      });
      await student.save();
    }

    const Application = require('../models/Application');
    const Scholarship = require('../models/Scholarship');

    const existing = await Application.findOne({ student: student._id, scholarship: scholarshipId });
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this scholarship' });
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    if (!scholarship.isActive) {
      return res.status(400).json({ error: 'This scholarship is not currently active' });
    }

    const documentFields = scholarship.requiredDocuments || [];
    const docRecords = documentFields.map(doc => ({
      name: typeof doc === 'string' ? doc : doc.name,
      fieldType: doc.type || 'file',
      value: '',
      status: 'pending'
    }));

    const application = new Application({
      student: student._id,
      scholarship: scholarshipId,
      applicationType: applicationType || 'fresh',
      amount: scholarship.amount,
      financialYear: scholarship.financialYears?.[0] || new Date().getFullYear().toString(),
      documents: docRecords,
      status: 'applied'
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;