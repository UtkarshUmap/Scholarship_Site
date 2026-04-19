import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { academicsDocumentRequestsApi } from '../api/academics';

export default function AcademicsRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseLink, setResponseLink] = useState('');
  const [responseNote, setResponseNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await academicsDocumentRequestsApi.getRequest(id);
        setRequest(res.data);
        setResponseLink(res.data.responseLink || '');
        setResponseNote(res.data.responseNote || '');
      } catch (err) {
        console.error(err);
        navigate('/academics/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await academicsDocumentRequestsApi.respondToRequest(id, {
        responseLink,
        responseNote
      });
      setSuccess(true);
      const res = await academicsDocumentRequestsApi.getRequest(id);
      setRequest(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iit-primary"></div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/academics/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Document Request</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            request.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {request.status.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Request Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-gray-900">{request.student?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Roll Number</label>
                  <p className="text-gray-900">{request.student?.rollNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Program</label>
                  <p className="text-gray-900">{request.student?.program}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-gray-900">{request.student?.branch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scholarship</label>
                  <p className="text-gray-900">{request.scholarship?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Required Documents</label>
                  <ul className="mt-1 list-disc list-inside text-gray-900">
                    {request.documents?.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                {request.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{request.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested By</label>
                  <p className="text-gray-900">{request.requestedBy?.name || 'Admin'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Date</label>
                  <p className="text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Submit Documents</h2>
              
              {request.status === 'completed' ? (
                <div className="text-center py-8">
                  <div className="rounded-full bg-green-100 p-4 inline-block">
                    <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="mt-4 text-gray-900 font-medium">This request has been completed</p>
                  {request.responseLink && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Submitted link:</p>
                      <a href={request.responseLink} target="_blank" rel="noopener noreferrer" className="text-iit-primary hover:underline">
                        {request.responseLink}
                      </a>
                    </div>
                  )}
                  {request.responseNote && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Note:</p>
                      <p className="text-gray-900">{request.responseNote}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      Response submitted successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Document Link *</label>
                      <p className="text-xs text-gray-500 mb-2">
                        Provide a link to the documents (Google Drive, Dropbox, etc.)
                      </p>
                      <input
                        type="url"
                        required
                        className="w-full border rounded px-3 py-2"
                        placeholder="https://drive.google.com/..."
                        value={responseLink}
                        onChange={(e) => setResponseLink(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                      <textarea
                        rows={3}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Any additional information..."
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-iit-primary text-white py-2 px-4 rounded hover:bg-iit-primary/90 disabled:bg-gray-400"
                    >
                      {submitting ? 'Submitting...' : 'Submit Documents'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
