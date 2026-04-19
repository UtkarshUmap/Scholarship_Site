import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { academicsDocumentRequestsApi } from '../api/academics';

const getAuthConfig = () => {
  const token = localStorage.getItem('academicsToken');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function AcademicsDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('academicsToken');
        if (!token) {
          navigate('/academics-login');
          return;
        }

        const res = await academicsDocumentRequestsApi.getMyRequests();
        setRequests(res.data);
        
        const storedUser = localStorage.getItem('academics');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('academicsToken');
        localStorage.removeItem('academics');
        navigate('/academics-login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('academicsToken');
    localStorage.removeItem('academics');
    navigate('/academics-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const submittedCount = requests.filter(r => r.status === 'submitted').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Academics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-yellow-500 p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{pendingCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-blue-500 p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Submitted</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{submittedCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-green-500 p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{completedCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Document Requests</h2>
              <p className="mt-1 text-sm text-gray-500">
                Requests from admin to provide documents for student scholarships
              </p>
            </div>
            <div className="border-t border-gray-200">
              {requests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No document requests at the moment.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <li key={req._id} className="p-4 hover:bg-gray-50">
                      <Link to={`/academics/request/${req._id}`} className="block">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              Student: {req.student?.name} ({req.student?.rollNo})
                            </p>
                            <p className="text-sm text-gray-500">
                              {req.scholarship?.name || 'Scholarship request'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Documents needed: {req.documents?.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Received on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
