import { useState, useEffect } from 'react';
import { publicApi } from '../api/public';
import { Link } from 'react-router-dom';
import { Award, Calendar, DollarSign, FileText, ArrowRight, Search, GraduationCap, X, ExternalLink, CheckCircle, Users, Clock, TrendingUp } from 'lucide-react';

export default function PublicScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await publicApi.getActiveScholarships();
      setScholarships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredScholarships = scholarships.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="navbar shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-10 w-10 rounded bg-white p-1 shadow-sm" />
              <span className="text-white font-semibold text-lg">IIT Bhilai Scholarship Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/status" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Check Status</Link>
              <Link to="/student-login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Student Login</Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-white/20">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-iit-primary via-iit-secondary to-[#1a2d4a] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
            <Award size={16} className="text-amber-400" />
            <span>Trusted by 1000+ students</span>
          </div>
          <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-28 w-28 mx-auto mb-6 rounded-2xl bg-white p-4 shadow-2xl" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            IIT Bhilai Scholarship Portal
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover and apply for scholarships. Track your application status in real-time.
          </p>
          
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search scholarships by name or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-full text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Award className="text-iit-primary" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">{scholarships.length}+ Scholarships</h3>
            <p className="text-gray-500 text-sm text-center mt-1">Various schemes available for eligible students</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-gradient-to-br from-green-50 to-green-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <DollarSign className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Financial Support</h3>
            <p className="text-gray-500 text-sm text-center mt-1">Up to full tuition & maintenance coverage</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock className="text-purple-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Easy Tracking</h3>
            <p className="text-gray-500 text-sm text-center mt-1">Check application status online anytime</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Available Scholarships</h2>
          <p className="text-gray-500 text-sm">{filteredScholarships.length} {filteredScholarships.length === 1 ? 'scholarship' : 'scholarships'} found</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
          </div>
        ) : filteredScholarships.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg">No scholarships found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, index) => (
              <div 
                key={scholarship._id} 
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${hoveredCard === index ? 'ring-2 ring-iit-primary' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setSelectedScholarship(scholarship)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-iit-primary/10 text-iit-primary text-xs font-medium rounded mb-2">
                        {scholarship.type === 'internal' ? 'Internal' : 'External'}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{scholarship.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{scholarship.provider || 'IIT Bhilai'}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-lg p-2">
                      <div className="bg-green-100 p-1.5 rounded">
                        <DollarSign size={16} className="text-green-600" />
                      </div>
                      <span className="font-semibold text-green-700">₹{scholarship.amount?.toLocaleString()}</span>
                      {scholarship.maxRecipients > 0 && (
                        <span className="text-gray-400 text-xs ml-auto">{scholarship.maxRecipients} seats</span>
                      )}
                    </div>
                    {scholarship.deadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-red-500" />
                        <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    {scholarship.requiredDocuments?.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-iit-primary" />
                        <span>{scholarship.requiredDocuments.length} documents required</span>
                      </div>
                    )}
                  </div>

                  {scholarship.eligibility && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Eligibility</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{scholarship.eligibility}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedScholarship(scholarship); }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-iit-primary to-iit-secondary text-white rounded-xl font-medium hover:from-iit-secondary hover:to-iit-primary transition-all shadow-lg shadow-iit-primary/20"
                  >
                    Check Eligibility
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedScholarship && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Scholarship Details</h2>
                <p className="text-gray-500 text-sm mt-1 truncate">{selectedScholarship.name}</p>
              </div>
              <button onClick={() => setSelectedScholarship(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Amount</p>
                    <p className="font-bold text-green-600 text-2xl">₹{selectedScholarship.amount?.toLocaleString()}</p>
                  </div>
                  {selectedScholarship.maxRecipients > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Seats</p>
                      <p className="font-bold text-gray-900 text-2xl">{selectedScholarship.maxRecipients}</p>
                    </div>
                  )}
                  {selectedScholarship.deadline && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Deadline</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedScholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  )}
                  {selectedScholarship.provider && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Provider</p>
                      <p className="font-semibold text-gray-900">{selectedScholarship.provider}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedScholarship.eligibility && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users size={18} className="text-iit-primary" />
                    Eligibility Criteria
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">{selectedScholarship.eligibility}</p>
                </div>
              )}

              {selectedScholarship.requiredDocuments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-iit-primary" />
                    Required Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedScholarship.requiredDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="bg-iit-primary/10 p-1.5 rounded">
                          <FileText size={14} className="text-gray-400" />
                        </div>
                        <span className="text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedScholarship.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedScholarship.description}</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  How to Apply
                </h3>
                <p className="text-blue-800 text-sm mb-4 leading-relaxed">
                  Click the button below to fill out the application form. You will need to submit the required documents as mentioned.
                </p>
                {selectedScholarship.googleFormLink ? (
                  <a
                    href={selectedScholarship.googleFormLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-iit-primary to-iit-secondary text-white rounded-xl font-medium hover:from-iit-secondary hover:to-iit-primary transition-all shadow-lg"
                  >
                    <ExternalLink size={18} />
                    Apply Now (Google Form)
                  </a>
                ) : (
                  <Link
                    to="/student-login"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-iit-primary to-iit-secondary text-white rounded-xl font-medium hover:from-iit-secondary hover:to-iit-primary transition-all shadow-lg"
                  >
                    Login to Apply
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-10 w-10 rounded bg-white p-1" />
              <span className="text-white font-semibold">IIT Bhilai Scholarship Portal</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 IIT Bhilai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
