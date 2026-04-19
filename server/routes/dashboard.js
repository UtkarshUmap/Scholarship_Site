const express = require('express');
const Student = require('../models/Student');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { financialYear } = req.query;
    const appMatch = financialYear ? { financialYear } : {};

    const [
      totalStudents,
      totalScholarships,
      activeScholarships,
      totalApplications
    ] = await Promise.all([
      Student.countDocuments(),
      Scholarship.countDocuments(),
      Scholarship.countDocuments({ isActive: true }),
      Application.countDocuments()
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $match: appMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const applicationsByScholarship = await Application.aggregate([
      { $match: appMatch },
      { $group: { _id: '$scholarship', count: { $sum: 1 } } },
      { $lookup: { from: 'scholarships', localField: '_id', foreignField: '_id', as: 'scholarship' } },
      { $unwind: { path: '$scholarship', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$scholarship.name', 'Unknown'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const applicationsByBranch = await Application.aggregate([
      { $match: appMatch },
      { $lookup: { from: 'students', localField: 'student', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $group: { _id: '$student.branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const applicationsByGender = await Application.aggregate([
      { $match: appMatch },
      { $lookup: { from: 'students', localField: 'student', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $group: { _id: '$student.gender', count: { $sum: 1 } } }
    ]);

    const applicationsByType = await Application.aggregate([
      { $match: appMatch },
      { $group: { _id: '$applicationType', count: { $sum: 1 } } }
    ]);

    const applicationsByMonth = await Application.aggregate([
      { $match: appMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const totalDisbursed = await Application.aggregate([
      { $match: { ...appMatch, status: 'accepted' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingCount = await Application.countDocuments({ 
      ...appMatch, 
      status: { $in: ['applied', 'pending'] } 
    });

    const recentApplications = await Application.find(appMatch)
      .populate('student', 'name rollNo branch')
      .populate('scholarship', 'name')
      .sort({ appliedAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalStudents,
        totalScholarships,
        activeScholarships,
        totalApplications,
        totalDisbursed: totalDisbursed[0]?.total || 0,
        pendingApplications: pendingCount
      },
      charts: {
        applicationsByStatus,
        applicationsByScholarship,
        applicationsByBranch,
        applicationsByGender,
        applicationsByType,
        applicationsByMonth
      },
      recentApplications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', auth, async (req, res) => {
  try {
    const { type, ...filters } = req.query;
    
    let data;
    let headers;

    if (type === 'students') {
      data = await Student.find(filters).lean();
      headers = ['rollNo', 'name', 'email', 'gender', 'branch', 'program', 'batch', 'year', 'financialYear', 'income', 'fatherIncome', 'phone'];
    } else if (type === 'applications') {
      const apps = await Application.find(filters)
        .populate('student', 'name rollNo branch email')
        .populate('scholarship', 'name amount')
        .lean();
      
      data = apps.map(a => ({
        rollNo: a.student?.rollNo,
        name: a.student?.name,
        branch: a.student?.branch,
        scholarship: a.scholarship?.name,
        amount: a.amount,
        status: a.status,
        applicationType: a.applicationType,
        financialYear: a.financialYear,
        appliedAt: a.appliedAt
      }));
      headers = ['rollNo', 'name', 'branch', 'scholarship', 'amount', 'status', 'applicationType', 'financialYear', 'appliedAt'];
    } else {
      data = await Scholarship.find(filters).lean();
      headers = ['name', 'provider', 'amount', 'isActive', 'deadline', 'maxRecipients'];
    }

    const csv = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(h => {
        let val = row[h];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        return val;
      });
      csv.push(values.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type || 'data'}_export.csv`);
    res.send(csv.join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
