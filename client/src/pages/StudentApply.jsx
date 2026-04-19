import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi, studentApplicationsApi } from '../api/student';
import { FileText, Upload, Type, Hash, AlertCircle, Award, ChevronRight, Calendar, DollarSign, Building, Search, X, User } from 'lucide-react';

export default function StudentApply() {
  const [scholarships, setScholarships] = useState([]);
  const [externalScholarships, setExternalScholarships] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationType, setApplicationType] = useState('fresh');
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('internal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/student-login');
        return;
      }
      try {
        const userRes = await studentAuthApi.getMe();
        const userData = userRes.data;
        setUser(userData);

        // Check if profile is complete
        if (!userData.rollNo) {
          setError('Please complete your profile with roll number first.');
          setLoading(false);
          return;
        }
        
        const [internal, external] = await Promise.all([
          studentApplicationsApi.getAvailableScholarships(),
          studentApplicationsApi.getExternalScholarships()
        ]);
        setScholarships(internal.data);
        setExternalScholarships(external.data);
      } catch (err) {
        console.error('StudentApply fetch error:', err);
        if (err.response?.data?.code === 'PROFILE_INCOMPLETE') {
          navigate('/student/profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedScholarship) {
      const initialData = {};
      const initialFiles = {};
      (selectedScholarship.requiredDocuments || []).forEach(doc => {
        if (doc.type === 'file') {
          initialFiles[doc.name] = null;
        } else {
          initialData[doc.name] = '';
        }
      });
      setFormData(initialData);
      setFiles(initialFiles);
      setApplicationType('fresh');
    }
  }, [selectedScholarship]);

  const handleFileChange = (docName, file) => {
    setFiles({ ...files, [docName]: file });
  };

  const handleInputChange = (docName, value) => {
    setFormData({ ...formData, [docName]: value });
  };

  const handleApply = async () => {
    if (!selectedScholarship) return;
    setApplying(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('scholarshipId', selectedScholarship._id);
      submitData.append('applicationType', applicationType);
      
      const documentInfo = (selectedScholarship.requiredDocuments || []).map(doc => ({
        name: doc.name,
        value: doc.type === 'file' ? files[doc.name]?.name : formData[doc.name]
      }));
      submitData.append('documents', JSON.stringify(documentInfo));
      
      Object.keys(files).forEach(docName => {
        if (files[docName]) {
          submitData.append(docName, files[docName]);
        }
      });

      await studentApplicationsApi.apply(submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.code === 'PROFILE_INCOMPLETE') {
        navigate('/student/profile');
      } else {
        setError(err.response?.data?.error || 'Failed to apply');
      }
    } finally {
      setApplying(false);
    }
  };

  const filteredScholarships = (activeTab === 'internal' ? scholarships : externalScholarships)
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 s.provider?.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderDocumentField = (doc, idx) => {
    const icon = doc.type === 'file' ? <Upload size={16} /> : doc.type === 'number' ? <Hash size={16} /> : <Type size={16} />;
    
    return (
      <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:border-iit-primary/30 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-iit-primary/10 p-2 rounded-lg">
            {icon}
          </div>
          <label className="font-semibold text-gray-900 text-sm">
            {doc.name}
            {doc.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        
        {doc.description && (
          <p className="text-xs text-gray-500 mb-3 bg-blue-50 px-3 py-2 rounded-lg">{doc.description}</p>
        )}

        {doc.type === 'file' ? (
          <div>
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                id={`doc-${idx}`}
                onChange={(e) => handleFileChange(doc.name, e.target.files[0])}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                files[doc.name] 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-iit-primary hover:bg-iit-primary/5'
              }`}>
                {files[doc.name] ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{files[doc.name].name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                  </>
                )}
              </div>
            </label>
          </div>
        ) : doc.type === 'number' ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              id={`doc-${idx}`}
              value={formData[doc.name] || ''}
              onChange={(e) => handleInputChange(doc.name, e.target.value)}
              className="w-full border rounded-xl px-4 py-3 pl-8 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none"
              placeholder={doc.placeholder || 'Enter amount'}
            />
          </div>
        ) : (
          <input
            type="text"
            id={`doc-${idx}`}
            value={formData[doc.name] || ''}
            onChange={(e) => handleInputChange(doc.name, e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none"
            placeholder={doc.placeholder || `Enter ${doc.name.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iit-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading scholarships...</p>
        </div>
      </div>
    );
  }

  // Profile incomplete check
  if (!user?.rollNo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link to="/student/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </Link>
                <div className="bg-gradient-to-br from-iit-primary to-iit-secondary p-2 rounded-xl shadow-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Apply for Scholarship</h1>
                  <p className="text-xs text-gray-500">Browse and apply for available scholarships</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
              <p className="text-white/80">You need to add your roll number before applying for scholarships</p>
            </div>
            
            <div className="p-6 text-center">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3">
                  {error}
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                Please complete your profile by adding your institute roll number. This roll number will be used to identify you throughout the scholarship application process.
              </p>
              
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-iit-primary to-iit-secondary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-iit-secondary hover:to-iit-primary transition-all"
              >
                <User size={20} />
                Go to Profile
              </Link>
            </div>
          </div>
        </main>
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
              <div className="bg-gradient-to-br from-iit-primary to-iit-secondary p-2 rounded-xl shadow-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Apply for Scholarship</h1>
                <p className="text-xs text-gray-500">Browse and apply for available scholarships</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                S
              </div>
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
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Application Submitted!</h3>
                <p className="text-sm text-white/80">Redirecting to dashboard...</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Scholarship List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveTab('internal'); setSearchTerm(''); }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'internal'
                      ? 'bg-gradient-to-r from-iit-primary to-iit-secondary text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building size={18} />
                  Internal ({scholarships.length})
                </button>
                <button
                  onClick={() => { setActiveTab('external'); setSearchTerm(''); }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'external'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Award size={18} />
                  External ({externalScholarships.length})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Scholarship Cards */}
            <div className="space-y-3">
              {filteredScholarships.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scholarships Found</h3>
                  <p className="text-gray-500">Try adjusting your search or check back later</p>
                </div>
              ) : (
                filteredScholarships.map((scholarship) => (
                  <div
                    key={scholarship._id}
                    onClick={() => setSelectedScholarship(scholarship)}
                    className={`bg-white rounded-2xl shadow-sm border p-5 cursor-pointer transition-all hover:shadow-lg group ${
                      selectedScholarship?._id === scholarship._id
                        ? 'border-iit-primary ring-2 ring-iit-primary/20'
                        : 'border-gray-100 hover:border-iit-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-iit-primary transition-colors">
                            {scholarship.name}
                          </h3>
                          {activeTab === 'external' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              External
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{scholarship.provider || 'IIT Bhilai'}</p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                            <DollarSign size={14} />
                            ₹{scholarship.amount.toLocaleString()}
                          </span>
                          {scholarship.deadline && (
                            <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                              <Calendar size={14} />
                              {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {scholarship.requiredDocuments?.length > 0 && (
                            <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <FileText size={14} />
                              {scholarship.requiredDocuments.length} docs
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-iit-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {selectedScholarship ? (
                <>
                  <div className="bg-gradient-to-r from-iit-primary to-iit-secondary p-5 text-white">
                    <h2 className="text-lg font-bold mb-1">{selectedScholarship.name}</h2>
                    <p className="text-white/80 text-sm">{selectedScholarship.provider || 'IIT Bhilai'}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <DollarSign size={14} />
                        ₹{selectedScholarship.amount.toLocaleString()}
                      </span>
                      {selectedScholarship.deadline && (
                        <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                          <Calendar size={14} />
                          Due: {new Date(selectedScholarship.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-5">
                    {selectedScholarship.eligibility && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-1 text-sm">Eligibility</h4>
                        <p className="text-sm text-blue-700">{selectedScholarship.eligibility}</p>
                      </div>
                    )}

                    {selectedScholarship.description && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Description</h4>
                        <p className="text-sm text-gray-600">{selectedScholarship.description}</p>
                      </div>
                    )}

                    {/* Application Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Application Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setApplicationType('fresh')}
                          className={`py-3 px-4 rounded-xl font-medium transition-all border ${
                            applicationType === 'fresh'
                              ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          Fresh Application
                        </button>
                        <button
                          type="button"
                          onClick={() => setApplicationType('renewal')}
                          className={`py-3 px-4 rounded-xl font-medium transition-all border ${
                            applicationType === 'renewal'
                              ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          Renewal
                        </button>
                      </div>
                    </div>

                    {/* Document Upload */}
                    {selectedScholarship.requiredDocuments?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Upload size={16} className="text-iit-primary" />
                          Required Documents
                        </h4>
                        <div className="space-y-3">
                          {selectedScholarship.requiredDocuments.map((doc, idx) => 
                            renderDocumentField(doc, idx)
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleApply}
                      disabled={applying || success}
                      className="w-full bg-gradient-to-r from-iit-primary to-iit-secondary text-white py-4 rounded-xl font-semibold hover:from-iit-secondary hover:to-iit-primary disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : success ? (
                        <>
                          <Award size={20} />
                          Applied Successfully!
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Scholarship</h3>
                  <p className="text-gray-500 text-sm">Choose a scholarship from the list to view details and apply</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
