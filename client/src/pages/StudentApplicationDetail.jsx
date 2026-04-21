import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApplicationsApi } from '../api/student';
import { FileText, Upload, MessageSquare, CheckCircle, XCircle, AlertCircle, Clock, Send, RefreshCw, Eye } from 'lucide-react';

const API_URL = '/api';

const getFileViewUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/file/view${path}`;
};

export default function StudentApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeDoc, setActiveDoc] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [resubmitLink, setResubmitLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await studentApplicationsApi.getStudentApplication(id);
        setApplication(res.data);
      } catch (err) {
        console.error(err);
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const handleFileUpload = async (docName, files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append(docName, files[0]);

      const res = await studentApplicationsApi.uploadDocument(id, formData);
      setApplication(res.data);
      setPendingFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleReplyWithUpdate = async (docIndex) => {
    if (!replyText.trim() && !pendingFile) return;
    setSubmitting(true);
    setError('');

    try {
      // First upload the file if there's a pending file
      if (pendingFile) {
        const formData = new FormData();
        formData.append(application.documents[docIndex].name, pendingFile);
        await studentApplicationsApi.uploadDocument(id, formData);
      }

      // Then send the reply
      const res = await studentApplicationsApi.updateDocument(id, docIndex, {
        resubmittedLink: resubmitLink || undefined,
        reply: replyText
      });
      setApplication(res.data);
      setReplyText('');
      setResubmitLink('');
      setPendingFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'needs_changes':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' },
      verified: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
      needs_changes: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' }
    };
    return colors[status] || colors.pending;
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-6 h-6 text-gray-400" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes('image')) return <FileText className="w-6 h-6 text-green-500" />;
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iit-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const applicationStatusColor = {
    applied: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    under_review: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    documents_pending: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    accepted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };

  const statusConfig = applicationStatusColor[application.status] || applicationStatusColor.pending;

  return (
    <div>
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Scholarship Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-iit-primary to-iit-secondary px-6 py-4">
                <h2 className="text-lg font-bold text-white">{application.scholarship?.name}</h2>
                <p className="text-white/80 text-sm">{application.scholarship?.provider || 'IIT Bhilai'}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="font-bold text-green-600">₹{application.amount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="font-medium text-gray-900 capitalize">{application.applicationType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Applied On</p>
                    <p className="font-medium text-gray-900">{new Date(application.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Financial Year</p>
                    <p className="font-medium text-gray-900">{application.financialYear}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                  {application.documents?.filter(d => d.filePath).length} / {application.documents?.length} uploaded
                </span>
              </div>
              <div className="p-6">
                {application.documents?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents required</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {application.documents?.map((doc, idx) => {
                      const statusStyle = getStatusColor(doc.status);
                      const needsAction = doc.status === 'needs_changes' || doc.status === 'rejected';
                      
                      return (
                        <div 
                          key={idx} 
                          className={`border-2 rounded-2xl overflow-hidden transition-all ${
                            activeDoc === idx 
                              ? 'border-iit-primary ring-2 ring-iit-primary/20' 
                              : needsAction 
                                ? 'border-orange-200 hover:border-orange-300' 
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-stretch">
                            <div className="w-28 bg-gray-50 flex flex-col items-center justify-center p-3 border-r gap-2">
                              {doc.filePath ? (
                                <a
                                  href={getFileViewUrl(doc.filePath)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col items-center gap-1 text-iit-primary hover:text-iit-primary/80 p-2 rounded-lg hover:bg-iit-primary/5"
                                >
                                  <Eye className="w-6 h-6 text-iit-primary" />
                                  <span className="text-xs font-medium">View</span>
                                </a>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                  <Upload className="w-6 h-6" />
                                  <span className="text-xs">Not Uploaded</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={statusStyle.icon}>{getStatusIcon(doc.status)}</span>
                                  <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  {doc.version > 1 && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      v{doc.version}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setActiveDoc(activeDoc === idx ? null : idx)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                  >
                                    {doc.status.replace('_', ' ').toUpperCase()}
                                  </button>
                                </div>
                              </div>
                              {doc.originalName && (
                                <p className="text-sm text-gray-500">{doc.originalName}</p>
                              )}
                              {doc.uploadedAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                            {doc.adminRemarks && (
                              <div className="w-2 bg-orange-500"></div>
                            )}
                          </div>

                          {activeDoc === idx && (
                            <div className="border-t bg-gray-50 p-5 space-y-4">
                              {/* Admin Remarks */}
                              {doc.adminRemarks && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-orange-800">Admin Feedback</span>
                                    {doc.adminRemarksAt && (
                                      <span className="text-xs text-orange-600 ml-auto">
                                        {new Date(doc.adminRemarksAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-orange-700">{doc.adminRemarks}</p>
                                </div>
                              )}

                              {/* Student Reply */}
                              {doc.studentReply && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-blue-800">Your Response</span>
                                    {doc.studentReplyAt && (
                                      <span className="text-xs text-blue-600 ml-auto">
                                        {new Date(doc.studentReplyAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-blue-700">{doc.studentReply}</p>
                                </div>
                              )}

                              {/* Resubmitted Link */}
                              {doc.studentResubmittedLink && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-green-800">Document Resubmitted</span>
                                  </div>
                                  <a
                                    href={doc.studentResubmittedLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-700 hover:underline break-all"
                                  >
                                    {doc.studentResubmittedLink}
                                  </a>
                                </div>
                              )}

                              {/* Action Section - When needs changes or rejected */}
                              {needsAction ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-orange-500" />
                                    Update Document
                                  </h4>

                                  {/* File Upload */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Upload New Document
                                    </label>
                                    <label className={`block w-full cursor-pointer ${
                                      pendingFile 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300 hover:border-iit-primary hover:bg-iit-primary/5'
                                    } border-2 border-dashed rounded-xl p-6 text-center transition-colors`}>
                                      <input
                                        type="file"
                                        onChange={(e) => setPendingFile(e.target.files[0])}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="hidden"
                                      />
                                      {pendingFile ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <FileText className="w-5 h-5 text-green-600" />
                                          <span className="text-sm font-medium text-green-700">{pendingFile.name}</span>
                                        </div>
                                      ) : (
                                        <>
                                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-500">Click to upload new document</p>
                                          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                                        </>
                                      )}
                                    </label>
                                  </div>

                                  {/* Link Option */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Or Provide Document Link (optional)
                                    </label>
                                    <input
                                      type="url"
                                      value={resubmitLink}
                                      onChange={(e) => setResubmitLink(e.target.value)}
                                      placeholder="Google Drive, Dropbox, etc."
                                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none"
                                    />
                                  </div>

                                  {/* Reply Text */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Your Message to Admin (optional)
                                    </label>
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Add any explanation or notes..."
                                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-iit-primary/20 focus:border-iit-primary outline-none resize-none"
                                      rows={3}
                                    />
                                  </div>

                                  {/* Submit Button */}
                                  <button
                                    onClick={() => handleReplyWithUpdate(idx)}
                                    disabled={submitting || (!replyText.trim() && !pendingFile && !resubmitLink)}
                                    className="w-full bg-gradient-to-r from-iit-primary to-iit-secondary text-white py-3 rounded-xl font-semibold hover:from-iit-secondary hover:to-iit-primary disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                                  >
                                    {submitting || uploading ? (
                                      <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Send size={18} />
                                        Submit Update
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : doc.status === 'pending' && !doc.filePath ? (
                                /* Initial Upload */
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Document
                                  </label>
                                  <label className="block w-full cursor-pointer border-2 border-dashed border-gray-300 hover:border-iit-primary hover:bg-iit-primary/5 rounded-xl p-6 text-center transition-colors">
                                    <input
                                      type="file"
                                      onChange={(e) => handleFileUpload(doc.name, e.target.files)}
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      className="hidden"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                                  </label>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* General Comments */}
            {application.adminComments?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    General Comments
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {application.adminComments.map((comment, idx) => (
                    <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-gray-900">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {comment.reply && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Your response:</span> {comment.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Your Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-iit-primary to-iit-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {application.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{application.student?.name}</p>
                    <p className="text-sm text-gray-500">{application.student?.rollNo}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="text-sm text-gray-900">{application.student?.email}</p>
                  </div>
                  {application.student?.program && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Program</p>
                      <p className="text-sm text-gray-900">{application.student?.program}</p>
                    </div>
                  )}
                  {application.student?.branch && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Branch</p>
                      <p className="text-sm text-gray-900">{application.student?.branch}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
