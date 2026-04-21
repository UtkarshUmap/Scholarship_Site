import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, Users, Award, FileText, Upload, Settings, 
  LogOut, Menu, X, GraduationCap, Send, FileCheck
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/scholarships', icon: Award, label: 'Scholarships' },
    { path: '/admin/applications', icon: FileText, label: 'Applications' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/external-requests', icon: Send, label: 'External Requests' },
    { path: '/admin/document-requests', icon: FileCheck, label: 'Doc Requests' },
    { path: '/admin/import', icon: Upload, label: 'Import Data' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="navbar fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white p-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-2">
                <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-10 w-10 rounded" />
                <span className="text-white font-semibold text-lg hidden sm:block">IIT Bhilai Scholarship Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white text-sm hidden sm:block">Welcome, {admin?.username}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
          <div className="p-4">
            <NavLink 
              to="/" 
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-iit-primary"
            >
              <GraduationCap size={16} />
              View Public Site
            </NavLink>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
