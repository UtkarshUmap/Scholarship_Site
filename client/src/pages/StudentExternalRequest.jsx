import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi, studentExternalRequestsApi, studentProfileApi } from '../api/student';
import { ChevronRight, Plus, ExternalLink, AlertCircle, CheckCircle, Clock, X, DollarSign, Building, FileText, Send } from 'lucide-react';

export default function StudentExternalRequest() {
  const [formData, setFormData] = useState({
    scholarshipName: '',
    provider: '',
    amount: '',
    requiredDocuments: '',
    verificationLinks: [{ label: '', url: '' }],
    description: ''
  });
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/student-login');
        return;
      }
      try {
        await studentAuthApi.getMe().catch(() => {
          return studentProfileApi.getProfile();
        });
        const res = await studentExternalRequestsApi.getMyRequests();
        setMyRequests(res.data);
      } catch (err) {
        if (err.response?.status === 400) {
          navigate('/student/profile');
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLinkChange = (idx, field, value) => {
    const links = [...formData.verificationLinks];
    links[idx][field] = value;
    setFormData({ ...formData, verificationLinks: links });
  };

  const addLink = () => {
    setFormData({
      ...formData,
      verificationLinks: [...formData.verificationLinks, { label: '', url: '' }]
    });
  };

  const removeLink = (idx) => {
    const links = formData.verificationLinks.filter((_, i) => i !== idx);
    setFormData({ ...formData, verificationLinks: links });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        requiredDocuments: formData.requiredDocuments.split(',').map(d => d.trim()).filter(Boolean),
        verificationLinks: formData.verificationLinks.filter(l => l.label && l.url)
      };

      await studentExternalRequestsApi.createRequest(payload);
      setSuccess(true);
      setFormData({
        scholarshipName: '',
        provider: '',
        amount: '',
        requiredDocuments: '',
        verificationLinks: [{ label: '', url: '' }],
        description: ''
      });
      const res = await studentExternalRequestsApi.getMyRequests();
      setMyRequests(res.data);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Clock size={16} />, label: 'Pending Review' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle size={16} />, label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertCircle size={16} />, label: 'Rejected' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iit-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

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
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">External Scholarship Request</h1>
                <p className="text-xs text-gray-500">Request a new external scholarship</p>
              </div>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              S
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Request Submitted!</h3>
                <p className="text-sm text-white/80">Admin will review and get back to you</p>
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit New Request
                </h2>
                <p className="text-white/80 text-sm mt-1">Request admin to add an external scholarship</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Scholarship Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FileText size={16} className="text-purple-500" />
                    Scholarship Name *
                  </label>
                  <input
                    type="text"
                    name="scholarshipName"
                    required
                    placeholder="e.g., Prime Minister Scholarship"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    value={formData.scholarshipName}
                    onChange={handleChange}
                  />
                </div>

                {/* Provider */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Building size={16} className="text-purple-500" />
                    Provider / Organization
                  </label>
                  <input
                    type="text"
                    name="provider"
                    placeholder="e.g., Ministry of Defence"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    value={formData.provider}
                    onChange={handleChange}
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <DollarSign size={16} className="text-purple-500" />
                    Scholarship Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      name="amount"
                      placeholder="50000"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Required Documents */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FileText size={16} className="text-purple-500" />
                    Required Documents
                  </label>
                  <input
                    type="text"
                    name="requiredDocuments"
                    placeholder="Income Certificate, Caste Certificate (comma separated)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    value={formData.requiredDocuments}
                    onChange={handleChange}
                  />
                </div>

                {/* Verification Links */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <ExternalLink size={16} className="text-purple-500" />
                    Verification Links
                  </label>
                  <div className="space-y-3">
                    {formData.verificationLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g., Official Website)"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                          value={link.label}
                          onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                        />
                        <input
                          type="url"
                          placeholder="URL"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                          value={link.url}
                          onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                        />
                        {formData.verificationLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLink(idx)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Plus size={16} />
                    Add another link
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Tell us more about this scholarship..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* My Requests */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">My Requests</h2>
                <p className="text-sm text-gray-500">{myRequests.length} request(s) submitted</p>
              </div>
              
              <div className="p-6">
                {myRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Yet</h3>
                    <p className="text-gray-500 text-sm">Submit a request to add an external scholarship</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((req) => {
                      const status = getStatusConfig(req.status);
                      return (
                        <div 
                          key={req._id} 
                          className={`border rounded-2xl p-5 transition-all hover:shadow-md ${status.border}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{req.scholarshipName}</h3>
                              <p className="text-sm text-gray-500">{req.provider || 'No provider specified'}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-sm mb-3">
                            {req.amount && (
                              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <DollarSign size={14} />
                                ₹{req.amount.toLocaleString()}
                              </span>
                            )}
                            {req.requiredDocuments?.length > 0 && (
                              <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                <FileText size={14} />
                                {req.requiredDocuments.length} docs
                              </span>
                            )}
                          </div>

                          {req.adminRemarks && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-800 mb-1">Admin Remarks:</p>
                              <p className="text-sm text-amber-700">{req.adminRemarks}</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-3">
                            Submitted on {new Date(req.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
