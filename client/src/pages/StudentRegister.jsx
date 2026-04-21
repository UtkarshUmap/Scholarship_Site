import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentAuthApi } from '../api/student';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User, ArrowRight } from 'lucide-react';

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-700 to-gray-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="text-center text-white relative z-10">
          <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-28 w-28 mx-auto mb-6 rounded-2xl bg-white p-2 shadow-2xl" />
          <h1 className="text-4xl font-bold mb-4">Student Portal</h1>
          <p className="text-xl text-white/80 mb-8">Create your account to apply for scholarships</p>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-md w-full space-y-8">
          <div className="lg:hidden text-center mb-8">
            <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-16 w-16 mx-auto mb-3 rounded-xl bg-white p-2 shadow-lg" />
            <h2 className="text-2xl font-bold text-gray-900">Student Portal</h2>
          </div>

          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Register to apply for scholarships</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Registration Successful!</h3>
                  <p className="text-sm text-green-600">Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-iit-primary focus:border-iit-primary"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-iit-primary focus:border-iit-primary"
                  placeholder="your.email@iitbhilai.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-iit-primary focus:border-iit-primary"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 8 12 8-5.373 8-12V0c-4.627 0-8 5.373-8 12z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/student-login" 
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              After registration, complete your profile with your roll number to apply for scholarships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}