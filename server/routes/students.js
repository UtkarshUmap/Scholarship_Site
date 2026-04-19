const express = require('express');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { 
      search, branch, program, batch, financialYear, 
      minIncome, maxIncome, gender, page = 1, limit = 50 
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }
    if (branch) query.branch = branch;
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (financialYear) query.financialYear = financialYear;
    if (gender) query.gender = gender;
    if (minIncome || maxIncome) {
      query.income = {};
      if (minIncome) query.income.$gte = Number(minIncome);
      if (maxIncome) query.income.$lte = Number(maxIncome);
    }

    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgIncome: { $avg: '$income' },
          minIncome: { $min: '$income' },
          maxIncome: { $max: '$income' }
        }
      }
    ]);

    const byBranch = await Student.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } }
    ]);

    const byProgram = await Student.aggregate([
      { $group: { _id: '$program', count: { $sum: 1 } } }
    ]);

    const byGender = await Student.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    res.json({
      total: stats[0] || { totalStudents: 0, avgIncome: 0, minIncome: 0, maxIncome: 0 },
      byBranch,
      byProgram,
      byGender
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const branches = await Student.distinct('branch');
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const programs = await Student.distinct('program');
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await Student.distinct('batch');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial-years', async (req, res) => {
  try {
    const years = await Student.distinct('financialYear');
    res.json(years);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
