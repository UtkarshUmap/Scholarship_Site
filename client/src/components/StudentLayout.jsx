import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Award, 
  Send, 
  LogOut, 
  GraduationCap, 
  ExternalLink
} from 'lucide-react';

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    navigate('/student-login');
  };

  const menuItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/profile', icon: User, label: 'My Profile' },
    { path: '/student/apply', icon: Award, label: 'Apply for Scholarship' },
    { path: '/student/external-request', icon: Send, label: 'External Request' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar - Fixed position left */}
      <nav style={{ 
        width: '256px', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        backgroundColor: 'white', 
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}>
        {/* Logo Area */}
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '0 16px', 
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#1e3a5f'
        }}>
          <img src="/IITBhLogo.png" alt="IIT Bhilai" style={{ height: '40px', width: '40px', borderRadius: '4px' }} />
          <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Student Portal</span>
        </div>
        
        {/* Nav Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <NavLink 
            to="/" 
            target="_blank"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '16px' 
            }}
          >
            <GraduationCap size={16} />
            View Public Site
          </NavLink>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: isActive ? '#1e3a5f' : 'transparent',
                  color: isActive ? 'white' : '#4b5563',
                  textDecoration: 'none'
                })}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Logout Button */}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              color: '#dc2626',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            <span style={{ fontWeight: '500' }}>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: '256px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <header style={{ 
          height: '64px', 
          backgroundColor: '#1e3a5f', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'fixed',
          top: 0,
          left: '256px',
          right: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Student Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NavLink 
              to="/" 
              target="_blank"
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={16} />
              Public Site
            </NavLink>
            <button 
              onClick={handleLogout}
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          padding: '24px',
          marginTop: '64px',
          backgroundColor: '#f9fafb'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}