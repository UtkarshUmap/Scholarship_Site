import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { documentRequestsApi } from '../api/public';

export default function DocumentRequests() {
  const [requests, setRequests] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [formData, setFormData] = useState({
    academicsId: '',
    studentId: '',
    documents: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [reqRes, acadRes, studRes] = await Promise.all([
        documentRequestsApi.getRequests(filter),
        documentRequestsApi.getAcademicsList(),
        documentRequestsApi.getStudentsList()
      ]);
      setRequests(reqRes.data);
      setAcademics(acadRes.data);
      setStudents(studRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await documentRequestsApi.createRequest({
        ...formData,
        documents: formData.documents.split(',').map(d => d.trim()).filter(Boolean)
      });
      setShowModal(false);
      setFormData({
        academicsId: '',
        studentId: '',
        documents: '',
        description: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await documentRequestsApi.completeRequest(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-iit-primary text-white px-4 py-2 rounded hover:bg-iit-primary/90"
        >
          New Request
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            {['pending', 'submitted', 'completed'].map((status) => (
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
                        <h3 className="text-lg font-medium text-gray-900">
                          {req.student?.name} ({req.student?.rollNo})
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Assigned to: {req.academics?.name} ({req.academics?.department})
                      </p>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">Documents needed: {req.documents?.join(', ')}</p>
                        {req.description && (
                          <p className="text-gray-500">Note: {req.description}</p>
                        )}
                      </div>
                      {req.responseLink && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Submitted documents:</p>
                          <a href={req.responseLink} target="_blank" rel="noopener noreferrer" className="text-iit-primary hover:underline text-sm">
                            {req.responseLink}
                          </a>
                          {req.responseNote && (
                            <p className="text-sm text-gray-600">Note: {req.responseNote}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {req.status === 'submitted' && (
                      <button
                        onClick={() => handleComplete(req._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Created on {new Date(req.createdAt).toLocaleDateString()}
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
            <h2 className="text-xl font-semibold mb-4">Create Document Request</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Academics *</label>
                <select
                  value={formData.academicsId}
                  onChange={(e) => setFormData({ ...formData, academicsId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select academics</option>
                  {academics.map((acad) => (
                    <option key={acad._id} value={acad._id}>
                      {acad.name} - {acad.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select student</option>
                  {students.map((stud) => (
                    <option key={stud._id} value={stud._id}>
                      {stud.name} ({stud.rollNo}) - {stud.program} {stud.branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Documents Required *</label>
                <input
                  type="text"
                  value={formData.documents}
                  onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Income Certificate, Bonafide, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-iit-primary text-white rounded hover:bg-iit-primary/90 disabled:bg-gray-400"
                >
                  {submitting ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
