import { useState, useRef } from 'react';
import { adminApi } from '../api/admin';
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

export default function Import() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await adminApi.importPreview(formData);
      setPreview(res.data);
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.importData(formData);
      setResult(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPreview(null);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Import failed' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await adminApi.getImportTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'scholarship_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error downloading template');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-500 mt-1">Upload CSV file with student and scholarship data</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CSV File Format</h2>
            <p className="text-sm text-gray-500 mt-1">Required columns for import</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-iit-primary text-white rounded-lg hover:bg-iit-secondary flex items-center gap-2"
          >
            <Download size={18} /> Download Template
          </button>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Column</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Field</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { col: 'S.No', field: 'Serial Number', ex: '1' },
                { col: 'ID No', field: 'Roll Number', ex: '2101CS01' },
                { col: 'Name', field: 'Student Name', ex: 'John Doe' },
                { col: 'Course', field: 'Branch/Course', ex: 'CSE' },
                { col: 'Gender', field: 'Male/Female', ex: 'Male' },
                { col: 'Financial Year', field: 'e.g. 2024-25', ex: '2024-25' },
                { col: 'Scholarship Scheme', field: 'Scholarship Name', ex: 'MCM Scholarship' },
                { col: 'Amount', field: 'Amount in Rupees', ex: '50000' },
                { col: 'Fresh/Renewal', field: 'Fresh or Renewal', ex: 'Fresh' }
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.col}</td>
                  <td className="px-4 py-3 text-gray-600">{item.field}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-iit-primary hover:bg-iit-primary/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">
            {file ? file.name : 'Click to upload CSV file'}
          </p>
          <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
        </div>

        {preview && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview ({preview.preview?.length || 0} rows shown)</h3>
            <div className="overflow-x-auto bg-gray-50 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {preview.headers?.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left bg-white font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview?.map((row, i) => (
                    <tr key={i} className="bg-white">
                      {preview.headers?.map((h, j) => (
                        <td key={j} className="px-3 py-2 border-t border-gray-100">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-6 py-3 bg-iit-primary text-white rounded-lg hover:bg-iit-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Import Data
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Result</h2>
          
          {result.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
              <XCircle size={24} />
              <div>
                <p className="font-medium">Import Failed</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3 mb-6">
                <CheckCircle size={24} />
                <p className="font-medium">Import completed successfully!</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.totalRows || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Total Rows</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.studentsCreated || 0}</p>
                  <p className="text-xs text-green-600 mt-1">New Students</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{result.studentsUpdated || 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Updated Students</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{result.applicationsCreated || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">New Applications</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-pink-600">{result.applicationsUpdated || 0}</p>
                  <p className="text-xs text-pink-600 mt-1">Updated Apps</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{result.skipped || 0}</p>
                  <p className="text-xs text-red-600 mt-1">Skipped</p>
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-yellow-600" />
                    Warnings ({result.errors.length})
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg max-h-40 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-sm text-yellow-800 py-1">
                        Row {err.row}: {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Important Notes</h3>
            <ul className="text-sm text-amber-800 mt-2 space-y-1">
              <li>• <strong>ID No (Roll No)</strong> is required and must be unique for each student</li>
              <li>• <strong>Scholarship Scheme</strong> will auto-create scholarships if they don't exist</li>
              <li>• Existing records will be updated if Roll No matches</li>
              <li>• Fresh students and applications will be created for new Roll Nos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
