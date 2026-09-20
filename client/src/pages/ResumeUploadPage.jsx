import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../services/resumeService';

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ['application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selected.type)) {
        setError('Only PDF and DOCX files allowed.');
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File too large (max 5MB).');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadResume(file);
      // Redirect to analysis page with resumeId
      navigate(`/resume/analyze/${data.resumeId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Your Resume</h2>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 mb-6 hover:border-indigo-400 transition cursor-pointer"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <p className="text-gray-700 dark:text-gray-300">{file.name}</p>
            ) : (
              <p className="text-gray-400">Drag & drop or click to select PDF/DOCX</p>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;