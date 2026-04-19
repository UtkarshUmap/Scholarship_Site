import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';

export default function ExternalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const res = await adminApi.getRequests(filter);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionType(action);
    setSelectedRequest(requests.find(r => r._id === id));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (actionType === 'approve') {
        await adminApi.approveRequest(selectedRequest._id);
      } else {
        await adminApi.rejectRequest(selectedRequest._id, { adminRemarks: remarks });
      }
      setShowModal(false);
      setRemarks('');
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">External Scholarship Requests</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-iit-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No requests found</div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">{req.scholarshipName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{req.provider}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-600">Amount: ₹{req.amount?.toLocaleString()}</span>
                        <span className="text-gray-600">By: {req.student?.name}</span>
                        <span className="text-gray-600">{req.student?.rollNo}</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Required Docs: {req.requiredDocuments?.join(', ')}</p>
                      </div>
                      {req.verificationLinks?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Verification Links:</p>
                          <ul className="text-sm text-iit-primary">
                            {req.verificationLinks.map((link, idx) => (
                              <li key={idx}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {req.adminRemarks && (
                        <div className="mt-2 text-sm text-red-600">
                          Remarks: {req.adminRemarks}
                        </div>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleAction(req._id, 'approve')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'reject')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted on {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h2>
            <p className="text-gray-600 mb-4">
              {actionType === 'approve' 
                ? `This will create a new external scholarship "${selectedRequest?.scholarshipName}" in the portal.`
                : 'Please provide a reason for rejection:'
              }
            </p>
            {actionType === 'reject' && (
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
                rows={3}
                placeholder="Reason for rejection..."
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing || (actionType === 'reject' && !remarks)}
                className={`px-4 py-2 text-white rounded ${
                  actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                } disabled:bg-gray-400`}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
