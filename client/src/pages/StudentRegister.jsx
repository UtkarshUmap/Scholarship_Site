import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi } from '../api/student';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await studentAuthApi.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/student-login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-iit-primary via-iit-secondary to-iit-primary/80 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAgTCAwIDEwIEwgMTAgMTAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZS8wLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="text-center text-white relative z-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <GraduationCap className="w-14 h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-4">IIT Bhilai</h1>
          <p className="text-xl text-white/80 mb-8">Scholarship Portal</p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span>Apply for scholarships easily</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span>Track your application status</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span>Get notified of updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md w-full space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">IIT Bhilai</h2>
            <p className="text-gray-500">Scholarship Portal</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Register to apply for scholarships</p>
          </div>

          {success && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Registration Successful!</h3>
                  <p className="text-sm text-white/80">Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <User size={16} className="text-iit-primary" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Mail size={16} className="text-iit-primary" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                placeholder="your.email@iitbhilai.ac.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Lock size={16} className="text-iit-primary" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none transition-all"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-iit-primary to-iit-secondary text-white py-4 rounded-xl font-semibold hover:from-iit-secondary hover:to-iit-primary disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <User size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/student-login" 
                className="font-semibold text-iit-primary hover:text-iit-secondary transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-400">
              After registration, complete your profile with your roll number to apply for scholarships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
