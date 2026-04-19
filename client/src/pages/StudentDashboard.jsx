import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi, studentApplicationsApi } from '../api/student';
import { 
  Award, FileText, Clock, CheckCircle, AlertCircle, LogOut, User, 
  Plus, ExternalLink, ChevronRight, DollarSign, Home, Bell, HelpCircle, FileCheck, TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileError, setProfileError] = useState('');
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

        // Only fetch applications if user has roll number
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
    totalAmount: applications.filter(a => a.status === 'accepted').reduce((sum, a) => sum + (a.amount || 0), 0),
    docsPending: applications.reduce((acc, app) => {
      return acc + (app.documents?.filter(d => d.status === 'needs_changes' || d.status === 'rejected').length || 0);
    }, 0)
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
    { icon: Award, label: 'Scholarships', path: '/student/apply' },
    { icon: User, label: 'Profile', path: '/student/profile' },
    { icon: ExternalLink, label: 'External Request', path: '/student/external-request' },
  ];

  const isProfileComplete = !!user?.rollNo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <AlertCircle size={20} /> : <ChevronRight size={20} />}
              </button>
              <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-10 w-10 rounded-xl shadow-md" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Scholarship Portal</h1>
                <p className="text-xs text-gray-500">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-600" />
                {stats.docsPending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.rollNo || 'Profile incomplete'}</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r transform transition-all duration-300 z-50 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    item.path === '/student/dashboard'
                      ? 'bg-gradient-to-r from-iit-primary to-iit-secondary text-white shadow-lg shadow-iit-primary/30'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-iit-primary/10 p-2 rounded-lg">
                  <HelpCircle size={18} className="text-iit-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">Need Help?</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Contact the scholarship office for any queries.</p>
              <Link 
                to="/student/contact" 
                className="text-xs text-iit-primary hover:underline font-medium"
              >
                Contact Support →
              </Link>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Completion Alert */}
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

          {/* Stats Grid */}
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

          {/* Applications Section */}
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

          {/* Quick Actions */}
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
      </main>
    </div>
  );
}
