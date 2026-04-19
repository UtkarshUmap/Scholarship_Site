import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentProfileApi } from '../api/student';
import { User, Save, AlertCircle, CheckCircle, ChevronRight, Mail, Phone, GraduationCap, Calendar, Hash, Building } from 'lucide-react';

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    email: '',
    phone: '',
    program: '',
    branch: '',
    batch: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/student-login');
        return;
      }
      try {
        const res = await studentProfileApi.getProfile();
        setUser(res.data);
        setFormData({
          rollNo: res.data.rollNo || '',
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          program: res.data.program || '',
          branch: res.data.branch || '',
          batch: res.data.batch || ''
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await studentProfileApi.updateProfile(formData);
      setSuccess('Profile saved successfully!');
      setUser(res.data.user);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iit-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const programs = ['BTech', 'MTech', 'MSc', 'PhD', 'BSc', 'MSc'];
  const branches = [
    'Computer Science and Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Metallurgy and Materials Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Data Science and Artificial Intelligence'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/student/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
              </Link>
              <div className="bg-gradient-to-br from-iit-primary to-iit-secondary p-2 rounded-xl shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                <p className="text-xs text-gray-500">Manage your personal information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-iit-primary to-iit-secondary p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-iit-primary text-3xl font-bold shadow-xl">
                  {formData.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <h2 className="text-xl font-bold text-white">{formData.name || 'Student'}</h2>
                <p className="text-white/80 text-sm">{formData.email}</p>
              </div>
              
              <div className="p-6 space-y-4">
                {user?.rollNo ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle size={20} />
                      <span className="font-semibold">Profile Verified</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">Roll No: {user.rollNo}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-700">
                      <AlertCircle size={20} />
                      <span className="font-semibold">Link Your Roll Number</span>
                    </div>
                    <p className="text-sm text-amber-600 mt-1">Required to apply for scholarships</p>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.program && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-iit-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Program</p>
                        <p className="font-medium text-gray-900">{formData.program}</p>
                      </div>
                    </div>
                  )}
                  
                  {formData.branch && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Building className="w-5 h-5 text-iit-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Branch</p>
                        <p className="font-medium text-gray-900">{formData.branch}</p>
                      </div>
                    </div>
                  )}
                  
                  {formData.batch && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-iit-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Batch</p>
                        <p className="font-medium text-gray-900">{formData.batch}</p>
                      </div>
                    </div>
                  )}
                  
                  {formData.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-iit-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{formData.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Roll Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Hash size={16} className="text-iit-primary" />
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="e.g., B22CS001"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <User size={16} className="text-iit-primary" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Mail size={16} className="text-iit-primary" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@iitbhilai.ac.in"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Phone size={16} className="text-iit-primary" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                    />
                  </div>

                  {/* Program */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <GraduationCap size={16} className="text-iit-primary" />
                      Program
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all bg-white"
                    >
                      <option value="">Select Program</option>
                      {programs.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Building size={16} className="text-iit-primary" />
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all bg-white"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Calendar size={16} className="text-iit-primary" />
                      Batch
                    </label>
                    <input
                      type="text"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      placeholder="e.g., 2022-2026"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-iit-primary to-iit-secondary text-white py-4 rounded-xl font-semibold hover:from-iit-secondary hover:to-iit-primary disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
