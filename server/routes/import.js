const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const { Settings, ColumnMapping } = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/imports'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const uploadsDir = path.join(__dirname, '../uploads/imports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const DEFAULT_MAPPINGS = {
  'S.No': 'serialNo',
  'S. No': 'serialNo',
  'SNo': 'serialNo',
  'ID No': 'rollNo',
  'IDNo': 'rollNo',
  'ID': 'rollNo',
  'Name': 'name',
  'Course': 'branch',
  'Gender': 'gender',
  'Financial Year': 'financialYear',
  'Fin Year': 'financialYear',
  'Scholarship Scheme': 'scholarshipName',
  'Scholarship': 'scholarshipName',
  'Amount': 'amount',
  'Fresh / Renewal': 'applicationType',
  'Fresh/Renewal': 'applicationType',
  'Fresh': 'applicationType',
  'Renewal': 'applicationType',
  'Batch': 'batch',
  'Year': 'year',
  'Income': 'income',
  'Father Income': 'fatherIncome',
  'Phone': 'phone',
  'Email': 'email'
};

function normalizeHeader(header) {
  return header.trim().replace(/\s+/g, ' ');
}

function getDbField(csvHeader) {
  const normalized = normalizeHeader(csvHeader);
  return DEFAULT_MAPPINGS[normalized] || null;
}

router.get('/mappings', auth, async (req, res) => {
  try {
    let mappings = await ColumnMapping.find({ isDefault: true }).sort({ createdAt: -1 });
    if (!mappings.length) {
      mappings = [{
        name: 'Default IIT Bhilai Format',
        mappings: [
          { csvColumn: 'S.No', dbField: 'serialNo' },
          { csvColumn: 'ID No', dbField: 'rollNo' },
          { csvColumn: 'Name', dbField: 'name' },
          { csvColumn: 'Course', dbField: 'branch' },
          { csvColumn: 'Gender', dbField: 'gender' },
          { csvColumn: 'Financial Year', dbField: 'financialYear' },
          { csvColumn: 'Scholarship Scheme', dbField: 'scholarshipName' },
          { csvColumn: 'Amount', dbField: 'amount' },
          { csvColumn: 'Fresh/Renewal', dbField: 'applicationType' }
        ],
        isDefault: true
      }];
    }
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mappings', auth, async (req, res) => {
  try {
    const { name, mappings, isDefault } = req.body;
    
    if (isDefault) {
      await ColumnMapping.updateMany({}, { isDefault: false });
    }

    const columnMapping = new ColumnMapping({ name, mappings, isDefault });
    await columnMapping.save();
    res.status(201).json(columnMapping);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/preview', auth, async (req, res) => {
  try {
    const { file } = req.query;
    const filePath = path.join(uploadsDir, file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const results = [];
    const headers = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (h) => {
        headers.push(...h);
      })
      .on('data', (data) => {
        if (results.length < 5) results.push(data);
      })
      .on('end', () => {
        res.json({ headers, preview: results });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    const stats = { studentsCreated: 0, studentsUpdated: 0, applicationsCreated: 0, applicationsUpdated: 0, skipped: 0 };

    const scholarships = await Scholarship.find({});
    const scholarshipMap = {};
    scholarships.forEach(s => {
      scholarshipMap[s.name.toLowerCase()] = s._id;
    });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (let i = 0; i < results.length; i++) {
          try {
            const row = results[i];
            const rowHeaders = Object.keys(row);
            
            const rowMappings = {};
            for (const header of rowHeaders) {
              const dbField = getDbField(header);
              if (dbField) {
                rowMappings[dbField] = row[header];
              }
            }

            const rollNo = (rowMappings.rollNo || '').toUpperCase().trim();
            
            if (!rollNo) {
              errors.push({ row: i + 1, error: 'Roll No (ID No) is required' });
              stats.skipped++;
              continue;
            }

            let student = await Student.findOne({ rollNo });
            if (!student) {
              const studentData = {
                rollNo,
                name: rowMappings.name || '',
                gender: rowMappings.gender ? normalizeGender(rowMappings.gender) : '',
                branch: rowMappings.branch || '',
                financialYear: rowMappings.financialYear || '',
                batch: rowMappings.batch || '',
                income: parseFloat(rowMappings.income) || 0,
                fatherIncome: parseFloat(rowMappings.fatherIncome) || 0
              };
              
              student = new Student(studentData);
              await student.save();
              stats.studentsCreated++;
            } else {
              await Student.findByIdAndUpdate(student._id, {
                name: rowMappings.name || student.name,
                gender: rowMappings.gender ? normalizeGender(rowMappings.gender) : student.gender,
                branch: rowMappings.branch || student.branch,
                financialYear: rowMappings.financialYear || student.financialYear,
                updatedAt: new Date()
              });
              stats.studentsUpdated++;
            }

            const scholarshipName = rowMappings.scholarshipName || '';
            if (scholarshipName) {
              let scholarshipId = scholarshipMap[scholarshipName.toLowerCase()];
              
              if (!scholarshipId) {
                const newScholarship = new Scholarship({
                  name: scholarshipName,
                  amount: parseFloat(rowMappings.amount) || 0,
                  isActive: true,
                  financialYears: [rowMappings.financialYear || new Date().getFullYear().toString()]
                });
                await newScholarship.save();
                scholarshipId = newScholarship._id;
                scholarshipMap[scholarshipName.toLowerCase()] = scholarshipId;
              }

              const appType = normalizeApplicationType(rowMappings.applicationType);
              
              let application = await Application.findOne({ 
                student: student._id, 
                scholarship: scholarshipId 
              });

              const appData = {
                student: student._id,
                scholarship: scholarshipId,
                financialYear: rowMappings.financialYear || '',
                applicationType: appType,
                amount: parseFloat(rowMappings.amount) || 0,
                serialNo: rowMappings.serialNo || String(i + 1)
              };

              if (application) {
                await Application.findByIdAndUpdate(application._id, {
                  ...appData,
                  updatedAt: new Date()
                });
                stats.applicationsUpdated++;
              } else {
                application = new Application(appData);
                await application.save();
                stats.applicationsCreated++;
              }
            }

          } catch (err) {
            errors.push({ row: i + 1, error: err.message });
          }
        }

        fs.unlinkSync(req.file.path);

        res.json({
          message: 'Import completed successfully',
          ...stats,
          totalRows: results.length,
          errors: errors.slice(0, 20)
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function normalizeGender(gender) {
  if (!gender) return '';
  const g = gender.toLowerCase().charAt(0);
  if (g === 'm') return 'Male';
  if (g === 'f') return 'Female';
  return 'Other';
}

function normalizeApplicationType(type) {
  if (!type) return 'fresh';
  const t = type.toLowerCase();
  if (t.includes('renew')) return 'renewal';
  return 'fresh';
}

router.get('/template', auth, (req, res) => {
  const headers = 'S.No,ID No,Name,Course,Gender,Financial Year,Scholarship Scheme,Amount,Fresh/Renewal';
  res.setHeader('Content-Disposition', 'attachment; filename=scholarship_template.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(headers);
});

module.exports = router;
