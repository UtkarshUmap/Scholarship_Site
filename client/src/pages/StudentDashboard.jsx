import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi, studentApplicationsApi } from '../api/student';
import { 
  Award, FileText, Clock, CheckCircle, AlertCircle, 
  Plus, ExternalLink, ChevronRight, DollarSign, FileCheck, TrendingUp, User
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          navigate('/student-login');
          return;
        }

        const [userRes] = await Promise.all([
          studentAuthApi.getMe()
        ]);

        setUser(userRes.data);

        if (userRes.data.rollNo) {
          try {
            const appsRes = await studentApplicationsApi.getMyApplications();
            setApplications(appsRes.data);
          } catch (appsErr) {
            if (appsErr.response?.data?.code === 'PROFILE_INCOMPLETE') {
              setProfileError(appsErr.response.data.error);
            }
          }
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('studentToken');
        localStorage.removeItem('student');
        navigate('/student-login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    navigate('/student-login');
  };

  const handleApplyClick = () => {
    if (!user?.rollNo) {
      navigate('/student/profile');
    } else {
      navigate('/student/apply');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iit-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      applied: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: <FileText size={16} />, label: 'Applied' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: <Clock size={16} />, label: 'Pending' },
      under_review: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: <Clock size={16} />, label: 'Under Review' },
      documents_pending: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: <AlertCircle size={16} />, label: 'Documents Pending' },
      accepted: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: <CheckCircle size={16} />, label: 'Accepted' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: <AlertCircle size={16} />, label: 'Rejected' }
    };
    return configs[status] || configs.applied;
  };

  const stats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    pending: applications.filter(a => ['pending', 'under_review', 'applied', 'documents_pending'].includes(a.status)).length,
  };

  const isProfileComplete = !!user?.rollNo;

  return (
        <div className="max-w-7xl mx-auto space-y-6">
          {!isProfileComplete && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">Complete Your Profile</h2>
                  <p className="text-white/80 text-sm mb-4">
                    To apply for scholarships, you need to add your roll number in your profile.
                  </p>
                  <Link
                    to="/student/profile"
                    className="inline-flex items-center gap-2 bg-white text-amber-600 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-amber-50 transition-all"
                  >
                    <User size={18} />
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <TrendingUp size={16} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-green-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-amber-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <TrendingUp size={16} className="text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
                <p className="text-sm text-gray-500 mt-1">Track your scholarship applications</p>
              </div>
              <button
                onClick={handleApplyClick}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg ${
                  isProfileComplete
                    ? 'bg-gradient-to-r from-iit-primary to-iit-secondary hover:from-iit-secondary hover:to-iit-primary text-white shadow-iit-primary/30 hover:shadow-xl'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                }`}
              >
                <Plus size={18} />
                {isProfileComplete ? 'Apply for Scholarship' : 'Complete Profile First'}
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FileText size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-4">
                    {isProfileComplete 
                      ? 'Start your scholarship journey today' 
                      : 'Complete your profile to start applying'}
                  </p>
                  <button
                    onClick={handleApplyClick}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      isProfileComplete
                        ? 'bg-iit-primary text-white hover:bg-iit-secondary'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    <Award size={18} />
                    {isProfileComplete ? 'Browse Scholarships' : 'Complete Profile'}
                  </button>
                </div>
              ) : (
                applications.map((app) => {
                  const status = getStatusConfig(app.status);
                  const uploadedDocs = app.documents?.filter(d => d.filePath).length || 0;
                  const totalDocs = app.documents?.length || 0;
                  const pendingDocs = app.documents?.filter(d => d.status === 'needs_changes' || d.status === 'rejected').length || 0;
                  
                  return (
                    <Link 
                      key={app._id} 
                      to={`/student/application/${app._id}`} 
                      className="block p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-iit-primary transition-colors">
                              {app.scholarship?.name || 'Scholarship'}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                              {status.icon}
                              {status.label}
                            </span>
                            {pendingDocs > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                <AlertCircle size={12} />
                                {pendingDocs} needs attention
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                              <Clock size={14} />
                              {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 text-green-600 font-medium">
                              <DollarSign size={14} />
                              ₹{app.amount?.toLocaleString() || 0}
                            </span>
                            <span className={`flex items-center gap-2 ${uploadedDocs === totalDocs && totalDocs > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              <FileCheck size={14} />
                              {totalDocs > 0 ? `${uploadedDocs}/${totalDocs} docs` : 'No docs required'}
                            </span>
                            <span className="hidden md:flex items-center gap-2 text-gray-400">
                              <Award size={14} />
                              {app.applicationType === 'fresh' ? 'Fresh Application' : 'Renewal'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex items-center gap-3">
                          <div className="hidden sm:flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              app.applicationType === 'fresh' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {app.applicationType === 'fresh' ? 'F' : 'R'}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-iit-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              to="/student/profile" 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-iit-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl group-hover:bg-iit-primary/10 transition-colors">
                  <User className="h-5 w-5 text-gray-600 group-hover:text-iit-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-500">Update details</p>
                </div>
              </div>
            </Link>
            
            <button 
              onClick={handleApplyClick}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-iit-primary/30 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl group-hover:bg-iit-primary/10 transition-colors">
                  <Award className="h-5 w-5 text-gray-600 group-hover:text-iit-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {isProfileComplete ? 'Scholarships' : 'Complete Profile'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isProfileComplete ? 'View & apply' : 'Add roll number first'}
                  </p>
                </div>
              </div>
            </button>
            
            <Link 
              to="/student/external-request" 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-iit-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl group-hover:bg-iit-primary/10 transition-colors">
                  <ExternalLink className="h-5 w-5 text-gray-600 group-hover:text-iit-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">External</h3>
                  <p className="text-sm text-gray-500">Request scholarship</p>
                </div>
              </div>
            </Link>
        </div>
      </div>
    );
}