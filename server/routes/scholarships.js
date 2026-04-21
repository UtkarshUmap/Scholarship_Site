const express = require('express');
const Scholarship = require('../models/Scholarship');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, isActive, financialYear, program, type, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (financialYear) query.financialYears = financialYear;
    if (program) query['eligibilityCriteria.programs'] = program;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const scholarships = await Scholarship.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Scholarship.countDocuments(query);

    res.json({
      scholarships,
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

router.get('/active', async (req, res) => {
  try {
    const scholarships = await Scholarship.find({ isActive: true }).sort({ name: 1 });
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial-years', async (req, res) => {
  try {
    const years = await Scholarship.distinct('financialYears');
    res.json(years.flat());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    res.json(scholarship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    res.status(201).json(scholarship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    res.json(scholarship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    scholarship.isActive = !scholarship.isActive;
    scholarship.updatedAt = new Date();
    await scholarship.save();
    res.json(scholarship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
