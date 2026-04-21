import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, FileText, ExternalLink, X } from 'lucide-react';

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

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', isActive: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState('');
  const [formData, setFormData] = useState({
    name: '', provider: '', amount: 0, eligibility: '', deadline: '', 
    maxRecipients: 0, requiredDocuments: [], isActive: true, 
    financialYears: [], description: '', googleFormLink: ''
  });
  const [docInput, setDocInput] = useState('');
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, [pagination.page, filters]);

  const fetchScholarships = async () => {
    try {
      const params = { page: pagination.page, limit: 50, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await adminApi.getScholarships(params);
      setScholarships(res.data.scholarships);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScholarship) {
        await adminApi.updateScholarship(editingScholarship, formData);
      } else {
        await adminApi.createScholarship(formData);
      }
      setShowModal(false);
      fetchScholarships();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving scholarship');
    }
  };

  const handleEdit = (scholarship) => {
    setEditingScholarship(scholarship._id);
    setFormData({
      ...scholarship,
      deadline: scholarship.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteScholarship(id);
      fetchScholarships();
      setShowDeleteModal(false);
      setDeletingId(null);
      setDeletingName('');
    } catch (err) {
      alert('Error deleting scholarship');
    }
  };

  const confirmDelete = (id, name) => {
    setDeletingId(id);
    setDeletingName(name);
    setShowDeleteModal(true);
  };

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleScholarship(id);
      fetchScholarships();
    } catch (err) {
      alert('Error toggling scholarship');
    }
  };

  const addDocument = (docName) => {
    if (docName) {
      const newDoc = { name: docName, type: 'file', required: true };
      const exists = formData.requiredDocuments.some(d => 
        (typeof d === 'string' ? d === docName : d.name === docName)
      );
      if (!exists) {
        setFormData({ ...formData, requiredDocuments: [...formData.requiredDocuments, newDoc] });
      }
    }
    setDocInput('');
    setShowPresetDropdown(false);
  };

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.filter((_, i) => i !== index)
    });
  };

  const availablePresets = DEFAULT_DOC_PRESETS.filter(p => !formData.requiredDocuments.includes(p));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-500">Manage scholarship schemes</p>
        </div>
        <button
          onClick={() => { setEditingScholarship(null); setFormData({ name: '', provider: '', amount: 0, eligibility: '', deadline: '', maxRecipients: 0, requiredDocuments: [], isActive: true, financialYears: [], description: '', googleFormLink: '' }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Scholarship
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            className="input w-auto"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input w-auto"
          >
            <option value="">All Types</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {scholarships.map((scholarship) => (
                <div key={scholarship._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                        <span className={`badge ${scholarship.type === 'external' ? 'badge-purple' : 'badge-info'}`}>
                          {scholarship.type === 'external' ? 'External' : 'Internal'}
                        </span>
                        <span className={`badge ${scholarship.isActive ? 'badge-success' : 'badge-gray'}`}>
                          {scholarship.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{scholarship.provider}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span>Amount: ₹{scholarship.amount?.toLocaleString()}</span>
                        <span>Max: {scholarship.maxRecipients || 'Unlimited'}</span>
                        {scholarship.deadline && <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>}
                        {scholarship.googleFormLink && (
                          <span className="text-iit-primary flex items-center gap-1">
                            <ExternalLink size={14} /> Form Link
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(scholarship._id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                        {scholarship.isActive ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                      </button>
                      <button onClick={() => handleEdit(scholarship)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => confirmDelete(scholarship._id, scholarship.name)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  {scholarship.requiredDocuments?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scholarship.requiredDocuments.map((doc, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          <FileText size={12} /> {typeof doc === 'string' ? doc : doc.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {scholarships.length} of {pagination.total} scholarships
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="btn-secondary disabled:opacity-50">
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4">Page {pagination.page} of {pagination.pages}</span>
                <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page >= pagination.pages} className="btn-secondary disabled:opacity-50">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingScholarship ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Recipients</label>
                    <input type="number" value={formData.maxRecipients} onChange={(e) => setFormData({ ...formData, maxRecipients: Number(e.target.value) })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="input" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Form Link (Application Form)</label>
                    <input type="url" value={formData.googleFormLink} onChange={(e) => setFormData({ ...formData, googleFormLink: e.target.value })} className="input" placeholder="https://forms.google.com/..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Financial Years</label>
                    <input type="text" value={formData.financialYears?.join(', ')} onChange={(e) => setFormData({ ...formData, financialYears: e.target.value.split(',').map(y => y.trim()).filter(Boolean) })} className="input" placeholder="2023-24, 2024-25" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                    <textarea value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} className="input" rows={2} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" rows={2} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                    <div className="relative">
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={docInput} 
                            onChange={(e) => { setDocInput(e.target.value); setShowPresetDropdown(false); }}
                            onFocus={() => setShowPresetDropdown(true)}
                            className="input w-full" 
                            placeholder="Type or select document..." 
                          />
                          {showPresetDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {availablePresets.length > 0 ? (
                                availablePresets.map((preset, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => addDocument(preset)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                  >
                                    {preset}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">All presets added</div>
                              )}
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => addDocument(docInput)} className="btn-secondary">Add</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredDocuments.map((doc, i) => (
                        <span key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                          <FileText size={14} className="text-gray-500" />
                          {typeof doc === 'string' ? doc : doc.name}
                          <button type="button" onClick={() => removeDocument(i)} className="text-red-500 hover:text-red-700 ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Scholarship</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong className="text-gray-900">"{deletingName}"</strong>?
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This will permanently remove the scholarship and all associated applications.
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingId(null);
                  setDeletingName('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
