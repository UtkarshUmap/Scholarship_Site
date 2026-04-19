const nodemailer = require('nodemailer');
const { Settings } = require('../models/Settings');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const emailSetting = await Settings.findOne({ key: 'emailConfig' });
  const config = emailSetting?.value || {};

  if (!config.host || !config.user) {
    console.log('Email not configured. Install nodemailer and configure SMTP.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port || 587,
    secure: config.secure || false,
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  return transporter;
}

async function sendNotification({ to, subject, message, studentName, scholarshipName, status }) {
  const transport = await getTransporter();
  if (!transport) {
    console.log('Email not configured. Skipping notification.');
    return { skipped: true };
  }

  const emailSetting = await Settings.findOne({ key: 'emailConfig' });
  const config = emailSetting?.value || {};
  const from = config.from || config.user;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">IIT Bhilai Scholarship Portal</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd;">
        <h2>Application Update</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>${message}</p>
        ${scholarshipName ? `<p><strong>Scholarship:</strong> ${scholarshipName}</p>` : ''}
        ${status ? `<p><strong>Status:</strong> <span style="color: ${getStatusColor(status)}; font-weight: bold;">${status.toUpperCase()}</span></p>` : ''}
        <p style="margin-top: 30px;">
          Please log in to the scholarship portal to view details and upload any required documents.
        </p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message from IIT Bhilai Scholarship Portal.
        </p>
      </div>
    </div>
  `;

  return transport.sendMail({
    from,
    to,
    subject,
    html: htmlContent
  });
}

function getStatusColor(status) {
  const colors = {
    accepted: '#28a745',
    rejected: '#dc3545',
    pending: '#ffc107',
    applied: '#17a2b8',
    under_review: '#6c757d'
  };
  return colors[status] || '#333';
}

async function sendBulkNotifications(applications, message) {
  const transport = await getTransporter();
  if (!transport) return { sent: 0, failed: 0 };

  let sent = 0, failed = 0;

  for (const app of applications) {
    try {
      await sendNotification({
        to: app.student.email,
        subject: `Scholarship Application Update - ${app.scholarship.name}`,
        message,
        studentName: app.student.name,
        scholarshipName: app.scholarship.name,
        status: app.status
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${app.student.email}:`, err.message);
      failed++;
    }
  }

  return { sent, failed };
}

module.exports = { sendNotification, sendBulkNotifications };
