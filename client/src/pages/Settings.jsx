import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Save, Settings as SettingsIcon, Mail, Shield, FileText, Plus, X, User, Trash2 } from 'lucide-react';

const DEFAULT_DOC_PRESETS = [
  'Income Certificate',
  'Caste Certificate',
  'Bank Passbook Copy',
  'Aadhar Card',
  'Previous Year Marksheet',
  'Fee Receipt',
  'Bonafide Certificate',
  'Domicile Certificate',
  'Father Income Certificate',
  'Passport Size Photo',
  'Institute ID Card',
  'GAP Certificate',
  'Migration Certificate'
];

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    maxApplications: 2,
    defaultFinancialYear: '2024-25',
    deadline: ''
  });
  const [emailConfig, setEmailConfig] = useState({
    host: '', port: 587, secure: false, user: '', password: '', from: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [documentPresets, setDocumentPresets] = useState(DEFAULT_DOC_PRESETS);
  const [newPreset, setNewPreset] = useState('');
  
  const [academics, setAcademics] = useState([]);
  const [showAcademicsModal, setShowAcademicsModal] = useState(false);
  const [academicsForm, setAcademicsForm] = useState({ name: '', email: '', password: '', department: '' });
  const [creatingAcademics, setCreatingAcademics] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAcademics();
  }, []);

  const fetchSettings = async () => {
    try {
      const [s, e] = await Promise.all([
        adminApi.getSettingsDefaults(),
        adminApi.getSettingsEmail()
      ]);
      setSettings(prev => ({ ...prev, ...s.data }));
      setEmailConfig(prev => ({ ...prev, ...e.data }));
      
      const allSettings = await adminApi.getSettings();
      if (allSettings.data.documentPresets) {
        setDocumentPresets(allSettings.data.documentPresets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademics = async () => {
    try {
      const res = await adminApi.getAcademics();
      setAcademics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAcademics = async (e) => {
    e.preventDefault();
    setCreatingAcademics(true);
    try {
      await adminApi.createAcademics(academicsForm);
      setMessage('Academics account created!');
      setTimeout(() => setMessage(''), 3000);
      setShowAcademicsModal(false);
      setAcademicsForm({ name: '', email: '', password: '', department: '' });
      fetchAcademics();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating account');
    } finally {
      setCreatingAcademics(false);
    }
  };

  const handleDeleteAcademics = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await adminApi.deleteAcademics(id);
      fetchAcademics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettingsBulk([
        { key: 'maxApplications', value: settings.maxApplications },
        { key: 'defaultFinancialYear', value: settings.defaultFinancialYear },
        { key: 'deadline', value: settings.deadline }
      ]);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettingsEmail(emailConfig);
      setMessage('Email configuration saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving email config');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePresets = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettingsDocumentPresets({ presets: documentPresets });
      setMessage('Document presets saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving presets');
    } finally {
      setSaving(false);
    }
  };

  const addPreset = () => {
    if (newPreset.trim() && !documentPresets.includes(newPreset.trim())) {
      setDocumentPresets([...documentPresets, newPreset.trim()]);
      setNewPreset('');
    }
  };

  const removePreset = (index) => {
    setDocumentPresets(documentPresets.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure system settings</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <SettingsIcon size={20} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-iit-primary" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Scholarship Applications per Student
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxApplications}
                onChange={(e) => setSettings({ ...settings, maxApplications: Number(e.target.value) })}
                className="input w-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                Students can apply to up to this many scholarships
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Financial Year
              </label>
              <input
                type="text"
                value={settings.defaultFinancialYear}
                onChange={(e) => setSettings({ ...settings, defaultFinancialYear: e.target.value })}
                className="input w-40"
                placeholder="2024-25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={settings.deadline}
                onChange={(e) => setSettings({ ...settings, deadline: e.target.value })}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Students cannot apply after this date
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={20} className="text-iit-primary" />
            <h2 className="text-lg font-semibold">Email Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                  className="input"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => setEmailConfig({ ...emailConfig, port: Number(e.target.value) })}
                  className="input"
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={emailConfig.secure}
                  onChange={(e) => setEmailConfig({ ...emailConfig, secure: e.target.checked })}
                  className="rounded text-iit-primary"
                />
                <span className="text-sm text-gray-700">Use SSL/TLS (port 465)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
              <input
                type="text"
                value={emailConfig.user}
                onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                className="input"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={emailConfig.password}
                  onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                  className="input pr-10"
                  placeholder="App password if using Gmail"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
              <input
                type="text"
                value={emailConfig.from}
                onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                className="input"
                placeholder="IIT Bhilai Scholarship Portal"
              />
            </div>

            <button
              onClick={handleSaveEmail}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Email Config'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-iit-primary" />
          <h2 className="text-lg font-semibold">Document Presets</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Manage common document names that can be quickly added when creating scholarships.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPreset}
              onChange={(e) => setNewPreset(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPreset()}
              className="input flex-1"
              placeholder="Add new document preset..."
            />
            <button onClick={addPreset} className="btn-secondary flex items-center gap-2">
              <Plus size={18} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {documentPresets.map((preset, idx) => (
              <span
                key={idx}
                className="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
              >
                <FileText size={14} className="text-gray-500" />
                {preset}
                <button
                  onClick={() => removePreset(idx)}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={handleSavePresets}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Presets'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-iit-primary" />
            <h2 className="text-lg font-semibold">Academics Accounts</h2>
          </div>
          <button
            onClick={() => setShowAcademicsModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add Academics
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Manage faculty/academics accounts for document requests.
        </p>

        {academics.length === 0 ? (
          <p className="text-gray-500 text-sm">No academics accounts yet. Click "Add Academics" to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {academics.map((acad) => (
                  <tr key={acad._id} className="border-t border-gray-100">
                    <td className="px-4 py-2">{acad.name}</td>
                    <td className="px-4 py-2">{acad.email}</td>
                    <td className="px-4 py-2">{acad.department || '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteAcademics(acad._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAcademicsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add Academics Account</h2>
            <form onSubmit={handleCreateAcademics} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={academicsForm.name}
                  onChange={(e) => setAcademicsForm({ ...academicsForm, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={academicsForm.email}
                  onChange={(e) => setAcademicsForm({ ...academicsForm, email: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={academicsForm.password}
                  onChange={(e) => setAcademicsForm({ ...academicsForm, password: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={academicsForm.department}
                  onChange={(e) => setAcademicsForm({ ...academicsForm, department: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAcademicsModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAcademics}
                  className="btn-primary"
                >
                  {creatingAcademics ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">CSV Column Mappings</h2>
        <p className="text-sm text-gray-600 mb-4">
          Default column mappings for CSV imports. These can be customized during import.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-2">CSV Column</th>
                <th className="px-4 py-2">Database Field</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { csv: 'S.No', db: 'serialNo', desc: 'Serial number' },
                { csv: 'ID No', db: 'rollNo', desc: 'Student roll number (unique)' },
                { csv: 'Name', db: 'name', desc: 'Student full name' },
                { csv: 'Course', db: 'branch', desc: 'Branch (BTech/MTech/MSc etc.)' },
                { csv: 'Gender', db: 'gender', desc: 'Male/Female/Other' },
                { csv: 'Financial Year', db: 'financialYear', desc: 'e.g., 2024-25' },
                { csv: 'Scholarship Scheme', db: 'scholarshipName', desc: 'Name of scholarship' },
                { csv: 'Amount', db: 'amount', desc: 'Scholarship amount' },
                { csv: 'Fresh/Renewal', db: 'applicationType', desc: 'Fresh or Renewal' },
              ].map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs">{row.csv}</td>
                  <td className="px-4 py-2">{row.db}</td>
                  <td className="px-4 py-2 text-gray-500">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
