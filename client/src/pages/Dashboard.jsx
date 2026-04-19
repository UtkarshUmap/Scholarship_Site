import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle, DollarSign, Upload, AlertCircle, ChevronRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ title, data, colorMap, icon: Icon }) {
  const total = data?.reduce((sum, item) => sum + item.count, 0) || 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className="text-iit-primary" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {data?.slice(0, 5).map((item, idx) => {
          const percentage = total > 0 ? (item.count / total * 100).toFixed(0) : 0;
          const color = colorMap[item._id] || '#6b7280';
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize">
                    {item.name || item._id || 'Unknown'}
                    {item.scholarshipId && <span className="text-gray-400 text-xs ml-1">(ID: {item.scholarshipId.slice(-6)})</span>}
                  </span>
                  <span className="text-gray-500">{item.count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [financialYear, setFinancialYear] = useState('');

  useEffect(() => {
    fetchData();
  }, [financialYear]);

  const fetchData = async () => {
    try {
      const params = financialYear ? { financialYear } : {};
      const res = await adminApi.getDashboard(params);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
      </div>
    );
  }

  const { stats, charts } = data || {};
  
  const statusColorMap = {
    accepted: '#10b981',
    pending: '#f59e0b',
    applied: '#3b82f6',
    rejected: '#ef4444',
    under_review: '#8b5cf6',
    documents_pending: '#f97316'
  };

  const totalAccepted = charts?.applicationsByStatus?.find(s => s._id === 'accepted')?.count || 0;
  const totalPending = charts?.applicationsByStatus?.find(s => s._id === 'pending')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Scholarship data overview</p>
        </div>
        <select
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-iit-primary"
        >
          <option value="">All Financial Years</option>
          <option value="2023-24">2023-24</option>
          <option value="2024-25">2024-25</option>
          <option value="2025-26">2025-26</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Total Students" 
          value={stats?.totalStudents || 0} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Total Applications" 
          value={stats?.totalApplications || 0} 
          icon={FileText} 
          color="bg-purple-500" 
        />
        <StatCard 
          label="Accepted" 
          value={totalAccepted} 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard
          title="Status Overview"
          data={charts?.applicationsByStatus}
          colorMap={statusColorMap}
          icon={CheckCircle}
        />
        
        <ProgressCard
          title="By Scholarship"
          data={charts?.applicationsByScholarship}
          colorMap={{}}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link 
          to="/admin/import"
          className="bg-iit-primary rounded-2xl p-6 text-white hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-semibold">Import CSV Data</h3>
              <p className="text-white/80 text-sm mt-1">Upload student & application data</p>
            </div>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link 
          to="/admin/applications"
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <ChevronRight size={24} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
          <p className="text-3xl font-bold text-amber-600 mt-1">{totalPending}</p>
          <p className="text-gray-500 text-sm mt-1">applications waiting for review</p>
        </Link>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Acceptance Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {stats?.totalApplications > 0 
              ? ((totalAccepted / stats.totalApplications) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-gray-500 text-sm mt-1">of total applications</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Stats by Gender</h3>
        <div className="grid grid-cols-3 gap-4">
          {charts?.applicationsByGender?.map((item, idx) => (
            <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-iit-primary">{item.count}</p>
              <p className="text-sm text-gray-500 capitalize">{item._id || 'Unknown'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
