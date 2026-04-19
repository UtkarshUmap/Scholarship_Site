const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Student = require('../models/Student');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const DocumentAuditLog = require('../models/DocumentAuditLog');
const { auth, studentAuth } = require('../middleware/auth');
const nodemailer = require('../utils/email');

const router = express.Router();

const getStoragePath = (req, file, cb) => {
  let baseDir = path.join(__dirname, '../uploads/documents');
  
  // Try to get scholarshipId from form data or params
  const scholarshipId = req.body.scholarshipId || req.params.scholarshipId || 'unknown';
  const year = new Date().getFullYear();
  const financialYear = `${year}-${year + 1}`;
  
  // Use last 8 chars of scholarshipId for directory name
  const scholarshipDir = String(scholarshipId).slice(-8);
  
  baseDir = path.join(baseDir, String(year), financialYear, scholarshipDir);
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  cb(null, baseDir);
};

const storage = multer.diskStorage({
  destination: getStoragePath,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, images, and Word documents are allowed'));
    }
  }
});

const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get('/', auth, async (req, res) => {
  try {
    const { 
      search, scholarship, student, status, financialYear,
      applicationType, gender, minAmount, maxAmount,
      minIncome, maxIncome, branch, program, 
      docStatus, dateFrom, dateTo,
      page = 1, limit = 50, sortBy = 'appliedAt', order = 'desc'
    } = req.query;

    let query = {};

    if (search) {
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNo: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.student = { $in: students.map(s => s._id) };
    }

    if (scholarship) query.scholarship = scholarship;
    if (student) query.student = student;
    if (status) query.status = status;
    if (financialYear) query.financialYear = financialYear;
    if (applicationType) query.applicationType = applicationType;

    if (gender || branch || program || minIncome || maxIncome) {
      const studentQuery = {};
      if (gender) studentQuery.gender = gender;
      if (branch) studentQuery.branch = branch;
      if (program) studentQuery.program = program;
      if (minIncome) studentQuery.income = { ...studentQuery.income, $gte: Number(minIncome) };
      if (maxIncome) studentQuery.income = { ...studentQuery.income, $lte: Number(maxIncome) };
      
      const students = await Student.find(studentQuery).select('_id');
      query.student = { $in: students.map(s => s._id) };
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (docStatus) {
      query['documents.status'] = docStatus;
    }

    if (dateFrom || dateTo) {
      query.appliedAt = {};
      if (dateFrom) query.appliedAt.$gte = new Date(dateFrom);
      if (dateTo) query.appliedAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sortObj = { [sortBy]: order === 'asc' ? 1 : -1 };
    
    const applications = await Application.find(query)
      .populate('student')
      .populate('scholarship')
      .populate('reviewedBy', 'username')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(query);

    res.json({
      applications,
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
    const { financialYear } = req.query;
    const match = financialYear ? { financialYear } : {};

    const byStatus = await Application.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byScholarship = await Application.aggregate([
      { $match: match },
      { $group: { _id: '$scholarship', count: { $sum: 1 } } },
      { $lookup: { from: 'scholarships', localField: '_id', foreignField: '_id', as: 'scholarship' } },
      { $unwind: '$scholarship' },
      { $project: { scholarshipId: '$_id', name: '$scholarship.name', count: 1 } }
    ]);

    const byType = await Application.aggregate([
      { $match: match },
      { $group: { _id: '$applicationType', count: { $sum: 1 } } }
    ]);

    const totalAmount = await Application.aggregate([
      { $match: { ...match, status: 'accepted' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      byStatus,
      byScholarship,
      byType,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-rollno/:rollNo', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo.toUpperCase() });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const applications = await Application.find({ student: student._id })
      .populate('scholarship')
      .sort({ appliedAt: -1 });

    res.json({ student, applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate('scholarship')
      .populate('reviewedBy', 'username email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { studentId, scholarshipId, applicationType, amount, googleFormLink } = req.body;

    const existing = await Application.findOne({ student: studentId, scholarship: scholarshipId });
    if (existing) {
      return res.status(400).json({ error: 'Application already exists for this scholarship' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const appCount = await Application.countDocuments({ student: studentId });
    if (appCount >= 2) {
      return res.status(400).json({ error: 'Maximum 2 scholarship applications allowed per student' });
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    const application = new Application({
      student: studentId,
      scholarship: scholarshipId,
      applicationType: applicationType || 'fresh',
      amount: amount || scholarship.amount,
      financialYear: scholarship.financialYears?.[0] || new Date().getFullYear().toString(),
      googleFormLink: googleFormLink || scholarship.googleFormLink
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/documents', auth, upload.array('documents', 10), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const newDocs = req.files.map(file => ({
      name: file.originalname,
      originalName: file.originalname,
      filePath: `/uploads/documents/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      status: 'pending',
      uploadedAt: new Date()
    }));

    application.documents.push(...newDocs);
    application.updatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/document/:docIndex', auth, async (req, res) => {
  try {
    const { status, remarks, googleFormLink } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docIndex = parseInt(req.params.docIndex);
    if (docIndex < 0 || docIndex >= application.documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    application.documents[docIndex].status = status;
    application.documents[docIndex].adminRemarks = remarks;
    application.documents[docIndex].adminRemarksAt = new Date();
    application.documents[docIndex].reviewedAt = new Date();
    application.documents[docIndex].reviewedBy = req.admin.id;
    if (googleFormLink) {
      application.documents[docIndex].googleFormLink = googleFormLink;
    }
    
    application.documents[docIndex].uploadHistory = application.documents[docIndex].uploadHistory || [];
    application.documents[docIndex].uploadHistory.push({
      action: 'review',
      performedBy: 'admin',
      userId: req.admin.id,
      timestamp: new Date(),
      details: `Status changed to ${status}${remarks ? `: ${remarks}` : ''}`
    });
    application.updatedAt = new Date();

    // Auto-update application status based on document statuses
    const allDocs = application.documents;
    const hasVerified = allDocs.some(d => d.status === 'verified');
    const hasRejected = allDocs.some(d => d.status === 'rejected');
    const hasNeedsChanges = allDocs.some(d => d.status === 'needs_changes');
    const allVerified = allDocs.length > 0 && allDocs.every(d => d.status === 'verified');
    const anyPending = allDocs.some(d => d.status === 'pending');

    // Only auto-update if current status is not one of the final statuses
    const finalStatuses = ['accepted', 'rejected'];
    if (!finalStatuses.includes(application.status)) {
      if (hasRejected || hasNeedsChanges) {
        application.status = 'documents_pending';
      } else if (allVerified && !anyPending) {
        application.status = 'under_review';
      }
    }

    await application.save();

    // Create audit log for admin review
    const actionMap = {
      'verified': 'verify',
      'rejected': 'reject',
      'needs_changes': 'request_changes'
    };
    await DocumentAuditLog.create({
      applicationId: application._id,
      documentIndex: docIndex,
      documentName: application.documents[docIndex].name,
      action: actionMap[status] || 'view',
      performedBy: {
        role: 'admin',
        userId: req.admin.id,
        name: req.admin.username,
        email: null
      },
      fileDetails: application.documents[docIndex].filePath ? {
        originalName: application.documents[docIndex].originalName,
        fileSize: application.documents[docIndex].fileSize,
        filePath: application.documents[docIndex].filePath,
        fileType: application.documents[docIndex].fileType
      } : null,
      remarks: remarks,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    if (remarks && application.student?.email) {
      let message = `Your document "${application.documents[docIndex].name}" requires attention: ${remarks}`;
      if (googleFormLink && (status === 'needs_changes' || status === 'rejected')) {
        message += `\n\nPlease submit updated documents using this form: ${googleFormLink}`;
      }
      try {
        await nodemailer.sendNotification({
          to: application.student.email,
          subject: `Document Review - Action Required`,
          message,
          studentName: application.student.name,
          scholarshipName: application.scholarship?.name,
          status: 'documents_pending'
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/comment/:commentIndex/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const commentIndex = parseInt(req.params.commentIndex);
    if (commentIndex < 0 || commentIndex >= application.adminComments.length) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    application.adminComments[commentIndex].reply = reply;
    application.adminComments[commentIndex].replyAt = new Date();
    application.updatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/document/:docIndex/reply', async (req, res) => {
  try {
    const { reply, resubmittedLink } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docIndex = parseInt(req.params.docIndex);
    if (docIndex < 0 || docIndex >= application.documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    application.documents[docIndex].studentReply = reply;
    application.documents[docIndex].studentReplyAt = new Date();
    if (resubmittedLink) {
      application.documents[docIndex].studentResubmittedLink = resubmittedLink;
      application.documents[docIndex].studentResubmittedLinkAt = new Date();
      application.documents[docIndex].status = 'pending';
    }
    application.updatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate('scholarship');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    application.remarks = remarks;
    application.reviewedBy = req.admin.id;
    application.reviewedAt = new Date();
    application.updatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.adminComments.push({
      text,
      by: req.admin.id
    });
    application.updatedAt = new Date();
    await application.save();

    if (application.student?.email) {
      try {
        await nodemailer.sendNotification({
          to: application.student.email,
          subject: `Scholarship Update - ${application.scholarship?.name || 'Scholarship'}`,
          message: text,
          studentName: application.student.name,
          scholarshipName: application.scholarship?.name,
          status: application.status
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/notify', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate('scholarship');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const student = application.student;
    if (!student.email) {
      return res.status(400).json({ error: 'Student email not found' });
    }

    await nodemailer.sendNotification({
      to: student.email,
      subject: `Scholarship Application Update - ${application.scholarship?.name || 'Scholarship'}`,
      message: message || `Your scholarship application status has been updated to: ${application.status}`,
      studentName: student.name,
      scholarshipName: application.scholarship?.name,
      status: application.status
    });

    application.notificationSent = true;
    application.notificationSentAt = new Date();
    await application.save();

    res.json({ message: 'Notification sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/bulk-status', auth, async (req, res) => {
  try {
    const { ids, status, remarks } = req.body;
    
    await Application.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          status, 
          remarks, 
          reviewedBy: req.admin.id,
          reviewedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: `Updated ${ids.length} applications` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    for (const doc of application.documents) {
      if (doc.filePath) {
        const filePath = path.join(__dirname, '..', doc.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/applications', studentAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.rollNo) {
      return res.json([]);
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    if (!student) {
      return res.json([]);
    }

    const applications = await Application.find({ student: student._id })
      .populate('scholarship')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/student/apply', studentAuth, upload.any(), async (req, res) => {
  try {
    const { scholarshipId, applicationType, documents } = req.body;
    
    // Parse documents if it's a JSON string (from FormData)
    let parsedDocuments = documents;
    if (typeof documents === 'string') {
      parsedDocuments = JSON.parse(documents);
    }

    const user = await User.findById(req.user.id);
    if (!user.rollNo) {
      return res.status(400).json({ error: 'Roll number not linked. Please contact admin.' });
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found. Please contact admin.' });
    }

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
    const uploadedFiles = req.files || [];
    
    const docRecords = documentFields.map((doc, index) => {
      const submittedDoc = parsedDocuments?.find(d => d.name === doc.name);
      const uploadedFile = uploadedFiles.find(f => f.fieldname === doc.name);
      
      return {
        name: doc.name,
        fieldType: doc.type || 'file',
        value: uploadedFile ? uploadedFile.filename : (submittedDoc?.value || undefined),
        originalName: uploadedFile ? uploadedFile.originalname : undefined,
        filePath: uploadedFile ? uploadedFile.path.replace(/\\/g, '/').replace(/^.*\/uploads/, '/uploads') : undefined,
        fileType: uploadedFile ? uploadedFile.mimetype : undefined,
        fileSize: uploadedFile ? uploadedFile.size : undefined,
        status: 'pending',
        uploadHistory: uploadedFile ? [{
          action: 'upload',
          performedBy: 'student',
          userId: user._id,
          timestamp: new Date(),
          details: `Initial upload during application`
        }] : []
      };
    });

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

    // Create audit logs for uploaded documents
    for (const file of uploadedFiles) {
      const docIndex = docRecords.findIndex(d => d.originalName === file.originalname);
      if (docIndex !== -1) {
        await DocumentAuditLog.create({
          applicationId: application._id,
          documentIndex: docIndex,
          documentName: docRecords[docIndex].name,
          action: 'upload',
          performedBy: {
            role: 'student',
            userId: user._id,
            name: student.name,
            email: user.email
          },
          fileDetails: {
            originalName: file.originalname,
            fileSize: file.size,
            filePath: file.path.replace(/\\/g, '/').replace(/^.*\/uploads/, '/uploads'),
            fileType: file.mimetype
          },
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          }
        });
      }
    }

    res.status(201).json(application);
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/student/:id/documents', studentAuth, upload.any(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.rollNo) {
      return res.status(400).json({ error: 'Roll number not linked' });
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const application = await Application.findOne({ _id: req.params.id, student: student._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const uploadedFiles = req.files || [];
    console.log('Uploaded files:', uploadedFiles.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));
    console.log('Application documents:', application.documents.map(d => d.name));
    
    // Create a map of fieldname to file
    const fileMap = {};
    uploadedFiles.forEach(file => {
      fileMap[file.fieldname] = file;
    });

    // Update matching documents
    let updatedCount = 0;
    application.documents.forEach((doc, docIndex) => {
      const file = fileMap[doc.name];
      if (file) {
        const previousPath = doc.filePath;
        const previousVersion = doc.version || 1;
        
        // Store previous version
        if (previousPath) {
          application.documents[docIndex].previousVersions = application.documents[docIndex].previousVersions || [];
          application.documents[docIndex].previousVersions.push({
            filePath: previousPath,
            originalName: doc.originalName,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadedAt,
            replacedAt: new Date()
          });
        }

        application.documents[docIndex].value = file.filename;
        application.documents[docIndex].originalName = file.originalname;
        application.documents[docIndex].filePath = file.path.replace(/\\/g, '/').replace(/^.*\/uploads/, '/uploads');
        application.documents[docIndex].fileType = file.mimetype;
        application.documents[docIndex].fileSize = file.size;
        application.documents[docIndex].status = 'pending';
        application.documents[docIndex].uploadedAt = new Date();
        application.documents[docIndex].version = previousVersion + 1;
        application.documents[docIndex].uploadHistory = application.documents[docIndex].uploadHistory || [];
        application.documents[docIndex].uploadHistory.push({
          action: 'upload',
          performedBy: 'student',
          userId: user._id,
          timestamp: new Date(),
          details: previousPath ? `Resubmitted (version ${previousVersion + 1})` : `Initial upload`
        });
        updatedCount++;

        // Create audit log
        DocumentAuditLog.create({
          applicationId: application._id,
          documentIndex: docIndex,
          documentName: doc.name,
          action: previousPath ? 'resubmit' : 'upload',
          performedBy: {
            role: 'student',
            userId: user._id,
            name: student.name,
            email: user.email
          },
          fileDetails: {
            originalName: file.originalname,
            fileSize: file.size,
            filePath: file.path.replace(/\\/g, '/').replace(/^.*\/uploads/, '/uploads'),
            fileType: file.mimetype
          },
          previousFilePath: previousPath,
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          }
        });
      }
    });

    console.log(`Updated ${updatedCount} documents`);

    application.updatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:id', studentAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.rollNo) {
      return res.status(400).json({ error: 'Roll number not linked' });
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const application = await Application.findOne({ _id: req.params.id, student: student._id })
      .populate('student')
      .populate('scholarship');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Log view action
    await DocumentAuditLog.create({
      applicationId: application._id,
      action: 'view',
      performedBy: {
        role: 'student',
        userId: user._id,
        name: student.name,
        email: user.email
      },
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/student/:id/document/:docIndex', studentAuth, async (req, res) => {
  try {
    const { resubmittedLink, reply } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.rollNo) {
      return res.status(400).json({ error: 'Roll number not linked' });
    }

    const student = await Student.findOne({ rollNo: user.rollNo });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const application = await Application.findOne({ _id: req.params.id, student: student._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docIndex = parseInt(req.params.docIndex);
    if (docIndex < 0 || docIndex >= application.documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const previousStatus = application.documents[docIndex].status;

    if (resubmittedLink) {
      application.documents[docIndex].studentResubmittedLink = resubmittedLink;
      application.documents[docIndex].studentResubmittedLinkAt = new Date();
      application.documents[docIndex].status = 'pending';
    }
    if (reply) {
      application.documents[docIndex].studentReply = reply;
      application.documents[docIndex].studentReplyAt = new Date();
    }

    application.documents[docIndex].uploadHistory = application.documents[docIndex].uploadHistory || [];
    application.documents[docIndex].uploadHistory.push({
      action: 'reply',
      performedBy: 'student',
      userId: user._id,
      timestamp: new Date(),
      details: reply ? `Reply: ${reply.substring(0, 100)}` : 'Response submitted'
    });

    application.updatedAt = new Date();
    await application.save();

    // Create audit log for student reply
    await DocumentAuditLog.create({
      applicationId: application._id,
      documentIndex: docIndex,
      documentName: application.documents[docIndex].name,
      action: 'reply',
      performedBy: {
        role: 'student',
        userId: user._id,
        name: student.name,
        email: user.email
      },
      remarks: reply,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scholarships/available', async (req, res) => {
  try {
    const { financialYear } = req.query;
    const query = { isActive: true, type: 'internal' };
    if (financialYear) {
      query.financialYears = financialYear;
    }

    const scholarships = await Scholarship.find(query)
      .select('name provider amount type eligibility deadline requiredDocuments description financialYears');
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scholarships/external', async (req, res) => {
  try {
    const { financialYear } = req.query;
    const query = { isActive: true, type: 'external' };
    if (financialYear) {
      query.financialYears = financialYear;
    }

    const scholarships = await Scholarship.find(query)
      .select('name provider amount type eligibility deadline requiredDocuments description financialYears');
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
