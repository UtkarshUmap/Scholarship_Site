import { useState } from 'react';
import { publicApi } from '../api/public';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, AlertCircle, FileText, ArrowLeft, MessageSquare, Send, ExternalLink, CornerDownRight, GraduationCap } from 'lucide-react';

export default function StatusCheck() {
  const [rollNo, setRollNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNo.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await publicApi.getApplicationByRollNo(rollNo.trim());
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No student found with this roll number. Please check and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      default: return <AlertCircle className="text-blue-500" size={20} />;
    }
  };

  const getDocStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'needs_changes': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getDocStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'needs_changes': return 'Needs Changes';
      default: return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="navbar shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/IITBhLogo.png" alt="IIT Bhilai" className="h-10 w-10 rounded bg-white p-1 shadow-sm" />
              <span className="text-white font-semibold text-lg">IIT Bhilai Scholarship Portal</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-iit-primary hover:underline mb-8 font-medium">
          <ArrowLeft size={18} />
          Back to Scholarships
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-iit-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-iit-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Application Status</h1>
            <p className="text-gray-500">Enter your roll number to view your scholarship applications</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter your Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                className="input pl-12 text-lg py-3"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !rollNo.trim()}
              className="btn-primary px-8 text-lg py-3 disabled:opacity-50 shadow-lg shadow-iit-primary/20"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-center gap-3">
            <XCircle size={24} />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap size={22} className="text-iit-primary" />
                Student Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{result.student.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Roll Number</p>
                  <p className="font-semibold">{result.student.rollNo}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-semibold">{result.student.program || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-semibold">{result.student.branch || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={22} className="text-iit-primary" />
                Applications ({result.applications.length})
              </h2>

              {result.applications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-lg">No applications found</p>
                  <Link to="/" className="text-iit-primary hover:underline mt-3 inline-block font-medium">
                    Browse Scholarships
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {result.applications.map((app) => (
                    <ApplicationCard key={app._id} app={app} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 IIT Bhilai Scholarship Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ApplicationCard({ app }) {
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingToDoc, setReplyingToDoc] = useState(null);
  const [docReplyText, setDocReplyText] = useState('');
  const [docLink, setDocLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatedApp, setUpdatedApp] = useState(app);

  const handleCommentReply = async (commentIndex) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await publicApi.replyApplicationComment(app._id, commentIndex, { reply: replyText.trim() });
      setUpdatedApp(res.data);
      setReplyText('');
      setReplyingToComment(null);
    } catch (err) {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocReply = async (docIndex) => {
    if (!docReplyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await publicApi.replyApplicationDocument(app._id, docIndex, {
        reply: docReplyText.trim(),
        resubmittedLink: docLink.trim() || undefined
      });
      setUpdatedApp(res.data);
      setDocReplyText('');
      setDocLink('');
      setReplyingToDoc(null);
    } catch (err) {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      default: return <AlertCircle className="text-blue-500" size={20} />;
    }
  };

  const getDocStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'needs_changes': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'needs_changes': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDocStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'needs_changes': return 'Needs Changes';
      default: return 'Pending';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{app.scholarship?.name || 'Unknown Scholarship'}</h3>
          <p className="text-sm text-gray-500">
            Applied on {new Date(app.appliedAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(app.status)}
          <span className={`font-medium capitalize ${
            app.status === 'accepted' ? 'text-green-600' :
            app.status === 'rejected' ? 'text-red-600' :
            app.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {app.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">Type</p>
          <p className="font-medium capitalize">{app.applicationType}</p>
        </div>
        <div>
          <p className="text-gray-500">Amount</p>
          <p className="font-medium">₹{app.amount?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Financial Year</p>
          <p className="font-medium">{app.financialYear}</p>
        </div>
        <div>
          <p className="text-gray-500">Documents</p>
          <p className="font-medium">{app.documents?.length || 0} uploaded</p>
        </div>
      </div>

      {updatedApp.documents?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Document Status</p>
          <div className="space-y-2">
            {updatedApp.documents.map((doc, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${getDocStatusColor(doc.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDocStatusBadge(doc.status)}`}>
                    {getDocStatusLabel(doc.status)}
                  </span>
                </div>

                {doc.adminRemarks && (
                  <div className="mb-2 p-3 bg-white rounded-lg text-sm">
                    <p className="font-semibold text-gray-700 mb-1">Admin Comment:</p>
                    <p className="text-gray-600">{doc.adminRemarks}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(doc.adminRemarksAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {doc.studentResubmittedLink && (
                  <div className="mb-2 p-3 bg-green-50 rounded-lg text-sm">
                    <p className="font-semibold text-green-700 mb-1">Resubmitted Document:</p>
                    <a
                      href={doc.studentResubmittedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-iit-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      {doc.studentResubmittedLink}
                    </a>
                    {doc.studentResubmittedLinkAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(doc.studentResubmittedLinkAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}

                {doc.studentReply && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-semibold text-blue-700 mb-1">Your Response:</p>
                    <p className="text-gray-600">{doc.studentReply}</p>
                  </div>
                )}

                {(doc.status === 'needs_changes' || doc.status === 'rejected') && replyingToDoc !== idx && (
                  <button
                    onClick={() => setReplyingToDoc(idx)}
                    className="mt-2 text-sm text-iit-primary hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={14} />
                    Reply / Submit Updated Link
                  </button>
                )}

                {replyingToDoc === idx && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Response:</p>
                    <textarea
                      value={docReplyText}
                      onChange={(e) => setDocReplyText(e.target.value)}
                      placeholder="Write your reply or note..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDocReply(idx)}
                        disabled={submitting || !docReplyText.trim()}
                        className="px-4 py-2 bg-iit-primary text-white rounded-lg text-sm hover:bg-iit-secondary disabled:opacity-50"
                      >
                        {submitting ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => { setReplyingToDoc(null); setDocReplyText(''); setDocLink(''); }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {updatedApp.adminComments?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} />
            Messages from Admin
          </p>
          <div className="space-y-2">
            {updatedApp.adminComments.map((comment, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{comment.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>

                    {comment.reply && (
                      <div className="mt-3 pl-3 border-l-2 border-blue-300">
                        <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                          <CornerDownRight size={12} />
                          Your Reply:
                        </p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded">{comment.reply}</p>
                        {comment.replyAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.replyAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {!comment.reply && replyingToComment !== idx && (
                      <button
                        onClick={() => setReplyingToComment(idx)}
                        className="mt-2 text-xs text-iit-primary hover:underline flex items-center gap-1"
                      >
                        <MessageSquare size={12} />
                        Reply
                      </button>
                    )}

                    {replyingToComment === idx && (
                      <div className="mt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleCommentReply(idx)}
                            disabled={submitting || !replyText.trim()}
                            className="px-3 py-1.5 bg-iit-primary text-white rounded-lg text-sm hover:bg-iit-secondary disabled:opacity-50"
                          >
                            {submitting ? 'Sending...' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => { setReplyingToComment(null); setReplyText(''); }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {updatedApp.remarks && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Status Remarks</p>
          <p className="text-sm text-gray-600">{updatedApp.remarks}</p>
        </div>
      )}
    </div>
  );
}
