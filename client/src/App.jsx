import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import api from './api/axios';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Scholarships from './pages/Scholarships';
import Applications from './pages/Applications';
import Import from './pages/Import';
import Settings from './pages/Settings';
import PublicScholarships from './pages/PublicScholarships';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/StudentDashboard';
import StudentApply from './pages/StudentApply';
import StudentApplicationDetail from './pages/StudentApplicationDetail';
import StudentExternalRequest from './pages/StudentExternalRequest';
import StudentProfile from './pages/StudentProfile';
import AcademicsLogin from './pages/AcademicsLogin';
import AcademicsDashboard from './pages/AcademicsDashboard';
import AcademicsRequestDetail from './pages/AcademicsRequestDetail';
import ExternalRequests from './pages/ExternalRequests';
import DocumentRequests from './pages/DocumentRequests';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export { api };

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
      </div>
    );
  }
  
  return admin ? children : <Navigate to="/login" />;
}

function StudentRoute({ children }) {
  const token = localStorage.getItem('studentToken');
  return token ? children : <Navigate to="/student-login" />;
}

function AcademicsRoute({ children }) {
  const token = localStorage.getItem('academicsToken');
  return token ? children : <Navigate to="/academics-login" />;
}

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    console.log("Logging in...");
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/academics-login" element={<AcademicsLogin />} />
          <Route path="/" element={<PublicScholarships />} />
          <Route path="/scholarships" element={<PublicScholarships />} />
          
          <Route path="/student" element={<StudentRoute><StudentLayout /></StudentRoute>}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="apply" element={<StudentApply />} />
            <Route path="application/:id" element={<StudentApplicationDetail />} />
            <Route path="external-request" element={<StudentExternalRequest />} />
          </Route>

          <Route path="/academics" element={<AcademicsRoute><Outlet /></AcademicsRoute>}>
            <Route index element={<Navigate to="/academics/dashboard" replace />} />
            <Route path="dashboard" element={<AcademicsDashboard />} />
            <Route path="request/:id" element={<AcademicsRequestDetail />} />
          </Route>

          <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="scholarships" element={<Scholarships />} />
            <Route path="applications" element={<Applications />} />
            <Route path="external-requests" element={<ExternalRequests />} />
            <Route path="document-requests" element={<DocumentRequests />} />
            <Route path="import" element={<Import />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
