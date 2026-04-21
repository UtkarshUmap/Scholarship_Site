import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Eye, X, 
  Mail, FileText, Check, AlertCircle, CheckCircle, XCircle, MessageSquare, 
  CornerDownRight, ExternalLink, Upload, Clock, Inbox, Archive
} from 'lucide-react';

const API_URL = '/api';

const getFileViewUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/file/view${path}`;
};

export default function Applications() {
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('action'); // 'action' or 'completed'
  const [filters, setFilters] = useState({
    search: '', scholarship: '', status: '', financialYear: '',
    applicationType: '', gender: '', branch: '', docStatus: ''
  });
  const [scholarships, setScholarships] = useState([]);
  const [branches, setBranches] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [comment, setComment] = useState('');
  const [showNeedsChangesModal, setShowNeedsChangesModal] = useState(false);
  const [needsChangesDoc, setNeedsChangesDoc] = useState(null);
  const [needsChangesRemark, setNeedsChangesRemark] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  // Separate applications by status
  const needsActionStatuses = ['applied', 'pending', 'under_review', 'documents_pending'];
  const completedStatuses = ['accepted', 'rejected'];

  useEffect(() => {
    fetchApplications();
    fetchFilters();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = { limit: 500 }; // Get more for tabs
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;
      const res = await adminApi.getApplications(params);
      setAllApplications(res.data.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [s, b, f] = await Promise.all([
        adminApi.getActiveScholarships(),
        adminApi.getStudentBranches(),
        adminApi.getStudentFinancialYears()
      ]);
      setScholarships(s.data);
      setBranches(b.data.filter(Boolean));
      setFinancialYears(f.data.filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter applications based on active tab and filters
  const filteredApplications = allApplications.filter(app => {
    if (activeTab === 'action') {
      if (!needsActionStatuses.includes(app.status)) return false;
    } else {
      if (!completedStatuses.includes(app.status)) return false;
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!app.student?.rollNo?.toLowerCase().includes(search) && 
          !app.student?.name?.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (filters.scholarship && app.scholarship?._id !== filters.scholarship) return false;
    if (filters.status && app.status !== filters.status) return false;
    if (filters.applicationType && app.applicationType !== filters.applicationType) return false;
    if (filters.financialYear && app.financialYear !== filters.financialYear) return false;
    if (filters.branch && app.student?.branch !== filters.branch) return false;
    if (filters.gender && app.student?.gender !== filters.gender) return false;
    
    if (minAmount && app.amount < parseInt(minAmount)) return false;
    if (maxAmount && app.amount > parseInt(maxAmount)) return false;

    return true;
  });

  // Count stats
  const stats = {
    needsAction: allApplications.filter(a => needsActionStatuses.includes(a.status)).length,
    completed: allApplications.filter(a => completedStatuses.includes(a.status)).length,
    accepted: allApplications.filter(a => a.status === 'accepted').length,
    rejected: allApplications.filter(a => a.status === 'rejected').length,
    pendingDocs: allApplications.filter(a => a.status === 'documents_pending').length
  };

  const handleView = async (id) => {
    try {
      const res = await adminApi.getApplication(id);
      setSelectedApp(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Error fetching application');
    }
  };

  const handleStatusChange = async (id, status, remarks = '') => {
    try {
      await adminApi.updateApplicationStatus(id, { status, remarks });
      fetchApplications();
      if (selectedApp?._id === id) {
        const res = await adminApi.getApplication(id);
        setSelectedApp(res.data);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDocReview = async (appId, docIndex, status, remarks, googleFormLink) => {
    try {
      await adminApi.updateApplicationDocument(appId, docIndex, { status, remarks, googleFormLink });
      const res = await adminApi.getApplication(appId);
      setSelectedApp(res.data);
      fetchApplications();
    } catch (err) {
      alert('Error updating document');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedApp) return;
    try {
      await adminApi.addApplicationComment(selectedApp._id, { text: comment });
      setComment('');
      const res = await adminApi.getApplication(selectedApp._id);
      setSelectedApp(res.data);
      alert('Comment added and email sent to student');
    } catch (err) {
      alert('Error adding comment');
    }
  };

  const handleNotify = async (id, message) => {
    try {
      await adminApi.notifyApplication(id, { message });
      alert('Notification sent successfully');
    } catch (err) {
      alert('Error sending notification');
    }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    try {
      await adminApi.bulkUpdateApplicationStatus({ ids: selectedIds, status: bulkStatus });
      setSelectedIds([]);
      setBulkStatus('');
      fetchApplications();
    } catch (err) {
      alert('Error updating applications');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map(a => a._id));
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', scholarship: '', status: '', financialYear: '', applicationType: '', gender: '', branch: '', docStatus: '' });
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || minAmount || maxAmount;

  const getStatusBadge = (status) => {
    const styles = {
      accepted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      applied: 'bg-blue-100 text-blue-800',
      under_review: 'bg-purple-100 text-purple-800',
      documents_pending: 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const getDocStatusBadge = (status) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_changes: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 mt-1">Review and manage scholarship applications</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">Set Status</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <button 
                onClick={handleBulkStatus} 
                className="px-3 py-2 bg-iit-primary text-white text-sm rounded-lg hover:bg-iit-secondary"
              >
                Apply
              </button>
            </div>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showFilters ? 'bg-iit-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter size={18} /> Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-amber-500 rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.needsAction}</p>
          <p className="text-sm text-gray-500">Needs Action</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingDocs}</p>
          <p className="text-sm text-gray-500">Pending Docs</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.accepted}</p>
          <p className="text-sm text-gray-500">Accepted</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          <p className="text-sm text-gray-500">Rejected</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Archive className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{allApplications.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('action'); setSelectedIds([]); }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'action' 
                  ? 'text-iit-primary bg-iit-primary/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Inbox className="w-5 h-5" />
                <span>Applications Requiring Action</span>
                {stats.needsAction > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.needsAction}
                  </span>
                )}
              </div>
              {activeTab === 'action' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-iit-primary"></div>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setSelectedIds([]); }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'completed' 
                  ? 'text-iit-primary bg-iit-primary/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Archive className="w-5 h-5" />
                <span>Completed Applications</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.completed}
                </span>
              </div>
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-iit-primary"></div>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by ID No or Name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              />
              <select
                value={filters.scholarship}
                onChange={(e) => setFilters({ ...filters, scholarship: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">All Scholarships</option>
                {scholarships.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">All Status</option>
                {activeTab === 'action' ? (
                  <>
                    <option value="applied">Applied</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="documents_pending">Documents Pending</option>
                  </>
                ) : (
                  <>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
              <select
                value={filters.applicationType}
                onChange={(e) => setFilters({ ...filters, applicationType: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">Fresh/Renewal</option>
                <option value="fresh">Fresh</option>
                <option value="renewal">Renewal</option>
              </select>
              <select
                value={filters.financialYear}
                onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">All Financial Years</option>
                {financialYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
              >
                <option value="">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <X size={18} /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">S.No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ID No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Branch</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Scholarship</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Docs</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app, idx) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app._id)}
                          onChange={() => toggleSelect(app._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.student?.rollNo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{app.student?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{app.student?.branch || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">{app.scholarship?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{app.amount?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          app.applicationType === 'fresh' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {app.applicationType === 'fresh' ? 'F' : 'R'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                      <td className="px-4 py-3">
                        {app.documents?.length > 0 ? (
                          <span className={`text-xs font-medium ${
                            app.documents.every(d => d.status === 'verified') ? 'text-green-600' :
                            app.documents.some(d => d.status === 'needs_changes') ? 'text-yellow-600' :
                            app.documents.some(d => d.status === 'rejected') ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {app.documents.filter(d => d.status === 'verified').length}/{app.documents.length} ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleView(app._id)} 
                          className="p-1.5 text-iit-primary hover:bg-iit-primary/10 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan="11" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-gray-300 mb-3" />
                          <p>No applications found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {filteredApplications.length} applications
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedApp.student?.rollNo} - {selectedApp.student?.name}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">ID No</p><p className="font-medium">{selectedApp.student?.rollNo}</p></div>
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{selectedApp.student?.name}</p></div>
                  <div><p className="text-gray-500">Program</p><p className="font-medium">{selectedApp.student?.program || '-'}</p></div>
                  <div><p className="text-gray-500">Branch</p><p className="font-medium">{selectedApp.student?.branch || '-'}</p></div>
                  <div><p className="text-gray-500">Gender</p><p className="font-medium">{selectedApp.student?.gender || '-'}</p></div>
                  <div><p className="text-gray-500">Financial Year</p><p className="font-medium">{selectedApp.financialYear || '-'}</p></div>
                  <div><p className="text-gray-500">Income</p><p className="font-medium">₹{selectedApp.student?.income?.toLocaleString() || 0}</p></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Scholarship Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">Scholarship</p><p className="font-medium">{selectedApp.scholarship?.name || '-'}</p></div>
                  <div><p className="text-gray-500">Amount</p><p className="font-medium text-green-600">₹{selectedApp.amount?.toLocaleString() || 0}</p></div>
                  <div><p className="text-gray-500">Type</p><p className="font-medium capitalize">{selectedApp.applicationType}</p></div>
                  <div><p className="text-gray-500">Status</p><div className="mt-1">{getStatusBadge(selectedApp.status)}</div></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Document Verification</h3>
                {selectedApp.documents?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedApp.documents.map((doc, idx) => (
                      <div key={idx} className={`border-2 rounded-xl overflow-hidden transition-all ${doc.adminRemarks ? 'border-orange-300' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-stretch">
                          <div className="w-28 bg-gray-50 flex flex-col items-center justify-center p-3 border-r gap-2">
                            {doc.filePath ? (
                              <a
                                href={getFileViewUrl(doc.filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-1 text-iit-primary hover:text-iit-primary/80 p-2 rounded-lg hover:bg-iit-primary/5"
                              >
                                <Eye className="w-6 h-6 text-iit-primary" />
                                <span className="text-xs font-medium">View</span>
                              </a>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-gray-400">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs">Pending</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {doc.status === 'verified' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {doc.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                                {doc.status === 'needs_changes' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                                {doc.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                                <span className="font-medium text-gray-900">{doc.name}</span>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDocStatusBadge(doc.status)}`}>
                                {doc.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            {doc.originalName && (
                              <p className="text-sm text-gray-500">{doc.originalName}</p>
                            )}
                            {doc.version > 1 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Version {doc.version}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t bg-gray-50 p-4 space-y-3">
                          {doc.adminRemarks && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Your Message</span>
                                {doc.adminRemarksAt && (
                                  <span className="text-xs text-orange-600 ml-auto">
                                    {new Date(doc.adminRemarksAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-orange-700">{doc.adminRemarks}</p>
                            </div>
                          )}

                          {doc.studentReply && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-blue-800">Student Response</span>
                                {doc.studentReplyAt && (
                                  <span className="text-xs text-blue-600 ml-auto">
                                    {new Date(doc.studentReplyAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-blue-700">{doc.studentReply}</p>
                              {doc.studentResubmittedLink && (
                                <a
                                  href={doc.studentResubmittedLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-iit-primary hover:underline text-xs"
                                >
                                  <ExternalLink size={12} />
                                  View Submitted Link
                                </a>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleDocReview(selectedApp._id, idx, 'verified', '', '')}
                              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                doc.status === 'verified' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              <CheckCircle size={14} /> Verified
                            </button>
                            <button
                              onClick={() => {
                                setRejectDoc({ appId: selectedApp._id, docIndex: idx, docName: doc.name });
                                setRejectRemark('');
                                setShowRejectModal(true);
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                doc.status === 'rejected' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              <XCircle size={14} /> Rejected
                            </button>
                            <button
                              onClick={() => {
                                setNeedsChangesDoc({ appId: selectedApp._id, docIndex: idx, docName: doc.name });
                                setNeedsChangesRemark('');
                                setShowNeedsChangesModal(true);
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                                doc.status === 'needs_changes' 
                                  ? 'bg-yellow-500 text-white' 
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              <AlertCircle size={14} /> Needs Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">No documents uploaded</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Send Message to Student</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-iit-primary"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="px-4 py-2.5 bg-iit-primary text-white rounded-lg hover:bg-iit-secondary disabled:opacity-50 flex items-center gap-2"
                  >
                    <MessageSquare size={18} /> Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">This message will be sent to the student via email</p>
              </div>

              {selectedApp.adminComments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Communication History</h3>
                  <div className="space-y-3">
                    {selectedApp.adminComments.map((c, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <MessageSquare size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-700">{c.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                            {c.reply && (
                              <div className="mt-2 pl-3 border-l-2 border-blue-300">
                                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                  <CornerDownRight size={12} /> Student Reply:
                                </p>
                                <p className="text-gray-700">{c.reply}</p>
                                {c.replyAt && (
                                  <p className="text-xs text-gray-400 mt-1">{new Date(c.replyAt).toLocaleString()}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['applied', 'pending', 'under_review', 'documents_pending', 'accepted', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedApp._id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedApp.status === status
                          ? 'bg-iit-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEmailMessage('');
                    setShowEmailModal(true);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Mail size={18} /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNeedsChangesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Request Changes</h3>
                  <p className="text-white/80 text-sm">Ask student to update document</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Document
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700">
                  {needsChangesDoc?.docName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message to Student <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={needsChangesRemark}
                  onChange={(e) => setNeedsChangesRemark(e.target.value)}
                  placeholder="Explain what needs to be changed or updated..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The student will see this message when they view their application.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNeedsChangesModal(false);
                  setNeedsChangesDoc(null);
                  setNeedsChangesRemark('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!needsChangesRemark.trim()) {
                    return;
                  }
                  handleDocReview(needsChangesDoc.appId, needsChangesDoc.docIndex, 'needs_changes', needsChangesRemark, '');
                  setShowNeedsChangesModal(false);
                  setNeedsChangesDoc(null);
                  setNeedsChangesRemark('');
                }}
                disabled={!needsChangesRemark.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <AlertCircle size={18} />
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reject Document</h3>
                  <p className="text-white/80 text-sm">Reject this document</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Document
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700">
                  {rejectDoc?.docName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="Explain why this document is being rejected..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectDoc(null);
                  setRejectRemark('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectRemark.trim()) return;
                  handleDocReview(rejectDoc.appId, rejectDoc.docIndex, 'rejected', rejectRemark, '');
                  setShowRejectModal(false);
                  setRejectDoc(null);
                  setRejectRemark('');
                }}
                disabled={!rejectRemark.trim()}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <XCircle size={18} />
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Send Email to Student</h3>
                  <p className="text-white/80 text-sm">Send a notification email</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Type your message to the student..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailMessage('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!emailMessage.trim()) return;
                  handleNotify(selectedApp._id, emailMessage);
                  setShowEmailModal(false);
                  setEmailMessage('');
                }}
                disabled={!emailMessage.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Mail size={18} />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
