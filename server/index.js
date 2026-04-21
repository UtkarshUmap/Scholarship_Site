require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MIME types for proper file serving
const mimeTypes = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// View file inline (displays in browser)
app.get('/api/file/view/:path(*)', (req, res) => {
  let relativePath = req.params.path;
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.substring(1);
  }
  if (relativePath.startsWith('uploads/')) {
    relativePath = relativePath.substring(8);
  }
  
  const filePath = path.join(uploadsDir, relativePath);
  const ext = path.extname(filePath).toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

// Static files for uploads (fallback)
app.use('/uploads', express.static(uploadsDir));

// API Routes
const studentRoutes = require('./routes/students');
const scholarshipRoutes = require('./routes/scholarships');
const applicationRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');
const importRoutes = require('./routes/import');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const externalRequestsRoutes = require('./routes/externalRequests');
const documentRequestsRoutes = require('./routes/documentRequests');
const academicsRoutes = require('./routes/academics');
const studentApiRoutes = require('./routes/student');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/import', importRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/external-requests', externalRequestsRoutes);
app.use('/api/document-requests', documentRequestsRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/student', studentApiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
